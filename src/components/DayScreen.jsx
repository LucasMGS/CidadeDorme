import React from 'react';

export const DayScreen = ({ gameState, currentPlayer, handleUpdateGameState }) => {
  const { players, gameLog, votes } = gameState;
  const alivePlayers = players.filter(p => p.isAlive);

  const handleVote = (targetName) => {
    handleUpdateGameState({
      [`votes.${currentPlayer.uid}`]: targetName
    });
  };

  const alreadyVoted = votes && votes[currentPlayer.uid];

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-yellow-400 mb-4">A Cidade Acorda</h2>
      <div className="bg-gray-800 p-4 rounded-lg mb-6 max-h-48 overflow-y-auto text-left">
        {gameLog.slice(-5).map((msg, i) => <p key={i} className="text-gray-300">{msg}</p>)}
      </div>
      <h3 className="text-2xl font-bold mb-4">Discutam e votem para eliminar um suspeito.</h3>
      
      {alreadyVoted ? (
        <p className="text-xl text-green-400">Você votou em {votes[currentPlayer.uid]}. Aguardando outros jogadores...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {alivePlayers.filter(p => p.uid !== currentPlayer.uid).map(p => (
            <button key={p.uid} onClick={() => handleVote(p.name)} className="bg-red-600 hover:bg-red-700 text-white font-bold p-4 rounded-lg">
              Votar em {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

