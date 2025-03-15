import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/authContext';
import TaskCard from './taskCard';
import TaskForm from './taskForm';
import ConfettiEffect from './confettiEffect';
import { fetchTasks, updateTask } from '../../services/taskService';
import { fetchProjects } from '../../services/projectServices';

const TaskList = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggingTask, setDraggingTask] = useState(null);
  const [confetti, setConfetti] = useState(false);
  
  // Références aux colonnes pour le drag & drop
  const todoColumnRef = useRef(null);
  const inProgressColumnRef = useRef(null);
  const doneColumnRef = useRef(null);
  
  useEffect(() => {
    loadProjectAndTasks();
  }, [projectId]);
  
  // Fonctions de drag & drop
  const handleDragStart = (e, task) => {
    setDraggingTask(task);
    e.dataTransfer.setData('text/plain', JSON.stringify(task));
    // Ajouter une classe pour le style pendant le drag
    setTimeout(() => {
      e.target.classList.add('opacity-50');
    }, 0);
  };
  
  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
    setDraggingTask(null);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    
    try {
      const task = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      // Si le statut n'a pas changé, ne rien faire
      if (task.status === newStatus) return;
      
      // Déclencher les confettis si la tâche est marquée comme terminée
      if (newStatus === 'done' && task.status !== 'done') {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
      }
      
      // Mettre à jour le statut de la tâche
      const updatedTask = await updateTask(task.id, { status: newStatus });
      
      // Mettre à jour l'état local
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setError('Erreur lors du déplacement de la tâche');
    }
  };
  
  const loadProjectAndTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Charger les détails du projet
      const projects = await fetchProjects();
      const projectData = projects.find(p => p.id === parseInt(projectId));
      
      if (!projectData) {
        setError('Projet non trouvé');
        return;
      }
      
      // S'assurer que la structure des membres est correcte
      // Créer un tableau complet de tous les membres du projet
      if (projectData) {
        // Si projectData.members n'existe pas ou n'est pas un tableau, on initialise un tableau vide
        const members = Array.isArray(projectData.members) ? [...projectData.members] : [];
        
        // Transformer tous les membres pour s'assurer qu'ils ont un format cohérent
        const formattedMembers = members.map(member => ({
          ...member,
          is_owner: projectData.owner && member.id === projectData.owner.id
        }));
        
        // Vérifier si le propriétaire est déjà inclus dans les membres
        // Si non, l'ajouter au tableau des membres avec le flag is_owner
        if (projectData.owner && !formattedMembers.some(member => member.id === projectData.owner.id)) {
          formattedMembers.push({
            ...projectData.owner,
            is_owner: true
          });
        }
        
        // Utiliser formattedMembers au lieu de members
        projectData.allMembers = formattedMembers;
        
        // Mettre à jour projectData avec le tableau complet des membres
        projectData.allMembers = members;
      }
      
      setProject(projectData);
      
      // Charger les tâches du projet
      const tasksData = await fetchTasks(projectId);
      setTasks(tasksData);
      
      // Log pour débogage
      console.log("Projet chargé:", projectData);
      console.log("Membres disponibles:", projectData?.allMembers);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
    setShowAddForm(false);
  };
  
  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };
  
  // Déterminer si l'utilisateur peut ajouter des tâches (propriétaire du projet ou admin)
  const canAddTask = project && (project.owner.id === user.id || user.is_superuser);
  
  // Grouper les tâches par statut
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const doneTasks = tasks.filter(task => task.status === 'done');
  
  return (
    <div className="fixed inset-0 flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-teal-500 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded-md flex items-center transition-colors"
            >
              <span className="mr-2">←</span> Retour
            </button>
            
            {project && (
              <h1 className="text-xl font-bold">
                Tâches du projet: {project.name}
              </h1>
            )}
            
            {canAddTask && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded-md flex items-center transition-colors"
              >
                <span className="mr-1">➕</span> Ajouter une tâche
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {error && (
          <div className="m-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="flex items-center">
              <span className="mr-2">❌</span> {error}
            </p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 h-full px-2 pb-2">
            {/* Colonne À faire */}
            <div 
              ref={todoColumnRef}
              className="bg-blue-50 rounded-md shadow-sm flex flex-col h-full overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'todo')}
            >
              <div className="bg-blue-500 text-white py-2 px-4 sticky top-0 z-10">
                <h2 className="text-lg font-semibold">À faire</h2>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                {todoTasks.length === 0 ? (
                  <div className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-300 rounded-md h-full flex items-center justify-center">
                    <p>Aucune tâche à faire</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todoTasks.map(task => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)} 
                        onDragEnd={handleDragEnd}
                      >
                        <TaskCard 
                          task={task} 
                          project={project}
                          onDelete={handleTaskDeleted}
                          onUpdate={handleTaskUpdated}
                          isDragging={draggingTask && draggingTask.id === task.id}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Colonne En cours */}
            <div 
              ref={inProgressColumnRef}
              className="bg-yellow-50 rounded-md shadow-sm flex flex-col h-full overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'in_progress')}
            >
              <div className="bg-yellow-500 text-white py-2 px-4 sticky top-0 z-10">
                <h2 className="text-lg font-semibold">En cours</h2>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                {inProgressTasks.length === 0 ? (
                  <div className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-300 rounded-md h-full flex items-center justify-center">
                    <p>Aucune tâche en cours</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inProgressTasks.map(task => (
                      <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)} 
                        onDragEnd={handleDragEnd}
                      >
                        <TaskCard 
                          task={task} 
                          project={project}
                          onDelete={handleTaskDeleted}
                          onUpdate={handleTaskUpdated}
                          isDragging={draggingTask && draggingTask.id === task.id}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Colonne Terminées */}
            <div 
              ref={doneColumnRef}
              className="bg-green-50 rounded-md shadow-sm flex flex-col h-full overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'done')}
            >
              <div className="bg-green-500 text-white py-2 px-4 sticky top-0 z-10">
                <h2 className="text-lg font-semibold">Terminées</h2>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                {doneTasks.length === 0 ? (
                  <div className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-300 rounded-md h-full flex items-center justify-center">
                    <p>Aucune tâche terminée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doneTasks.map(task => (
                      <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)} 
                        onDragEnd={handleDragEnd}
                      >
                        <TaskCard 
                          task={task} 
                          project={project}
                          onDelete={handleTaskDeleted}
                          onUpdate={handleTaskUpdated}
                          isDragging={draggingTask && draggingTask.id === task.id}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Modal pour ajouter une tâche */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Ajouter une nouvelle tâche
                </h2>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <TaskForm 
                projectId={parseInt(projectId)}
                onTaskCreated={handleTaskCreated}
                projectMembers={project?.allMembers || []}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Effet de confettis lors de la complétion d'une tâche */}
      <ConfettiEffect active={confetti} />
    </div>
  );
};

export default TaskList;