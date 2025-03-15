import axios from '../axios';

export const fetchProjects = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get('projects/', {
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
      // Envoyer les IDs des membres sélectionnés dans le champ members_ids
      members_ids: projectData.members || []
    };
    
    const response = await axios.post('projects/', data, {
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
      // Renommer members en members_ids pour l'API
      members_ids: projectData.members || []
    };
    
    const response = await axios.patch(`projects/${projectId}/`, data, {
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

export const deleteProject = async (projectId) => {
  try {
    const token = localStorage.getItem('access_token');
    await axios.delete(`projects/${projectId}/`, {
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
    const response = await axios.get('users/', {
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