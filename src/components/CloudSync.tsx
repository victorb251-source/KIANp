
import React, { useState } from 'react';
import { AuthState } from '../types';
import { XMarkIcon } from './Icon';

interface CloudSyncProps {
    authState: AuthState;
    cloudConfigId: string | null;
    onLogin: () => void;
    onLogout: () => void;
    onSaveConfig: (id: string) => void;
}

export const SetupCloudModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (id: string) => void }> = ({ isOpen, onClose, onSave }) => {
    const [clientId, setClientId] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-bg-primary border border-border-color rounded-xl p-6 max-w-md w-full animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-text-primary">Configuração Google Drive</h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-text-tertiary" /></button>
                </div>
                
                <p className="text-sm text-text-secondary mb-4">
                    Para habilitar a sincronização na nuvem, você precisa fornecer um <strong>Google Client ID</strong>. 
                    Como este é um aplicativo web executado no seu navegador, não podemos fornecer um ID universal sem hospedar um servidor.
                </p>

                <div className="bg-bg-secondary p-3 rounded-md text-xs text-text-tertiary mb-4 space-y-2">
                    <p>1. Vá ao Google Cloud Console.</p>
                    <p>2. Crie um projeto e habilite a <strong>Google Drive API</strong>.</p>
                    <p>3. Crie credenciais OAuth 2.0 para "Aplicativo Web".</p>
                    <p>4. Adicione a origem da sua aplicação (ex: <code>http://localhost:5173</code>) nas origens autorizadas.</p>
                    <p>5. Cole o Client ID abaixo.</p>
                </div>

                <input 
                    type="text" 
                    placeholder="Cole seu Client ID aqui (ex: 123...apps.googleusercontent.com)"
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className="w-full p-2 mb-4 bg-bg-tertiary border border-border-color rounded text-text-primary text-sm"
                />

                <button 
                    onClick={() => { if(clientId) onSave(clientId); }}
                    disabled={!clientId}
                    className="w-full py-2 bg-accent-primary text-white font-bold rounded hover:bg-accent-primary/80 disabled:opacity-50"
                >
                    Salvar e Conectar
                </button>
            </div>
        </div>
    );
};

export const CloudMenu: React.FC<CloudSyncProps> = ({ authState, cloudConfigId, onLogin, onLogout, onSaveConfig }) => {
    const [isSetupOpen, setIsSetupOpen] = useState(false);

    const handleLoginClick = () => {
        if (!cloudConfigId) {
            setIsSetupOpen(true);
        } else {
            onLogin();
        }
    };

    return (
        <>
            <SetupCloudModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} onSave={(id) => { onSaveConfig(id); setIsSetupOpen(false); }} />
            
            <div className="flex items-center gap-3">
                {authState.isAuthenticated && authState.user ? (
                    <div className="flex items-center gap-2 bg-bg-tertiary px-3 py-1 rounded-full border border-border-color">
                        {authState.user.photoUrl ? (
                            <img src={authState.user.photoUrl} alt="Avatar" className="w-6 h-6 rounded-full" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-accent-secondary flex items-center justify-center text-xs font-bold text-white">
                                {authState.user.name[0]}
                            </div>
                        )}
                        <span className="text-xs font-medium text-text-primary hidden sm:block">{authState.user.name.split(' ')[0]}</span>
                        <button onClick={onLogout} className="text-xs text-accent-error hover:underline ml-2">Sair</button>
                    </div>
                ) : (
                    <button 
                        onClick={handleLoginClick}
                        className="flex items-center gap-2 px-4 py-1.5 bg-white text-gray-800 text-sm font-bold rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                        </svg>
                        Login com Google
                    </button>
                )}
            </div>
        </>
    );
};
