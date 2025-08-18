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
      gameId: newGameId,
      hostId: user.uid,
      players: [],
      phase: 'LOBBY',
      gameLog: [],
      witchState: { hasLifePotion: true, hasDeathPotion: true },
      nightData: { currentActor: null },
      hunterPendingShot: null,
      votes: {},
    });
    setGameId(newGameId);
  };

  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-red-500 mb-8">Cidade Dorme Online</h1>
      <button onClick={createGame} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl mb-4 w-full max-w-xs">
        Criar Novo Jogo
      </button>
      <div className="my-4 text-gray-400">OU</div>
      <div className="flex justify-center">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          placeholder="Código da Sala"
          className="bg-gray-700 text-white p-3 rounded-l-lg focus:outline-none w-48"
        />
        <button onClick={() => roomId.trim() && setGameId(roomId.trim())} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-r-lg">
          Entrar
        </button>
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
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
        setGameId(null);
        setGameState(null);
      }
    });
    return () => unsubscribe();
  }, [gameId, user]);

  const handleUpdateGameState = async (newState) => {
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, newState);
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !user) return;
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, {
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
        return <LobbyScreen
          gameState={gameState}
          user={user}
          playerName={playerName}
          setPlayerName={setPlayerName}
          handleJoinGame={handleJoinGame}
          handleUpdateGameState={handleUpdateGameState}
          currentPlayerInGame={!!currentPlayer}
        />;
      default:
        return (
          <div>
            <h1 className="text-2xl mb-4">Jogo em Andamento</h1>
            <p>Fase: {gameState.phase}</p>
            <p>Seu nome: {currentPlayer?.name}</p>
            <p>Seu papel: {currentPlayer?.role?.name}</p>
            <button onClick={() => setGameId(null)} className="mt-4 bg-red-600 p-2 rounded">Sair da Sala</button>
          </div>
        );
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
