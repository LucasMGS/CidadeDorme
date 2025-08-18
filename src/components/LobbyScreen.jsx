import React from 'react';
import { ROLES } from '../constants/roles';

export const LobbyScreen = ({ gameState, user, playerName, setPlayerName, handleJoinGame, handleUpdateGameState, currentPlayerInGame }) => {
  const { gameId, players, hostId } = gameState;
  const isHost = user.uid === hostId;

  const startGame = () => {
    if (players.length < 5) {
      alert('São necessários pelo menos 5 jogadores.');
      return;
    }
    
    // Lógica de atribuição de papéis movida para cá para ser chamada pelo host
    let rolesToAssign = [];
    if (players.length >= 8) rolesToAssign = [ROLES.ASSASSINO, ROLES.ASSASSINO, ROLES.VIDENTE, ROLES.MEDICO, ROLES.FEITICEIRA, ROLES.CACADOR];
    else if (players.length >= 7) rolesToAssign = [ROLES.ASSASSINO, ROLES.ASSASSINO, ROLES.VIDENTE, ROLES.MEDICO, ROLES.CACADOR];
    else if (players.length >= 5) rolesToAssign = [ROLES.ASSASSINO, ROLES.VIDENTE, ROLES.MEDICO, ROLES.FEITICEIRA];
    else rolesToAssign = [ROLES.ASSASSINO, ROLES.VIDENTE, ROLES.MEDICO];
    while (rolesToAssign.length < players.length) rolesToAssign.push(ROLES.ALDEAO);

    for (let i = rolesToAssign.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolesToAssign[i], rolesToAssign[j]] = [rolesToAssign[j], rolesToAssign[i]];
    }

    const playersWithRoles = players.map((player, index) => ({
      ...player,
      role: rolesToAssign[index],
    }));

    handleUpdateGameState({
      players: playersWithRoles,
      phase: 'ROLE_REVEAL',
      gameLog: ['O jogo começou! A cidade dorme...'],
    });
  };

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-red-500 mb-2">Sala de Jogo</h1>
      <p className="text-2xl font-mono bg-gray-800 text-yellow-400 inline-block px-4 py-1 rounded mb-6">
        Código: {gameId}
      </p>
      
      {!currentPlayerInGame && (
        <div className="flex justify-center mb-4">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Seu nome"
            className="bg-gray-700 text-white p-3 rounded-l-lg focus:outline-none w-64"
          />
          <button onClick={handleJoinGame} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-r-lg">
            Entrar na Sala
          </button>
        </div>
      )}

      <h2 className="text-2xl mb-4">Jogadores na Sala: ({players.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {players.map((p) => (
          <div key={p.uid} className="bg-gray-800 p-3 rounded-lg text-center">{p.name}</div>
        ))}
      </div>

      {isHost && players.length >= 5 && (
        <button onClick={startGame} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl">
          Começar Jogo
        </button>
      )}
      {isHost && players.length < 5 && (
        <p className="text-gray-400">Aguardando pelo menos 5 jogadores para começar...</p>
      )}
    </div>
  );
};

