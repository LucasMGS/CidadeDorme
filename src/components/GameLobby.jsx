import React, { useState, useEffect } from 'react';
import { db, auth, onAuthStateChanged } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export const GameLobby = ({ setGameId }) => {
  const [roomId, setRoomId] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Auto sign in anonymously if no user
        signInAnonymously(auth).then((result) => {
          setUser(result.user);
        }).catch((error) => {
          console.error('Error signing in:', error);
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const createGame = async () => {
    if (!user || creating) return;
    
    setCreating(true);
    try {
      const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
      await setDoc(doc(db, "games", newGameId), {
        gameId: newGameId, 
        hostId: user.uid, 
        players: [], 
        phase: 'LOBBY', 
        gameLog: [],
        witchState: { hasLifePotion: true, hasDeathPotion: true },
        nightData: { currentActor: null, phase: 'acting' }, 
        hunterPendingShot: null, 
        votes: {},
        nightNumber: 1,
        history: [],
        createdAt: Date.now()
      });
      setGameId(newGameId);
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Erro ao criar o jogo. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  const openJoinModal = () => {
    setShowJoinModal(true);
  };

  const closeJoinModal = () => {
    setShowJoinModal(false);
    setJoinRoomId('');
  };

  const joinGame = () => {
    if (!joinRoomId.trim() || !user) return;
    setGameId(joinRoomId.trim());
    closeJoinModal();
  };

  const joinGameOld = () => {
    if (!roomId.trim() || !user) return;
    setGameId(roomId.trim());
  };

  const jainiFont = { fontFamily: 'Jaini, sans-serif' };

  if (loading) {
    return (
      <div className="text-white min-h-screen p-8 flex items-center justify-center" style={{...jainiFont, backgroundColor: '#161A1D'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white min-h-screen p-8" style={{...jainiFont, backgroundColor: '#161A1D', minHeight: '100vh'}}>
      {/* Header */}
      <div className="text-center mb-16">
        <img 
          src="/images/cidade-dorme-logo.png" 
          alt="Cidade Dorme"
          className="mx-auto mb-8 max-w-24 sm:max-w-28"
        />
        <div className="flex justify-center gap-4 mb-8 mt-16">
          <button 
            onClick={createGame} 
            disabled={creating || !user}
            className="disabled:cursor-not-allowed text-white font-semibold px-8 py-4 text-sm uppercase tracking-wide transition-colors rounded-xl"
            style={{ 
              backgroundColor: creating || !user ? '#475569' : '#660708'
            }}
            onMouseEnter={(e) => !creating && user && (e.target.style.backgroundColor = '#520506')}
            onMouseLeave={(e) => !creating && user && (e.target.style.backgroundColor = '#660708')}
          >
            {creating ? 'Criando...' : 'Criar Novo Jogo'}
          </button>
          <button 
            onClick={openJoinModal} 
            disabled={!user}
            className="disabled:cursor-not-allowed text-white font-semibold px-8 py-4 text-sm uppercase tracking-wide transition-colors rounded-xl"
            style={{ 
              backgroundColor: !user ? '#475569' : '#660708'
            }}
            onMouseEnter={(e) => user && (e.target.style.backgroundColor = '#520506')}
            onMouseLeave={(e) => user && (e.target.style.backgroundColor = '#660708')}
          >
            Entrar Em Um Jogo
          </button>
                
        </div>
      </div>

      {/* Create a thin line */}
        <hr className="border-t border-gray-700 my-12" />
      

      {/* Como jogar */}
        <h2 className="text-2xl font-bold mb-8">Como jogar</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-blue-500 rounded-full mr-3 flex items-center justify-center">
                <span className="text-xs text-white">☀</span>
              </div>
              <h3 className="text-lg font-semibold">Fase do dia</h3>
            </div>
            <p className="text-sm text-gray-300" style={{ fontFamily: 'Fenix, serif' }}>
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
            <p className="text-sm text-gray-300" style={{ fontFamily: 'Fenix, serif' }}>
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
            <p className="text-sm text-gray-300" style={{ fontFamily: 'Fenix, serif' }}>
              Preste atenção aos padrões de votação, às reivindicações e ao comportamento. Os lobos 
              tentarão se misturar, enquanto os jogadores do Time do Bem buscam a verdade.
            </p>
          </div>
        </div>

      {/* Papéis dentro do jogo */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Papéis dentro do jogo</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="flex items-center justify-center gap-6">
                <img 
                  src="/images/aldeao.png" 
                  alt="Aldeão" 
                  className="w-32 h-32 object-fill rounded"
                />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>Aldeão</h3>
                <p className="text-base text-gray-300 leading-snug" style={{ fontFamily: 'Fenix, serif' }}>
                  Um cidadão comum tentando identificar e eliminar os lobos. 
                  Vota sabiamente durante a fase do dia para ajudar seu time a vencer.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="flex items-center justify-center gap-6">
                <img 
                  src="/images/feiticeiro.png" 
                  alt="Feiticeiro" 
                  className="w-32 h-32 object-fill rounded"
                />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#B938F5' }}>Feiticeiro</h3>
                <p className="text-base text-gray-300 leading-snug" style={{ fontFamily: 'Fenix, serif' }}>
                  Um poderoso usuário de magia que pode usar feitiços especiais. 
                  Use suas habilidades estrategicamente para ajudar a vila a sobreviver à noite.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="flex items-center justify-center gap-6">
                <img 
                  src="/images/cacador.png" 
                  alt="Caçador" 
                  className="w-32 h-32 object-fill rounded"
                />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#D8A22E' }}>Caçador</h3>
                <p className="text-base text-gray-300 leading-snug" style={{ fontFamily: 'Fenix, serif' }}>
                  Um atirador habilidoso com um tiro mortal. Quando eliminado, 
                  você pode levar outro jogador consigo. Escolha seu alvo com cuidado.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="flex items-center justify-center gap-6">
                <img 
                  src="/images/medico.png" 
                  alt="Médico" 
                  className="w-32 h-32 object-fill rounded"
                />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#2ED86F' }}>Médico</h3>
                <p className="text-base text-gray-300 leading-snug" style={{ fontFamily: 'Fenix, serif' }}>
                  Um curandeiro que pode salvar vidas durante a noite. 
                  Escolha um jogador a cada noite para proteger contra ataques de lobos. Você não pode se proteger.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="flex items-center justify-center gap-6">
                <img 
                  src="/images/vidente.png" 
                  alt="Vidente" 
                  className="w-32 h-32 object-fill rounded"
                />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#2E69D8' }}>Vidente</h3>
                <p className="text-base text-gray-300 leading-snug" style={{ fontFamily: 'Fenix, serif' }}>
                  Uma figura mística que pode ver a verdadeira natureza dos outros. 
                  A cada noite, você pode investigar um jogador para saber se ele é do time do Bem ou do mal.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="flex items-center justify-center gap-6">
                <img 
                  src="/images/lobo.png" 
                  alt="Lobo" 
                  className="w-32 h-32 object-fill rounded"
                />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#AC2748' }}>Lobo</h3>
                <p className="text-base text-gray-300 leading-snug" style={{ fontFamily: 'Fenix, serif' }}>
                  Um predador social escondido entre os aldeões. 
                  Trabalhe com outros lobos para eliminar os moradores do bem durante a fase da noite.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Game Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{...jainiFont, backgroundColor: 'rgba(0, 0, 0, 0.85)'}}>
          <div className="rounded-3xl p-8 w-full max-w-lg border-2 border-gray-700" style={{ backgroundColor: '#161A1D' }}>
            <h2 className="text-3xl font-bold text-white text-left " style={jainiFont}>Entrar Em Um Jogo</h2>
             <hr className="border-t border-gray-700 my-4 mb-8" style={{ width: 'calc(100% + 4rem)', marginLeft: '-2rem', marginRight: '-2rem' }} />
            <div className="mb-16">
              <input 
                type="text" 
                value={joinRoomId} 
                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())} 
                placeholder="Inserir Código" 
                className="w-full text-white px-6 py-4 text-lg border-none focus:outline-none rounded-2xl"
                style={{ backgroundColor: '#2A2F36', fontFamily: 'Jaini, sans-serif' }}
                onKeyDown={(e) => e.key === 'Enter' && joinGame()}
                autoFocu4
              />
            </div>

            <div className="flex gap-4 justify-end">
              <button 
                onClick={closeJoinModal} 
                className="text-white font-semibold px-8 py-3 rounded-2xl transition-colors"
                style={{ backgroundColor: '#161A1D', fontFamily: 'Jaini, sans-serif', border: '1px solid #374151' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2A2F36'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#161A1D'}
              >
                Cancelar
              </button>
              <button 
                onClick={joinGame} 
                disabled={!joinRoomId.trim()}
                className="disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-2xl transition-colors"
                style={{ 
                  backgroundColor: !joinRoomId.trim() ? '#475569' : '#660708',
                  fontFamily: 'Jaini, sans-serif'
                }}
                onMouseEnter={(e) => joinRoomId.trim() && (e.target.style.backgroundColor = '#520506')}
                onMouseLeave={(e) => joinRoomId.trim() && (e.target.style.backgroundColor = '#660708')}
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
