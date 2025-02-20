from django.shortcuts import render, get_object_or_404, redirect
from .models import Task
from projects.models import Project
from users.models import CustomUser

# Afficher toutes les tâches
def task_list(request):
    tasks = Task.objects.all()
    return render(request, 'tasks/task_list.html', {'tasks': tasks})

# Afficher les détails d'une tâche
def task_detail(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    return render(request, 'tasks/task_detail.html', {'task': task})

# Créer une tâche
def task_create(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        assigned_to_id = request.POST.get('assigned_to')
        status = request.POST.get('status')
        due_date = request.POST.get('due_date')

        assigned_to = get_object_or_404(CustomUser, id=assigned_to_id)

        # Création de la tâche
        Task.objects.create(
            title=title,
            description=description,
            project=project,
            assigned_to=assigned_to,
            status=status,
            due_date=due_date
        )

        return redirect('task_list')

    # Récupérer tous les utilisateurs pour les assigner à une tâche
    users = CustomUser.objects.all()
    return render(request, 'tasks/task_form.html', {'project': project, 'users': users})

# Mettre à jour une tâche 
def task_update(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    
    if request.method == 'POST':
        task.title = request.POST.get('title')
        task.description = request.POST.get('description')
        task.status = request.POST.get('status')
        task.due_date = request.POST.get('due_date')

        assigned_to_id = request.POST.get('assigned_to')
        task.assigned_to = get_object_or_404(CustomUser, id=assigned_to_id)

        # Mise à jour de la tâche
        task.save()

        return redirect('task_list')

    # Récupérer tous les utilisateurs pour le formulaire
    users = CustomUser.objects.all()
    return render(request, 'tasks/task_form.html', {'task': task, 'users': users})

# Supprimer une tâche 
def task_delete(request, task_id):
    task = get_object_or_404(Task, id=task_id)

    # Vérifier si l'utilisateur peut supprimer la tâche
    if request.user == task.assigned_to or request.user == task.project.owner:
        task.delete()
        return redirect('task_list')

    # Ajouter un message d’erreur si l'utilisateur ne peut pas supprimer la tâche
    return render(request, 'tasks/task_detail.html', {
        'task': task,
        'error': "Vous n'avez pas l'autorisation de supprimer cette tâche."
    })
    return redirect('task_list')