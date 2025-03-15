from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'users'

# Router pour l'API
router = DefaultRouter()
router.register('users', views.UserViewSet, basename='user')

urlpatterns = [
    # Route pour l'inscription des étudiants
    path('users/register_student/', views.UserViewSet.as_view({
        'post': 'register_student'
    }), name='register-student'),
    
    # Route pour la création d'enseignants
    path('users/create_teacher/', views.UserViewSet.as_view({
        'post': 'create_teacher'
    }), name='create-teacher'),
    
    # Route explicite pour /me/
    path('users/me/', views.UserViewSet.as_view({
        'get': 'me',
        'patch': 'me',
        'delete': 'me'
    }), name='user-me'),
    
    path('', include(router.urls)),
]