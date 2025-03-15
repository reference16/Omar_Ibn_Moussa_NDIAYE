# Documentation Frontend

## Structure de l'Application React

### Architecture des Composants

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── dashboards/
│   │   ├── adminDashboard.jsx
│   │   ├── teacherDashboard.jsx
│   │   └── studentDashboard.jsx
│   ├── projects/
│   │   ├── projectList.jsx
│   │   ├── projectCreate.jsx
│   │   └── projectDetail.jsx
│   └── tasks/
│       ├── taskList.jsx
│       └── taskCreate.jsx
├── context/
│   └── authContext.js
├── services/
│   ├── projectServices.js
│   ├── taskService.js
│   └── userService.js
└── axios.js
```

## Configuration Axios

```javascript
// src/axios.js
import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8000/',
    headers: {
        'Content-Type': 'application/json'
    }
});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
```

## Contexte d'Authentification

```javascript
// src/context/authContext.js
const AuthContext = createContext({
    user: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: false
});
```

## Services

### Service Projets
```javascript
// src/services/projectServices.js
export const PROJECT_STATUS = {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    DONE: 'done'
};

export const fetchProjects = async () => {
    const response = await axios.get('/api/projects/');
    return response.data;
};
```

### Service Tâches
```javascript
// src/services/taskService.js
export const createTask = async (projectId, taskData) => {
    const response = await axios.post(`/api/projects/${projectId}/tasks/`, taskData);
    return response.data;
};
```

## Tableaux de Bord

### Tableau de Bord Enseignant
- Affichage des statistiques des projets et tâches
- Actions rapides pour créer des projets
- Liste des projets avec filtres
- Interface de gestion des tâches

### Tableau de Bord Étudiant
- Vue des projets assignés
- Gestion des tâches personnelles
- Suivi de progression

### Tableau de Bord Admin
- Gestion des utilisateurs
- Création de comptes enseignants
- Statistiques globales

## Styles et UI

L'application utilise Tailwind CSS pour le styling avec une palette de couleurs cohérente :

```javascript
// Couleurs principales
const colors = {
    primary: 'teal-500',    // Actions principales
    secondary: 'indigo-500', // Actions secondaires
    success: 'green-500',    // Statut "terminé"
    warning: 'yellow-500',   // Statut "en cours"
    danger: 'red-500',       // Actions destructives
    info: 'blue-500'         // Statut "à faire"
};
```

## Gestion des États

### État Global (Context)
- AuthContext : Gestion de l'authentification
- Stockage du token JWT
- Information utilisateur

### États Locaux (useState)
- Gestion des formulaires
- États de chargement
- États des modales

## Sécurité

### Protection des Routes
```javascript
// Exemple de route protégée
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    return isAuthenticated ? children : <Navigate to="/login" />;
};
```

### Gestion des Tokens
- Stockage sécurisé dans localStorage
- Rafraîchissement automatique
- Déconnexion sur expiration

## Bonnes Pratiques

1. **Performance**
   - Utilisation de useMemo et useCallback
   - Lazy loading des composants
   - Optimisation des re-renders

2. **Sécurité**
   - Validation des entrées utilisateur
   - Protection XSS
   - Gestion sécurisée des tokens

3. **Maintenance**
   - Organisation modulaire
   - Documentation des composants
   - Conventions de nommage cohérentes
