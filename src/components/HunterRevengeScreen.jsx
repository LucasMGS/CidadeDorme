import React from 'react';

export const HunterRevengeScreen = ({ gameState, currentPlayer, handleUpdateGameState }) => {
  const { players, hunterPendingShot } = gameState;
  const alivePlayers = players.filter(p => p.isAlive);

  // Verifica se o jogador atual é o caçador que precisa atirar
  const isHunterShooting = currentPlayer && currentPlayer.name === hunterPendingShot;

  if (!isHunterShooting) {
    return (
      <div className="text-center">
        <h2 className="text-4xl font-bold text-red-500 mb-4 animate-pulse">Vingança do Caçador!</h2>
        <p className="text-xl text-gray-300 mb-6">Aguardando {hunterPendingShot} escolher seu alvo...</p>
      </div>
    );
  }

  const handleShot = (targetName) => {
    handleUpdateGameState({ 'hunterData.target': targetName });
  };

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-red-500 mb-4">Sua Vingança!</h2>
      <p className="text-xl text-gray-300 mb-6">Você foi eliminado. Leve alguém com você.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {alivePlayers.filter(p => p.name !== currentPlayer.name).map(p => (
          <button key={p.uid} onClick={() => handleShot(p.name)} className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold p-4 rounded-lg">
            Atirar em {p.name}
          </button>
        ))}
      </div>
    </div>
  );
};

