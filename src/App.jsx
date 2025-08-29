import React, { useState, useEffect } from 'react';
import { db, auth, onAuthStateChanged } from './firebase';
import { doc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ROLES } from './constants/roles';
import { HomePage } from './components/HomePage';
import { GameLobby } from './components/GameLobby';
import { LobbyScreen } from './components/LobbyScreen';
import { RoleRevealScreen } from './components/RoleRevealScreen';
import { NightScreen } from './components/NightScreen';
import { DayScreen } from './components/DayScreen';
import { HunterRevengeScreen } from './components/HunterRevengeScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { NightStartScreen } from './components/NightStartScreen';
import { roleColors } from './utils/roleColors';


export default function App() {
  const [user, setUser] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [showHomePage, setShowHomePage] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!gameId || !user) return;
    const gameRef = doc(db, "games", gameId);
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        setGameState(doc.data());
      } else {
        alert("Sala não encontrada ou foi deletada.");
        setGameId(null); setGameState(null);
      }
    });
    return () => unsubscribe();
  }, [gameId, user]);
  
  const handleUpdateGameState = async (newState) => {
    if (!gameId) return;
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, newState);
  };

  const checkWinCondition = (players) => {
    const alive = players.filter(p => p.isAlive);
    const evil = alive.filter(p => p.role.team === 'evil');
    const good = alive.filter(p => p.role.team === 'good');
    if (evil.length === 0) return 'CIDADÃOS';
    if (evil.length >= good.length) return 'LOBOS';
    return null;
  };

  const getFirstNightActor = (players) => {
    const turnOrder = [ROLES.VIDENTE.name, ROLES.LOBO.name, ROLES.FEITICEIRA.name, ROLES.MEDICO.name];
    for (const roleName of turnOrder) {
      if (players.some(p => p.isAlive && p.role.name === roleName)) {
        return roleName;
      }
    }
    return null;
  };

  const createNewNightData = (players, lastDoctorSave) => ({
    currentActor: getFirstNightActor(players),
    phase: 'acting',
    lastProtected: lastDoctorSave || null,
    seerCheck: null,
    assassinTarget: null,
    witchSaveUsed: false,
    witchKillTarget: null,
    doctorSaveTarget: null,
    turnEndTime: Date.now() + 30000,
  });

  const processNightResults = async () => {
    let playersCopy = JSON.parse(JSON.stringify(gameState.players));
    let newLog = [...gameState.gameLog];
    let eliminatedPlayers = [];
    const { assassinTarget, doctorSaveTarget, witchSaveUsed, witchKillTarget } = gameState.nightData;
    
    const nightActionsLog = {
        attack: assassinTarget ? { by: 'Lobos', target: assassinTarget } : null,
        save: doctorSaveTarget ? { by: 'Médico', target: doctorSaveTarget } : null,
        witchSave: witchSaveUsed,
        witchKill: witchKillTarget ? { by: 'Feiticeira', target: witchKillTarget } : null,
    };

    if (assassinTarget && !(doctorSaveTarget === assassinTarget || witchSaveUsed)) {
      eliminatedPlayers.push({ name: assassinTarget, reason: 'morto pelos Lobos' });
    } else if (assassinTarget) {
      newLog.push("Os Lobos atacaram, mas a vítima foi salva!");
    }

    if (witchKillTarget && !eliminatedPlayers.some(p => p.name === witchKillTarget)) {
       eliminatedPlayers.push({ name: witchKillTarget, reason: 'morto pela poção da Feiticeira' });
    }
    
    if (eliminatedPlayers.length === 0 && (assassinTarget || witchKillTarget)) {
      newLog.push("O dia amanhece e, por sorte, ninguém morreu esta noite.");
    } else if (eliminatedPlayers.length === 0) {
      newLog.push("O dia amanhece com tranquilidade. Ninguém morreu.");
    }

    let hunterTriggered = null;
    eliminatedPlayers.forEach(eliminated => {
      const player = playersCopy.find(p => p.name === eliminated.name);
      if (player && player.isAlive) {
        player.isAlive = false;
        newLog.push(`${player.name} foi encontrado(a) ${eliminated.reason}.`);
        if (player.role.name === ROLES.CACADOR.name) {
          hunterTriggered = player.name;
        }
      }
    });
    
    const winner = checkWinCondition(playersCopy);
    const updates = { players: playersCopy, gameLog: newLog, votes: {} };

    if (winner) {
      updates.phase = 'GAME_OVER';
      updates.winner = winner;
      updates.history = arrayUnion({ night: gameState.nightNumber, winner: winner, actions: nightActionsLog });
    } else if (hunterTriggered) {
      updates.phase = 'HUNTER_REVENGE';
      updates.hunterPendingShot = hunterTriggered;
    } else {
      updates.phase = 'DAY';
    }
    await handleUpdateGameState(updates);
  };

  const processDayVote = async () => {
    let playersCopy = JSON.parse(JSON.stringify(gameState.players));
    let newLog = [...gameState.gameLog];
    const voteCounts = Object.values(gameState.votes).reduce((acc, name) => ({ ...acc, [name]: (acc[name] || 0) + 1 }), {});

    let maxVotes = 0;
    let playerToEliminate = null;
    Object.keys(voteCounts).forEach(player => {
      if (voteCounts[player] > maxVotes) {
        maxVotes = voteCounts[player];
        playerToEliminate = player;
      }
    });
    
    const playersWithMaxVotes = Object.keys(voteCounts).filter(p => voteCounts[p] === maxVotes);
    let hunterTriggered = null;

    if (playersWithMaxVotes.length > 1) {
        newLog.push(`A votação terminou em empate! Ninguém foi eliminado.`);
    } else if (playerToEliminate && playerToEliminate !== 'Ninguém') {
      const targetPlayer = playersCopy.find(p => p.name === playerToEliminate);
      if (targetPlayer) {
        targetPlayer.isAlive = false;
        newLog.push(`A cidade decidiu! ${playerToEliminate} foi eliminado(a).`);
        if (targetPlayer.role.name === ROLES.CACADOR.name) {
          hunterTriggered = targetPlayer.name;
        }
      }
    } else {
      newLog.push('A cidade não chegou a um consenso. Ninguém foi eliminado.');
    }
    
    const winner = checkWinCondition(playersCopy);
    const updates = { players: playersCopy, gameLog: newLog, phase: 'VOTE_RESULT' };

    if (winner) {
      updates.phase = 'GAME_OVER';
      updates.winner = winner;
      updates.history = arrayUnion({ night: gameState.nightNumber, winner: winner, actions: null });
    } else if (hunterTriggered) {
      updates.phase = 'HUNTER_REVENGE';
      updates.hunterPendingShot = hunterTriggered;
    }
    
    await handleUpdateGameState(updates);
  };
  
  const processHunterShot = async () => {
    let playersCopy = JSON.parse(JSON.stringify(gameState.players));
    let newLog = [...gameState.gameLog];
    const targetName = gameState.hunterData.target;

    const targetPlayer = playersCopy.find(p => p.name === targetName);
    if (targetPlayer) {
      targetPlayer.isAlive = false;
      newLog.push(`${gameState.hunterPendingShot}, o Caçador, deu seu último tiro e levou ${targetName} junto.`);
    }

    const winner = checkWinCondition(playersCopy);
    const updates = { players: playersCopy, gameLog: newLog, hunterPendingShot: null, hunterData: null };

    if (winner) {
      updates.phase = 'GAME_OVER';
      updates.winner = winner;
      updates.history = arrayUnion({ night: gameState.nightNumber, winner: winner, actions: null });
    } else {
      updates.phase = 'NIGHT_START';
      updates.nightNumber = gameState.nightNumber + 1;
      updates.gameLog = [...newLog, `Começando a noite ${gameState.nightNumber + 1}!`];
    }
    await handleUpdateGameState(updates);
  };

  useEffect(() => {
    if (!gameState || !user || user.uid !== gameState.hostId) return;

    if (gameState.phase === 'ROLE_REVEAL') {
      const timer = setTimeout(() => {
        handleUpdateGameState({ 
          phase: 'NIGHT',
          nightData: createNewNightData(gameState.players, null)
        });
      }, 8000);
      return () => clearTimeout(timer);
    }

    if (gameState.phase === 'NIGHT' && gameState.nightData.phase === 'processing') {
      processNightResults();
    }
    
    const alivePlayers = gameState.players.filter(p => p.isAlive);
    if (gameState.phase === 'DAY' && (gameState.dayTimerExpired || Object.keys(gameState.votes || {}).length === alivePlayers.length)) {
        const currentVotes = gameState.votes || {};
        const updates = { votes: { ...currentVotes } };
        
        alivePlayers.forEach(player => {
            if (!currentVotes[player.uid]) {
                updates.votes[player.uid] = 'Ninguém';
            }
        });
        
        handleUpdateGameState({ ...updates, dayTimerExpired: false });
        processDayVote();
    }
    
    if (gameState.phase === 'VOTE_RESULT') {
        const timer = setTimeout(() => {
            const winner = checkWinCondition(gameState.players);
            if (winner) {
                handleUpdateGameState({ phase: 'GAME_OVER', winner: winner });
            } else {
                handleUpdateGameState({
                    phase: 'NIGHT_START',
                    nightNumber: gameState.nightNumber + 1,
                    gameLog: [...gameState.gameLog, `Começando a noite ${gameState.nightNumber + 1}!` ],
                });
            }
        }, 6000);
        return () => clearTimeout(timer);
    }
    
    if (gameState.phase === 'NIGHT_START') {
        const timer = setTimeout(() => {
            handleUpdateGameState({
                phase: 'NIGHT',
                nightData: createNewNightData(gameState.players, gameState.nightData.doctorSaveTarget)
            });
        }, 4000);
        return () => clearTimeout(timer);
    }
    
    if (gameState.phase === 'HUNTER_REVENGE' && gameState.hunterData?.target) {
        processHunterShot();
    }

  }, [gameState, user]);

  const handleJoinGame = async () => {
    if (!playerName.trim() || !user) return;
    await handleUpdateGameState({
      players: arrayUnion({ uid: user.uid, name: playerName.trim(), role: null, isAlive: true })
    });
  };

  const handleLeaveGame = async () => {
    if (!user || !gameState) return;
    const playerToRemove = gameState.players.find(p => p.uid === user.uid);
    if (playerToRemove) {
      await handleUpdateGameState({
        players: arrayRemove(playerToRemove)
      });
    }
    setGameId(null);
  };

  const renderScreen = () => {
    if (!user) return <HomePage onEnterGame={() => setShowHomePage(false)} />;
    if (showHomePage) return <HomePage onEnterGame={() => setShowHomePage(false)} />;
    if (!gameId) return <GameLobby setGameId={setGameId} />;
    if (!gameState) return <div className="text-center text-xl">Carregando sala...</div>;

    const currentPlayer = gameState.players.find(p => p.uid === user.uid);

    switch (gameState.phase) {
      case 'LOBBY':
        return <LobbyScreen gameState={gameState} user={user} playerName={playerName} setPlayerName={setPlayerName} handleJoinGame={handleJoinGame} handleUpdateGameState={handleUpdateGameState} currentPlayerInGame={!!currentPlayer} handleLeaveGame={handleLeaveGame}/>;
      case 'ROLE_REVEAL':
        return <RoleRevealScreen player={currentPlayer} />;
      case 'NIGHT_START':
        return <NightStartScreen gameState={gameState} />;
      case 'NIGHT':
        return <NightScreen gameState={gameState} currentPlayer={currentPlayer} handleUpdateGameState={handleUpdateGameState} />;
      case 'DAY':
      case 'VOTE_RESULT':
        return <DayScreen gameState={gameState} currentPlayer={currentPlayer} handleUpdateGameState={handleUpdateGameState} />;
      case 'HUNTER_REVENGE':
        return <HunterRevengeScreen gameState={gameState} currentPlayer={currentPlayer} handleUpdateGameState={handleUpdateGameState} />;
      case 'GAME_OVER':
        return <GameOverScreen gameState={gameState} user={user} handleUpdateGameState={handleUpdateGameState} />;
      default:
        return <div>Fase de jogo desconhecida: {gameState.phase}</div>;
    }
  };
  
  const currentPlayer = gameState ? gameState.players.find(p => p.uid === user.uid) : null;
  const roleColorClass = currentPlayer?.role?.name ? roleColors[currentPlayer.role.name] || 'text-gray-400' : 'text-gray-400';

  // Don't show the game UI wrapper on home page
  if (showHomePage) {
    return renderScreen();
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        {gameState && gameState.phase !== 'LOBBY' && currentPlayer && (
          <div className="absolute top-4 left-4 flex items-start gap-4 z-10">
            {currentPlayer.role && (
              <div className="p-2 md:p-4 bg-gray-800 rounded-lg shadow-lg">
                  <p className="font-bold text-base md:text-lg">{currentPlayer.name}</p>
                  <p className={`text-sm font-semibold ${roleColorClass}`}>{currentPlayer.role.name}</p>
              </div>
            )}
            <button onClick={handleLeaveGame} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg text-sm mt-2">Sair</button>
          </div>
        )}
        <div className={gameState && gameState.phase !== 'LOBBY' ? 'pt-24 md:pt-0' : ''}>
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}
