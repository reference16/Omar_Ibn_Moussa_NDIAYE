# Generated by Django 5.1.6 on 2025-02-20 11:09

import users.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to=users.models.user_avatar_path, verbose_name='Photo de profil'),
        ),
    ]
