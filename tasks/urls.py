from django.urls import path

from . import views

urlpatterns = [
    path('', views.task_list, name='task_list'),
    path('<int:task_id>/', views.task_detail, name='task_detail'),
    path('create/<int:project_id>/', views.task_create, name='task_create'),
]   