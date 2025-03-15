import axios from '../axios';

export const createTask = async (projectId, title, description, assignedTo, dueDate, status) => {
  try {
    const response = await axios.post(`projects/${projectId}/tasks/`, {
      title,
      description,
      assigned_to: parseInt(assignedTo),
      due_date: dueDate || null,
      status: status.toLowerCase(),
      project: parseInt(projectId)
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de la tâche:", error);
    throw error;
  }
};

export const fetchTasks = async (projectId) => {
    try {
      if (!projectId) {
        throw new Error("Project ID is required");
      }
      const response = await axios.get(`projects/${projectId}/tasks/list/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error);
      return [];
    }
};

export const updateTask = async (taskId, data) => {
  try {
    let updatedData = {};
    
    if (typeof data === 'string') {
      updatedData = { status: data.toLowerCase() };
    } else {
      updatedData = { ...data };
      
      if (data.assigned_to) {
        updatedData.assigned_to = parseInt(data.assigned_to);
      }
      
      if (data.project || data.project_id) {
        updatedData.project = parseInt(data.project || data.project_id);
      }
      
      if (data.status) {
        updatedData.status = data.status.toLowerCase();
      }
      
      if ('due_date' in data) {
        updatedData.due_date = data.due_date || null;
      }
    }
    
    const response = await axios.patch(`tasks/${taskId}/`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche:", error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    await axios.delete(`tasks/${taskId}/`);
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche:", error);
    throw error;
  }
};

export const fetchTaskStatistics = async (projectId = null) => {
  try {
    const url = projectId ? `tasks/statistics/?project_id=${projectId}` : 'tasks/statistics/';
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error);
    return {
      todo: 0,
      in_progress: 0,
      done: 0,
      total: 0,
      urgent: 0
    };
  }
};