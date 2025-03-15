import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/authContext';

const Login = () => {
    const location = useLocation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);

    // Récupérer le message de succès d'inscription s'il existe
    const successMessage = location.state?.message || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);
        } catch (err) {
            console.error('Erreur de connexion:', err);
            if (err.response?.status === 401) {
                setError('Identifiant ou mot de passe incorrect');
            } else {
                setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex w-screen h-screen overflow-hidden bg-teal-500">
            {/* Section gauche - Formulaire */}
            <div className="w-3/5 h-full p-8 flex flex-col justify-center">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white">
                        Connexion
                    </h2>
                    <p className="mt-2 text-teal-100">Connectez-vous pour accéder à votre espace personnel</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg overflow-y-auto max-h-full">
                    {successMessage && (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4">
                            <p>{successMessage}</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
                            <p>{error}</p>
                        </div>
                    )}

                    <form className="p-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom d'utilisateur
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isLoading}
                                    required
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                            </button>
                        </div>
                    </form>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
                        <div className="text-sm text-center">
                            Pas encore inscrit ?{' '}
                            <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500">
                                Créez un compte
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
                </div>
            </div>
        </div>
    );
};

export default Login;