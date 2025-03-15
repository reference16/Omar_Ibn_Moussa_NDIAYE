import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/authContext.jsx';
import { fetchProjects, createProject, deleteProject, fetchUsers, updateProject } from '../services/projectServices.js';
import { createTask, fetchTasks, updateTask, deleteTask } from '../services/taskService.js';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    members: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    assignedTo: '',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0] 
  });
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTasksList, setShowTasksList] = useState(false);
  const [projectTasks, setProjectTasks] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProjects();
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      setError('Erreur lors du chargement des projets');
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      setError('Le nom du projet est requis');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const createdProject = await createProject(newProject);
      setProjects([...projects, createdProject]);
      setNewProject({ name: '', description: '', members: [] });
    } catch (error) {
      setError('Erreur lors de la création du projet');
      console.error('Erreur lors de la création du projet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('⚠️ Es-tu sûr de vouloir supprimer ce projet ?')) {
      try {
        setLoading(true);
        setError('');
        await deleteProject(projectId);
        setProjects(projects.filter(p => p.id !== projectId));
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
          setShowProjectDetails(false);
        }
      } catch (error) {
        setError('Erreur lors de la suppression du projet');
        console.error('Erreur lors de la suppression du projet:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setEditedProject({ ...project });
    setShowProjectDetails(true);
    setEditMode(false);
    setShowAddTask(false);
  };

  const handleEditProject = () => {
    setEditMode(true);
    setShowAddTask(false);
  };

  const handleAddTask = () => {
    setShowAddTask(true);
    setEditMode(false);
  };

  const handleSaveProject = async () => {
    try {
      setLoading(true);
      const updatedProject = await updateProject(editedProject.id, editedProject);
      setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      setSelectedProject(updatedProject);
      setEditMode(false);
    } catch (error) {
      setError('Erreur lors de la modification du projet');
      console.error('Erreur lors de la modification du projet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!newTask.title.trim()) {
      setError('Le titre de la tâche est requis');
      return;
    }
    if (!newTask.description.trim()) {
      setError('La description de la tâche est requise');
      return;
    }
    if (!newTask.assignedTo) {
      setError('Veuillez assigner la tâche à un membre');
      return;
    }
    if (!newTask.dueDate) {
      setError('La date limite est requise');
      return;
    }

    // Vérifier que la date limite n'est pas dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(newTask.dueDate);
    if (dueDate < today) {
      setError('La date limite ne peut pas être dans le passé');
      return;
    }

    try {
      setLoading(true);
      const createdTask = await createTask(
        selectedProject.id,
        newTask.title,
        newTask.description,
        newTask.assignedTo,
        newTask.dueDate,
        newTask.status
      );

      // Mettre à jour la liste des tâches
      setSelectedProject({
        ...selectedProject,
        tasks: [...(selectedProject.tasks || []), createdTask]
      });

      // Réinitialiser le formulaire
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        status: 'todo',
        dueDate: new Date().toISOString().split('T')[0]
      });
      setShowAddTask(false);
    } catch (error) {
      setError('Erreur lors de la création de la tâche. Veuillez réessayer.');
      console.error('Erreur lors de la création de la tâche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewTasks = async (project) => {
    try {
      setLoading(true);
      setError('');
      const tasks = await fetchTasks(project.id);
      setProjectTasks(tasks);
      setSelectedProject(project);
      setShowTasksList(true);
    } catch (error) {
      setError('Erreur lors du chargement des tâches');
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      setLoading(true);
      setError('');
      
      // Envoi uniquement du statut dans un objet
      await updateTask(taskId, { status: newStatus });
      
      // Mettre à jour l'état local
      setProjectTasks(projectTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      setError('Erreur lors de la mise à jour du statut');
      console.error('Erreur lors de la mise à jour du statut:', error);
    } finally {
      setLoading(false);
    }
  };

// Assurez-vous que cette ligne est présente dans les imports en haut du fichier

const handleDeleteTask = async (taskId) => {
  if (window.confirm('⚠️ Es-tu sûr de vouloir supprimer cette tâche ?')) {
    try {
      setLoading(true);
      setError('');
      await deleteTask(taskId);
      setProjectTasks(projectTasks.filter(task => task.id !== taskId));
    } catch (error) {
      setError('Erreur lors de la suppression de la tâche');
      console.error('Erreur lors de la suppression de la tâche:', error);
    } finally {
      setLoading(false);
    }
  }
};

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>📊 Tableau de bord</h1>
        <div className="user-actions">
          <button 
            onClick={() => navigate('/profile')}
            className="profile-button"
          >
            👤 Mon Profil
          </button>
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            🚪 Déconnexion
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <section className="projects-section">
        <h2>📁 Mes Projets</h2>
        {loading ? (
          <div className="loading-message">⏳ Chargement des projets...</div>
        ) : (
          <>
            {projects.length === 0 ? (
              <p className="no-projects">Aucun projet trouvé.</p>
            ) : (
              <div className="projects-grid">
                {projects.map(project => (
                  <div key={project.id} className="project-card">
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <div className="project-actions">
                      <button
                        onClick={() => handleViewProject(project)}
                        className="view-button"
                      >
                        👁️ Voir
                      </button>
                      <button
                        onClick={() => handleViewTasks(project)}
                        className="view-tasks-button"
                      >
                        📋 Tâches
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="delete-button"
                        disabled={loading}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showProjectDetails && selectedProject && (
              <div className="project-details-modal">
                <div className="modal-content">
                  {!editMode && !showAddTask && (
                    <>
                      <h2>{selectedProject.name}</h2>
                      <p>{selectedProject.description}</p>
                      <div className="members-list">
                        <h3>Membres du projet :</h3>
                        <ul>
                          {selectedProject.members.map(member => (
                            <li key={member.id}>
                              {member.username || member.email}
                              {selectedProject.owner.id === member.id && " (Propriétaire)"}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="tasks-list">
                        <h3>Tâches :</h3>
                        <ul>
                          {(selectedProject.tasks || []).map(task => (
                            <li key={task.id}>
                              <strong>{task.title}</strong>
                              <p>{task.description}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="modal-actions">
                        <button 
                          onClick={handleEditProject}
                          className="edit-button"
                        >
                          ✏️ Modifier
                        </button>
                        <button 
                          onClick={handleAddTask}
                          className="add-task-button"
                        >
                          ➕ Ajouter une tâche
                        </button>
                        <button 
                          onClick={() => setShowProjectDetails(false)}
                          className="close-button"
                        >
                          ❌ Fermer
                        </button>
                      </div>
                    </>
                  )}

                  {editMode && (
                    <div className="edit-form">
                      <h2>Modifier le projet</h2>
                      <input
                        type="text"
                        value={editedProject.name}
                        onChange={(e) => setEditedProject({ 
                          ...editedProject, 
                          name: e.target.value 
                        })}
                        placeholder="Nom du projet"
                      />
                      <textarea
                        value={editedProject.description}
                        onChange={(e) => setEditedProject({ 
                          ...editedProject, 
                          description: e.target.value 
                        })}
                        placeholder="Description"
                        rows="3"
                      />
                      <select
                        multiple
                        value={editedProject.members.map(m => m.id)}
                        onChange={(e) => {
                          const selectedOptions = Array.from(e.target.selectedOptions);
                          setEditedProject({ 
                            ...editedProject, 
                            members: selectedOptions.map(option => option.value)
                          });
                        }}
                        className="members-select"
                      >
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.username || u.email}
                          </option>
                        ))}
                      </select>
                      <div className="modal-actions">
                        <button 
                          onClick={handleSaveProject}
                          className="save-button"
                          disabled={loading}
                        >
                          {loading ? '⏳ Enregistrement...' : '💾 Enregistrer'}
                        </button>
                        <button 
                          onClick={() => {
                            setEditMode(false);
                            setEditedProject({ ...selectedProject });
                          }}
                          className="cancel-button"
                        >
                          ❌ Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  {showAddTask && (
                    <div className="add-task-form">
                      <h2>Ajouter une tâche</h2>
                      <form onSubmit={handleCreateTask} className="task-form">
                        {error && <div className="error-message">{error}</div>}
                        
                        <div className="form-group">
                          <label htmlFor="taskTitle">Titre*</label>
                          <input
                            id="taskTitle"
                            type="text"
                            value={newTask.title}
                            onChange={(e) => {
                              setError('');
                              setNewTask({
                                ...newTask,
                                title: e.target.value
                              });
                            }}
                            required
                            className="form-control"
                            placeholder="Titre de la tâche"
                          />
                        </div>

                        <div className="form-group">
  <label htmlFor="taskAssignee">Assigner à*</label>
  <select
    id="taskAssignee"
    value={newTask.assignedTo}
    onChange={(e) => {
      setError('');
      setNewTask({
        ...newTask,
        assignedTo: e.target.value
      });
    }}
    required
    className="form-control"
  >
    <option value="">Sélectionner un membre</option>
    {/* Afficher le propriétaire du projet */}
    <option key={selectedProject.owner.id} value={selectedProject.owner.id}>
      {selectedProject.owner.username || selectedProject.owner.email} (Propriétaire)
    </option>
    {/* Afficher tous les membres du projet (sauf le propriétaire pour éviter les doublons) */}
    {selectedProject?.members?.filter(member => member.id !== selectedProject.owner.id).map((member) => (
      <option key={member.id} value={member.id}>
        {member.username || member.email}
      </option>
    ))}
  </select>
</div>

                        <div className="form-group">
                          <label htmlFor="taskAssignee">Assigner à*</label>
                          <select
                            id="taskAssignee"
                            value={newTask.assignedTo}
                            onChange={(e) => {
                              setError('');
                              setNewTask({
                                ...newTask,
                                assignedTo: e.target.value
                              });
                            }}
                            required
                            className="form-control"
                          >
                            <option value="">Sélectionner un membre</option>
                            {selectedProject?.members?.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.username}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="taskDueDate">Date limite*</label>
                          <input
                            id="taskDueDate"
                            type="date"
                            value={newTask.dueDate}
                            onChange={(e) => {
                              setError('');
                              setNewTask({
                                ...newTask,
                                dueDate: e.target.value
                              });
                            }}
                            required
                            className="form-control"
                            min={new Date().toISOString().split('T')[0]}
                          />
                          <small className="form-text text-muted">
                            La date limite doit être égale ou postérieure à aujourd'hui
                          </small>
                        </div>

                        <div className="form-group">
                          <label htmlFor="taskStatus">Statut*</label>
                          <select
                            id="taskStatus"
                            value={newTask.status}
                            onChange={(e) => {
                              setError('');
                              setNewTask({
                                ...newTask,
                                status: e.target.value
                              });
                            }}
                            required
                            className="form-control"
                          >
                            <option value="todo">À faire</option>
                            <option value="in_progress">En cours</option>
                            <option value="done">Terminée</option>
                          </select>
                        </div>

                        <div className="modal-actions">
                          <button 
                            type="submit" 
                            className="submit-button"
                            disabled={loading}
                          >
                            {loading ? 'Création...' : 'Créer la tâche'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddTask(false);
                              setError('');
                              setNewTask({
                                title: '',
                                description: '',
                                assignedTo: '',
                                status: 'todo',
                                dueDate: new Date().toISOString().split('T')[0]
                              });
                            }}
                            className="cancel-button"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal pour la liste des tâches */}
            {showTasksList && selectedProject && (
              <div className="tasks-modal">
                <div className="modal-content">
                  <h2>Tâches du projet : {selectedProject.name}</h2>
                  
                  {loading ? (
                    <div className="loading">⏳ Chargement des tâches...</div>
                  ) : projectTasks.length === 0 ? (
                    <p>Aucune tâche pour ce projet.</p>
                  ) : (
                    <div className="tasks-grid">
                      {projectTasks.map(task => (
                        <div key={task.id} className="task-card">
                          <h3>{task.title}</h3>
                          <p>{task.description}</p>
                          <p>
                            <strong>Assignée à :</strong> {users.find(u => u.id === task.assigned_to)?.username || 'Non assignée'}
                          </p>
                          <p>
                            <strong>Date limite :</strong> {new Date(task.due_date).toLocaleDateString()}
                          </p>
                          <div className="task-status">
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                              className={`status-select status-${task.status}`}
                            >
                              <option value="todo">À faire</option>
                              <option value="in_progress">En cours</option>
                              <option value="done">Terminée</option>
                            </select>
                          </div>
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="delete-button"
                          >
                            ❌ Supprimer
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="modal-actions">
                    <button 
                      onClick={() => setShowTasksList(false)}
                      className="close-button"
                    >
                      ❌ Fermer
                    </button>
                   
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <form onSubmit={handleCreateProject} className="create-project-form">
        <h3>➕ Ajouter un projet</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Nom du projet"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            rows="3"
          />
          <select
            multiple
            value={newProject.members}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions);
              setNewProject({ 
                ...newProject, 
                members: selectedOptions.map(option => option.value)
              });
            }}
            className="members-select"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.username || u.email}
              </option>
            ))}
          </select>
          <button 
            type="submit"
            disabled={loading}
            className="create-button"
          >
            {loading ? '⏳ Création...' : '✨ Créer le projet'}
          </button>
        </div>
      </form>

      <style>
        {`
        .dashboard-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .project-details-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .edit-button, .add-task-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .edit-button {
          background: #4CAF50;
          color: white;
        }

        .add-task-button {
          background: #2196F3;
          color: white;
        }

        .save-button {
          background: #4CAF50;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .cancel-button {
          background: #f44336;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .edit-form input, .edit-form textarea,
        .add-task-form input, .add-task-form textarea {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .members-select {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          min-height: 100px;
        }

        .members-list {
          margin-top: 20px;
        }

        .members-list ul {
          list-style: none;
          padding: 0;
        }

        .members-list li {
          padding: 5px 0;
        }

        .tasks-list {
          margin-top: 20px;
        }

        .tasks-list ul {
          list-style: none;
          padding: 0;
        }

        .tasks-list li {
          padding: 10px;
          margin: 5px 0;
          background: #f5f5f5;
          border-radius: 4px;
        }

        .close-button {
          margin-top: 20px;
          padding: 8px 16px;
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .close-button:hover {
          background: #cc0000;
        }

        .task-select {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
        }

        .tasks-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .task-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .task-status {
          margin-top: 20px;
        }

        .status-select {
          padding: 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .status-todo {
          background: #ff9800;
          color: white;
        }

        .status-in_progress {
          background: #2196F3;
          color: white;
        }

        .status-done {
          background: #4CAF50;
          color: white;
        }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
