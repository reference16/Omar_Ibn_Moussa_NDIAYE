from django.urls import path
from .views import profile_view, profile_edit

app_name = 'users'

urlpatterns = [
    path('profile/', profile_view, name='profile'),
    path('profile/edit/', profile_edit, name='profile_edit'),
]