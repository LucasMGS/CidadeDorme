import React from 'react';

export const GameOverScreen = ({ winner, players, resetGame }) => (
  <div className="text-center">
      <h1 className="text-6xl font-bold mb-4">Fim de Jogo!</h1>
      <p className="text-3xl mb-8">
          Os <span className={`font-bold ${winner === 'ASSASSINOS' ? 'text-red-500' : 'text-green-500'}`}>{winner}</span> venceram!
      </p>
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h3 className="text-2xl font-bold mb-4">Quadro Final de Papéis</h3>
          {players.map(p => (
              <p key={p.name} className="text-lg">
                  {p.name} era <span className={`font-bold ${p.role.team === 'evil' ? 'text-red-400' : 'text-green-400'}`}>{p.role.name}</span>
              </p>
          ))}
      </div>
      <button 
          onClick={resetGame} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl"
      >
          Jogar Novamente
      </button>
  </div>
);
