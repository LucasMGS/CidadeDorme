import React from 'react';
import { assignRolesToPlayers } from '../utils/roleAssigner';

export const GameOverScreen = ({ gameState, user, handleUpdateGameState }) => {
  const { winner, players, history, hostId, roundNumber } = gameState;
  const isHost = user && user.uid === hostId;

  const startNewRound = () => {
    if (!isHost) return;

    const playersForNewRound = assignRolesToPlayers(players);

    handleUpdateGameState({
      phase: 'ROLE_REVEAL',
      players: playersForNewRound,
      roundNumber: roundNumber + 1,
      gameLog: [`Começando o round ${roundNumber + 1}!`],
      witchState: { hasLifePotion: true, hasDeathPotion: true },
      nightData: { currentActor: null, phase: 'acting' },
      hunterPendingShot: null,
      votes: {},
      winner: null,
    });
  };

  const backToLobby = () => {
    if (!isHost) return;

    handleUpdateGameState({
      phase: 'LOBBY',
      players: players.map(p => ({ uid: p.uid, name: p.name, role: null, isAlive: true })),
      roundNumber: 1,
      history: [],
      gameLog: [],
      witchState: { hasLifePotion: true, hasDeathPotion: true },
      nightData: { currentActor: null, phase: 'acting' },
      hunterPendingShot: null,
      votes: {},
      winner: null,
    });
  };

  return (
    <div className="text-center">
      <h1 className="text-6xl font-bold mb-4">Fim do Round!</h1>
      <p className="text-3xl mb-8">
        Os <span className={`font-bold ${winner === 'ASSASSINOS' ? 'text-red-500' : 'text-green-500'}`}>{winner}</span> venceram o round {roundNumber}!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Quadro de Papéis do Round</h3>
          {players.map(p => (
            <p key={p.uid} className="text-lg">
              {p.name} era <span className={`font-bold ${p.role.team === 'evil' ? 'text-red-400' : 'text-green-400'}`}>{p.role.name}</span>
            </p>
          ))}
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Histórico da Sala</h3>
          {(history || []).map((round, index) => (
            <p key={index} className="text-lg">
              <span className="font-bold">Round {round.round}:</span> Vencedor - <span className={`font-semibold ${round.winner === 'ASSASSINOS' ? 'text-red-400' : 'text-green-400'}`}>{round.winner}</span>
            </p>
          ))}
        </div>
      </div>

      {isHost && (
        <div className="mt-8 flex justify-center gap-4">
            <button onClick={startNewRound} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl">
                Começar Próximo Round
            </button>
            <button onClick={backToLobby} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-xl">
                Voltar para o Lobby
            </button>
        </div>
      )}
      {!isHost && (
        <p className="mt-8 text-yellow-400 text-xl animate-pulse">Aguardando o host iniciar o próximo round...</p>
      )}
    </div>
  );
};
