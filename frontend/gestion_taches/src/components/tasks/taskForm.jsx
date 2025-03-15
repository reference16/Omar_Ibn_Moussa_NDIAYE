import React, { useState, useEffect, useContext } from 'react';
import { createTask, updateTask } from '../../services/taskService';
import AuthContext from '../../context/authContext';

const TaskForm = ({ task, projectId, projectMembers, onTaskCreated, onTaskUpdated }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Charger les données de la tâche si en mode édition
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        assignedTo: task.assigned_to,
        status: task.status,
        dueDate: task.due_date || new Date().toISOString().split('T')[0]
      });
    }
  }, [task]);
  
  // Fonction pour déterminer le nom d'affichage d'un membre
  const getMemberDisplayName = (member) => {
    if (!member) return '';
    
    // Options par ordre de préférence
    if (member.username) return member.username;
    if (member.display_name) return member.display_name;
    if (member.email) return member.email;
    if (member.name) return member.name;
    if (member.first_name && member.last_name) return `${member.first_name} ${member.last_name}`;
    
    // Si aucune information personnelle n'est disponible, utiliser l'ID
    return `Utilisateur #${member.id}`;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    // Validation des champs
    if (!formData.title.trim()) {
      setError('Le titre de la tâche est requis');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('La description de la tâche est requise');
      return false;
    }
    
    if (!formData.assignedTo) {
      setError('Veuillez assigner la tâche à un membre');
      return false;
    }
    
    if (!formData.dueDate) {
      setError('La date limite est requise');
      return false;
    }
    
    // Vérifier que la date limite n'est pas dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(formData.dueDate);
    if (dueDate < today) {
      setError('La date limite ne peut pas être dans le passé');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Formatter les données à envoyer à l'API
      const taskData = {
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assignedTo,
        status: formData.status,
        due_date: formData.dueDate,
        project: projectId
      };
      
      let result;
      
      if (task) {
        // Mode modification
        result = await updateTask(task.id, taskData);
        if (onTaskUpdated) onTaskUpdated(result);
      } else {
        // Mode création
        result = await createTask(
          projectId,
          formData.title,
          formData.description,
          formData.assignedTo,
          formData.dueDate,
          formData.status
        );
        if (onTaskCreated) onTaskCreated(result);
      }
      
      // Réinitialiser le formulaire en mode création
      if (!task) {
        setFormData({
          title: '',
          description: '',
          assignedTo: '',
          status: 'todo',
          dueDate: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la tâche:', error);
      setError('Erreur lors de la sauvegarde de la tâche');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Titre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          disabled={loading}
          placeholder="Titre de la tâche"
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          disabled={loading}
          placeholder="Description détaillée de la tâche"
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          rows="3"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
            Assigner à <span className="text-red-500">*</span>
          </label>
          <select
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo || ''}
            onChange={handleChange}
            required
            disabled={loading}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          >
            <option value="">Sélectionner un membre</option>
            {Array.isArray(projectMembers) && projectMembers.length > 0 ? (
              projectMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {getMemberDisplayName(member)}
                  {member.is_owner ? ' (Propriétaire)' : ''}
                  {member.id === user?.id ? ' (Moi)' : ''}
                </option>
              ))
            ) : (
              <option value="" disabled>Aucun membre disponible</option>
            )}
          </select>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Statut <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            disabled={loading}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          >
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="done">Terminée</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date limite <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
            disabled={loading}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            La date limite doit être égale ou postérieure à aujourd'hui
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button 
          type="submit" 
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 ${
            !loading ? 'hover:bg-teal-700' : ''
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Traitement...
            </span>
          ) : (
            <span className="flex items-center">
              {task ? '💾 Mettre à jour' : '✨ Créer la tâche'}
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;