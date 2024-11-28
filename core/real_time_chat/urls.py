from django.urls import path

from .views import (
    ActivateChatAPI,
    CreateNewChatAPIView,
    CheckAuthenticatedAPIView,
    SignInAPIView,
    SignUpAPIView,
    CSRFTokenAPIView
    # ChatsListAPIView, RetrieveDialogHistoryAPIView
)

urlpatterns = [
    # path('fill/', FillDB.as_view(), name='fill_db'),
    path('sign_in/', SignInAPIView.as_view(), name='sign_in'),
    path('sign_up/', SignUpAPIView.as_view(), name='sign_up'),
    path('create_new_chat/', CreateNewChatAPIView.as_view(), name='create_new_chat'),
    path('check_auth/', CheckAuthenticatedAPIView.as_view(), name='check_auth'),
    path('get_csrf_token/', CSRFTokenAPIView.as_view(), name='get_csrf_token'),
    # path('chats_list/', ChatsListAPIView.as_view(), name='chats_list'),
    # path('c/<str:uuid>/', RetrieveDialogHistoryAPIView.as_view(), name='chat_history'),
    path('link/<str:user_uuid>/', ActivateChatAPI.as_view(), name='activate_chat'),
]