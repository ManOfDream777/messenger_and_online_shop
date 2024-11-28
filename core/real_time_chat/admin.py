from django.contrib import admin

from .models import Dialog, Message, GroupDialog, GroupDialogMessage, InvitationLinkForDialog


@admin.register(Dialog)
class DialogAdmin(admin.ModelAdmin):
    pass


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    pass


@admin.register(GroupDialog)
class GroupDialogAdmin(admin.ModelAdmin):
    pass


@admin.register(GroupDialogMessage)
class GroupDialogMessageAdmin(admin.ModelAdmin):
    pass


@admin.register(InvitationLinkForDialog)
class InvitationLinkForDialogAdmin(admin.ModelAdmin):
    pass
