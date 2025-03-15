import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/authContext';
import ProjectList from '../projects/projectList';
import { createTeacher, getUsers } from '../../services/userService';
import { fetchProjectStatistics } from '../../services/projectServices';
import { fetchTaskStatistics } from '../../services/taskService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState({ teachers: [], students: [] });
  const [projectStats, setProjectStats] = useState({ todo: 0, in_progress: 0, done: 0, total: 0 });
  const [taskStats, setTaskStats] = useState({ todo: 0, in_progress: 0, done: 0, total: 0 });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!user.is_staff && !user.is_superuser) {
      navigate('/dashboard');
      return;
    }

    loadUsers();
    loadStatistics();
  }, [user, navigate]);

  const loadStatistics = async () => {
    try {
      const [projectStatsData, taskStatsData] = await Promise.all([
        fetchProjectStatistics(),
        fetchTaskStatistics()
      ]);
      setProjectStats(projectStatsData);
      setTaskStats(taskStatsData);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await getUsers();
      const teachers = allUsers.filter(u => u.is_staff && !u.is_superuser);
      const students = allUsers.filter(u => !u.is_staff);
      setUsers({ teachers, students });
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const handleTeacherFormChange = (e) => {
    const { name, value } = e.target;
    setTeacherForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createTeacher(teacherForm);
      setShowTeacherModal(false);
      setTeacherForm({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: ''
      });
      loadUsers();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte enseignant');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen w-screen overflow-x-hidden bg-gray-100">
      {/* Header fixe */}
      <header className="w-full bg-teal-500 text-white shadow-md z-10">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold">FlowTask</h1>
            <span className="px-2 py-1 text-xs bg-teal-600 rounded-md">Administrateur</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigate('/profile')}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded-md flex items-center transition-colors"
            >
              <span className="mr-1">👤</span> Profil
            </button>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md flex items-center transition-colors"
            >
              <span className="mr-1">🚪</span> Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main content avec largeur maximale et padding uniforme */}
      <main className="flex-grow w-full p-4">
        <div className="grid gap-4">
          {/* Carte de bienvenue */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Tableau de bord Administrateur</h2>
            <p className="text-gray-600 mb-1">Bienvenue, {user.first_name} {user.last_name}</p>
            <p className="text-gray-600">Gérez les utilisateurs et les projets de la plateforme.</p>
          </div>
          
          {/* Statistiques globales */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📊</span> Statistiques Globales
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Statistiques des projets */}
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Projets</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-md border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600">À faire</p>
                    <p className="text-xl font-bold text-blue-500">{projectStats.todo}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-600">En cours</p>
                    <p className="text-xl font-bold text-yellow-500">{projectStats.in_progress}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md border-l-4 border-green-500">
                    <p className="text-sm text-gray-600">Terminés</p>
                    <p className="text-xl font-bold text-green-500">{projectStats.done}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md border-l-4 border-purple-500">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold text-purple-500">{projectStats.total}</p>
                  </div>
                </div>
              </div>
              
              {/* Statistiques des tâches */}
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Tâches</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-md border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600">À faire</p>
                    <p className="text-xl font-bold text-blue-500">{taskStats.todo}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-600">En cours</p>
                    <p className="text-xl font-bold text-yellow-500">{taskStats.in_progress}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md border-l-4 border-green-500">
                    <p className="text-sm text-gray-600">Terminées</p>
                    <p className="text-xl font-bold text-green-500">{taskStats.done}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md border-l-4 border-purple-500">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold text-purple-500">{taskStats.total}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions admin et statistiques */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">⚙️</span> Actions Administrateur
              </h2>
              <button 
                onClick={() => setShowTeacherModal(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-3 rounded-md flex items-center transition-colors"
              >
                <span className="mr-1">👨‍🏫</span> Ajouter un Enseignant
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-md p-4 border-l-4 border-teal-500">
                <h3 className="text-gray-700 mb-1">Enseignants</h3>
                <p className="text-2xl font-bold text-teal-500">{users.teachers.length}</p>
              </div>
              
              <div className="bg-gray-50 rounded-md p-4 border-l-4 border-indigo-500">
                <h3 className="text-gray-700 mb-1">Étudiants</h3>
                <p className="text-2xl font-bold text-indigo-500">{users.students.length}</p>
              </div>
            </div>
          </div>
          
          {/* Liste des enseignants */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">👨‍🏫</span> Liste des Enseignants
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.teachers.map(teacher => (
                <div key={teacher.id} className="bg-gray-50 rounded-md p-3 border border-gray-200 hover:shadow-sm transition-shadow">
                  <h3 className="font-semibold text-gray-800 mb-1">{teacher.first_name} {teacher.last_name}</h3>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <span className="mr-1">📧</span> {teacher.email}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="mr-1">👤</span> {teacher.username}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Liste des étudiants */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">👨‍🎓</span> Liste des Étudiants
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.students.map(student => (
                <div key={student.id} className="bg-gray-50 rounded-md p-3 border border-gray-200 hover:shadow-sm transition-shadow">
                  <h3 className="font-semibold text-gray-800 mb-1">{student.first_name} {student.last_name}</h3>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <span className="mr-1">📧</span> {student.email}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="mr-1">👤</span> {student.username}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Projets */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📂</span> Projets
            </h2>
            
            <div className="bg-gray-50 rounded-md p-4">
              <ProjectList role="admin" />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer simple */}
      <footer className="w-full bg-gray-800 text-white py-4 text-center">
        <p> 2025 FlowTask - Plateforme de gestion de tâches</p>
      </footer>
      
      {/* Modal d'ajout d'enseignant */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Ajouter un Enseignant</h2>
                <button 
                  onClick={() => setShowTeacherModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  
                </button>
              </div>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                  <p>{error}</p>
                </div>
              )}
              
              <form onSubmit={handleCreateTeacher}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={teacherForm.username}
                      onChange={handleTeacherFormChange}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={teacherForm.email}
                      onChange={handleTeacherFormChange}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={teacherForm.first_name}
                      onChange={handleTeacherFormChange}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={teacherForm.last_name}
                      onChange={handleTeacherFormChange}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={teacherForm.password}
                      onChange={handleTeacherFormChange}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      id="password2"
                      name="password2"
                      value={teacherForm.password2}
                      onChange={handleTeacherFormChange}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowTeacherModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-teal-500 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    disabled={loading}
                  >
                    {loading ? 'Création...' : 'Créer le compte'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;