from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Project
from .forms import ProjectForm
from django.urls import reverse
from .serializers import ProjectSerializer
from rest_framework import generics, status
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.renderers import JSONRenderer
from .permissions import IsProjectOwnerOrMember
from django.db.models import Q, Count
from users.models import CustomUser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes

# Vue pour les statistiques
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def project_statistics(request):
    user = request.user
    
    # Pour les enseignants : tous les projets
    if user.role == 'teacher':
        stats = {
            'total': Project.objects.count(),
            'todo': Project.objects.filter(status='todo').count(),
            'in_progress': Project.objects.filter(status='in_progress').count(),
            'done': Project.objects.filter(status='done').count(),
            'my_projects': Project.objects.filter(owner=user).count(),
            'supervised_projects': Project.objects.filter(members=user).exclude(owner=user).count()
        }
    # Pour les étudiants : projets dont ils sont propriétaires ou membres
    else:
        stats = {
            'total': Project.objects.filter(Q(owner=user) | Q(members=user)).distinct().count(),
            'todo': Project.objects.filter(owner=user, status='todo').count(),
            'in_progress': Project.objects.filter(
                (Q(owner=user) | Q(members=user)) & Q(status='in_progress')
            ).distinct().count(),
            'done': Project.objects.filter(
                (Q(owner=user) | Q(members=user)) & Q(status='done')
            ).distinct().count(),
            'my_projects': Project.objects.filter(owner=user).count(),
            'member_projects': Project.objects.filter(members=user).exclude(owner=user).count()
        }
    
    return Response(stats)

#vue normale

@login_required
def project_list(request):
    user = request.user
    # Pour les projets "à faire", montrer uniquement ceux dont l'utilisateur est propriétaire
    todo_projects = Project.objects.filter(owner=user, status='todo')
    # Pour les autres projets, montrer ceux dont l'utilisateur est membre ou propriétaire
    other_projects = Project.objects.filter(
        (Q(members=user) | Q(owner=user)) & ~Q(status='todo')
    ).distinct()
    
    user_projects = todo_projects | other_projects
    return render(request, 'projects/dashboard.html', {
        'projects': user_projects.distinct()
    })

@login_required
def project_create(request):
    if request.method == 'POST':
        form = ProjectForm(request.POST)
        if form.is_valid():
            project = form.save(commit=False)
            project.owner = request.user
            project.status = 'todo'  # État initial: à faire
            project.save()
            # Ajouter automatiquement le créateur comme membre
            project.members.add(request.user)
            messages.success(request, 'Projet créé avec succès!')
            return redirect('projects:project_list')
    else:
        form = ProjectForm()
    
    return render(request, 'projects/project_form.html', {
        'form': form,
        'title': 'Créer un projet',
        'button_text': 'Créer'
    })

@login_required
def project_edit(request, pk):
    project = get_object_or_404(Project, pk=pk)
    # Vérifier que l'utilisateur est le propriétaire
    if project.owner != request.user:
        messages.error(request, "Vous n'avez pas la permission de modifier ce projet.")
        return redirect('projects:project_list')
    
    if request.method == 'POST':
        form = ProjectForm(request.POST, instance=project)
        if form.is_valid():
            # Si le projet passe de 'todo' à 'in_progress', on garde les membres sélectionnés
            old_status = project.status
            project = form.save()
            
            if old_status == 'todo' and project.status == 'in_progress':
                messages.success(request, 'Le projet est maintenant visible par tous les membres!')
            
            messages.success(request, 'Projet modifié avec succès!')
            return redirect('projects:project_list')
    else:
        form = ProjectForm(instance=project)
    
    return render(request, 'projects/project_form.html', {
        'form': form,
        'project': project,
        'title': 'Modifier le projet',
        'button_text': 'Enregistrer'
    })

@login_required
def project_delete(request, pk):
    project = get_object_or_404(Project, pk=pk)
    # Vérifier que l'utilisateur est le propriétaire
    if project.owner != request.user:
        messages.error(request, "Vous n'avez pas la permission de supprimer ce projet.")
        return redirect('projects:project_list')
    
    if request.method == 'POST':
        project.delete()
        messages.success(request, 'Projet supprimé avec succès!')
        return redirect('projects:project_list')
    
    return render(request, 'projects/project_confirm_delete.html', {
        'project': project
    })

@login_required
def project_tasks(request, pk):
    project = get_object_or_404(Project, pk=pk)
    # Vérifier que l'utilisateur est membre ou propriétaire
    if project.status == 'todo' and project.owner != request.user:
        messages.error(request, "Ce projet est en cours de préparation.")
        return redirect('projects:project_list')
    
    if request.user not in project.members.all() and request.user != project.owner:
        messages.error(request, "Vous n'avez pas accès à ce projet.")
        return redirect('projects:project_list')
    
    return render(request, 'projects/project_tasks.html', {
        'project': project,
        'tasks': project.tasks.all()
    })

#vue API

class ProjectListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        user = self.request.user
        # Projets visibles :
        # 1. Tous les projets dont l'utilisateur est propriétaire
        # 2. Les projets non "todo" dont l'utilisateur est membre
        return Project.objects.filter(
            Q(owner=user) |  # Tous les projets dont l'utilisateur est propriétaire
            (Q(members=user) & ~Q(status='todo'))  # Les projets où l'utilisateur est membre ET qui ne sont pas "à faire"
        ).distinct().select_related('owner')

    def perform_create(self, serializer):
        # Créer le projet avec le statut initial "à faire"
        project = serializer.save(owner=self.request.user, status='todo')
        # Ajouter le propriétaire comme membre
        project.members.add(self.request.user)

class ProjectDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsProjectOwnerOrMember]
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        user = self.request.user
        # Même logique que pour la liste
        return Project.objects.filter(
            Q(owner=user) |  # Tous les projets dont l'utilisateur est propriétaire
            (Q(members=user) & ~Q(status='todo'))  # Les projets où l'utilisateur est membre ET qui ne sont pas "à faire"
        ).distinct().select_related('owner')

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_status = instance.status
        
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        
        # Si le projet passe de 'todo' à 'in_progress', on garde les membres
        new_status = serializer.validated_data.get('status', old_status)
        
        self.perform_update(serializer)
        
        # S'assurer que le propriétaire est toujours membre
        instance.members.add(instance.owner)
        
        return Response(serializer.data)