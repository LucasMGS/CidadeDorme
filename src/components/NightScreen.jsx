import React from 'react';
import { ROLES } from '../constants/roles';
import { roleColors } from '../utils/roleColors';

export const NightScreen = ({ gameState, currentPlayer, handleUpdateGameState }) => {
  const { players, nightData, witchState } = gameState;
  const alivePlayers = players.filter(p => p.isAlive);
  const actor = players.find(p => p.isAlive && p.role.name === nightData.currentActor);

  const advanceNightTurn = (updates = {}) => {
    const turnOrder = [ROLES.VIDENTE.name, ROLES.LOBO.name, ROLES.FEITICEIRA.name, ROLES.MEDICO.name];
    const currentTurnIndex = turnOrder.indexOf(nightData.currentActor);
    let nextActorName = null;
    
    if (currentTurnIndex < turnOrder.length - 1) {
      for (let i = currentTurnIndex + 1; i < turnOrder.length; i++) {
        if (players.some(p => p.isAlive && p.role.name === turnOrder[i])) {
          nextActorName = turnOrder[i];
          break;
        }
      }
    }
    
    const finalUpdates = { ...updates, 'nightData.currentActor': nextActorName };
    if (nightData.currentActor === ROLES.VIDENTE.name) {
      finalUpdates['nightData.seerCheck'] = null;
    }

    if (!nextActorName) {
      finalUpdates['nightData.phase'] = 'processing';
    }
    
    handleUpdateGameState(finalUpdates);
  };

  if (!actor || !currentPlayer) return <div className="text-center text-xl">Aguardando...</div>;
  if (currentPlayer.role.name !== actor.role.name) {
    return <div className="text-center text-xl">É a vez de <span className={roleColors[actor.role.name]}>{actor.role.name}</span>. Aguarde...</div>;
  }

  if (currentPlayer.role.name === ROLES.VIDENTE.name && nightData.seerCheck) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">Sua Investigação</h2>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-lg text-yellow-300 mb-4">O papel de {nightData.seerCheck.target} é <span className={roleColors[nightData.seerCheck.role.name]}>{nightData.seerCheck.role.name}</span></p>
          <button 
            onClick={() => advanceNightTurn()} 
            className="text-white font-bold p-3 rounded-lg"
            style={{ backgroundColor: '#660708' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#520506'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#660708'}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  if (currentPlayer.role.name === ROLES.FEITICEIRA.name) {
    const handleWitchAction = (updates) => {
      advanceNightTurn(updates);
    };
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">É a sua vez, <span className="text-purple-500">Feiticeira</span></h2>
        <div className="bg-gray-800 p-6 rounded-lg">
          {nightData.assassinTarget ? 
            <p className="text-xl text-yellow-400 mb-4">Os Lobos atacaram: {nightData.assassinTarget}</p>
            : <p className="text-xl text-gray-400 mb-4">Os Lobos não atacaram ninguém esta noite.</p>
          }
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 my-4">
            {witchState.hasLifePotion && nightData.assassinTarget && (
              <button 
                onClick={() => handleWitchAction({ 'witchState.hasLifePotion': false, 'nightData.witchSaveUsed': true })} 
                className="text-white font-bold p-4 rounded-lg w-full sm:w-auto"
                style={{ backgroundColor: '#660708' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#520506'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#660708'}
              >
                Usar Poção da Vida
              </button>
            )}
            {witchState.hasDeathPotion && (
              <div className="w-full sm:w-auto">
                <h3 className="mb-2">Usar Poção da Morte em:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {alivePlayers.filter(p => p.uid !== currentPlayer.uid && p.name !== nightData.assassinTarget).map(p => (
                      <button 
                        key={p.uid} 
                        onClick={() => handleWitchAction({ 'witchState.hasDeathPotion': false, 'nightData.witchKillTarget': p.name })} 
                        className="text-white font-bold p-2 rounded-lg"
                        style={{ backgroundColor: '#660708' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#520506'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#660708'}
                      >
                        {p.name}
                      </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={() => advanceNightTurn()} 
            className="text-white font-bold p-3 rounded-lg mt-4"
            style={{ backgroundColor: '#660708' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#520506'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#660708'}
          >
            Não fazer nada
          </button>
        </div>
      </div>
    );
  }

  let targets = [];
  let title = "";
  const wolves = players.filter(p => p.role.name === ROLES.LOBO.name);
  
  if (nightData.currentActor === ROLES.VIDENTE.name) {
    title = "Vidente, quem você quer investigar?";
    targets = alivePlayers.filter(p => p.uid !== currentPlayer.uid);
  } else if (nightData.currentActor === ROLES.LOBO.name) {
    title = "Lobo, escolha sua vítima.";
    targets = alivePlayers.filter(p => p.role.team !== 'evil');
  } else if (nightData.currentActor === ROLES.MEDICO.name) {
    title = "Médico, quem você quer proteger?";
    targets = alivePlayers.filter(p => p.name !== nightData.lastProtected);
  }

  const handleAction = (targetPlayer) => {
    if (actor.role.name === ROLES.VIDENTE.name) {
      handleUpdateGameState({ 'nightData.seerCheck': { target: targetPlayer.name, role: targetPlayer.role } });
    } else {
      const updates = {};
      if (actor.role.name === ROLES.LOBO.name) updates['nightData.assassinTarget'] = targetPlayer ? targetPlayer.name : null;
      if (actor.role.name === ROLES.MEDICO.name) updates['nightData.doctorSaveTarget'] = targetPlayer ? targetPlayer.name : null;
      advanceNightTurn(updates);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-6">É a sua vez, <span className={roleColors[actor.role.name]}>{actor.role.name}</span></h2>
      {currentPlayer.role.name === ROLES.LOBO.name && wolves.length > 1 && (
        <div className="mb-4 p-2 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">Seus aliados Lobos:</p>
            <p className="font-semibold">{wolves.filter(w => w.uid !== currentPlayer.uid).map(w => w.name).join(', ')}</p>
        </div>
      )}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-2xl mb-4">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {targets.map(p => {
            const isSelfSave = currentPlayer.role.name === ROLES.MEDICO.name && p.uid === currentPlayer.uid;
            return (
              <button 
                key={p.uid} 
                onClick={() => handleAction(p)} 
                className="text-white font-bold p-4 rounded-lg"
                style={{ backgroundColor: '#660708' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#520506'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#660708'}
              >
                {isSelfSave ? "Me salvar" : p.name}
              </button>
            )
          })}
          {(actor.role.name === ROLES.MEDICO.name || actor.role.name === ROLES.LOBO.name) && (
            <button 
              onClick={() => handleAction(null)} 
              className="text-white font-bold p-4 rounded-lg col-span-full"
              style={{ backgroundColor: '#660708' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#520506'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#660708'}
            >
                {actor.role.name === ROLES.MEDICO.name ? "Não proteger ninguém" : "Não atacar ninguém"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
