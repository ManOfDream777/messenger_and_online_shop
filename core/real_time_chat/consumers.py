import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ValidationError
from django.db.models import Q

from custom_authentication.models import MyUser
from real_time_chat.models import Dialog, Message

from real_time_chat.serializers import ChatsListSerializer, RetrieveDialogHistorySerializer


class AsyncRealTimeChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope['user'].is_authenticated:
            user = self.scope['user']
            await self.set_online_status(user)

            available_dialogs = await self.get_available_dialogs(user)
            for dialog_id in available_dialogs:
                group_name = f'dialog_{dialog_id}'

                await self.channel_layer.group_add(
                    group_name,
                    self.channel_name
                )

                self.groups.append(group_name)

            await self.accept()
            await self.send_message({
                'message': await self.load_chat_list(user)
            }, 'chat_list')

            return
        await self.close()

    async def disconnect(self, code):
        for group_name in self.groups:
            await self.channel_layer.group_discard(
                group_name,
                self.channel_name
            )
        self.set_offline_status(self.scope['user'])

    async def receive(self, text_data=None, bytes_data=None):
        parsed_data = json.loads(text_data)
        action_type = parsed_data['action_type']
        match action_type:
            case 'retrieve_chat':
                companion_uuid = parsed_data['companion_uuid']
                batch_number = parsed_data['batch_number']
                result = await self.load_dialog_history(
                    user1=self.scope['user'],
                    user2_uuid=companion_uuid,
                    batch_number=batch_number if batch_number > 0 else 1)
                error = result.get('error', None)
                if error is None:
                    await self.send_message({
                        'message': result
                    }, 'retrieve_chat')
                else:
                    await self.send_message({
                        'message': result
                    }, 'error_need_attention')
            case 'message_sent':
                companion_uuid = parsed_data['companion_uuid']
                dialog = await self.get_current_dialog(companion_uuid)
                error = None

                if isinstance(dialog, dict):
                    error = dialog.get('error', 'Error')

                if error is None:
                    group_name = f'dialog_{dialog.id}'

                    data = {
                        'text': parsed_data['message'],
                        'when_created': parsed_data['when_created'],
                        'recipient': await self.get_user_by_uuid(companion_uuid),
                        'sender': self.scope['user'],
                        'dialog': dialog,
                        'encrypted_secret_key_by_own_key': parsed_data['encrypted_secret_key_by_own_key'],
                        'encrypted_secret_key_by_companion_key': parsed_data['encrypted_secret_key_by_companion_key']
                    }
                    serialized_data = await self.save_message(data)

                    await self.channel_layer.group_send(group_name, {
                        'type': 'send_message',
                        'message': serialized_data | {'action_type': 'message_sent', 'dialog_id': dialog.id}
                    })
                else:
                    await self.send_message({
                        'message': error
                    }, 'error_need_attention')
            case 'exchange_keys':
                dialog_ids = parsed_data['dialog_ids']
                dialogs: Dialog = await self.get_dialogs_by_id(dialog_ids)
                error = None

                if isinstance(dialogs, dict):
                    error = dialogs.get('error', 'Error')

                if error is None:
                    result = [{'dialog_id': dialog['id'], 'public_key': dialog['public_key_user2']} for
                              dialog in
                              dialogs]
                    await self.send_message({
                        'message': result
                    }, 'exchange_keys')
                else:
                    await self.send_message({
                        'message': error
                    }, 'error_need_attention')

    async def send_message(self, event, action_type=''):
        message = event['message']
        if action_type == '':
            action_type = message.get('action_type', None)
        match action_type:
            case 'chat_list':
                await self.send(text_data=json.dumps({
                    'message': message,
                    'action_type': action_type
                }))
            case 'retrieve_chat':
                await self.send(text_data=json.dumps({
                    'message': message,
                    'action_type': action_type
                }))
            case 'error_need_attention':
                await self.send(text_data=json.dumps({
                    'message': message,
                    'action_type': action_type
                }))
            case 'message_sent':
                await self.send(text_data=json.dumps({
                    'message': message,
                    'action_type': action_type
                }))
            case 'exchange_keys':
                await self.send(text_data=json.dumps({
                    'message': message,
                    'action_type': action_type
                }))
            case _:
                await self.send(text_data=json.dumps({
                    'message': 'Something went wrong. Try again. Sorry for inconvenience.',
                    'action_type': 'unresolved error'
                }))

    @database_sync_to_async
    def get_dialogs_by_id(self, dialog_ids):
        qs = Dialog.objects.filter(id__in=dialog_ids, is_to_be_started=True)
        if qs.exists():
            return list(qs.values('id', 'public_key_user2'))
        return {'error': "Query you are trying to fetch doesn't exists"}

    @database_sync_to_async
    def get_available_dialogs(self, user):
        return list(Dialog.objects.filter(Q(user1=user) | Q(user2=user)).values_list('id', flat=True))

    @database_sync_to_async
    def set_online_status(self, user):
        user.is_online = True
        user.save()

    @database_sync_to_async
    def load_chat_list(self, user):
        qs = Dialog.objects.filter(Q(user1=user) | Q(user2=user)).prefetch_related('messages')
        serializer = ChatsListSerializer(qs, many=True, context={'request': {'user': self.scope['user']}})
        return serializer.data

    @database_sync_to_async
    def set_offline_status(self, user):
        user.is_online = False
        user.save()

    @database_sync_to_async
    def load_dialog_history(self, user1, user2_uuid, batch_number):
        # max capacity of data is 8192 bytes.
        try:
            companion = MyUser.objects.get(uuid=user2_uuid)
        except MyUser.DoesNotExist:
            return {'error': "Companion you are trying to query doesn't exists"}
        except ValidationError:
            return {'error': "Check your companion UUID"}
        dialog = Dialog.objects.get(Q(user1=user1, user2__uuid=user2_uuid) | Q(user2=user1,
                                                                               user1__uuid=user2_uuid))
        pagination = 50
        previous_batch_number = batch_number - 1 if batch_number > 1 else 0
        dialog_has_finished = False
        messages_count = Message.objects.filter(Q(sender=user1, recipient__uuid=user2_uuid) | Q(recipient=user1,
                                                                                                sender__uuid=user2_uuid)).count()

        unread_messages = Message.objects.filter(Q(sender=user1, recipient__uuid=user2_uuid) | Q(recipient=user1,
                                                                                                 sender__uuid=user2_uuid),
                                                 has_read=False)
        if unread_messages.exists():
            unread_messages.update(has_read=True)

        if previous_batch_number == 0:
            qs = Message.objects.filter(Q(sender=user1, recipient__uuid=user2_uuid) | Q(recipient=user1,
                                                                                        sender__uuid=user2_uuid)).order_by(
                '-id')[
                 previous_batch_number:batch_number * pagination]
        else:
            if batch_number * pagination >= messages_count:
                qs = Message.objects.filter(Q(sender=user1, recipient__uuid=user2_uuid) | Q(recipient=user1,
                                                                                            sender__uuid=user2_uuid)).order_by(
                    '-id')[
                     previous_batch_number * pagination:]
                dialog_has_finished = True
            else:
                qs = Message.objects.filter(Q(sender=user1, recipient__uuid=user2_uuid) | Q(recipient=user1,
                                                                                            sender__uuid=user2_uuid)).order_by(
                    '-id')[
                     previous_batch_number * pagination:batch_number * pagination]
        serializer = RetrieveDialogHistorySerializer(list(qs)[::-1], many=True)
        return {'companion': companion.username, 'messages': serializer.data,
                'dialog_has_finished': dialog_has_finished, 'dialog_id': dialog.id}

    @database_sync_to_async
    def save_message(self, data):
        instance = Message.objects.create(**data)
        serializer = RetrieveDialogHistorySerializer(instance)
        return serializer.data

    @database_sync_to_async
    def get_current_dialog(self, companion_uuid):
        try:
            return Dialog.objects.get(
                Q(user1=self.scope['user'], user2__uuid=companion_uuid) |
                Q(user1__uuid=companion_uuid, user2=self.scope['user']))
        except Dialog.DoesNotExist:
            return {'error': "Dialog doesn't exists"}

    @database_sync_to_async
    def get_user_by_uuid(self, companion_uuid):
        return MyUser.objects.get(uuid=companion_uuid)
