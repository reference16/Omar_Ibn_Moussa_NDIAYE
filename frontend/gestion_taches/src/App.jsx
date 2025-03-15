import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthContext from './context/authContext';
import Login from './components/login';
import Register from './components/auth/Register';
import Profile from './components/profile';
import AdminDashboard from './components/dashboards/adminDashboard';
import TeacherDashboard from './components/dashboards/teacherDashboard';
import StudentDashboard from './components/dashboards/studentDashboard';
import ProjectList from './components/projects/projectList';
import TaskList from './components/tasks/taskList';
import PrivateRoute from './components/privateRoute';

const App = () => {
  const { user } = useContext(AuthContext);

  // Fonction pour déterminer le type de dashboard selon le rôle
  const DashboardRouter = () => {
    if (!user) return <Navigate to="/login" replace />;
    
    const userRole = user.role || (user.is_superuser ? 'admin' : user.is_staff ? 'teacher' : 'student');
    
    switch(userRole) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'teacher':
        return <Navigate to="/teacher/dashboard" replace />;
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Redirection intelligente du dashboard selon le rôle */}
      <Route path="/dashboard" element={<DashboardRouter />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Routes dashboard par rôle */}
      <Route path="/admin/dashboard/*" element={
        <PrivateRoute element={<AdminDashboard />} allowedRoles={['admin']} />
      } />
      <Route path="/teacher/dashboard/*" element={
        <PrivateRoute element={<TeacherDashboard />} allowedRoles={['teacher']} />
      } />
      <Route path="/student/dashboard/*" element={
        <PrivateRoute element={<StudentDashboard />} allowedRoles={['student']} />
      } />
      
      {/* Routes de profil */}
      <Route path="/profile" element={
        <PrivateRoute element={<Profile />} allowedRoles={['admin', 'teacher', 'student']} />
      } />
      
      {/* Routes de projets et tâches */}
      <Route path="/projects" element={
        <PrivateRoute element={<ProjectList />} allowedRoles={['admin', 'teacher', 'student']} />
      } />
      <Route path="/projects/:projectId/tasks" element={
        <PrivateRoute element={<TaskList />} allowedRoles={['admin', 'teacher', 'student']} />
      } />
    </Routes>
  );
};

export default App;