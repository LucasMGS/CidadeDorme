import React, { useState, useEffect } from 'react';

export const DayScreen = ({ gameState, currentPlayer, handleUpdateGameState }) => {
  const { players, gameLog, votes, phase } = gameState;
  const alivePlayers = players.filter(p => p.isAlive);
  const [timer, setTimer] = useState(180);

  useEffect(() => {
    if (phase === 'DAY') {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // O host irá processar a votação via useEffect em App.jsx
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleVote = (targetName) => {
    if (!currentPlayer.isAlive) return;
    handleUpdateGameState({
      [`votes.${currentPlayer.uid}`]: targetName
    });
  };

  const alreadyVoted = votes && votes[currentPlayer.uid];
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  if (phase === 'VOTE_RESULT') {
    return (
        <div className="text-center">
            <h2 className="text-4xl font-bold text-yellow-400 mb-4">Resultado da Votação</h2>
            <div className="bg-gray-800 p-4 rounded-lg mb-6 max-h-96 overflow-y-auto text-left">
                {gameLog.slice(-5).map((msg, i) => <p key={i} className="text-gray-300">{msg}</p>)}
                <div className="mt-4 border-t border-gray-600 pt-4">
                    <h3 className="font-bold text-lg mb-2">Resumo dos Votos:</h3>
                    {players.filter(p => p.isAlive).map(voter => {
                        const vote = votes[voter.uid];
                        return <p key={voter.uid}>{voter.name} votou em: <span className="font-semibold">{vote || 'Ninguém'}</span></p>
                    })}
                </div>
            </div>
            <p className="text-xl animate-pulse">A noite vai começar em breve...</p>
        </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-yellow-400 mb-4">A Cidade Acorda</h2>
      <div className="bg-gray-800 p-4 rounded-lg mb-6 max-h-48 overflow-y-auto text-left">
        {gameLog.slice(-5).map((msg, i) => <p key={i} className="text-gray-300">{msg}</p>)}
      </div>
      <div className="text-2xl font-mono mb-4">Tempo para votar: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</div>
      
      {alreadyVoted ? (
        <p className="text-xl text-green-400">Você votou em {votes[currentPlayer.uid]}. Aguardando outros jogadores...</p>
      ) : currentPlayer.isAlive ? (
        <div>
            <h3 className="text-2xl font-bold mb-4">Vote para eliminar um suspeito</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {alivePlayers.filter(p => p.uid !== currentPlayer.uid).map(p => (
                <button key={p.uid} onClick={() => handleVote(p.name)} className="bg-red-600 hover:bg-red-700 text-white font-bold p-4 rounded-lg">
                Votar em {p.name}
                </button>
            ))}
            <button onClick={() => handleVote('Ninguém')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold p-4 rounded-lg col-span-full">
                Não votar em ninguém
            </button>
            </div>
        </div>
      ) : (
        <p className="text-xl text-gray-500">Você está morto e não pode votar.</p>
      )}
    </div>
  );
};
