# Documentation API

## Authentification

### Obtenir un token JWT
```http
POST /api/token/
```

**Corps de la requête**
```json
{
    "username": "string",
    "password": "string"
}
```

**Réponse**
```json
{
    "access": "string",
    "refresh": "string"
}
```

### Rafraîchir un token
```http
POST /api/token/refresh/
```

**Corps de la requête**
```json
{
    "refresh": "string"
}
```

## Gestion des Utilisateurs

### Inscription Étudiant
```http
POST /api/users/register_student/
```

**Corps de la requête**
```json
{
    "username": "string",
    "email": "string",
    "password": "string",
    "password2": "string"
}
```

### Création Compte Enseignant (Admin uniquement)
```http
POST /api/users/create_teacher/
```

**Corps de la requête**
```json
{
    "username": "string",
    "email": "string",
    "password": "string"
}
```

### Liste des Étudiants
```http
GET /api/users/students/
```

**Réponse**
```json
[
    {
        "id": "integer",
        "username": "string",
        "email": "string",
        "role": "student"
    }
]
```

## Gestion des Projets

### Liste des Projets
```http
GET /api/projects/
```

**Réponse**
```json
[
    {
        "id": "integer",
        "name": "string",
        "description": "string",
        "status": "string",
        "owner": "integer",
        "members": ["integer"],
        "created_at": "datetime",
        "updated_at": "datetime"
    }
]
```

### Créer un Projet
```http
POST /api/projects/
```

**Corps de la requête**
```json
{
    "name": "string",
    "description": "string",
    "members": ["integer"]
}
```

### Mettre à jour un Projet
```http
PATCH /api/projects/{id}/
```

**Corps de la requête**
```json
{
    "name": "string",
    "description": "string",
    "status": "string",
    "members": ["integer"]
}
```

## Gestion des Tâches

### Liste des Tâches d'un Projet
```http
GET /api/projects/{project_id}/tasks/list/
```

**Réponse**
```json
[
    {
        "id": "integer",
        "title": "string",
        "description": "string",
        "status": "string",
        "project": "integer",
        "assigned_to": "integer",
        "due_date": "date",
        "created_at": "datetime",
        "updated_at": "datetime"
    }
]
```

### Créer une Tâche
```http
POST /api/projects/{project_id}/tasks/
```

**Corps de la requête**
```json
{
    "title": "string",
    "description": "string",
    "assigned_to": "integer",
    "due_date": "date"
}
```

### Mettre à jour une Tâche
```http
PATCH /api/tasks/{id}/
```

**Corps de la requête**
```json
{
    "title": "string",
    "description": "string",
    "status": "string",
    "assigned_to": "integer",
    "due_date": "date"
}
```

## Codes d'État HTTP

- `200 OK` : Requête réussie
- `201 Created` : Ressource créée avec succès
- `400 Bad Request` : Données invalides dans la requête
- `401 Unauthorized` : Non authentifié
- `403 Forbidden` : Non autorisé
- `404 Not Found` : Ressource non trouvée
- `500 Internal Server Error` : Erreur serveur

## Headers Requis

Pour les requêtes authentifiées :
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```
