import React from 'react';
import PropTypes from 'prop-types';

const StatisticsSection = ({ projectStats, taskStats }) => {
  return (
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
  );
};

StatisticsSection.propTypes = {
  projectStats: PropTypes.shape({
    todo: PropTypes.number.isRequired,
    in_progress: PropTypes.number.isRequired,
    done: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired
  }).isRequired,
  taskStats: PropTypes.shape({
    todo: PropTypes.number.isRequired,
    in_progress: PropTypes.number.isRequired,
    done: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired
  }).isRequired
};

export default StatisticsSection;