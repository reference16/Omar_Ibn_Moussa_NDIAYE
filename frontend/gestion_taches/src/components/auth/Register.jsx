import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerStudent } from '../../services/userService';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerStudent(formData);
      navigate('/login', { state: { message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' } });
    } catch (error) {
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-teal-500">
      {/* Section gauche - Formulaire */}
      <div className="w-3/5 h-full p-8 flex flex-col justify-center">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white">
            Inscription
          </h2>
          <p className="mt-2 text-teal-100">Créez votre compte pour commencer à gérer vos tâches</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-y-auto max-h-full">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
              <p>{error}</p>
            </div>
          )}

          <form className="p-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  required
                  value={formData.password2}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                disabled={loading}
              >
                {loading ? 'Inscription en cours...' : 'S\'inscrire'}
              </button>
            </div>
          </form>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
            <div className="text-sm text-center">
              Déjà inscrit ?{' '}
              <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
                Connectez-vous
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite - Informations */}
      <div className="w-2/5 h-full p-8 flex flex-col justify-center bg-teal-600">
        <div className="text-white">
          <h1 className="text-4xl font-bold mb-4">FlowTask</h1>
          <p className="text-xl opacity-90 mb-8">La plateforme qui simplifie la gestion de vos tâches quotidiennes</p>
          
          <div className="space-y-6">
            <div className="border-l-4 border-yellow-400 pl-4">
              <h3 className="font-semibold text-lg mb-2">Organisez votre travail</h3>
              <p className="text-teal-100">Créez des tâches, définissez des priorités et respectez vos délais facilement.</p>
            </div>
            
            <div className="border-l-4 border-pink-400 pl-4">
              <h3 className="font-semibold text-lg mb-2">Collaborez efficacement</h3>
              <p className="text-teal-100">Partagez vos projets avec votre équipe et suivez l'avancement en temps réel.</p>
            </div>
            
            <div className="border-l-4 border-purple-400 pl-4">
              <h3 className="font-semibold text-lg mb-2">Restez productif</h3>
              <p className="text-teal-100">Suivez votre progression et concentrez-vous sur ce qui compte vraiment.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-10">
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <span className="block text-3xl font-bold">+5K</span>
              <span className="text-sm">Utilisateurs</span>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <span className="block text-3xl font-bold">93%</span>
              <span className="text-sm">Satisfaction</span>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <span className="block text-3xl font-bold">24/7</span>
              <span className="text-sm">Soutien</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;