from django.db import models
from django.contrib.auth.models import AbstractUser

def user_avatar_path(instance, filename):
    # Le chemin sera : media/avatars/user_<id>/<filename>
    return f'avatars/user_{instance.id}/{filename}'

# Create your models here.

class CustomUser(AbstractUser):
    ROLES_CHOICES = [
        ('student', 'Etudiant'),
        ('teacher', 'Professeur'),
    ]
    role = models.CharField(max_length=10, choices=ROLES_CHOICES, default='student')
    avatar = models.ImageField(
        upload_to=user_avatar_path,
        null=True,
        blank=True,
        verbose_name="Photo de profil"
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"