import React, { useState, useEffect } from 'react';

export const DayScreen = ({ gameState, currentPlayer, handleUpdateGameState }) => {
  const { players, gameLog, votes, phase, hostId } = gameState;
  const alivePlayers = players.filter(p => p.isAlive);
  const [timer, setTimer] = useState(180);
  const [selectedVote, setSelectedVote] = useState(null);

  useEffect(() => {
    if (phase === 'DAY') {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            if (currentPlayer && currentPlayer.uid === hostId) {
              handleUpdateGameState({ dayTimerExpired: true });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, currentPlayer, hostId]);

  const handleConfirmVote = () => {
    if (!currentPlayer.isAlive || !selectedVote) return;
    handleUpdateGameState({
      [`votes.${currentPlayer.uid}`]: selectedVote
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
                  <button 
                    key={p.uid} 
                    onClick={() => setSelectedVote(p.name)} 
                    className="font-bold p-4 rounded-lg text-white"
                    style={{ backgroundColor: selectedVote === p.name ? '#520506' : '#660708' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#520506'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = selectedVote === p.name ? '#520506' : '#660708'}
                  >
                    {p.name}
                  </button>
              ))}
              <button 
                onClick={() => setSelectedVote('Ninguém')} 
                className="font-bold p-4 rounded-lg col-span-full text-white"
                style={{ backgroundColor: selectedVote === 'Ninguém' ? '#520506' : '#660708' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#520506'}
                onMouseLeave={(e) => e.target.style.backgroundColor = selectedVote === 'Ninguém' ? '#520506' : '#660708'}
              >
                  Não votar em ninguém
              </button>
            </div>
            <button 
              onClick={handleConfirmVote} 
              disabled={!selectedVote} 
              className="mt-6 disabled:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg text-xl"
              style={{ backgroundColor: !selectedVote ? '#6b7280' : '#660708' }}
              onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#520506')}
              onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#660708')}
            >
                Confirmar Voto
            </button>
        </div>
      ) : (
        <p className="text-xl text-gray-500">Você está morto e não pode votar.</p>
      )}
    </div>
  );
};

