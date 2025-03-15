import React, { useContext } from 'react';
import AuthContext from '../../context/authContext';
import { updateTask, deleteTask } from '../../services/taskService';

const TaskCard = ({ task, project, onDelete, onUpdate, isDragging }) => {
  const { user } = useContext(AuthContext);
  
  // Déterminer les permissions de l'utilisateur
  const isAssignedToMe = task.assigned_to === user.id;
  const isProjectOwner = project && project.owner.id === user.id;
  const canEdit = isAssignedToMe || isProjectOwner || user.is_superuser;
  const canDelete = isProjectOwner || user.is_superuser;
  
  // Calculer si la date est dépassée
  const isDueDatePassed = () => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== 'done';
  };
  
  const handleStatusChange = async (e) => {
    const status = e.target.value;
    
    try {
      const updatedTask = await updateTask(task.id, { status });
      if (onUpdate) onUpdate(updatedTask);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };
  
  const handleDeleteTask = async () => {
    if (window.confirm('⚠️ Es-tu sûr de vouloir supprimer cette tâche ?')) {
      try {
        await deleteTask(task.id);
        if (onDelete) onDelete(task.id);
      } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error);
        alert('Erreur lors de la suppression de la tâche');
      }
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Trouver le nom de l'utilisateur assigné
  const getAssigneeName = () => {
    if (!task.assigned_to) return 'Non assignée';
    
    if (project) {
      const assignee = project.members.find(member => member.id === task.assigned_to);
      if (assignee) return assignee.username || assignee.email;
    }
    
    return `Utilisateur #${task.assigned_to}`;
  };
  
  // Obtenir la classe de couleur selon le statut
  const getStatusColor = () => {
    if (isDueDatePassed()) return 'border-red-500 bg-red-50';
    
    switch (task.status) {
      case 'todo':
        return 'border-blue-500 bg-blue-50';
      case 'in_progress':
        return 'border-yellow-500 bg-yellow-50';
      case 'done':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = () => {
    switch (task.status) {
      case 'todo':
        return 'À faire';
      case 'in_progress':
        return 'En cours';
      case 'done':
        return 'Terminée';
      default:
        return 'Inconnu';
    }
  };
  
  // Style spécifique pour le drag and drop
  const dragStyle = isDragging ? 'opacity-50 shadow-lg scale-95' : '';
  
  return (
    <div 
      className={`rounded-md shadow-sm border-l-4 ${getStatusColor()} ${dragStyle} transition-all duration-200 cursor-grab active:cursor-grabbing`}
      draggable={canEdit}
      data-task-id={task.id}
      data-current-status={task.status}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800">{task.title}</h3>
          
          {/* Badge de statut */}
          <div className={`px-2 py-0.5 text-xs rounded-full 
            ${task.status === 'todo' ? 'bg-blue-100 text-blue-800' : 
             task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
             'bg-green-100 text-green-800'}`}
          >
            {getStatusLabel()}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
        
        <div className="space-y-2 text-xs text-gray-600">
          {/* Assignation */}
          <div className="flex items-center">
            <span className="mr-1">👤</span>
            <span>{getAssigneeName()}</span>
            {isAssignedToMe && (
              <span className="ml-1 px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded-full">
                Moi
              </span>
            )}
          </div>
          
          {/* Date d'échéance */}
          <div className={`flex items-center ${isDueDatePassed() ? 'text-red-600 font-semibold' : ''}`}>
            <span className="mr-1">📅</span>
            <span>Échéance: {formatDate(task.due_date)}</span>
            {isDueDatePassed() && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full">
                En retard
              </span>
            )}
          </div>
        </div>
        
        {/* Actions uniquement affichées si l'utilisateur a des permissions */}
        {(canEdit || canDelete) && (
          <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center">
            {canEdit && (
              <select
                value={task.status}
                onChange={handleStatusChange}
                className={`text-xs py-1 px-2 rounded border ${
                  task.status === 'todo' ? 'border-blue-300 bg-blue-50' : 
                  task.status === 'in_progress' ? 'border-yellow-300 bg-yellow-50' : 
                  'border-green-300 bg-green-50'
                }`}
              >
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="done">Terminée</option>
              </select>
            )}
            
            {canDelete && (
              <button
                onClick={handleDeleteTask}
                className="text-xs p-1 text-red-600 hover:text-red-800 transition-colors"
                title="Supprimer"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;