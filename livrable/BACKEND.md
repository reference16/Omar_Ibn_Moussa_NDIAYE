# Documentation Backend Django

## Structure du Projet

```
backend/
├── config/                 # Configuration principale
│   ├── settings.py
│   └── urls.py
├── users/                  # Application de gestion des utilisateurs
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── permissions.py
│   └── urls.py
├── projects/              # Application de gestion des projets
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── tasks/                 # Application de gestion des tâches
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
└── requirements.txt
```

## Modèles de Données

### Utilisateur (CustomUser)
```python
class CustomUser(AbstractUser):
    ROLES = [
        ('student', 'Etudiant'),
        ('teacher', 'Professeur')
    ]
    role = models.CharField(max_length=10, choices=ROLES, default='student')
    avatar = models.ImageField(upload_to='avatars/', null=True)

    # Relations
    # - owned_projects (Project) : Projets créés par l'utilisateur
    # - projects (Project) : Projets auxquels l'utilisateur participe
    # - assigned_tasks (Task) : Tâches assignées à l'utilisateur
```

### Projet (Project)
```python
class Project:
    STATUS_CHOICES = [
        ('todo', 'À faire'),
        ('in_progress', 'En cours'),
        ('done', 'Terminé')
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    owner = models.ForeignKey(CustomUser, related_name='owned_projects')
    members = models.ManyToManyField(CustomUser, related_name='projects')
    status = models.CharField(choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Relations
    # - tasks (Task) : Tâches du projet
```

### Tâche (Task)
```python
class Task:
    STATUS_CHOICES = [
        ('todo', 'A faire'),
        ('in_progress', 'En cours'),
        ('done', 'Fait')
    ]
    
    title = models.CharField(max_length=100)
    description = models.TextField()
    project = models.ForeignKey(Project, related_name='tasks')
    assigned_to = models.ForeignKey(CustomUser, related_name='assigned_tasks')
    status = models.CharField(choices=STATUS_CHOICES)
    due_date = models.DateField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## Système de Permissions

### Permissions Personnalisées
```python
class IsAdminOrAuthenticatedStudent(BasePermission):
    """
    Permission permettant :
    - Aux administrateurs d'accéder à toutes les fonctionnalités
    - Aux étudiants authentifiés d'accéder à leurs données
    - L'inscription publique pour les étudiants
    """
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        if view.action == 'register_student':
            return True
        return request.user.is_authenticated
```

## Configuration JWT

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    )
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}
```

## Vues API

### Projets
```python
class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Project.objects.all()
        return Project.objects.filter(
            Q(owner=user) | Q(members=user)
        ).distinct()
```

### Tâches
```python
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return Task.objects.filter(project_id=project_id)
```

## Sérializers

### Projet
```python
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'status', 
                 'owner', 'members', 'created_at', 'updated_at']
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
```

### Tâche
```python
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status',
                 'project', 'assigned_to', 'due_date',
                 'created_at', 'updated_at']
```

## Tests

### Tests des Modèles
```python
class ProjectModelTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
    def test_project_creation(self):
        project = Project.objects.create(
            name='Test Project',
            description='Test Description',
            owner=self.user,
            status='todo'
        )
        self.assertEqual(project.name, 'Test Project')
```

## Sécurité

1. **Protection CSRF**
   - Middleware Django par défaut
   - Tokens CSRF pour les requêtes POST

2. **Validation des Données**
   - Validation au niveau des sérializers
   - Nettoyage des entrées HTML

3. **Contrôle d'Accès**
   - Permissions basées sur les rôles
   - Filtrage des querysets par utilisateur

## Bonnes Pratiques

1. **Performance**
   - Utilisation de select_related() et prefetch_related()
   - Indexation des champs fréquemment utilisés
   - Pagination des résultats

2. **Maintenance**
   - Documentation des vues et modèles
   - Tests unitaires et d'intégration
   - Logging des actions importantes
