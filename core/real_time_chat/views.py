# import random
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.middleware.csrf import get_token
from custom_authentication.models import MyUser
from .models import InvitationLinkForDialog, Dialog
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.db.models import Q
from .serializers import CreateNewDialogSerializer, SignInSerializer, SignUpSerializer, PublicKeySerializer
from django.contrib.auth import authenticate, login


class CreateNewChatAPIView(APIView):
    """ It is creating only Dialog with user1. Another fields will be filled when recipient activates the link. """
    permission_classes = (IsAuthenticated,)

    @transaction.atomic
    def post(self, request):
        public_key_serializer = PublicKeySerializer(data=request.data)
        public_key_serializer.is_valid(raise_exception=True)

        dialog = Dialog.objects.create(user1=self.request.user,
                                       public_key_user1=public_key_serializer.data['public_key'])
        invitation_link = dialog.invitation_link

        serializer = CreateNewDialogSerializer(instance=invitation_link)
        return Response(status=201, data=serializer.data)


class ActivateChatAPI(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, user_uuid):
        encrypted_user_uuid = user_uuid
        instance = get_object_or_404(InvitationLinkForDialog, uri__contains=encrypted_user_uuid)
        dialog = instance.dialog

        if Dialog.objects.filter(Q(user1=self.request.user, user2=dialog.user1) | Q(user1=dialog.user1,
                                                                                    user2=self.request.user)).exists():
            return Response(status=400, data={'error': "Current chat already exists."})

        if instance.expiration_time > timezone.now() and dialog.user1 != self.request.user:
            return Response(status=200)

        if dialog.user1 == self.request.user:
            return Response(status=202, data={'error': "You can't create chat with yourself. Later, this feature "
                                                       "might be implemented."})

        return Response(status=400,
                        data={'error': 'Invitation link is expired. Ask your companion to invite you '
                                       'again.'})

    @transaction.atomic
    def post(self, request, user_uuid):
        encrypted_user_uuid = user_uuid
        instance = get_object_or_404(InvitationLinkForDialog, uri__contains=encrypted_user_uuid)
        dialog = instance.dialog

        if Dialog.objects.filter(Q(user1=self.request.user, user2=dialog.user1) | Q(user1=dialog.user1,
                                                                                    user2=self.request.user)).exists():
            return Response(status=400, data={'error': "Current chat already exists."})

        if instance.expiration_time > timezone.now() and dialog.user1 != self.request.user:
            serializer = PublicKeySerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            dialog.set_user2(self.request.user, serializer.data['public_key'])
            instance.delete()

            return Response(status=200, data={'dialog_id': dialog.id,
                                              'companion_public_key': dialog.public_key_user1})

        instance.delete()
        dialog.delete()

        return Response(status=400,
                        data={'error': 'Invitation link is expired. Ask your friend to invite you '
                                       'again.'})


class CheckAuthenticatedAPIView(APIView):

    def get(self, request):
        if self.request.user.is_authenticated:
            return Response(status=200, data={'username': self.request.user.username, 'uuid': self.request.user.uuid})
        return Response(status=403)


class CSRFTokenAPIView(APIView):
    def options(self, request, *args, **kwargs):
        return Response(status=200, data={'csrf_token': get_token(request)})


class SignInAPIView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = SignInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(request, username=serializer.data['username'], password=serializer.data['password'])
        if user:
            login(request, user)
            return Response(status=200)
        return Response(status=401)


class SignUpAPIView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        MyUser.objects.create_user(username=serializer.data['username'], password=serializer.data['password'])
        user = authenticate(request, username=serializer.data['username'], password=serializer.data['password'])
        login(request, user)
        return Response(status=201)
