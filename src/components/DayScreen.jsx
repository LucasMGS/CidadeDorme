import React from 'react';

export const DayScreen = ({ players, gameLog, votes, setVotes, processDayVote }) => {
  const alivePlayers = (players || []).filter(p => p.isAlive);
  const votesCast = Object.keys(votes).length;

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-yellow-400 mb-4">A Cidade Acorda</h2>
      <div className="bg-gray-800 p-4 rounded-lg mb-6 max-h-48 overflow-y-auto text-left">
        {(gameLog || []).slice(-5).map((msg, i) => <p key={i} className="text-gray-300">{msg}</p>)}
      </div>
      <h3 className="text-2xl font-bold mb-4">Discutam e votem para eliminar um suspeito.</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {alivePlayers.map(voter => (
          <div key={voter.name} className="bg-gray-700 p-4 rounded-lg">
            <p className="font-bold text-lg mb-2">{voter.name} vota em:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {alivePlayers.filter(candidate => candidate.name !== voter.name).map(candidate => (
                <button
                  key={candidate.name}
                  onClick={() => setVotes(v => ({...v, [voter.name]: candidate.name}))}
                  className={`px-3 py-1 rounded-md text-sm font-semibold ${votes[voter.name] === candidate.name ? 'bg-red-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}
                >
                  {candidate.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {votesCast > 0 && votesCast === alivePlayers.length && (
        <button onClick={processDayVote} className="mt-8 bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded-lg text-xl animate-pulse">
          Ver Resultado da Votação
        </button>
      )}
    </div>
  );
};
