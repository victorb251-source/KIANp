
import React, { useState, useEffect } from 'react';
import { listPdfs } from '../services/googleDriveService';
import { DriveFile } from '../types';
import { XMarkIcon, DocumentTextIcon } from './Icon';
import Loader from './Loader';

interface DrivePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectFile: (fileId: string, fileName: string) => void;
}

const DrivePicker: React.FC<DrivePickerProps> = ({ isOpen, onClose, onSelectFile }) => {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadFiles();
        }
    }, [isOpen]);

    const loadFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const driveFiles = await listPdfs();
            setFiles(driveFiles || []);
        } catch (e: any) {
            console.error(e);
            setError(e?.result?.error?.message || "Erro ao listar arquivos do Google Drive.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-bg-primary border border-border-color rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-border-color flex justify-between items-center bg-bg-secondary rounded-t-xl">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <span className="text-accent-primary">☁️</span> Selecionar PDF do Drive
                    </h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-text-tertiary hover:text-text-primary" /></button>
                </div>

                <div className="flex-grow overflow-y-auto p-4">
                    {loading && <div className="py-10"><Loader message="Carregando arquivos do Drive..." /></div>}
                    
                    {error && (
                        <div className="bg-accent-error/20 text-accent-error p-3 rounded-md text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {!loading && !error && files.length === 0 && (
                        <p className="text-center text-text-tertiary py-10">Nenhum arquivo PDF encontrado no seu Drive (ou nesta pasta de app).</p>
                    )}

                    <div className="grid grid-cols-1 gap-2">
                        {files.map(file => (
                            <button 
                                key={file.id} 
                                onClick={() => onSelectFile(file.id, file.name)}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-secondary text-left group border border-transparent hover:border-border-color transition-all"
                            >
                                <DocumentTextIcon className="w-8 h-8 text-accent-secondary group-hover:scale-110 transition-transform" />
                                <div className="flex-grow overflow-hidden">
                                    <p className="text-sm font-semibold text-text-primary truncate">{file.name}</p>
                                    <p className="text-xs text-text-tertiary">ID: {file.id.slice(0, 8)}...</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrivePicker;
