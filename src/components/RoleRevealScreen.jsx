import React from 'react';

export const RoleRevealScreen = ({ player, showRole, setShowRole, handleNextPlayer }) => (
  <div className="text-center">
    <h2 className="text-3xl font-bold mb-4">Passe o dispositivo para</h2>
    <p className="text-5xl font-bold text-yellow-400 mb-8">{player.name}</p>
    
    {!showRole ? (
      <button onClick={() => setShowRole(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl">
        Ver meu Papel
      </button>
    ) : (
      <div className="bg-gray-800 p-8 rounded-lg animate-fade-in">
        <h3 className="text-2xl text-gray-400">Seu papel é...</h3>
        <p className={`text-4xl font-bold my-2 ${player.role.team === 'evil' ? 'text-red-500' : 'text-green-400'}`}>
          {player.role.name}
        </p>
        <p className="text-gray-300 mb-6">{player.role.description}</p>
        <button
          onClick={handleNextPlayer}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Entendi, passar para o próximo
        </button>
      </div>
    )}
  </div>
);
