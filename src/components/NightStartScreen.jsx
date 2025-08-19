import React from 'react';

export const NightStartScreen = ({ gameState }) => {
  const { nightNumber } = gameState;

  return (
    <div className="text-center flex flex-col items-center justify-center h-screen -mt-24 md:-mt-0">
      <h1 className="text-8xl font-bold text-blue-400 animate-pulse">
        Noite {nightNumber}
      </h1>
      <p className="text-xl text-gray-400 mt-4">A cidade dorme...</p>
    </div>
  );
};
