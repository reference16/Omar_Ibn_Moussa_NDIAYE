from django.urls import path
from . import views
from tasks import views as task_views

app_name = 'projects'

urlpatterns = [
    # Routes API
    path('', views.ProjectListCreateAPIView.as_view(), name='api_project_list'),
    path('<int:pk>/', views.ProjectDetailAPIView.as_view(), name='api_project_detail'),
    path('<int:project_id>/tasks/', task_views.TaskCreateView.as_view(), name='project_tasks_create'),
    path('<int:project_id>/tasks/list/', task_views.TasklistView.as_view(), name='project_tasks_list'),
    path('statistics/', views.project_statistics, name='api_project_statistics'),
    # path('<int:project_id>/tasks/statistics/', views.task_statistics, name='api_task_statistics'),

    # Routes HTML (commentées pour l'instant)
    # path('', views.project_list, name='project_list'),
    # path('create/', views.project_create, name='project_create'),
    # path('<int:pk>/edit/', views.project_edit, name='project_edit'),
    # path('<int:pk>/delete/', views.project_delete, name='project_delete'),
    # path('<int:pk>/tasks/', views.project_tasks, name='project_tasks'),
]