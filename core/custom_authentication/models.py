from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from .manager import MyUserManager
from django.db import models
import uuid


class MyAbstractBaseUser(AbstractUser):
    email = None
    last_name = None
    first_name = None

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    is_online = models.BooleanField(_("Online"), default=False)

    objects = MyUserManager()

    EMAIL_FIELD = 'username'
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        abstract = True


class MyUser(MyAbstractBaseUser):

    def __str__(self):
        return f'{self.username}'
