from django.shortcuts import render, get_object_or_404, redirect
from .models import Task
from .forms import TaskForm
from projects.models import Project
from users.models import CustomUser
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .serializers import TaskSerializer
from .permissions import IsTaskAssignedorReadOnly, IsProjectOwnerorReadOnly
from rest_framework import generics, status
from rest_framework import permissions
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q

#vue normale


@login_required
# Afficher toutes les tâches
def task_list(request):
    tasks = Task.objects.all()
    
     
    # Ajout des filtres par statut et utilisateur
    status_filter = request.GET.get('status')
    user_filter = request.GET.get('user')

    if status_filter:
        tasks = tasks.filter(status=status_filter)
    if user_filter:
        tasks = tasks.filter(assigned_to=user_filter)

    return render(request, 'tasks/task_list.html', {'tasks': tasks})

@login_required
# Afficher les détails d'une tâche
def task_detail(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    return render(request, 'tasks/task_detail.html', {'task': task})

@login_required
# Créer une tâche
def task_create(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.project = project
            task.save()
            return redirect('tasks:task_list')
    else:
        form = TaskForm()
    return render(request, 'tasks/task_form.html', {'form': form, 'project': project, 'title': 'Créer une tâche', 'button_text': 'Créer'})

# Mettre à jour une tâche 
@login_required
def task_update(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    
    # Vérifier que l'utilisateur est assigné à la tâche ou est le créateur du projet
    if request.user != task.assigned_to and request.user != task.project.owner:
        messages.error(request, "Vous n'avez pas la permission de modifier cette tâche.")
        return redirect('projects:project_tasks', task.project.pk)
    
    if request.method == 'POST':
        form = TaskForm(request.POST, instance=task)
        if form.is_valid():
            form.save()
            messages.success(request, 'Tâche modifiée avec succès!')
            return redirect('projects:project_tasks', task.project.pk)
    else:
        form = TaskForm(instance=task)
    
    return render(request, 'tasks/task_form.html', {
        'form': form,
        'task': task,
        'title': 'Modifier la tâche',
        'button_text': 'Enregistrer'
    })

@login_required
# Supprimer une tâche 
def task_delete(request, task_id):
    task = get_object_or_404(Task, id=task_id)

    # Vérifier si l'utilisateur peut supprimer la tâche
    if request.user == task.assigned_to or request.user == task.project.owner:
        task.delete()
        return redirect('tasks:task_list')

    # Ajouter un message d’erreur si l'utilisateur ne peut pas supprimer la tâche
    return render(request, 'tasks/task_detail.html', {
        'task': task,
        'error': "Vous n'avez pas l'autorisation de supprimer cette tâche."
    })
    return redirect('tasks:task_list')


#Vue pour les api


class TasklistView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Utiliser distinct() pour éviter les doublons
        queryset = Task.objects.all().distinct()
        
        # Si l'utilisateur n'est pas superuser, il ne voit que les tâches de ses projets
        # ou les tâches qui lui sont assignées
        if not self.request.user.is_superuser:
            queryset = queryset.filter(
                models.Q(project__owner=self.request.user) |
                models.Q(assigned_to=self.request.user) |
                models.Q(project__members=self.request.user)
            ).distinct()

        # Récupérer le projet_id depuis l'URL si la vue est appelée depuis l'URL du projet
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        else:
            # Appliquer les filtres depuis les paramètres de requête
            project_filter = self.request.query_params.get('project', None)
            if project_filter:
                queryset = queryset.filter(project_id=project_filter)
                
        # Autres filtres
        status_filter = self.request.query_params.get('status', None)
        user_filter = self.request.query_params.get('assigned_to', None)

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if user_filter:
            queryset = queryset.filter(assigned_to=user_filter)

        return queryset.select_related('project', 'assigned_to')
#Afficher, modifier, supprimer une tâche
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsTaskAssignedorReadOnly]
    
#Creer une tache 
class TaskCreateView(generics.CreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsProjectOwnerorReadOnly]
    
    def perform_create(self, serializer):
        #vérifier que seul le propriétaire du projet peut créer une tâche
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id)

        #vérifier que l'utilisateur est propriétaire du projet
        if project.owner != self.request.user:
            raise permissions.PermissionDenied("Vous n'avez pas la permission de créer une tâche dans ce projet.")
        serializer.save(project = project)
    
    
#Mettre à jour une tache
class TaskUpdateView(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsTaskAssignedorReadOnly]

#Supprimer une tache
class TaskDeleteView(generics.DestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsTaskAssignedorReadOnly]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def task_statistics(request):
    """
    Retourne les statistiques des tâches pour l'utilisateur connecté
    """
    user = request.user
    project_id = request.query_params.get('project_id')
    
    # Base queryset
    tasks = Task.objects.all()
    
    # Filtrer par projet si spécifié
    if project_id:
        tasks = tasks.filter(project_id=project_id)
    
    # Pour un étudiant : tâches qui lui sont assignées
    if not user.is_staff and not user.is_superuser:
        tasks = tasks.filter(assigned_to=user)
    # Pour un enseignant : toutes les tâches de ses projets
    else:
        tasks = tasks.filter(project__owner=user)
    
    # Calculer les statistiques
    stats = {
        'todo': tasks.filter(status='todo').count(),
        'in_progress': tasks.filter(status='in_progress').count(),
        'done': tasks.filter(status='done').count(),
        'total': tasks.count(),
        'urgent': tasks.filter(
            status__in=['todo', 'in_progress'],
            due_date__isnull=False
        ).count()
    }
    
    return Response(stats)