import React, { useState, useEffect } from 'react';
import { assignRolesToPlayers } from '../utils/roleAssigner';
import { remoteConfig, getNumber } from '../firebase';

export const LobbyScreen = ({ gameState, user, playerName, setPlayerName, handleJoinGame, handleUpdateGameState, currentPlayerInGame, handleLeaveGame }) => {
  const { gameId, players, hostId } = gameState;
  const isHost = user.uid === hostId;
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [newName, setNewName] = useState('');
  const [minPlayers, setMinPlayers] = useState(getNumber(remoteConfig, "min_players") || 2);

  useEffect(() => {
    const minPlayersValue = getNumber(remoteConfig, "min_players");
    if (minPlayersValue) {
      setMinPlayers(minPlayersValue);
    }
  }, [gameState]);

  const startGame = () => {
    if (players.length < minPlayers) {
      alert(`São necessários pelo menos ${minPlayers} jogadores.`);
      return;
    }
    
    const playersWithRoles = assignRolesToPlayers(players);

    handleUpdateGameState({
      players: playersWithRoles,
      phase: 'ROLE_REVEAL',
      gameLog: ['O jogo começou! A cidade dorme...'],
    });
  };

  const handleNameChange = (playerToUpdate) => {
    if (!newName.trim()) return;
    const updatedPlayers = players.map(p => 
      p.uid === playerToUpdate.uid ? { ...p, name: newName.trim() } : p
    );
    handleUpdateGameState({ players: updatedPlayers });
    setEditingPlayer(null);
    setNewName('');
  };

  return (
    <div className="text-center">
      <div className="relative mb-6">
        <h1 className="text-3xl font-bold text-red-500 mb-2">Sala de Jogo</h1>
        {currentPlayerInGame && (
          <button onClick={handleLeaveGame} className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm">Sair da Sala</button>
        )}
        <p className="text-2xl font-mono bg-gray-800 text-yellow-400 inline-block px-4 py-1 rounded">Código: {gameId}</p>
      </div>
      {!currentPlayerInGame && (
        <div className="flex justify-center mb-4">
          <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Seu nome" className="bg-gray-700 text-white p-3 rounded-l-lg focus:outline-none w-64"/>
          <button onClick={handleJoinGame} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-r-lg">Entrar na Sala</button>
        </div>
      )}
      <h2 className="text-2xl mb-4">Jogadores na Sala: ({players.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {players.map((p) => (
          <div key={p.uid} className="bg-gray-800 p-3 rounded-lg text-center">
            {editingPlayer === p.uid ? (
              <div className="flex">
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-gray-600 text-white p-1 rounded-l w-full" autoFocus onBlur={() => handleNameChange(p)} onKeyDown={(e) => e.key === 'Enter' && handleNameChange(p)}/>
                <button onClick={() => handleNameChange(p)} className="bg-green-600 p-1 rounded-r">✓</button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>{p.name}</span>
                {p.uid === user.uid && (
                  <button onClick={() => { setEditingPlayer(p.uid); setNewName(p.name); }} className="text-xs">✏️</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {isHost && players.length >= minPlayers && <button onClick={startGame} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl">Começar Jogo</button>}
      {isHost && players.length < minPlayers && <p className="text-gray-400">Aguardando pelo menos {minPlayers} jogadores...</p>}
    </div>
  );
};

