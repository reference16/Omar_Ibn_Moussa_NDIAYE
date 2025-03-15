from django.urls import path
from . import views

app_name = 'tasks'

urlpatterns = [
    #Routes pour les vue HTML concernant les tâches

    # path('', views.task_list, name='task_list'),
    # path('<int:task_id>/', views.task_detail, name='task_detail'),
    # path('create/<int:project_id>/', views.task_create, name='task_create'),
    # path('<int:task_id>/edit/', views.task_update, name='task_update'),
    # path('<int:task_id>/delete/', views.task_delete, name='task_delete'),

    #Routes pour les API
    path('', views.TasklistView.as_view(), name='api_task_list'),
    path('statistics/', views.task_statistics, name='api_task_statistics'),
    path('<int:pk>/', views.TaskDetailView.as_view(), name='api_task_detail'),
    path('create/<int:project_id>/', views.TaskCreateView.as_view(), name='api_task_create'),
    path('<int:pk>/update/', views.TaskUpdateView.as_view(), name='api_task_update'),
    path('<int:pk>/delete/', views.TaskDeleteView.as_view(), name='api_task_delete'),
]