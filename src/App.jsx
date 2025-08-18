import React, { useState, useEffect } from 'react';
import { db, auth, onAuthStateChanged } from './firebase';
import { doc, setDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { ROLES } from './constants/roles';
import { LobbyScreen } from './components/LobbyScreen';
import { RoleRevealScreen } from './components/RoleRevealScreen';
import { NightScreen } from './components/NightScreen';
import { DayScreen } from './components/DayScreen';
import { HunterRevengeScreen } from './components/HunterRevengeScreen';
import { GameOverScreen } from './components/GameOverScreen';

const GameLobby = ({ setGameId }) => {
  const [roomId, setRoomId] = useState('');
  const createGame = async () => {
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const user = auth.currentUser;
    if (!user) return;
    await setDoc(doc(db, "games", newGameId), {
      gameId: newGameId, hostId: user.uid, players: [], phase: 'LOBBY', gameLog: [],
      witchState: { hasLifePotion: true, hasDeathPotion: true },
      nightData: { currentActor: null, phase: 'acting' }, hunterPendingShot: null, votes: {},
      roundNumber: 1,
      history: [],
    });
    setGameId(newGameId);
  };
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-red-500 mb-8">Cidade Dorme Online</h1>
      <button onClick={createGame} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl mb-4 w-full max-w-xs">Criar Novo Jogo</button>
      <div className="my-4 text-gray-400">OU</div>
      <div className="flex justify-center">
        <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value.toUpperCase())} placeholder="Código da Sala" className="bg-gray-700 text-white p-3 rounded-l-lg focus:outline-none w-48"/>
        <button onClick={() => roomId.trim() && setGameId(roomId.trim())} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-r-lg">Entrar</button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [playerName, setPlayerName] = useState('');

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
    if (evil.length >= good.length) return 'ASSASSINOS';
    return null;
  };

  const processNightResults = async () => {
    let playersCopy = JSON.parse(JSON.stringify(gameState.players));
    let newLog = [...gameState.gameLog];
    let eliminatedPlayers = [];
    const { assassinTarget, doctorSaveTarget, witchSaveUsed, witchKillTarget } = gameState.nightData;

    if (assassinTarget && !(doctorSaveTarget === assassinTarget || witchSaveUsed)) {
      eliminatedPlayers.push({ name: assassinTarget, reason: 'morto pelos assassinos' });
    } else if (assassinTarget) {
      newLog.push("Os assassinos atacaram, mas a vítima foi salva!");
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
      updates.history = arrayUnion({ round: gameState.roundNumber, winner: winner });
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
    } else if (playerToEliminate) {
      const targetPlayer = playersCopy.find(p => p.name === playerToEliminate);
      if (targetPlayer) {
        targetPlayer.isAlive = false;
        newLog.push(`A cidade decidiu! ${playerToEliminate} foi eliminado(a). Seu papel era ${targetPlayer.role.name}.`);
        if (targetPlayer.role.name === ROLES.CACADOR.name) {
          hunterTriggered = targetPlayer.name;
        }
      }
    } else {
      newLog.push('A cidade não chegou a um consenso. Ninguém foi eliminado.');
    }
    
    const winner = checkWinCondition(playersCopy);
    const updates = { players: playersCopy, gameLog: newLog };

    if (winner) {
      updates.phase = 'GAME_OVER';
      updates.winner = winner;
      updates.history = arrayUnion({ round: gameState.roundNumber, winner: winner });
    } else if (hunterTriggered) {
      updates.phase = 'HUNTER_REVENGE';
      updates.hunterPendingShot = hunterTriggered;
    } else {
      updates.phase = 'NIGHT';
      updates['nightData.currentActor'] = ROLES.VIDENTE.name;
      updates['nightData.phase'] = 'acting';
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
      updates.history = arrayUnion({ round: gameState.roundNumber, winner: winner });
    } else {
      updates.phase = 'NIGHT';
      updates['nightData.currentActor'] = ROLES.VIDENTE.name;
      updates['nightData.phase'] = 'acting';
    }
    await handleUpdateGameState(updates);
  };

  // Efeito para transições de fase gerenciadas pelo host
  useEffect(() => {
    if (!gameState || !user || user.uid !== gameState.hostId) return;

    if (gameState.phase === 'ROLE_REVEAL') {
      const timer = setTimeout(() => {
        handleUpdateGameState({ 
          phase: 'NIGHT',
          'nightData.currentActor': ROLES.VIDENTE.name,
          'nightData.phase': 'acting',
        });
      }, 8000);
      return () => clearTimeout(timer);
    }

    if (gameState.phase === 'NIGHT' && gameState.nightData.phase === 'processing') {
      processNightResults();
    }
    
    const alivePlayers = gameState.players.filter(p => p.isAlive);
    if (gameState.phase === 'DAY' && Object.keys(gameState.votes || {}).length === alivePlayers.length) {
        processDayVote();
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

  const renderScreen = () => {
    if (!user) return <div className="text-center text-xl">Conectando...</div>;
    if (!gameId) return <GameLobby setGameId={setGameId} />;
    if (!gameState) return <div className="text-center text-xl">Carregando sala...</div>;

    const currentPlayer = gameState.players.find(p => p.uid === user.uid);

    switch (gameState.phase) {
      case 'LOBBY':
        return <LobbyScreen gameState={gameState} user={user} playerName={playerName} setPlayerName={setPlayerName} handleJoinGame={handleJoinGame} handleUpdateGameState={handleUpdateGameState} currentPlayerInGame={!!currentPlayer}/>;
      case 'ROLE_REVEAL':
        return <RoleRevealScreen player={currentPlayer} />;
      case 'NIGHT':
        return <NightScreen gameState={gameState} currentPlayer={currentPlayer} handleUpdateGameState={handleUpdateGameState} />;
      case 'DAY':
        return <DayScreen gameState={gameState} currentPlayer={currentPlayer} handleUpdateGameState={handleUpdateGameState} />;
      case 'HUNTER_REVENGE':
        return <HunterRevengeScreen gameState={gameState} currentPlayer={currentPlayer} handleUpdateGameState={handleUpdateGameState} />;
      case 'GAME_OVER':
        return <GameOverScreen gameState={gameState} user={user} handleUpdateGameState={handleUpdateGameState} />;
      default:
        return <div>Fase de jogo desconhecida: {gameState.phase}</div>;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        {renderScreen()}
      </div>
    </div>
  );
}
