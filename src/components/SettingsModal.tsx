

import React, { useState, useEffect } from 'react';
import { Cog6ToothIcon, SpeakerWaveIcon, SpeakerXMarkIcon, XMarkIcon, CloudIcon, ArrowPathIcon, CheckIcon, InformationCircleIcon } from './Icon';
import { AUDIO_SETTINGS_STORAGE_KEY } from '../constants';
import { setGlobalMute, setGlobalVolume, getAudioSettings } from '../utils/audioPlayer';
import { AuthState } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Cloud Props
  onSync: () => Promise<void>;
  isSyncing: boolean;
  onLogin: () => void;
  onLogout: () => void;
  authState: AuthState;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSync, isSyncing, onLogin, onLogout, authState }) => {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'audio' | 'cloud'>('audio');
  
  // Cloud ID state
  const [clientId, setClientId] = useState('');
  const [hasSavedId, setHasSavedId] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const settings = getAudioSettings();
      setVolume(settings.volume);
      setIsMuted(settings.muted);
      
      const savedId = localStorage.getItem('kian_google_client_id');
      if (savedId) {
          setClientId(savedId);
          setHasSavedId(true);
      }
    }
  }, [isOpen]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setGlobalVolume(newVolume);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setGlobalMute(newMuted);
  };
  
  const saveClientId = () => {
      if(clientId.trim()) {
          localStorage.setItem('kian_google_client_id', clientId.trim());
          setHasSavedId(true);
      }
  };
  
  const clearClientId = () => {
      localStorage.removeItem('kian_google_client_id');
      setClientId('');
      setHasSavedId(false);
      onLogout();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-bg-primary border border-border-color rounded-xl shadow-2xl max-w-md w-full animate-fade-in flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border-color flex justify-between items-center bg-bg-secondary rounded-t-xl flex-shrink-0">
          <h3 className="font-bold text-text-primary flex items-center gap-2">
            <Cog6ToothIcon className="w-6 h-6 text-accent-primary" />
            Configurações
          </h3>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex border-b border-border-color">
            <button 
                onClick={() => setActiveTab('audio')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'audio' ? 'text-accent-primary border-b-2 border-accent-primary' : 'text-text-tertiary hover:text-text-primary'}`}
            >
                Áudio
            </button>
            <button 
                onClick={() => setActiveTab('cloud')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'cloud' ? 'text-accent-primary border-b-2 border-accent-primary' : 'text-text-tertiary hover:text-text-primary'}`}
            >
                Nuvem & Sincronização
            </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          
          {activeTab === 'audio' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                    {isMuted ? (
                        <SpeakerXMarkIcon className="w-8 h-8 text-text-tertiary" />
                    ) : (
                        <SpeakerWaveIcon className="w-8 h-8 text-accent-secondary" />
                    )}
                    <div>
                        <p className="font-bold text-text-primary">Efeitos Sonoros</p>
                        <p className="text-xs text-text-tertiary">Sons de interface e feedback</p>
                    </div>
                    </div>
                    <button 
                    onClick={toggleMute}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isMuted ? 'bg-bg-tertiary' : 'bg-accent-primary'}`}
                    >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMuted ? 'translate-x-1' : 'translate-x-6'}`} />
                    </button>
                </div>

                <div className={`space-y-2 transition-opacity ${isMuted ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Volume</span>
                    <span className="font-mono text-text-primary">{Math.round(volume * 100)}%</span>
                    </div>
                    <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={volume} 
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary"
                    />
                </div>
              </div>
          )}

          {activeTab === 'cloud' && (
              <div className="space-y-6">
                  <div className="bg-bg-secondary p-4 rounded-lg border border-border-color">
                      <div className="flex items-start gap-3">
                          <CloudIcon className="w-8 h-8 text-accent-primary flex-shrink-0" />
                          <div>
                              <h4 className="font-bold text-text-primary text-sm">Sincronização com Google Drive</h4>
                              <p className="text-xs text-text-secondary mt-1">Salve seu progresso, XP e flashcards na nuvem para acessar em qualquer dispositivo.</p>
                          </div>
                      </div>
                  </div>

                  {!hasSavedId ? (
                      <div className="space-y-3 animate-fade-in">
                          <div className="text-xs text-text-tertiary bg-bg-tertiary p-3 rounded border border-border-color">
                             <p className="font-bold mb-1 flex items-center gap-1"><InformationCircleIcon className="w-4 h-4"/> Configuração Necessária</p>
                             <p>Para usar o Google Drive sem um servidor intermediário (custo zero), você precisa fornecer um <strong>Client ID</strong> do Google Cloud.</p>
                             <ol className="list-decimal list-inside mt-2 space-y-1 ml-1 opacity-80">
                                 <li>Crie um projeto no Google Cloud Console.</li>
                                 <li>Habilite a <strong>Google Drive API</strong>.</li>
                                 <li>Crie Credenciais OAuth (Web App).</li>
                                 <li>Adicione a origem deste site (ex: localhost ou seu domínio).</li>
                                 <li>Copie o Client ID.</li>
                             </ol>
                          </div>
                          <input 
                              type="text" 
                              placeholder="Cole seu Client ID aqui (ex: ...apps.googleusercontent.com)"
                              value={clientId}
                              onChange={(e) => setClientId(e.target.value)}
                              className="w-full p-2 bg-bg-tertiary border border-border-color rounded text-sm text-text-primary"
                          />
                          <button 
                              onClick={saveClientId}
                              disabled={!clientId.trim()}
                              className="w-full py-2 bg-accent-primary text-white font-bold rounded hover:bg-accent-primary/80 disabled:opacity-50"
                          >
                              Salvar Configuração
                          </button>
                      </div>
                  ) : (
                      <div className="space-y-4 animate-fade-in">
                           {!authState.isAuthenticated ? (
                               <button 
                                   onClick={onLogin}
                                   className="w-full flex items-center justify-center gap-2 py-2 bg-white text-black font-bold rounded hover:bg-gray-100 transition-colors"
                               >
                                   <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                                   Conectar com Google
                               </button>
                           ) : (
                               <div className="space-y-4">
                                   <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                                       <div className="flex items-center gap-2">
                                           {authState.user?.photoUrl ? (
                                               <img src={authState.user.photoUrl} className="w-8 h-8 rounded-full" />
                                           ) : (
                                               <div className="w-8 h-8 bg-accent-secondary rounded-full flex items-center justify-center font-bold text-white">{authState.user?.name?.[0]}</div>
                                           )}
                                           <div>
                                               <p className="text-sm font-bold text-text-primary">{authState.user?.name}</p>
                                               <p className="text-xs text-text-secondary">Conectado</p>
                                           </div>
                                       </div>
                                       <button onClick={onLogout} className="text-xs text-accent-error hover:underline">Sair</button>
                                   </div>

                                   <button 
                                       onClick={onSync}
                                       disabled={isSyncing}
                                       className="w-full flex items-center justify-center gap-2 py-3 bg-accent-secondary text-white font-bold rounded-lg hover:bg-accent-secondary/80 disabled:opacity-50 transition-all"
                                   >
                                       {isSyncing ? (
                                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                       ) : (
                                           <ArrowPathIcon className="w-5 h-5" />
                                       )}
                                       {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                                   </button>
                                   
                                   <p className="text-xs text-center text-text-tertiary">
                                       A sincronização mescla seus dados locais com a nuvem, mantendo sempre o maior progresso.
                                   </p>
                               </div>
                           )}
                           
                           <div className="pt-4 border-t border-border-color">
                               <button onClick={clearClientId} className="text-xs text-text-tertiary hover:text-text-primary underline w-full text-center">
                                   Remover Configuração (Client ID)
                               </button>
                           </div>
                      </div>
                  )}

              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;