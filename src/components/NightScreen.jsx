import React from 'react';
import { ROLES } from '../constants/roles';

export const NightScreen = ({ gameState, currentPlayer, handleUpdateGameState }) => {
  const { players, nightData, witchState } = gameState;
  const alivePlayers = players.filter(p => p.isAlive);
  const actor = players.find(p => p.isAlive && p.role.name === nightData.currentActor);

  const advanceNightTurn = (updates = {}) => {
    const turnOrder = [ROLES.VIDENTE.name, ROLES.ASSASSINO.name, ROLES.FEITICEIRA.name, ROLES.MEDICO.name];
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
    return <div className="text-center text-xl">É a vez de {actor.role.name}. Aguarde...</div>;
  }

  // Vidente - Passo 2: Mostrar resultado e botão para continuar
  if (currentPlayer.role.name === ROLES.VIDENTE.name && nightData.seerCheck) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">Sua Investigação</h2>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-lg text-yellow-300 mb-4">O papel de {nightData.seerCheck.target} é {nightData.seerCheck.role.name}</p>
          <button onClick={() => advanceNightTurn()} className="bg-blue-600 hover:bg-blue-800 text-white font-bold p-3 rounded-lg">Continuar</button>
        </div>
      </div>
    );
  }

  // Feiticeira
  if (currentPlayer.role.name === ROLES.FEITICEIRA.name) {
    const handleWitchAction = (updates) => {
      advanceNightTurn(updates);
    };
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">É a sua vez, Feiticeira</h2>
        <div className="bg-gray-800 p-6 rounded-lg">
          {nightData.assassinTarget ? 
            <p className="text-xl text-yellow-400 mb-4">Os assassinos atacaram: {nightData.assassinTarget}</p>
            : <p className="text-xl text-gray-400 mb-4">Os assassinos não atacaram ninguém esta noite.</p>
          }
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 my-4">
            {witchState.hasLifePotion && nightData.assassinTarget && (
              <button onClick={() => handleWitchAction({ 'witchState.hasLifePotion': false, 'nightData.witchSaveUsed': true })} className="bg-green-600 hover:bg-green-700 text-white font-bold p-4 rounded-lg w-full sm:w-auto">Usar Poção da Vida</button>
            )}
            {witchState.hasDeathPotion && (
              <div className="w-full sm:w-auto">
                <h3 className="mb-2">Usar Poção da Morte em:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {alivePlayers.filter(p => p.name !== nightData.assassinTarget).map(p => (
                      <button key={p.uid} onClick={() => handleWitchAction({ 'witchState.hasDeathPotion': false, 'nightData.witchKillTarget': p.name })} className="bg-purple-600 hover:bg-purple-700 text-white font-bold p-2 rounded-lg">{p.name}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => advanceNightTurn()} className="bg-gray-600 hover:bg-gray-700 text-white font-bold p-3 rounded-lg mt-4">Não fazer nada</button>
        </div>
      </div>
    );
  }

  // UI Padrão para Vidente (Passo 1), Assassino e Médico
  let targets = [];
  let title = "";
  
  if (nightData.currentActor === ROLES.VIDENTE.name) {
    title = "Vidente, quem você quer investigar?";
    targets = alivePlayers.filter(p => p.uid !== currentPlayer.uid);
  } else if (nightData.currentActor === ROLES.ASSASSINO.name) {
    title = "Assassino, escolha sua vítima.";
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
      if (actor.role.name === ROLES.ASSASSINO.name) updates['nightData.assassinTarget'] = targetPlayer.name;
      if (actor.role.name === ROLES.MEDICO.name) updates['nightData.doctorSaveTarget'] = targetPlayer ? targetPlayer.name : null;
      advanceNightTurn(updates);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-6">É a sua vez, {actor.role.name}</h2>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-2xl mb-4">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {targets.map(p => (
            <button key={p.uid} onClick={() => handleAction(p)} className="bg-blue-600 hover:bg-blue-800 text-white font-bold p-4 rounded-lg">{p.name}</button>
          ))}
          {actor.role.name === ROLES.MEDICO.name && (
            <button onClick={() => handleAction(null)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold p-4 rounded-lg col-span-full">Não proteger ninguém</button>
          )}
        </div>
      </div>
    </div>
  );
};

