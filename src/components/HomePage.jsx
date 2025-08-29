import React from 'react';

export const HomePage = ({ onEnterGame }) => {
  return (
    <div 
      className="bg-[url(/images/background.png)] min-h-screen flex items-center justify-center relative"
    >
      
      <div className="relative z-10 text-center text-white px-4">
        {/* Title Image */}
        <div className="mb-8">
          <img 
            src="/images/cidade-dorme-logo.png" 
            alt="Cidade Dorme"
            className="mx-auto max-w-full h-auto"
          />
        </div>
        
        <p 
          className="text-lg md:text-xl font-light tracking-wide mb-12 max-w-2xl mx-auto text-white"
          style={{ fontFamily: "'IM Fell Great Primer', serif" }}
        >
          Cada sombra esconde uma verdade. Cada silêncio, uma mentira.
        </p>
        
        <button
          onClick={onEnterGame}
          className="bg-red-600 hover:bg-red-700 transition-colors duration-300 text-white font-bold py-4 px-8 rounded-lg text-xl tracking-wide shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          ENTRAR NO JOGO
        </button>
      </div>
    </div>
  );
};
