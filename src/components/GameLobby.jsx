import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export const GameLobby = ({ setGameId }) => {
  const [roomId, setRoomId] = useState('');
  
  const createGame = async () => {
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const user = auth.currentUser;
    if (!user) return;
    await setDoc(doc(db, "games", newGameId), {
      gameId: newGameId, hostId: user.uid, players: [], phase: 'LOBBY', gameLog: [],
      witchState: { hasLifePotion: true, hasDeathPotion: true },
      nightData: { currentActor: null, phase: 'acting' }, hunterPendingShot: null, votes: {},
      nightNumber: 1,
      history: [],
    });
    setGameId(newGameId);
  };

  const interFont = { fontFamily: 'Inter, sans-serif' };

  return (
    <div className="bg-slate-900 text-white min-h-screen p-8" style={interFont}>
      {/* Header */}
      <div className="text-center mb-16">
        <img 
          src="/images/cidade-dorme-logo.png" 
          alt="Cidade Dorme"
          className="mx-auto mb-8 max-w-xs sm:max-w-sm"
        />
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={createGame} 
            className="bg-red-700 hover:bg-red-800 text-white font-semibold px-8 py-3 text-sm uppercase tracking-wide transition-colors"
          >
            Criar Novo Jogo
          </button>
          <button 
            onClick={() => roomId.trim() && setGameId(roomId.trim())} 
            className="bg-red-700 hover:bg-red-800 text-white font-semibold px-8 py-3 text-sm uppercase tracking-wide transition-colors"
          >
            Entrar Em Um Jogo
          </button>
        </div>
        <input 
          type="text" 
          value={roomId} 
          onChange={(e) => setRoomId(e.target.value.toUpperCase())} 
          placeholder="Código da sala..." 
          className="bg-slate-700 text-white px-4 py-2 text-center text-sm border-none focus:outline-none focus:ring-2 focus:ring-red-600"
        />
      </div>

      {/* Como jogar */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Como jogar</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-blue-500 rounded-full mr-3 flex items-center justify-center">
                <span className="text-xs text-white">☀</span>
              </div>
              <h3 className="text-lg font-semibold">Fase do dia</h3>
            </div>
            <p className="text-sm text-gray-300">
              Todos os jogadores discutem e votam para eliminar alguém que suspeitem ser ameaça. 
              Use a lógica, a observação e a dedução para identificar as ameaças.
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-purple-500 rounded-full mr-3 flex items-center justify-center">
                <span className="text-xs text-white">🌙</span>
              </div>
              <h3 className="text-lg font-semibold">Fase da noite</h3>
            </div>
            <p className="text-sm text-gray-300">
              Funções especiais ativam suas habilidades em segredo. Os lobos escolhem uma vítima, 
              enquanto outros papéis trabalham para proteger ou investigar.
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                <span className="text-xs text-white">🎯</span>
              </div>
              <h3 className="text-lg font-semibold">Dicas de estratégia</h3>
            </div>
            <p className="text-sm text-gray-300">
              Preste atenção aos padrões de votação, às reivindicações e ao comportamento. Os lobos 
              tentarão se misturar, enquanto os jogadores do Time do Bem buscam a verdade.
            </p>
          </div>
        </div>
      </div>

      {/* Papéis dentro do jogo */}
      <div>
        <h2 className="text-2xl font-bold mb-8">Papéis dentro do jogo</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-green-400">Aldeão</h3>
            <p className="text-sm text-gray-300">
              Um cidadão comum tentando identificar e eliminar os lobos. 
              Vota sabiamente durante a fase do dia para ajudar seu time a vencer.
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-purple-400">Feiticeiro</h3>
            <p className="text-sm text-gray-300">
              Um poderoso usuário de magia que pode usar feitiços especiais. 
              Use suas habilidades estrategicamente para ajudar a vila a sobreviver à noite.
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-orange-400">Caçador</h3>
            <p className="text-sm text-gray-300">
              Um atirador habilidoso com um tiro mortal. Quando eliminado, 
              você pode levar outro jogador consigo. Escolha seu alvo com cuidado.
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">Médico</h3>
            <p className="text-sm text-gray-300">
              Um curandeiro que pode salvar vidas durante a noite. 
              Escolha um jogador a cada noite para proteger contra ataques de lobos. Você não pode se proteger.
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-cyan-400">Vidente</h3>
            <p className="text-sm text-gray-300">
              Uma figura mística que pode ver a verdadeira natureza dos outros. 
              A cada noite, você pode investigar um jogador para saber se ele é do time do Bem ou do mal.
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-red-400">Lobo</h3>
            <p className="text-sm text-gray-300">
              Um predador social escondido entre os aldeões. 
              Trabalhe com outros lobos para eliminar os moradores do bem durante a fase da noite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
