import React from 'react';

export const HunterRevengeScreen = ({ players, hunterToShoot, handleHunterShot }) => {
  const alivePlayers = (players || []).filter(p => p.isAlive);

  return (
    <div className="text-center">
        <h2 className="text-4xl font-bold text-red-500 mb-4">Vingança do Caçador!</h2>
        <p className="text-xl text-gray-300 mb-6">{hunterToShoot}, você foi eliminado. Leve alguém com você.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {alivePlayers.map(p => (
              <button 
                key={p.name} 
                onClick={() => handleHunterShot(p.name)} 
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold p-4 rounded-lg"
              >
                {p.name}
              </button>
            ))}
        </div>
    </div>
  );
};
