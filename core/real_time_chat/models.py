from django.db import models

from services.utils import generate_link
from django.db.models.signals import post_save
from django.dispatch import receiver
from cryptography.fernet import Fernet
from django.utils import timezone


class Dialog(models.Model):
    user1 = models.ForeignKey("custom_authentication.MyUser", on_delete=models.CASCADE, related_name="user1",
                              verbose_name="User 1", help_text='Dialog initiator')
    user2 = models.ForeignKey("custom_authentication.MyUser", on_delete=models.CASCADE, related_name="user2",
                              verbose_name="User 2", null=True, blank=True)
    is_to_be_started = models.BooleanField(verbose_name='When user2 activates the link', default=False)
    public_key_user1 = models.CharField(max_length=1024, verbose_name="Public key user 1")
    public_key_user2 = models.CharField(max_length=1024, verbose_name="Public key user 2", null=True, blank=True)

    class Meta:
        verbose_name = "Dialog"
        verbose_name_plural = "Dialogs"

    def __str__(self):
        return f'{self.user1} and {self.user2} started the chat.'

    def generate_invitation_link(self, cypher):
        return generate_link(cypher, self.user1.uuid)

    def set_user2(self, user2, public_key_user2):
        self.user2 = user2
        self.public_key_user2 = public_key_user2
        self.is_to_be_started = True
        self.save()


class InvitationLinkForDialog(models.Model):
    uri = models.CharField(max_length=200, verbose_name="URI", unique=True, db_index=True)
    dialog = models.OneToOneField(Dialog, on_delete=models.CASCADE, verbose_name="Dialog",
                                  related_name='invitation_link')
    expiration_time = models.DateTimeField(verbose_name="Expiration time",
                                           default=timezone.now() + timezone.timedelta(hours=1))

    class Meta:
        verbose_name = "Invitation link for dialog"
        verbose_name_plural = "Invitation links for dialog"

    def __str__(self):
        return f'Invitation link for {self.dialog.user1} and {self.dialog.user2}'


@receiver(post_save, sender=Dialog)
def handle_creation_dialog(sender, instance, created, **kwargs):
    if created:
        secret_key = Fernet.generate_key()
        cypher = Fernet(secret_key)
        InvitationLinkForDialog.objects.create(uri=instance.generate_invitation_link(cypher),
                                               dialog=instance)


class Message(models.Model):
    dialog = models.ForeignKey(Dialog, on_delete=models.CASCADE, verbose_name='Dialog', related_name='messages')
    sender = models.ForeignKey("custom_authentication.MyUser", on_delete=models.CASCADE, related_name="sender",
                               verbose_name="Sender")
    recipient = models.ForeignKey("custom_authentication.MyUser", on_delete=models.CASCADE, related_name="recipient",
                                  verbose_name="Recipient")
    text = models.TextField(verbose_name="Text")
    has_read = models.BooleanField(verbose_name='Message has been read', default=False)
    when_created = models.TextField(verbose_name="When created (timestamp)")
    encrypted_secret_key_by_own_key = models.TextField(verbose_name="Encrypted secret key by own key")
    encrypted_secret_key_by_companion_key = models.TextField(verbose_name="Encrypted secret key by companion key")

    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"

    def __str__(self):
        return f'{self.sender} sent a message to {self.recipient}.'


class GroupDialog(models.Model):
    group_name = models.CharField(max_length=100, verbose_name="Group name")
    users_in_dialog = models.ManyToManyField("custom_authentication.MyUser", verbose_name="Users in dialog")

    class Meta:
        verbose_name = "Group dialog"
        verbose_name_plural = "Group dialogs"

    def __str__(self):
        return f'Group dialog "{self.group_name}" started between {self.users_in_dialog.all().count()} users.'


class GroupDialogMessage(models.Model):
    group_dialog = models.ForeignKey(GroupDialog, on_delete=models.CASCADE, verbose_name="Group dialog")
    sender = models.ForeignKey("custom_authentication.MyUser", on_delete=models.CASCADE, related_name="group_sender")
    text = models.TextField(verbose_name="Text")
    when_created = models.CharField(verbose_name="When created (timestamp)", max_length=600, help_text='Stored only '
                                                                                                       'as encrypted '
                                                                                                       'string')
    encrypted_secret_key = models.CharField(verbose_name="Encrypted secret key", max_length=100, help_text='Stored, '
                                                                                                           'because '
                                                                                                           'previous '
                                                                                                           'messages '
                                                                                                           'should be decrypted in history')

    class Meta:
        verbose_name = "Group dialog message"
        verbose_name_plural = "Group dialog messages"

    def __str__(self):
        return f'{self.sender} sent a message to {self.group_dialog.group_name}.'
