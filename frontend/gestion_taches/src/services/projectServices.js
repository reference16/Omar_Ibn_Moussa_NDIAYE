import axios from '../axios';

// Constantes pour les états de projet
export const PROJECT_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done'
};

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.TODO]: 'À faire',
  [PROJECT_STATUS.IN_PROGRESS]: 'En cours',
  [PROJECT_STATUS.DONE]: 'Terminé'
};

export const fetchProjects = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get('/projects/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des projets :", error);
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    const token = localStorage.getItem('access_token');
    // Créer un nouvel objet avec les données du projet
    const data = {
      name: projectData.name,
      description: projectData.description,
      // Le status est automatiquement 'todo' dans le backend
      members_ids: projectData.members || []
    };
    
    const response = await axios.post('/projects/', data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création du projet :", error);
    throw error;
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
    const token = localStorage.getItem('access_token');
    // Adapter les données pour qu'elles correspondent à ce que le backend attend
    const data = {
      name: projectData.name,
      description: projectData.description,
      members_ids: projectData.members || [],
      status: projectData.status // Ajout du status dans la mise à jour
    };
    
    const response = await axios.patch(`/projects/${projectId}/`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du projet :", error);
    throw error;
  }
};

export const updateProjectStatus = async (projectId, status) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.patch(`/projects/${projectId}/`, { status }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du projet :", error);
    throw error;
  }
};

export const deleteProject = async (projectId) => {
  try {
    const token = localStorage.getItem('access_token');
    await axios.delete(`/projects/${projectId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du projet :", error);
    throw error;
  }
};

export const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get('/users/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des utilisateurs :", error);
    throw error;
  }
};

export const fetchProjectStatistics = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get('/projects/statistics/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques :', error);
    throw error;
  }
};