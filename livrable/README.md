# Gestion des Tâches - Documentation

## Table des matières
1. [Configuration du projet](#configuration-du-projet)
2. [Structure des données](#structure-des-données)
3. [API Endpoints](#api-endpoints)

## Configuration du projet

### Prérequis
- Python 3.8+
- Node.js et npm
- PostgreSQL (recommandé) ou SQLite

### Installation du Backend (Django)

1. Cloner le projet et accéder au dossier backend :
```bash
cd backend
```

2. Créer un environnement virtuel et l'activer :
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. Installer les dépendances :
```bash
pip install -r requirements.txt
```

4. Configurer la base de données :
```bash
python manage.py migrate
```

5. Créer un superutilisateur (admin) :
```bash
python manage.py createsuperuser
```

6. Lancer le serveur backend :
```bash
python manage.py runserver
```

### Installation du Frontend (React)

1. Accéder au dossier frontend :
```bash
cd frontend/gestion_taches
```

2. Installer les dépendances :
```bash
npm install
```

3. Lancer l'application :
```bash
npm start
```

## Structure des données

### Modèle Utilisateur (CustomUser)
```python
class CustomUser(AbstractUser):
    ROLES = [('student', 'Etudiant'), ('teacher', 'Professeur')]
    role = models.CharField(max_length=10, choices=ROLES, default='student')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
```

### Modèle Projet (Project)
```python
class Project:
    name = models.CharField(max_length=100)
    description = models.TextField()
    owner = models.ForeignKey(CustomUser, related_name='owned_projects')
    members = models.ManyToManyField(CustomUser, related_name='projects')
    status = models.CharField(choices=['todo', 'in_progress', 'done'])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Modèle Tâche (Task)
```python
class Task:
    title = models.CharField(max_length=100)
    description = models.TextField()
    project = models.ForeignKey(Project, related_name='tasks')
    assigned_to = models.ForeignKey(CustomUser, related_name='assigned_tasks')
    status = models.CharField(choices=['todo', 'in_progress', 'done'])
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## API Endpoints

### Authentification
- POST `/api/users/register_student/` : Inscription étudiant
- POST `/api/users/create_teacher/` : Création compte enseignant (admin)
- POST `/api/token/` : Obtention du token JWT
- POST `/api/token/refresh/` : Rafraîchissement du token JWT

### Gestion des Projets
- GET `/api/projects/` : Liste des projets
- POST `/api/projects/` : Création d'un projet
- GET `/api/projects/{id}/` : Détails d'un projet
- PATCH `/api/projects/{id}/` : Mise à jour d'un projet
- DELETE `/api/projects/{id}/` : Suppression d'un projet

### Gestion des Tâches
- GET `/api/projects/{project_id}/tasks/list/` : Liste des tâches d'un projet
- POST `/api/projects/{project_id}/tasks/` : Création d'une tâche
- PATCH `/api/tasks/{id}/` : Mise à jour d'une tâche
- DELETE `/api/tasks/{id}/` : Suppression d'une tâche

### Gestion des Utilisateurs
- GET `/api/users/students/` : Liste des étudiants
- GET `/api/users/me/` : Profil de l'utilisateur connecté

## Rôles et Permissions

### Étudiant
- Inscription via l'interface publique
- Accès à son profil
- Gestion de ses projets et tâches
- Visualisation des autres étudiants

### Enseignant
- Accès complet aux données des étudiants
- Gestion complète des projets et tâches
- Création et assignation de tâches

### Administrateur
- Toutes les permissions des enseignants
- Création de comptes enseignants
- Gestion complète des utilisateurs
