import React from 'react';
import { assignRolesToPlayers } from '../utils/roleAssigner';

const MIN_PLAYERS = 2;

export const LobbyScreen = ({ gameState, user, playerName, setPlayerName, handleJoinGame, handleUpdateGameState, currentPlayerInGame }) => {
  const { gameId, players, hostId } = gameState;
  const isHost = user.uid === hostId;

  const startGame = () => {
    if (players.length < MIN_PLAYERS) {
      alert(`São necessários pelo menos ${MIN_PLAYERS} jogadores.`);
      return;
    }
    
    const playersWithRoles = assignRolesToPlayers(players);

    handleUpdateGameState({
      players: playersWithRoles,
      phase: 'ROLE_REVEAL',
      gameLog: ['O jogo começou! A cidade dorme...'],
    });
  };

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-red-500 mb-2">Sala de Jogo</h1>
      <p className="text-2xl font-mono bg-gray-800 text-yellow-400 inline-block px-4 py-1 rounded mb-6">Código: {gameId}</p>
      {!currentPlayerInGame && (
        <div className="flex justify-center mb-4">
          <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Seu nome" className="bg-gray-700 text-white p-3 rounded-l-lg focus:outline-none w-64"/>
          <button onClick={handleJoinGame} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-r-lg">Entrar na Sala</button>
        </div>
      )}
      <h2 className="text-2xl mb-4">Jogadores na Sala: ({players.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {players.map((p) => <div key={p.uid} className="bg-gray-800 p-3 rounded-lg text-center">{p.name}</div>)}
      </div>
      {isHost && players.length >= MIN_PLAYERS && <button onClick={startGame} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl">Começar Jogo</button>}
      {isHost && players.length < MIN_PLAYERS && <p className="text-gray-400">Aguardando pelo menos {MIN_PLAYERS} jogadores...</p>}
    </div>
  );
};
