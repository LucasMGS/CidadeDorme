import React, { useState, useEffect } from 'react';
import { assignRolesToPlayers } from '../utils/roleAssigner';
import { remoteConfig, getNumber } from '../firebase';

export const LobbyScreen = ({ gameState, user, playerName, setPlayerName, handleJoinGame: originalHandleJoinGame, handleUpdateGameState, currentPlayerInGame, handleLeaveGame }) => {
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
    const trimmedName = newName.trim().substring(0, 20);
    const updatedPlayers = players.map(p => 
      p.uid === playerToUpdate.uid ? { ...p, name: trimmedName } : p
    );
    handleUpdateGameState({ players: updatedPlayers });
    setEditingPlayer(null);
    setNewName('');
  };

  const handleKickPlayer = (playerToKick) => {
    if (!isHost || playerToKick.uid === hostId) return;
    const updatedPlayers = players.filter(p => p.uid !== playerToKick.uid);
    handleUpdateGameState({ players: updatedPlayers });
  };

  const handleJoinGame = () => {
    // Use the original handleJoinGame function from GamePage which includes IP restriction
    originalHandleJoinGame();
  };

  const handleCopyGameId = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      // Optional: Show a brief success indicator
      const button = document.querySelector('[data-copy-button]');
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✓';
        setTimeout(() => {
          button.textContent = originalText;
        }, 1500);
      }
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      console.warn('Could not copy to clipboard:', error);
      alert(`Código da sala: ${gameId}`);
    }
  };

  const interFont = { fontFamily: 'Inter, sans-serif' };

  return (
    <div className="bg-slate-900 text-white min-h-screen p-8" style={interFont}>
      {/* Header Section */}
      <div className="text-center mb-12">
        <img 
          src="/images/cidade-dorme-logo.png" 
          alt="Cidade Dorme"
          className="mx-auto mb-6 max-w-xs"
        />
        
        {/* Game Code Display */}
        <div className="mb-8">
          <h2 className="text-lg text-gray-300 mb-2">Código da Sala</h2>
          <div className="inline-flex items-center bg-slate-800 px-6 py-3 rounded-xl border border-slate-700">
            <span className="text-2xl font-bold text-red-400 tracking-widest">{gameId}</span>
            <button 
              onClick={handleCopyGameId}
              className="ml-3 text-gray-400 hover:text-white transition-colors"
              title="Copiar código"
              data-copy-button
            >
              📋
            </button>
          </div>
        </div>

        {/* Leave Game Button */}
        {currentPlayerInGame && (
          <button 
            onClick={handleLeaveGame} 
            className="absolute top-6 right-6 bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Sair da Sala
          </button>
        )}
      </div>

      {/* Join Game Section */}
      {!currentPlayerInGame && (
        <div className="max-w-md mx-auto mb-12">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-center">Entrar na Sala</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value.substring(0, 20))} 
                placeholder="Digite seu nome..." 
                maxLength={20}
                className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 border-none"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
              />
              <button 
                onClick={handleJoinGame} 
                disabled={!playerName.trim()}
                className="bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Players Section */}
      <div className="max-w-4xl mx-auto">
        {players.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Jogadores na Sala</h2>
              <div className="bg-slate-800 px-4 py-2 rounded-lg">
                <span className="text-red-400 font-semibold">{players.length}</span>
                <span className="text-gray-400 ml-1">/ 12</span>
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {players.map((p) => (
                <div key={p.uid} className="bg-slate-800 border border-slate-700 p-4 rounded-xl hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {p.uid === hostId && (
                        <span className="text-yellow-400 text-lg" title="Host">👑</span>
                      )}
                      {editingPlayer === p.uid ? (
                        <div className="flex gap-1 min-w-0 flex-1">
                          <input 
                            type="text" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value.substring(0, 20))} 
                            className="bg-slate-700 text-white px-2 py-1 rounded text-sm flex-1 min-w-0" 
                            maxLength={20}
                            autoFocus 
                            onBlur={() => handleNameChange(p)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleNameChange(p)}
                          />
                          <button 
                            onClick={() => handleNameChange(p)} 
                            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-white text-sm"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium truncate">{p.name}</span>
                          {p.uid === user.uid && (
                            <button 
                              onClick={() => { setEditingPlayer(p.uid); setNewName(p.name); }} 
                              className="text-gray-400 hover:text-white ml-2 text-sm"
                              title="Editar nome"
                            >
                              ✏️
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {p.uid === user.uid && (
                        <div className="w-2 h-2 bg-green-400 rounded-full" title="Você"></div>
                      )}
                      {isHost && p.uid !== hostId && p.uid !== user.uid && (
                        <button 
                          onClick={() => handleKickPlayer(p)}
                          className="text-red-400 hover:text-red-300 text-sm"
                          title="Remover jogador"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Game Control Section */}
        <div className="text-center">
          {isHost && players.length >= minPlayers && (
            <button 
              onClick={startGame} 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Começar Jogo
            </button>
          )}
          
          {isHost && players.length < minPlayers && (
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl inline-block">
              <div className="text-yellow-400 mb-2">⏳</div>
              <p className="text-gray-300">
                Aguardando jogadores...
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Mínimo: {minPlayers} jogadores
              </p>
            </div>
          )}

          {!isHost && (
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl inline-block">
              <div className="text-blue-400 mb-2">⏳</div>
              <p className="text-gray-300">Aguardando o host iniciar o jogo...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

