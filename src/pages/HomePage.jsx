import React from 'react';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();

  const handleEnterGame = () => {
    navigate('/lobby');
  };

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
          onClick={handleEnterGame}
          className="text-white font-bold py-4 px-8 rounded-lg text-xl tracking-wide shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          style={{ backgroundColor: '#660708' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#520506'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#660708'}
        >
          ENTRAR NO JOGO
        </button>
      </div>
    </div>
  );
};