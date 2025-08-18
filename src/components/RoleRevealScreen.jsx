import React from 'react';

export const RoleRevealScreen = ({ player }) => {
  if (!player || !player.role) {
    return (
      <div className="text-center text-xl">
        Aguardando a atribuição de papéis...
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4">Seu Papel Secreto</h2>
      <div className="bg-gray-800 p-8 rounded-lg animate-fade-in">
        <h3 className="text-2xl text-gray-400">Você é...</h3>
        <p className={`text-4xl font-bold my-2 ${player.role.team === 'evil' ? 'text-red-500' : 'text-green-400'}`}>
          {player.role.name}
        </p>
        <p className="text-gray-300 mb-6">{player.role.description}</p>
        <p className="text-yellow-400 mt-8 animate-pulse">A noite vai começar em breve...</p>
      </div>
    </div>
  );
};

