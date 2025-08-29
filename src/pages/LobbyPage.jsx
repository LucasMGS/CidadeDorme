import React from 'react';
import { GameLobby } from '../components/GameLobby';
import { useNavigate } from 'react-router-dom';

export const LobbyPage = () => {
  const navigate = useNavigate();

  const handleSetGameId = (gameId) => {
    navigate(`/lobby/${gameId}`);
  };

  return <GameLobby setGameId={handleSetGameId} />;
};