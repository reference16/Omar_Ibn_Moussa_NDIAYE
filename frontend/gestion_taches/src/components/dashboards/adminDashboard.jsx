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
    <div className="flex flex-col min-h-screen w-full bg-gray-100">
      {/* Header */}
      <header className="bg-teal-500 text-white shadow-md w-full">
        <div className="container mx-auto px-4 py-3 w-full max-w-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">FlowTask</h1>
              <span className="ml-2 px-2 py-1 text-xs bg-teal-600 rounded">Admin</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full">
        <div className="container mx-auto px-4 py-8 w-full max-w-full">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-2">Tableau de bord Administrateur</h2>
            <p className="text-gray-600">Bienvenue, {user.first_name} {user.last_name}</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Project Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Statistiques des Projets</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">À faire</p>
                  <p className="text-2xl font-bold text-blue-600">{projectStats.todo}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-yellow-600">{projectStats.in_progress}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Terminés</p>
                  <p className="text-2xl font-bold text-green-600">{projectStats.done}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-purple-600">{projectStats.total}</p>
                </div>
              </div>
            </div>

            {/* Task Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Statistiques des Tâches</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">À faire</p>
                  <p className="text-2xl font-bold text-blue-600">{taskStats.todo}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-yellow-600">{taskStats.in_progress}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Terminées</p>
                  <p className="text-2xl font-bold text-green-600">{taskStats.done}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-purple-600">{taskStats.total}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Gestion des Utilisateurs</h3>
              <button 
                onClick={() => setShowTeacherModal(true)}
                className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
              >
                Ajouter un Enseignant
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teachers List */}
              <div>
                <h4 className="font-medium mb-3">Enseignants ({users.teachers.length})</h4>
                <div className="space-y-2">
                  {users.teachers.map(teacher => (
                    <div key={teacher.id} className="p-3 bg-gray-50 rounded">
                      <p className="font-medium">{teacher.first_name} {teacher.last_name}</p>
                      <p className="text-sm text-gray-600">{teacher.email}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Students List */}
              <div>
                <h4 className="font-medium mb-3">Étudiants ({users.students.length})</h4>
                <div className="space-y-2">
                  {users.students.map(student => (
                    <div key={student.id} className="p-3 bg-gray-50 rounded">
                      <p className="font-medium">{student.first_name} {student.last_name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Projets</h3>
            <ProjectList role="admin" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 text-center w-full">
        <p>© 2025 FlowTask - Plateforme de gestion de tâches</p>
      </footer>

      {/* Add Teacher Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Ajouter un Enseignant</h3>
                <button 
                  onClick={() => setShowTeacherModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateTeacher}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={teacherForm.username}
                      onChange={handleTeacherFormChange}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={teacherForm.email}
                      onChange={handleTeacherFormChange}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={teacherForm.first_name}
                      onChange={handleTeacherFormChange}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={teacherForm.last_name}
                      onChange={handleTeacherFormChange}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={teacherForm.password}
                      onChange={handleTeacherFormChange}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      name="password2"
                      value={teacherForm.password2}
                      onChange={handleTeacherFormChange}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowTeacherModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Création...' : 'Créer'}
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