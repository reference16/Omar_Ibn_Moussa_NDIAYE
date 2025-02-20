from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Project
from .forms import ProjectForm
from django.urls import reverse

@login_required
def project_list(request):
    # Récupérer les projets dont l'utilisateur est propriétaire ou membre
    user_projects = Project.objects.filter(members=request.user) | Project.objects.filter(owner=request.user)
    user_projects = user_projects.distinct()
    return render(request, 'projects/dashboard.html', {
        'projects': user_projects
    })

@login_required
def project_create(request):
    if request.method == 'POST':
        form = ProjectForm(request.POST)
        if form.is_valid():
            project = form.save(commit=False)
            project.owner = request.user
            project.save()
            # Sauvegarder les membres après la création du projet
            form.save_m2m()  # Important pour les champs ManyToMany
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
            form.save()
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
    if request.user not in project.members.all() and request.user != project.owner:
        messages.error(request, "Vous n'avez pas accès à ce projet.")
        return redirect('projects:project_list')
    
    return render(request, 'projects/project_tasks.html', {
        'project': project,
        'tasks': project.task_set.all()
    })
