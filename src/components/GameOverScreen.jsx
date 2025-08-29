import React from 'react';
import { assignRolesToPlayers } from '../utils/roleAssigner';
import { roleColors } from '../utils/roleColors';

export const GameOverScreen = ({ gameState, user, handleUpdateGameState }) => {
  const { winner, players, history, hostId, nightNumber } = gameState;
  const isHost = user && user.uid === hostId;

  const startNewRound = () => {
    if (!isHost) return;

    const playersForNewRound = assignRolesToPlayers(players);

    handleUpdateGameState({
      phase: 'ROLE_REVEAL',
      players: playersForNewRound,
      nightNumber: nightNumber + 1,
      gameLog: [`Começando a noite ${nightNumber + 1}!`],
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
      nightNumber: 1,
      history: [],
      gameLog: [],
      witchState: { hasLifePotion: true, hasDeathPotion: true },
      nightData: { currentActor: null, phase: 'acting' },
      hunterPendingShot: null,
      votes: {},
      winner: null,
    });
  };

  const lastNightActions = history && history.length > 0 ? history[history.length - 1].actions : null;

  return (
    <div className="text-center">
      <h1 className="text-6xl font-bold mb-4">Fim da Noite!</h1>
      <p className="text-3xl mb-8">
        Os <span className={`font-bold ${winner === 'LOBOS' ? 'text-red-500' : 'text-green-500'}`}>{winner}</span> venceram a noite {nightNumber}!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Papéis da Noite</h3>
          {players.map(p => (
            <p key={p.uid} className="text-lg">
              {p.name} era <span className={`font-bold ${roleColors[p.role.name]}`}>{p.role.name}</span>
            </p>
          ))}
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Ações da Última Noite</h3>
          {lastNightActions ? (
            <div className="text-left">
              {lastNightActions.attack && <p>🔪 <span className="text-red-500">Lobos</span> atacaram: {lastNightActions.attack.target}</p>}
              {lastNightActions.save && <p>💚 <span className="text-green-500">Médico</span> salvou: {lastNightActions.save.target}</p>}
              {lastNightActions.witchSave && <p>💚 <span className="text-purple-500">Feiticeira</span> usou a poção da vida.</p>}
              {lastNightActions.witchKill && <p>☠️ <span className="text-purple-500">Feiticeira</span> matou: {lastNightActions.witchKill.target}</p>}
            </div>
          ) : <p>Nenhuma ação especial na última noite.</p>}
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Histórico da Sala</h3>
          {(history || []).map((round, index) => (
            <p key={index} className="text-lg">
              <span className="font-bold">Noite {round.night}:</span> Vencedor - <span className={`font-semibold ${roleColors[round.winner === 'LOBOS' ? 'Lobo' : 'Aldeão']}`}>{round.winner}</span>
            </p>
          ))}
        </div>
      </div>

      {isHost && (
        <div className="mt-8 flex justify-center gap-4">
            <button 
              onClick={startNewRound} 
              className="text-white font-bold py-3 px-6 rounded-lg text-xl"
              style={{ backgroundColor: '#660708' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#520506'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#660708'}
            >
              Próxima Noite
            </button>
            <button 
              onClick={backToLobby} 
              className="text-white font-bold py-3 px-6 rounded-lg text-xl"
              style={{ backgroundColor: '#660708' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#520506'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#660708'}
            >
              Voltar para o Lobby
            </button>
        </div>
      )}
      {!isHost && (
        <p className="mt-8 text-yellow-400 text-xl animate-pulse">Aguardando o host iniciar a próxima noite...</p>
      )}
    </div>
  );
};
