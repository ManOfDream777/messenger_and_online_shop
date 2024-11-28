from rest_framework import serializers

from custom_authentication.models import MyUser
from .models import InvitationLinkForDialog, Dialog, Message


class CreateNewDialogSerializer(serializers.ModelSerializer):
    uri = serializers.CharField(max_length=256, read_only=True)
    expiration_time = serializers.DateTimeField(format='%H:%M:%S %d.%m.%Y', read_only=True)
    dialog_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = InvitationLinkForDialog
        fields = ('uri', 'expiration_time', 'dialog_id')

    def save(self, **kwargs):
        pass


class PublicKeySerializer(serializers.Serializer):
    public_key = serializers.CharField(max_length=1024)


class SignInSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    password = serializers.CharField(max_length=100)

    class Meta:
        fields = ('username', 'password')


class SignUpSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100, min_length=2)
    password = serializers.CharField(max_length=100, min_length=8)
    password2 = serializers.CharField(max_length=100, min_length=8)

    class Meta:
        fields = ('username', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password didn't match."})
        return attrs


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()
    recipient = serializers.StringRelatedField()
    text = serializers.CharField(max_length=300)

    class Meta:
        model = Message
        fields = ('sender', 'recipient', 'text', 'when_created', 'encrypted_secret_key_by_own_key',
                  'encrypted_secret_key_by_companion_key')


class RetrieveDialogHistorySerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    recipient = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ('sender', 'recipient', 'text', 'when_created', 'has_read', 'encrypted_secret_key_by_own_key',
                  'encrypted_secret_key_by_companion_key')

    def get_sender(self, obj):
        return str(obj.sender.username)

    def get_recipient(self, obj):
        return str(obj.recipient.username)


class ChatsListSerializer(serializers.ModelSerializer):
    companion_data = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_messages_count = serializers.SerializerMethodField()

    class Meta:
        model = Dialog
        fields = ('id', 'companion_data', 'last_message', 'unread_messages_count')

    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-id').first()
        return MessageSerializer(last_message).data if last_message else None

    def get_companion_data(self, obj):
        if self.context['request']['user'].uuid == obj.user1.uuid:
            companion = obj.user2
        else:
            companion = obj.user1
        if companion is not None:
            return {'uuid': str(companion.uuid), 'username': companion.username, "online": companion.is_online}
        return None

    def get_unread_messages_count(self, obj):
        unread_messages = obj.messages.filter(has_read=False).count()
        return unread_messages
