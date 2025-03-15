# Guide de Configuration du Projet

## Prérequis Système

### Backend (Django)
- Python 3.8+
- pip (gestionnaire de paquets Python)
- PostgreSQL 12+ (recommandé) ou SQLite
- Virtualenv (optionnel mais recommandé)

### Frontend (React)
- Node.js 14+
- npm 6+ ou yarn 1.22+
- Un navigateur web moderne

## Configuration de l'Environnement de Développement

### 1. Configuration du Backend

#### 1.1 Préparation de l'environnement Python
```bash
# Création de l'environnement virtuel
python -m venv venv

# Activation de l'environnement virtuel
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Installation des dépendances
cd backend
pip install -r requirements.txt
```

#### 1.2 Configuration de la Base de Données
```python
# config/settings.py

# Pour PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'gestion_taches',
        'USER': 'votre_utilisateur',
        'PASSWORD': 'votre_mot_de_passe',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Pour SQLite (plus simple pour le développement)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

#### 1.3 Variables d'Environnement
Créez un fichier `.env` dans le dossier backend :
```env
DEBUG=True
SECRET_KEY=votre_cle_secrete
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Configuration Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=votre_email@gmail.com
EMAIL_HOST_PASSWORD=votre_mot_de_passe
```

#### 1.4 Initialisation de la Base de Données
```bash
# Création des tables
python manage.py migrate

# Création d'un superutilisateur
python manage.py createsuperuser

# Lancement du serveur de développement
python manage.py runserver
```

### 2. Configuration du Frontend

#### 2.1 Installation des Dépendances
```bash
# Accéder au dossier frontend
cd frontend/gestion_taches

# Installation des dépendances
npm install
# ou avec yarn
yarn install
```

#### 2.2 Configuration des Variables d'Environnement
Créez un fichier `.env` dans le dossier frontend/gestion_taches :
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
```

#### 2.3 Lancement du Serveur de Développement
```bash
npm start
# ou avec yarn
yarn start
```

## Configuration de Production

### Backend (Django)

1. **Sécurité**
```python
# settings.py
DEBUG = False
ALLOWED_HOSTS = ['votre-domaine.com']
CORS_ALLOWED_ORIGINS = ['https://votre-domaine.com']

# Configuration HTTPS
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

2. **Serveur Web**
```nginx
# Configuration Nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /static/ {
        alias /chemin/vers/vos/fichiers/statiques/;
    }
    
    location /media/ {
        alias /chemin/vers/vos/fichiers/media/;
    }
}
```

### Frontend (React)

1. **Build de Production**
```bash
# Construction du build de production
npm run build
# ou avec yarn
yarn build
```

2. **Configuration Nginx pour le Frontend**
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    root /chemin/vers/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Scripts Utiles

### Backend
```bash
# Création des migrations
python manage.py makemigrations

# Application des migrations
python manage.py migrate

# Collecte des fichiers statiques
python manage.py collectstatic

# Tests
python manage.py test
```

### Frontend
```bash
# Lancement des tests
npm test

# Vérification du linting
npm run lint

# Build de production
npm run build
```

## Résolution des Problèmes Courants

### Backend

1. **Erreur de Migration**
```bash
# Réinitialisation des migrations
python manage.py migrate --fake app_name zero
python manage.py migrate app_name
```

2. **Problèmes de CORS**
Vérifiez que `CORS_ALLOWED_ORIGINS` dans settings.py correspond à l'URL de votre frontend.

### Frontend

1. **Erreurs de Build**
```bash
# Nettoyage du cache
npm cache clean --force
rm -rf node_modules
npm install
```

2. **Problèmes d'API**
Vérifiez que `REACT_APP_API_URL` pointe vers la bonne URL du backend.

## Maintenance

### Sauvegarde de la Base de Données
```bash
# PostgreSQL
pg_dump -U utilisateur nom_base > backup.sql

# Restauration
psql -U utilisateur nom_base < backup.sql
```

### Mise à Jour des Dépendances
```bash
# Backend
pip freeze > requirements.txt

# Frontend
npm update
# ou
yarn upgrade
```
