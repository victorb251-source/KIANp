

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BoardStyle, GeneratedQuestion, ShopItem, StudyGoal, ProgressData, Folder } from './types';
import { BOARD_STYLES, CORRECT_ANSWER_SOUND_URL, INCORRECT_ANSWER_SOUND_URL, REWARDS, FOLDERS_STORAGE_KEY } from './constants';
import { generateQuestions, generateFlashcard, generateSimpleExplanation, generateStudySuggestions } from './services/geminiService';
import Loader from './components/Loader';
import QuestionCard from './components/QuestionCard';
import { 
  BrainIcon, 
  FolderOpenIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  TrophyIcon,
  DocumentTextIcon,
  XMarkIcon,
  FolderPlusIcon,
  FolderIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  ChevronRightIcon
} from './components/Icon';
import { playSound } from './utils/audioPlayer';
import useGamification from './hooks/useGamification';
import StatsModal from './components/StatsModal';
import ToastNotification from './components/ToastNotification';
import { isToday, formatRelativeTime } from './utils/dateUtils';
import ResizeHandle from './components/ResizeHandle';
import ExplanationModal from './components/ExplanationModal';
import SuggestionsModal from './components/SuggestionsModal';
import Toolbar from './components/Toolbar';
import StudyGoalModal from './components/StudyGoalModal';
import GoalCompletionModal from './components/GoalCompletionModal';
import SessionStatsModal from './components/SessionStatsModal';
import MockExamSetupModal from './components/MockExamSetupModal';
import MockExamWindow from './components/MockExamWindow';

declare const pdfjsLib: any;

const PROGRESS_STORAGE_KEY = 'concurseiroAtivoProgress';

// --- DESKTOP UI COMPONENTS ---
const MenuBar: React.FC<{ 
    onOpenFile: () => void, 
}> = ({ onOpenFile }) => (
  <header className="bg-bg-secondary px-4 py-2 border-b border-border-color/50 flex items-center justify-between gap-4 flex-shrink-0">
    <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gradient-from to-accent-gradient-to">
          Kian
        </h1>
        <nav className="flex gap-4">
          <button onClick={onOpenFile} className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Arquivo Local
          </button>
        </nav>
    </div>
  </header>
);

const StatusBar: React.FC<{ fileName: string; onOpenStats: () => void; tokens: number }> = ({ fileName, onOpenStats, tokens }) => (
  <footer className="bg-bg-secondary px-4 py-1.5 border-t border-border-color/50 flex items-center justify-between text-sm flex-shrink-0">
    <span className="text-text-tertiary truncate text-xs" title={fileName}>
      {fileName}
    </span>
    <div className="flex items-center gap-4">
       <div className="flex items-center gap-1.5 font-bold text-yellow-400">
          <span className="text-lg">🪙</span>
          <span className="text-sm">{tokens}</span>
      </div>
      <button onClick={onOpenStats} className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors font-semibold">
        <TrophyIcon className="w-4 h-4" />
        <span className="text-xs">Jornada</span>
      </button>
    </div>
  </footer>
);

const RecentActivityItem: React.FC<{ 
    activity: ProgressData, 
    onOpenFile: () => void, 
    onShowStats: () => void,
    onDelete: () => void,
    onMove: (folderId: string | null) => void,
    folders: Folder[],
    currentFolderId: string | null
}> = ({ activity, onOpenFile, onShowStats, onDelete, onMove, folders, currentFolderId }) => {
    const progress = activity.totalPages > 0 ? (activity.currentPage / activity.totalPages) * 100 : 0;
    const [isMoveOpen, setIsMoveOpen] = useState(false);
    
    return (
        <div className="relative bg-bg-secondary p-4 rounded-lg border border-border-color/50 flex items-center justify-between gap-4 animate-fade-in transition-all hover:border-accent-primary/50 hover:bg-bg-tertiary group">
            
            {/* Delete Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="absolute top-2 right-2 p-1 text-text-tertiary hover:text-accent-error opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remover arquivo"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 overflow-hidden">
                <DocumentTextIcon className="w-10 h-10 text-accent-primary flex-shrink-0" />
                <div className="flex-grow overflow-hidden pr-8">
                    <p className="font-bold text-text-primary truncate" title={activity.fileName}>{activity.fileName}</p>
                    <p className="text-xs text-text-tertiary">Acessado {formatRelativeTime(new Date(activity.sessionDate))}</p>
                    <div className="mt-2 w-32" title={`Página ${activity.currentPage} de ${activity.totalPages}`}>
                    <div className="w-full bg-bg-tertiary rounded-full h-1.5">
                        <div className="bg-accent-secondary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                 {/* Move Dropdown */}
                 <div className="relative">
                    <button 
                        onClick={() => setIsMoveOpen(!isMoveOpen)}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-interactive rounded-md"
                        title="Mover para pasta"
                    >
                        <FolderOpenIcon className="w-5 h-5" />
                    </button>
                    {isMoveOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsMoveOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-primary border border-border-color rounded-md shadow-xl z-20 py-1 max-h-60 overflow-y-auto">
                                <button
                                    onClick={() => { onMove(null); setIsMoveOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-bg-interactive ${currentFolderId === null ? 'font-bold text-accent-primary' : 'text-text-primary'}`}
                                >
                                    Arquivos Soltos (Raiz)
                                </button>
                                {folders.map(folder => (
                                    <button
                                        key={folder.id}
                                        onClick={() => { onMove(folder.id); setIsMoveOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-xs hover:bg-bg-interactive ${currentFolderId === folder.id ? 'font-bold text-accent-primary' : 'text-text-primary'}`}
                                    >
                                        {folder.name}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <button onClick={onShowStats} className="bg-bg-tertiary text-text-secondary font-bold px-3 py-2 rounded-md hover:bg-bg-interactive transition-transform transform hover:scale-105 text-xs">
                    Stats
                </button>
                <button onClick={onOpenFile} className="bg-accent-primary text-white font-bold px-3 py-2 rounded-md hover:bg-accent-primary/80 transition-transform transform hover:scale-105 text-xs">
                    Abrir
                </button>
            </div>
        </div>
    );
};


const WelcomeScreen: React.FC<{ 
    onOpenFile: () => void, 
    error: string | null, 
    activities: Record<string, ProgressData>, 
    onShowStats: (activity: ProgressData) => void,
    onDeleteFile: (id: string) => void,
    folders: Folder[],
    onCreateFolder: (name: string) => void,
    onDeleteFolder: (id: string) => void,
    onMoveFile: (fileId: string, folderId: string | null) => void
}> = ({ onOpenFile, error, activities, onShowStats, onDeleteFile, folders, onCreateFolder, onDeleteFolder, onMoveFile }) => {
    
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const currentFolder = folders.find(f => f.id === currentFolderId);
    
    // Determine which files to show
    const filesToShow = (Object.entries(activities) as [string, ProgressData][]).filter(([id, data]) => {
        const fileInFolder = folders.find(f => f.files.includes(id));
        if (currentFolderId) {
            // Show files in the current folder
            return fileInFolder?.id === currentFolderId;
        } else {
            // Show files in NO folder (root)
            return !fileInFolder;
        }
    }).sort((a, b) => new Date(b[1].sessionDate).getTime() - new Date(a[1].sessionDate).getTime());

    const handleCreateFolderSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFolderName.trim()) {
            onCreateFolder(newFolderName.trim());
            setNewFolderName('');
            setIsCreatingFolder(false);
        }
    };

    return (
    <div className="flex flex-col h-full p-4 md:p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8 flex-shrink-0">
             <div>
                 <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-gradient-from to-accent-gradient-to">
                    Biblioteca
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                    {currentFolder ? `Pasta: ${currentFolder.name}` : 'Seus arquivos e pastas'}
                </p>
             </div>
             <div className="flex gap-2">
                 {!currentFolderId && (
                     <button 
                        onClick={() => setIsCreatingFolder(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-bg-secondary text-text-primary rounded-lg border border-border-color hover:bg-bg-tertiary transition-all"
                     >
                         <FolderPlusIcon className="w-5 h-5" />
                         <span className="hidden sm:inline">Nova Pasta</span>
                     </button>
                 )}
                 <button
                    onClick={onOpenFile}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white font-bold rounded-lg hover:bg-accent-primary/80 transition-all shadow-lg"
                >
                    <FolderOpenIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Abrir PDF</span>
                </button>
             </div>
        </div>

        {/* Folder Navigation Header if inside folder */}
        {currentFolderId && (
            <div className="flex items-center gap-2 mb-4">
                <button 
                    onClick={() => setCurrentFolderId(null)}
                    className="flex items-center gap-1 text-text-tertiary hover:text-accent-primary transition-colors"
                >
                    <ArrowUturnLeftIcon className="w-4 h-4" />
                    Voltar
                </button>
                <ChevronRightIcon className="w-4 h-4 text-text-tertiary" />
                <span className="font-bold text-text-primary">{currentFolder?.name}</span>
            </div>
        )}
        
        <div className="flex-grow pb-20">
            {/* Create Folder Form */}
            {isCreatingFolder && (
                <form onSubmit={handleCreateFolderSubmit} className="mb-6 bg-bg-secondary p-4 rounded-lg border border-accent-primary animate-fade-in flex gap-2 items-center">
                    <FolderIcon className="w-6 h-6 text-accent-primary" />
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Nome da pasta..." 
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        className="flex-grow bg-bg-tertiary text-text-primary px-3 py-2 rounded border border-border-color focus:border-accent-primary outline-none"
                    />
                    <button type="submit" className="px-4 py-2 bg-accent-primary text-white rounded font-bold hover:bg-accent-primary/80">Criar</button>
                    <button type="button" onClick={() => setIsCreatingFolder(false)} className="px-4 py-2 bg-bg-tertiary text-text-primary rounded hover:bg-bg-interactive">Cancelar</button>
                </form>
            )}

            {/* Folders Grid (Only show in root) */}
            {!currentFolderId && folders.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-text-tertiary mb-3 uppercase tracking-wider">Pastas</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {folders.map(folder => (
                            <div key={folder.id} className="group relative bg-bg-secondary border border-border-color rounded-lg p-4 hover:bg-bg-tertiary hover:border-accent-primary/50 transition-all cursor-pointer" onClick={() => setCurrentFolderId(folder.id)}>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                                    className="absolute top-2 right-2 p-1 text-text-tertiary hover:text-accent-error opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Excluir pasta"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <FolderIcon className="w-12 h-12 text-accent-secondary" />
                                    <span className="font-bold text-text-primary text-sm truncate w-full">{folder.name}</span>
                                    <span className="text-xs text-text-tertiary">{folder.files.length} itens</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Files List */}
            <div>
                <h3 className="text-sm font-bold text-text-tertiary mb-3 uppercase tracking-wider">
                    {currentFolderId ? `Arquivos em ${currentFolder?.name}` : 'Arquivos Soltos'}
                </h3>
                {filesToShow.length > 0 ? (
                    <div className="space-y-3">
                        {filesToShow.map(([id, activity]) => (
                            <RecentActivityItem 
                                key={id} 
                                activity={activity} 
                                onOpenFile={() => onOpenFile()} 
                                onShowStats={() => onShowStats(activity)}
                                onDelete={() => onDeleteFile(id)}
                                onMove={(targetFolderId) => onMoveFile(id, targetFolderId)}
                                folders={folders}
                                currentFolderId={currentFolderId}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 px-6 bg-bg-secondary/30 rounded-lg border border-border-color/30 border-dashed">
                        <p className="text-text-secondary">Nenhum arquivo encontrado aqui.</p>
                        {!currentFolderId && <p className="text-text-tertiary text-sm mt-2">Adicione um PDF ou crie uma pasta para começar.</p>}
                    </div>
                )}
            </div>
        </div>
        
        {error && (
            <div className="mt-4 bg-accent-error/20 border border-accent-error text-accent-error px-4 py-3 rounded-md w-full text-sm" role="alert">
                <p>{error}</p>
            </div>
        )}
    </div>
    );
}

// --- OUTLINE COMPONENT ---

const OutlineSidebar: React.FC<{ 
    outline: any[], 
    isOpen: boolean, 
    onClose: () => void,
    onNavigate: (dest: any) => void 
}> = ({ outline, isOpen, onClose, onNavigate }) => {
    
    // Recursive renderer for outline items
    const renderItems = (items: any[]) => {
        return (
            <ul className="pl-4 border-l border-border-color/30 ml-1">
                {items.map((item, index) => (
                    <li key={index} className="my-1">
                        <button 
                            onClick={() => onNavigate(item.dest)}
                            className="text-left text-sm text-text-secondary hover:text-text-primary hover:bg-bg-interactive/20 py-1 px-2 rounded w-full truncate block"
                            title={item.title}
                        >
                            {item.title}
                        </button>
                        {item.items && item.items.length > 0 && renderItems(item.items)}
                    </li>
                ))}
            </ul>
        );
    };

    if (!isOpen) return null;

    return (
        <div className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-bg-secondary border-r border-border-color shadow-2xl transform transition-transform duration-300 ease-in-out
            md:relative md:transform-none md:shadow-none md:z-0
            ${isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}
            flex flex-col h-full flex-shrink-0
        `}>
            <div className="p-3 border-b border-border-color flex justify-between items-center bg-bg-secondary sticky top-0">
                <h3 className="font-bold text-text-primary text-sm uppercase tracking-wide">Sumário</h3>
                <button onClick={onClose} className="md:hidden text-text-tertiary hover:text-text-primary">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-bg-interactive scrollbar-track-bg-secondary">
                {outline.length > 0 ? (
                    <div className="pr-2">
                        <ul className="">
                        {outline.map((item, index) => (
                             <li key={index} className="my-1">
                                <button 
                                    onClick={() => onNavigate(item.dest)}
                                    className="text-left text-sm font-medium text-text-primary hover:text-accent-primary hover:bg-bg-interactive/20 py-1.5 px-2 rounded w-full truncate block"
                                    title={item.title}
                                >
                                    {item.title}
                                </button>
                                {item.items && item.items.length > 0 && renderItems(item.items)}
                            </li>
                        ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-text-tertiary text-sm p-4 text-center">Nenhum sumário encontrado.</p>
                )}
            </div>
        </div>
    );
};

// --- PDF PAGE COMPONENT ---
interface PDFPageProps {
    pageNumber: number;
    pdfDoc: any;
    scale: number;
    searchQuery: string;
    searchResults: number[];
    isSelectionMode: boolean;
    onSelectionStart: (p: number, x: number, y: number) => void;
    onSelectionMove: (p: number, x: number, y: number) => void;
    onSelectionEnd: () => void;
    selectionRect: { page: number, x: number, y: number, w: number, h: number } | null;
    registerPageRef: (pageNum: number, el: HTMLDivElement | null) => void;
    isSelecting: boolean;
    startSelection: { page: number, x: number, y: number } | null;
    generateFromSelection: () => void;
    numQuestionsSelection: number;
    setNumQuestionsSelection: (n: number) => void;
    onCancelSelection: () => void;
}

const PDFPage = React.memo(({ 
    pageNumber, 
    pdfDoc, 
    scale, 
    searchQuery, 
    searchResults,
    isSelectionMode,
    onSelectionStart,
    onSelectionMove,
    onSelectionEnd,
    selectionRect,
    registerPageRef,
    isSelecting,
    generateFromSelection,
    numQuestionsSelection,
    setNumQuestionsSelection,
    onCancelSelection
}: PDFPageProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const renderTaskRef = useRef<any>(null);
    const [pageDimensions, setPageDimensions] = useState<{width: number, height: number} | null>(null);

    // Initial load for dimensions. We use a placeholder height initially.
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { rootMargin: '50% 0px 50% 0px' } // Preload nicely (50% viewport above/below)
        );
        if (wrapperRef.current) observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible || !pdfDoc || !canvasRef.current) return;
        
        let cancelled = false;

        const render = async () => {
            if (renderTaskRef.current) {
                await renderTaskRef.current.promise.catch(() => {});
            }
            
            if (cancelled) return;

            try {
                const page = await pdfDoc.getPage(pageNumber);
                const viewport = page.getViewport({ scale });
                
                // Update dimensions
                setPageDimensions({ width: viewport.width, height: viewport.height });

                const canvas = canvasRef.current;
                if (!canvas) return;
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    const task = page.render(renderContext);
                    renderTaskRef.current = task;
                    await task.promise;
                    renderTaskRef.current = null;
                    
                    if (cancelled) return;

                    // --- Highlight Search Results ---
                    if (searchQuery && searchResults.includes(pageNumber)) {
                        try {
                            const textContent = await page.getTextContent();
                            const query = searchQuery.toLowerCase();
                            context.fillStyle = 'rgba(255, 235, 59, 0.4)'; // Semi-transparent yellow

                            textContent.items.forEach((item: any) => {
                                if (item.str.toLowerCase().includes(query)) {
                                    const tx = item.transform;
                                    const h = item.height || Math.sqrt(tx[3] * tx[3]);
                                    
                                    const rect = [
                                        tx[4], // x
                                        tx[5], // y
                                        tx[4] + item.width, // x + w
                                        tx[5] + h // y + h
                                    ];
                                    
                                    const viewRect = viewport.convertToViewportRectangle(rect);
                                    
                                    const minX = Math.min(viewRect[0], viewRect[2]);
                                    const minY = Math.min(viewRect[1], viewRect[3]);
                                    const w = Math.abs(viewRect[2] - viewRect[0]);
                                    const hRect = Math.abs(viewRect[3] - viewRect[1]);
                                    
                                    context.fillRect(minX, minY, w, hRect);
                                }
                            });
                        } catch (err) {
                            console.error("Error highlighting text", err);
                        }
                    }
                }
            } catch (err: any) {
                if (err.name !== 'RenderingCancelledException') {
                    console.error("Page render error", err);
                }
            }
        };

        render();

        return () => {
            cancelled = true;
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }
        };
    }, [isVisible, pdfDoc, scale, pageNumber, searchQuery, searchResults]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isSelectionMode || !wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();
        onSelectionStart(pageNumber, e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isSelectionMode || !wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();
        onSelectionMove(pageNumber, e.clientX - rect.left, e.clientY - rect.top);
    };
    
    // Check if this page is the active selection page
    const isActiveSelectionPage = selectionRect?.page === pageNumber;

    return (
        <div 
            ref={(el) => { wrapperRef.current = el; registerPageRef(pageNumber, el); }}
            className="relative mb-4 bg-white shadow-md mx-auto"
            style={{ 
                width: pageDimensions ? pageDimensions.width : undefined, 
                minHeight: pageDimensions ? pageDimensions.height : '800px', // Placeholder height
                height: pageDimensions ? pageDimensions.height : undefined
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={onSelectionEnd}
        >
            <canvas ref={canvasRef} className="block" />
             
             {/* Selection Overlay for this page */}
             {isSelectionMode && (
                <div className="absolute inset-0 z-20 cursor-crosshair">
                     {isActiveSelectionPage && selectionRect && (
                      <>
                        <div 
                            className="absolute border-2 border-accent-primary bg-accent-primary/20"
                            style={{
                                left: selectionRect.x,
                                top: selectionRect.y,
                                width: selectionRect.w,
                                height: selectionRect.h
                            }}
                        />
                         {/* Selection Controls */}
                        {!isSelecting && selectionRect.w > 10 && selectionRect.h > 10 && (
                            <div 
                                className="absolute bg-bg-secondary border border-border-color shadow-xl rounded-md p-2 flex flex-col gap-2 z-30 min-w-[200px]"
                                style={{
                                    left: Math.min(selectionRect.x + selectionRect.w + 10, pageDimensions ? pageDimensions.width - 220 : 0),
                                    top: selectionRect.y
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <p className="text-xs font-bold text-text-primary text-center">Gerar questões desta área</p>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-text-secondary">Qtd:</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="10" 
                                        value={numQuestionsSelection}
                                        onChange={(e) => setNumQuestionsSelection(Number(e.target.value))}
                                        className="w-12 text-xs p-1 rounded bg-bg-tertiary text-text-primary border border-border-color"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={onCancelSelection}
                                        className="flex-1 px-2 py-1 text-xs font-bold text-text-tertiary bg-bg-tertiary rounded hover:bg-bg-interactive"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={generateFromSelection}
                                        className="flex-1 px-2 py-1 text-xs font-bold text-white bg-accent-primary rounded hover:bg-accent-primary/80"
                                    >
                                        Gerar
                                    </button>
                                </div>
                            </div>
                        )}
                      </>
                    )}
                </div>
             )}
        </div>
    );
});


// --- MAIN APP COMPONENT ---

const getPDFIdentifier = (file: File | {name: string, size: number, lastModified: number}): string => `${file.name}-${file.size}-${file.lastModified}`;
const loadAllProgress = (): Record<string, ProgressData> => {
  try {
    const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return savedProgress ? JSON.parse(savedProgress) : {};
  } catch (e) {
    console.error("Failed to load progress from localStorage", e);
    return {};
  }
};
const saveAllProgress = (progress: Record<string, ProgressData>) => {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save progress to localStorage", e);
  }
};

const loadFolders = (): Folder[] => {
    try {
        const savedFolders = localStorage.getItem(FOLDERS_STORAGE_KEY);
        return savedFolders ? JSON.parse(savedFolders) : [];
    } catch (e) {
        console.error("Failed to load folders", e);
        return [];
    }
};

const saveFolders = (folders: Folder[]) => {
    try {
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
    } catch(e) { console.error("Failed to save folders", e); }
};

const App: React.FC = () => {

  // --- STANDARD APP STATE ---
  const [allProgress, setAllProgress] = useState<Record<string, ProgressData>>(loadAllProgress);
  const [folders, setFolders] = useState<Folder[]>(loadFolders);
  const [file, setFile] = useState<File | ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [boardStyle, setBoardStyle] = useState<BoardStyle>(BoardStyle.CEBRASPE);
  const [error, setError] = useState<string | null>(null);
  const [numQuestions, setNumQuestions] = useState<number>(3);
  const [pdfIdentifier, setPdfIdentifier] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [scale, setScale] = useState(1.0);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [questionsByPage, setQuestionsByPage] = useState<Record<string, GeneratedQuestion[]>>({});
  const [sessionErrors, setSessionErrors] = useState<GeneratedQuestion[]>([]);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{ page: number, x: number, y: number, w: number, h: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startSelection, setStartSelection] = useState<{ page: number, x: number, y: number } | null>(null);
  const [numQuestionsSelection, setNumQuestionsSelection] = useState<number>(3);
  
  // Outline State
  const [outline, setOutline] = useState<any[]>([]);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);

  const gamification = useGamification();

  // State for resizable panels
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [pdfPanelWidth, setPdfPanelWidth] = useState<number | null>(null);

  // State for explanation modal
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);
  const [explanationText, setExplanationText] = useState<string | null>(null);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);

  // State for suggestions modal
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [suggestionsText, setSuggestionsText] = useState<string | null>(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  
  // State for study goals
  const [studyGoal, setStudyGoal] = useState<StudyGoal | null>(null);
  const [isStudyGoalModalOpen, setIsStudyGoalModalOpen] = useState(false);
  const [isGoalCompletionModalOpen, setIsGoalCompletionModalOpen] = useState(false);
  const [sessionTimer, setSessionTimer] = useState({ isRunning: false, seconds: 0 });
  const [initialStudyTime, setInitialStudyTime] = useState(0);

  // State for session stats modal
  const [isSessionStatsModalOpen, setIsSessionStatsModalOpen] = useState(false);
  const [selectedActivityStats, setSelectedActivityStats] = useState<ProgressData | null>(null);
  
  // State for Mock Exam
  const [isMockExamSetupOpen, setIsMockExamSetupOpen] = useState(false);
  const [isMockExamVisible, setIsMockExamVisible] = useState(false);
  const [isGeneratingMockExam, setIsGeneratingMockExam] = useState(false);
  const [mockExamQuestions, setMockExamQuestions] = useState<GeneratedQuestion[]>([]);
  const [mockExamError, setMockExamError] = useState<string | null>(null);

  // Timer logic
  useEffect(() => {
    let interval: number | null = null;
    if (sessionTimer.isRunning) {
      interval = window.setInterval(() => {
        setSessionTimer(prev => ({ ...prev, seconds: prev.seconds + 1 }));
      }, 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [sessionTimer.isRunning]);

  // Goal completion check logic
  useEffect(() => {
    if (!studyGoal || !studyGoal.isActive) return;

    let goalMet = false;
    let progress = 0;
    
    if (studyGoal.type === 'pages') {
      progress = currentPage - studyGoal.initialValue;
      if (progress >= studyGoal.target) goalMet = true;
    } else if (studyGoal.type === 'questions') {
      progress = gamification.state.questionsAnsweredThisSession - studyGoal.initialValue;
      if (progress >= studyGoal.target) goalMet = true;
    } else if (studyGoal.type === 'time') {
      progress = Math.floor((sessionTimer.seconds - studyGoal.initialValue) / 60);
      if (progress >= studyGoal.target) goalMet = true;
    }

    if (goalMet) {
      setIsGoalCompletionModalOpen(true);
      gamification.logGoalCompleted();
      setStudyGoal(prev => prev ? { ...prev, isActive: false } : null);
    }
  }, [currentPage, gamification.state.questionsAnsweredThisSession, sessionTimer.seconds, studyGoal, gamification.logGoalCompleted]);


  useEffect(() => {
    if (pdfDoc && mainContainerRef.current && pdfPanelWidth === null) {
      setPdfPanelWidth(mainContainerRef.current.offsetWidth * 0.6); // Default 60% width for PDF
    }
    if(!pdfDoc && pdfPanelWidth !== null) {
      setPdfPanelWidth(null);
    }
  }, [pdfDoc, pdfPanelWidth]);

  const handleFitToWidth = useCallback(async () => {
    if (!pdfDoc || !canvasContainerRef.current) return;
    try {
        const page = await pdfDoc.getPage(currentPage);
        const newScale = (canvasContainerRef.current.offsetWidth - 60) / page.getViewport({ scale: 1.0 }).width;
        setScale(newScale);
    } catch (e) { console.error("Error calculating fit-to-width", e); }
  }, [pdfDoc, currentPage]);

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startWidth = pdfPanelWidth || 0;
    const startX = e.clientX;
    const mainContainer = mainContainerRef.current;
    if (!mainContainer) return;

    const handleMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const containerWidth = mainContainer.offsetWidth;
        const minWidth = containerWidth * 0.2; // 20% min
        const maxWidth = containerWidth * 0.8; // 80% max
        
        let newWidth = startWidth + deltaX;
        newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
        
        setPdfPanelWidth(newWidth);
    };

    const handleUp = () => {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
        handleFitToWidth();
    };
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };


  useEffect(() => {
    const htmlElement = document.documentElement;
    const themeClasses = Array.from(htmlElement.classList).filter(cls => cls.startsWith('theme-'));
    htmlElement.classList.remove(...themeClasses);
    if (gamification.state.activeTheme) {
      htmlElement.classList.add(gamification.state.activeTheme);
    }
    if (!htmlElement.classList.contains('dark')) {
        htmlElement.classList.add('dark');
    }
  }, [gamification.state.activeTheme]);

  const registerPageRef = useCallback((pageNum: number, el: HTMLDivElement | null) => {
      if (el) pageRefs.current.set(pageNum, el);
      else pageRefs.current.delete(pageNum);
  }, []);

  // Scroll Sync and Visibility
  const handleScroll = useCallback(() => {
      if (!canvasContainerRef.current) return;
      
      const container = canvasContainerRef.current;
      const center = container.scrollTop + container.clientHeight / 2;
      
      // Find the page closest to the center
      let closestPage = currentPage;
      let minDistance = Infinity;

      for (const [pageNum, el] of pageRefs.current.entries()) {
          const rect = el.getBoundingClientRect();
          // We need to calculate position relative to container
          // Container rect
          const containerRect = container.getBoundingClientRect();
          const elCenter = (rect.top - containerRect.top) + container.scrollTop + rect.height / 2;
          
          const distance = Math.abs(center - elCenter);
          if (distance < minDistance) {
              minDistance = distance;
              closestPage = pageNum;
          }
      }

      if (closestPage !== currentPage) {
          setCurrentPage(closestPage);
          if (pdfIdentifier) gamification.logPageRead(pdfIdentifier, closestPage, totalPages);
      }
  }, [currentPage, gamification, pdfIdentifier, totalPages]);

  const scrollToPage = (pageNum: number) => {
      const el = pageRefs.current.get(pageNum);
      if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setCurrentPage(pageNum);
      }
  };


  const loadPdf = async (fileData: ArrayBuffer, name: string, identifier: string) => {
      try {
            const savedState = allProgress[identifier];
            setInitialStudyTime(savedState?.studyTimeInSeconds || 0);
            setSessionErrors( (savedState?.sessionDate && isToday(new Date(savedState.sessionDate))) ? (savedState.sessionErrors || []) : []);
            
            const pdf = await pdfjsLib.getDocument({ data: fileData }).promise;
            
            // Load outline
            try {
                const outlineData = await pdf.getOutline();
                setOutline(outlineData || []);
            } catch (outlineErr) {
                console.warn("Could not load outline", outlineErr);
                setOutline([]);
            }
            setIsOutlineOpen(false);

            setFile(fileData); 
            setFileName(name);
            setQuestionsByPage(savedState?.questionsByPage || {});
            setScale(savedState?.scale || 1.0);
            setTotalPages(pdf.numPages);
            setCurrentPage(savedState?.currentPage || 1);
            setPdfIdentifier(identifier);
            setPdfDoc(pdf);
            
            // Wait for render then scroll? UseTimeout
            setTimeout(() => {
                 if (savedState?.currentPage) scrollToPage(savedState.currentPage);
            }, 500);

      } catch (e) {
            console.error("Error loading PDF", e);
            setError("Não foi possível carregar o arquivo PDF.");
            setPdfDoc(null);
      }
  }
  
  const handleOutlineNavigate = async (dest: any) => {
    if (!pdfDoc) return;
    try {
        let explicitDest = dest;
        if (typeof dest === 'string') {
            explicitDest = await pdfDoc.getDestination(dest);
        }
        
        if (!explicitDest) return;

        // The first element of explicitDest array is the reference to the page
        const destRef = explicitDest[0];
        const pageIndex = await pdfDoc.getPageIndex(destRef);
        const targetPage = pageIndex + 1;
        
        scrollToPage(targetPage);
        
        // On mobile, close sidebar after navigation
        if (window.innerWidth < 768) {
             setIsOutlineOpen(false);
        }
    } catch (err) {
        console.error("Outline navigation error", err);
        gamification.addToast("Não foi possível navegar para este item.", "⚠️");
    }
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setStudyGoal(null);
    setSessionTimer({ isRunning: false, seconds: 0 });
    setInitialStudyTime(0);

    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
        const identifier = getPDFIdentifier(selectedFile);
        const arrayBuffer = await selectedFile.arrayBuffer();
        await loadPdf(arrayBuffer, selectedFile.name, identifier);
    } else if (selectedFile) {
        setError('Por favor, selecione um arquivo PDF válido.');
    }
    if(event.target) event.target.value = ''; // Reset file input
  }, [allProgress]);
  

  useEffect(() => {
    if (pdfIdentifier && pdfDoc) {
      const pagesCompleted = Object.keys(questionsByPage).filter(key => questionsByPage[key]?.length > 0).length;
      const questionsAnswered = Object.values(questionsByPage).flat().filter((q: GeneratedQuestion) => q.userAnswer).length;
      const flashcardsCreated = Object.values(questionsByPage).flat().filter((q: GeneratedQuestion) => q.flashcard).length;
      const studyTimeInSeconds = initialStudyTime + sessionTimer.seconds;
      
      const newProgressForFile: ProgressData = {
        fileName, totalPages, currentPage, scale, questionsByPage, sessionErrors, sessionDate: new Date().toISOString(),
        studyTimeInSeconds,
        pagesCompleted,
        questionsAnswered,
        flashcardsCreated,
      };
      
      setAllProgress(prev => {
          const updated = { ...prev, [pdfIdentifier]: newProgressForFile };
          saveAllProgress(updated); 
          return updated;
      });
      
    }
  }, [pdfIdentifier, fileName, totalPages, currentPage, scale, questionsByPage, pdfDoc, sessionErrors, initialStudyTime, sessionTimer.seconds, gamification.state]);

  const extractTextFromCurrentPage = useCallback(async (): Promise<string> => {
    if (!pdfDoc) throw new Error("PDF não carregado.");
    const page = await pdfDoc.getPage(currentPage);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((s: any) => s.str).join(' ');
    if (pageText.trim().length < 50) throw new Error("Não foi possível extrair texto suficiente desta página para gerar questões.");
    return pageText;
  }, [pdfDoc, currentPage]);

  const questionsCacheKey = `${currentPage}-${boardStyle}`;
  const currentQuestions = questionsByPage[questionsCacheKey] || [];

  const handleGenerateClick = useCallback(async (isRegenerating = false, customText?: string) => {
    if (!pdfDoc || !pdfIdentifier) { setError('Por favor, carregue um arquivo PDF primeiro.'); return; }
    if (!isRegenerating && !customText) gamification.logPageCompleted(pdfIdentifier, currentPage);
    
    setIsGeneratingQuestions(true);
    setError(null);
    try {
      const pageText = customText || await extractTextFromCurrentPage();
      const existingQuestions = isRegenerating ? (questionsByPage[questionsCacheKey] || []) : [];
      const quantity = customText ? numQuestionsSelection : numQuestions;

      const newQuestions = await generateQuestions(pageText, boardStyle, quantity, existingQuestions);
      setQuestionsByPage(prev => ({ ...prev, [questionsCacheKey]: [...(prev[questionsCacheKey] || []), ...newQuestions] }));
      
      if (customText) {
          setIsSelectionMode(false);
          setSelectionRect(null);
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  }, [pdfDoc, pdfIdentifier, currentPage, boardStyle, extractTextFromCurrentPage, questionsCacheKey, numQuestions, questionsByPage, gamification.logPageCompleted, numQuestionsSelection]);

  const isCorrectAnswer = (userAnswer: string | undefined, correctAnswer: string): boolean => {
    if (!userAnswer) return false;
    const cleanedUserAnswer = userAnswer.trim().toLowerCase();
    const cleanedCorrectAnswer = correctAnswer.trim().toLowerCase();
    if (cleanedUserAnswer === cleanedCorrectAnswer) return true;
    return (cleanedUserAnswer === 'certo' && cleanedCorrectAnswer === 'correto') || 
            (cleanedUserAnswer === 'correto' && cleanedCorrectAnswer === 'certo');
  };

  const handleAnswerQuestion = (questionIndex: number, answer: string, answerTimeInMs: number) => {
    const question = currentQuestions[questionIndex];
    if (!question || question.userAnswer) return;

    const isCorrect = isCorrectAnswer(answer, question.correct_answer);

    playSound(isCorrect ? CORRECT_ANSWER_SOUND_URL : INCORRECT_ANSWER_SOUND_URL);
    gamification.logAnswer(isCorrect, answerTimeInMs);
    
    if (!isCorrect) {
      setSessionErrors(prevErrors => {
          if (!prevErrors.some(err => err.question_text === question.question_text)) return [...prevErrors, question];
          return prevErrors;
      });
    }
    setQuestionsByPage(prev => {
        const pageQuestions = [...(prev[questionsCacheKey] || [])];
        pageQuestions[questionIndex] = { ...pageQuestions[questionIndex], userAnswer: answer };
        
        const allAnswered = pageQuestions.every(q => q.userAnswer);
        if (allAnswered) {
          gamification.logQuestionSessionCompleted(pageQuestions);
        }

        return { ...prev, [questionsCacheKey]: pageQuestions };
    });
  };

  const handleReviewMistakes = useCallback(async () => {
    if (sessionErrors.length === 0 || !pdfIdentifier) return;
    setIsReviewing(true);
    setError(null);
    try {
        const reviewPromises = sessionErrors.map(errorQuestion => 
            generateQuestions(errorQuestion.justification_anchor, boardStyle, 1, [errorQuestion])
            .catch(err => { console.error(`Failed to generate review question`, err); return []; })
        );
        const newReviewQuestions = (await Promise.all(reviewPromises)).flat();

        if (newReviewQuestions.length > 0) {
            setQuestionsByPage(prev => ({ ...prev, [questionsCacheKey]: [...(prev[questionsCacheKey] || []), ...newReviewQuestions] }));
        }
        setSessionErrors([]);
    } catch (err) {
      console.error("Error during mistake review:", err);
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao gerar a revisão.");
    } finally {
      setIsReviewing(false);
    }
  }, [sessionErrors, boardStyle, pdfIdentifier, questionsCacheKey]);

  const handleGenerateFlashcard = useCallback(async (questionIndex: number) => {
    const pageQuestions = questionsByPage[questionsCacheKey] || [];
    const question = pageQuestions[questionIndex];
    if (!question || question.flashcard || question.isGeneratingFlashcard) return;

    setQuestionsByPage(prev => {
      const q = [...(prev[questionsCacheKey] || [])]; q[questionIndex] = { ...q[questionIndex], isGeneratingFlashcard: true };
      return { ...prev, [questionsCacheKey]: q };
    });
    try {
      const flashcard = await generateFlashcard(question.question_text, question.justification_anchor);
      setQuestionsByPage(prev => {
        const q = [...(prev[questionsCacheKey] || [])]; q[questionIndex] = { ...q[questionIndex], flashcard, isGeneratingFlashcard: false };
        return { ...prev, [questionsCacheKey]: q };
      });
      gamification.addToast('Flashcard criado com sucesso!', '⚡');
    } catch (err) {
      console.error("Failed to generate flashcard", err);
      gamification.addToast(err instanceof Error ? `Falha: ${err.message}` : 'Falha ao gerar flashcard.', '❌');
      setQuestionsByPage(prev => {
        const q = [...(prev[questionsCacheKey] || [])]; q[questionIndex] = { ...q[questionIndex], isGeneratingFlashcard: false };
        return { ...prev, [questionsCacheKey]: q };
      });
    }
  }, [questionsCacheKey, questionsByPage, gamification.addToast]);

  const handleExplainPageClick = useCallback(async () => {
    if (!pdfDoc) return;
    
    setIsExplanationModalOpen(true);
    setIsGeneratingExplanation(true);
    setExplanationText(null);
    setExplanationError(null);

    try {
        const pageText = await extractTextFromCurrentPage();
        const simpleExplanation = await generateSimpleExplanation(pageText);
        setExplanationText(simpleExplanation);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
        console.error("Error generating explanation:", err);
        setExplanationError(errorMessage);
    } finally {
        setIsGeneratingExplanation(false);
    }
  }, [pdfDoc, extractTextFromCurrentPage]);
  
  const handleShowSuggestionsClick = useCallback(async () => {
    setIsSuggestionsModalOpen(true);
    setIsGeneratingSuggestions(true);
    setSuggestionsText(null);
    setSuggestionsError(null);

    try {
        const incorrectQuestions = currentQuestions.filter(
            q => q.userAnswer && !isCorrectAnswer(q.userAnswer, q.correct_answer)
        );

        if (incorrectQuestions.length > 0) {
            const suggestions = await generateStudySuggestions(incorrectQuestions);
            setSuggestionsText(suggestions);
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
        console.error("Error generating suggestions:", err);
        setSuggestionsError(errorMessage);
    } finally {
        setIsGeneratingSuggestions(false);
    }
  }, [currentQuestions]);

  const handleSetStudyGoal = (type: 'pages' | 'questions' | 'time', target: number) => {
    let initialValue = 0;
    if (type === 'pages') initialValue = currentPage;
    else if (type === 'questions') initialValue = gamification.state.questionsAnsweredThisSession;
    else if (type === 'time') initialValue = sessionTimer.seconds;

    setStudyGoal({ type, target, initialValue, isActive: true });
    setIsStudyGoalModalOpen(false);
    gamification.addToast('Nova meta de estudo definida!', '🎯');
  };

  const handleShowSessionStats = (activity: ProgressData) => {
    setSelectedActivityStats(activity);
    setIsSessionStatsModalOpen(true);
  };

  const handlePlayPauseTimer = () => {
    setSessionTimer(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };
  
  const handleCreateMockExam = useCallback(async (startPage: number, endPage: number) => {
    if (!pdfDoc) return;
    setIsMockExamSetupOpen(false);
    setIsMockExamVisible(true);
    setIsGeneratingMockExam(true);
    setMockExamError(null);
    setMockExamQuestions([]);

    try {
        let combinedText = '';
        const promises = [];
        for (let i = startPage; i <= endPage; i++) {
            promises.push(pdfDoc.getPage(i));
        }
        
        const pages = await Promise.all(promises);
        const textPromises = pages.map((page: any) => page.getTextContent());
        const textContents = await Promise.all(textPromises);
        
        textContents.forEach((textContent: any) => {
            combinedText += textContent.items.map((s: any) => s.str).join(' ') + '\n\n';
        });

        if (combinedText.trim().length < 100) {
            throw new Error('Texto insuficiente no intervalo de páginas selecionado para gerar um simulado.');
        }
        
        const questionsToGenerate = 50;
        const newQuestions = await generateQuestions(combinedText, boardStyle, questionsToGenerate);
        setMockExamQuestions(newQuestions);

    } catch (err) {
        setMockExamError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao criar o simulado.');
    } finally {
        setIsGeneratingMockExam(false);
    }
  }, [pdfDoc, boardStyle]);

  // --- Search Logic ---
  const performSearch = async (query: string) => {
    if (!query.trim() || !pdfDoc) return;
    setIsSearching(true);
    setSearchResults([]);
    setSearchQuery(query);
    
    const results: number[] = [];
    const numPages = pdfDoc.numPages;
    
    // Batch processing to avoid UI blocking
    const BATCH_SIZE = 10;
    for (let i = 1; i <= numPages; i += BATCH_SIZE) {
        const promises = [];
        for (let j = i; j < i + BATCH_SIZE && j <= numPages; j++) {
            promises.push(
                pdfDoc.getPage(j).then(async (page: any) => {
                    const textContent = await page.getTextContent();
                    const fullText = textContent.items.map((item: any) => item.str).join(' ').toLowerCase();
                    if (fullText.includes(query.toLowerCase())) {
                        results.push(j);
                    }
                }).catch((e: any) => console.error(e))
            );
        }
        await Promise.all(promises);
    }
    
    // Sort results as promises might resolve out of order
    results.sort((a, b) => a - b);

    setSearchResults(results);
    setIsSearching(false);
    
    if (results.length > 0) {
        setCurrentSearchIndex(0);
        scrollToPage(results[0]);
        gamification.addToast(`${results.length} páginas encontradas`, '🔍');
    } else {
        gamification.addToast('Nenhum resultado encontrado', '❌');
    }
  };

  const goToNextResult = () => {
      if (searchResults.length === 0) return;
      const nextIndex = (currentSearchIndex + 1) % searchResults.length;
      setCurrentSearchIndex(nextIndex);
      scrollToPage(searchResults[nextIndex]);
  };

  const goToPrevResult = () => {
      if (searchResults.length === 0) return;
      const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
      setCurrentSearchIndex(prevIndex);
      scrollToPage(searchResults[prevIndex]);
  };

  const clearSearch = () => {
      setSearchQuery('');
      setSearchResults([]);
      setCurrentSearchIndex(0);
  };

  // --- Selection Mode Logic ---
  
  const handleSelectionMouseDown = (pageNumber: number, x: number, y: number) => {
    setStartSelection({ page: pageNumber, x, y });
    setSelectionRect({ page: pageNumber, x, y, w: 0, h: 0 });
    setIsSelecting(true);
  };

  const handleSelectionMouseMove = (pageNumber: number, x: number, y: number) => {
    if (!isSelectionMode || !isSelecting || !startSelection || startSelection.page !== pageNumber) return;
    
    setSelectionRect({
        page: pageNumber,
        x: Math.min(startSelection.x, x),
        y: Math.min(startSelection.y, y),
        w: Math.abs(x - startSelection.x),
        h: Math.abs(y - startSelection.y)
    });
  };

  const handleSelectionMouseUp = () => {
      if (isSelecting) {
          setIsSelecting(false);
      }
  };

  const generateFromSelection = async () => {
      if (!selectionRect || !pdfDoc) return;
      
      const pageNum = selectionRect.page;

      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        const [x1, y1] = viewport.convertToPdfPoint(selectionRect.x, selectionRect.y);
        const [x2, y2] = viewport.convertToPdfPoint(selectionRect.x + selectionRect.w, selectionRect.y + selectionRect.h);
        
        const pdfMinX = Math.min(x1, x2);
        const pdfMaxX = Math.max(x1, x2);
        const pdfMinY = Math.min(y1, y2);
        const pdfMaxY = Math.max(y1, y2);

        const textContent = await page.getTextContent();
        const selectedItems = textContent.items.filter((item: any) => {
            const tx = item.transform;
            const x = tx[4];
            const y = tx[5]; 
            // PDF coordinates: Y increases upwards usually, but viewport convert handles it.
            // Just check bounds roughly
            return x >= pdfMinX && x <= pdfMaxX && y >= pdfMinY && y <= pdfMaxY;
        });

        const selectedText = selectedItems.map((item: any) => item.str).join(' ');
        
        if (selectedText.trim().length < 20) {
            gamification.addToast('Texto selecionado insuficiente.', '⚠️');
            return;
        }
        
        // We set current page to the selection page to store questions correctly
        setCurrentPage(pageNum);
        handleGenerateClick(false, selectedText);

      } catch (err) {
          console.error(err);
          gamification.addToast('Erro ao processar seleção.', '❌');
      }
  };

  // --- Folder Management ---

  const handleDeleteFile = (id: string) => {
    // 1. Remove from allProgress
    setAllProgress(prev => {
        const newState = { ...prev };
        delete newState[id];
        saveAllProgress(newState);
        return newState;
    });

    // 2. Remove from any folders containing this file
    setFolders(prevFolders => {
        const newFolders = prevFolders.map(folder => ({
            ...folder,
            files: folder.files.filter(fileId => fileId !== id)
        }));
        saveFolders(newFolders);
        return newFolders;
    });

    gamification.addToast('Arquivo removido.', '🗑️');
  };

  const handleCreateFolder = (name: string) => {
      const newFolder: Folder = {
          id: Date.now().toString(),
          name,
          files: []
      };
      setFolders(prev => {
          const updated = [...prev, newFolder];
          saveFolders(updated);
          return updated;
      });
      gamification.addToast(`Pasta "${name}" criada!`, '📁');
  };

  const handleDeleteFolder = (id: string) => {
      setFolders(prev => {
          const updated = prev.filter(f => f.id !== id);
          saveFolders(updated);
          return updated;
      });
      gamification.addToast('Pasta removida.', '🗑️');
  };

  const handleMoveFile = (fileId: string, targetFolderId: string | null) => {
      setFolders(prevFolders => {
          // Remove from source folder if present
          let updatedFolders = prevFolders.map(folder => ({
              ...folder,
              files: folder.files.filter(fid => fid !== fileId)
          }));

          // Add to target folder if not root (null)
          if (targetFolderId) {
              updatedFolders = updatedFolders.map(folder => {
                  if (folder.id === targetFolderId) {
                      return { ...folder, files: [...folder.files, fileId] };
                  }
                  return folder;
              });
          }
          saveFolders(updatedFolders);
          return updatedFolders;
      });
      gamification.addToast('Arquivo movido.', '📂');
  };

  // Navigation Logic updated for scrolling
  const goToPreviousPage = () => {
      const target = Math.max(1, currentPage - 1);
      scrollToPage(target);
  };
  const goToNextPage = () => {
      const target = Math.min(totalPages, currentPage + 1);
      scrollToPage(target);
  };
  
  const handleZoomIn = () => setScale(prev => prev + 0.25);
  const handleZoomOut = () => setScale(prev => Math.max(0.25, prev - 0.25));

  const hasErrors = currentQuestions.length > 0 && currentQuestions.every(q => q.userAnswer) && currentQuestions.some(q => !isCorrectAnswer(q.userAnswer, q.correct_answer));
  
  return (
    <div className="fixed inset-0 font-sans">
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
        <ToastNotification toasts={gamification.toasts} />
        <StatsModal 
          isOpen={isStatsModalOpen} 
          onClose={() => setIsStatsModalOpen(false)}
          gamificationState={gamification.state}
          onPurchaseTheme={gamification.purchaseTheme as (item: ShopItem) => void}
          onSelectTheme={gamification.setActiveTheme}
        />
        <ExplanationModal
          isOpen={isExplanationModalOpen}
          onClose={() => setIsExplanationModalOpen(false)}
          explanation={explanationText}
          isLoading={isGeneratingExplanation}
          error={explanationError}
        />
        <SuggestionsModal
          isOpen={isSuggestionsModalOpen}
          onClose={() => setIsSuggestionsModalOpen(false)}
          suggestions={suggestionsText}
          isLoading={isGeneratingSuggestions}
          error={suggestionsError}
        />
        <StudyGoalModal 
          isOpen={isStudyGoalModalOpen}
          onClose={() => setIsStudyGoalModalOpen(false)}
          onSetGoal={handleSetStudyGoal}
          currentGoal={studyGoal}
        />
        <GoalCompletionModal 
          isOpen={isGoalCompletionModalOpen}
          onClose={() => setIsGoalCompletionModalOpen(false)}
          goal={studyGoal}
          reward={{xp: REWARDS.GOAL_COMPLETED.xp, tokens: REWARDS.GOAL_COMPLETED.tokens }}
        />
        <SessionStatsModal 
            isOpen={isSessionStatsModalOpen}
            onClose={() => setIsSessionStatsModalOpen(false)}
            stats={selectedActivityStats}
        />
        
        {pdfDoc && (
          <>
            <MockExamSetupModal
              isOpen={isMockExamSetupOpen}
              onClose={() => setIsMockExamSetupOpen(false)}
              onSubmit={handleCreateMockExam}
              totalPages={totalPages}
            />
            <MockExamWindow
              isVisible={isMockExamVisible}
              onClose={() => setIsMockExamVisible(false)}
              isLoading={isGeneratingMockExam}
              questions={mockExamQuestions}
              error={mockExamError}
            />
          </>
        )}


        <div className="w-full h-full bg-bg-primary flex flex-col overflow-hidden text-text-primary">
            <MenuBar 
                onOpenFile={() => fileInputRef.current?.click()} 
            />
            
            {pdfDoc && <Toolbar 
              boardStyle={boardStyle} setBoardStyle={setBoardStyle}
              currentPage={currentPage} totalPages={totalPages} goToPreviousPage={goToPreviousPage} goToNextPage={goToNextPage}
              sessionErrors={sessionErrors} handleReviewMistakes={handleReviewMistakes} isGeneratingQuestions={isGeneratingQuestions} isReviewing={isReviewing}
              scale={scale} handleZoomOut={handleZoomOut} handleZoomIn={handleZoomIn} handleFitToWidth={handleFitToWidth}
              onOpenGoalModal={() => setIsStudyGoalModalOpen(true)}
              onOpenMockExamSetup={() => setIsMockExamSetupOpen(true)}
              sessionTimer={sessionTimer}
              onPlayPauseTimer={handlePlayPauseTimer}
              studyGoal={studyGoal}
              
              // Search Props
              onSearch={performSearch}
              searchResults={searchResults}
              currentSearchIndex={currentSearchIndex}
              onNextResult={goToNextResult}
              onPrevResult={goToPrevResult}
              isSearching={isSearching}
              onClearSearch={clearSearch}

              // Selection Props
              isSelectionMode={isSelectionMode}
              onToggleSelectionMode={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectionRect(null);
                  setIsSelecting(false);
                  setStartSelection(null);
              }}
              
              // Outline Props
              isOutlineOpen={isOutlineOpen}
              onToggleOutline={() => setIsOutlineOpen(!isOutlineOpen)}
              hasOutline={outline.length > 0}
            />}
            
            <main ref={mainContainerRef} className="flex-grow flex flex-col overflow-hidden bg-black/20">
              {!pdfDoc ? (
                  <WelcomeScreen 
                      onOpenFile={() => fileInputRef.current?.click()} 
                      error={error} 
                      activities={allProgress} 
                      onShowStats={handleShowSessionStats}
                      onDeleteFile={handleDeleteFile}
                      folders={folders}
                      onCreateFolder={handleCreateFolder}
                      onDeleteFolder={handleDeleteFolder}
                      onMoveFile={handleMoveFile}
                  />
              ) : (
                <div className="flex-grow flex overflow-hidden">
                    <OutlineSidebar 
                        outline={outline} 
                        isOpen={isOutlineOpen} 
                        onClose={() => setIsOutlineOpen(false)}
                        onNavigate={handleOutlineNavigate}
                    />

                    <div 
                      ref={canvasContainerRef} 
                      className="relative bg-black/30 overflow-auto flex flex-col items-center p-2 sm:p-4 flex-shrink-0 h-full scroll-smooth"
                      style={{ width: pdfPanelWidth ? `${pdfPanelWidth}px` : '60%' }}
                      onScroll={handleScroll}
                    >
                      {/* Render All Pages via Map */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                          <PDFPage 
                            key={pageNum} 
                            pageNumber={pageNum}
                            pdfDoc={pdfDoc}
                            scale={scale}
                            searchQuery={searchQuery}
                            searchResults={searchResults}
                            isSelectionMode={isSelectionMode}
                            onSelectionStart={handleSelectionMouseDown}
                            onSelectionMove={handleSelectionMouseMove}
                            onSelectionEnd={handleSelectionMouseUp}
                            selectionRect={selectionRect}
                            registerPageRef={registerPageRef}
                            isSelecting={isSelecting}
                            startSelection={startSelection}
                            generateFromSelection={generateFromSelection}
                            numQuestionsSelection={numQuestionsSelection}
                            setNumQuestionsSelection={setNumQuestionsSelection}
                            onCancelSelection={() => {
                                setIsSelectionMode(false);
                                setSelectionRect(null);
                                setIsSelecting(false);
                            }}
                          />
                      ))}
                    </div>

                    <ResizeHandle onMouseDown={handleResizeMouseDown} />

                    <div className="flex-grow flex flex-col overflow-hidden">
                       <div className="bg-bg-secondary p-4 space-y-3 text-center flex-shrink-0 border-b border-border-color/50">
                          <div className="flex justify-center items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-2">
                                <label htmlFor="num-questions" className="font-medium text-sm text-text-secondary">Questões:</label>
                                <select id="num-questions" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} disabled={isGeneratingQuestions || isReviewing} className="p-2 text-sm bg-bg-tertiary text-text-primary border border-border-color rounded-md focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition disabled:opacity-70">
                                  {[1,2,3,4,5,7,10].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                              </div>
                              <button onClick={() => handleGenerateClick(false)} disabled={isGeneratingQuestions || currentQuestions.length > 0 || isReviewing} className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-accent-gradient-from to-accent-gradient-to text-white font-bold text-sm rounded-md hover:from-accent-gradient-from/80 hover:to-accent-gradient-to/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-accent-primary disabled:from-bg-tertiary disabled:to-bg-interactive disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-105 disabled:scale-100">
                                <BrainIcon className="w-5 h-5 mr-2" />
                                {currentQuestions.length > 0 ? 'Questões Geradas' : 'Página Concluída: Gerar Questões'}
                              </button>
                          </div>
                        </div>
                        
                        <div className="overflow-y-auto flex-grow p-4 space-y-6">
                            {error && !isGeneratingQuestions && (
                                <div className="bg-accent-error/20 border border-accent-error text-accent-error p-3 rounded-md text-left text-xs" role="alert">
                                <p className="font-bold">Erro</p>
                                <p>{error}</p>
                                </div>
                            )}

                            {(isGeneratingQuestions || isReviewing) && <Loader message={isReviewing ? 'Revisando seus erros...' : 'Gerando questões...'} />}
                            
                            {currentQuestions.length > 0 && (
                            <div className="space-y-4 animate-fade-in">
                                {currentQuestions.map((q, index) => (
                                    <QuestionCard key={`${currentPage}-${boardStyle}-${q.question_text.slice(0, 10)}-${index}`} question={q} index={index} onAnswer={(answer, time) => handleAnswerQuestion(index, answer, time)} onGenerateFlashcard={() => handleGenerateFlashcard(index)} />
                                ))}
                                <div className="pt-4 text-center flex flex-wrap items-center justify-center gap-4">
                                  <button onClick={() => handleGenerateClick(true)} disabled={isGeneratingQuestions || isReviewing} className="inline-flex items-center justify-center px-5 py-2 bg-accent-secondary text-white font-bold text-sm rounded-md hover:bg-accent-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-accent-secondary disabled:bg-bg-tertiary disabled:cursor-not-allowed transition-transform duration-200 ease-in-out transform hover:scale-105 disabled:scale-100">
                                      <BrainIcon className="w-4 h-4 mr-2" />
                                      {isGeneratingQuestions ? 'Gerando mais...' : 'Quero outras questões'}
                                  </button>
                                  {hasErrors && (
                                      <button
                                          onClick={handleShowSuggestionsClick}
                                          disabled={isGeneratingSuggestions}
                                          className="inline-flex items-center justify-center px-5 py-2 border-2 border-yellow-500 text-yellow-500 font-bold text-sm rounded-md hover:bg-yellow-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-wait transition-all duration-200 ease-in-out transform hover:scale-105 disabled:scale-100"
                                      >
                                          <LightBulbIcon className="w-5 h-5 mr-2" />
                                          {isGeneratingSuggestions ? 'Analisando...' : 'Ver Sugestões'}
                                      </button>
                                  )}
                                  <button
                                    onClick={handleExplainPageClick}
                                    disabled={isGeneratingExplanation}
                                    className="inline-flex items-center justify-center px-5 py-2 border-2 border-accent-primary text-accent-primary font-bold text-sm rounded-md hover:bg-accent-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-accent-primary disabled:opacity-50 disabled:cursor-wait transition-all duration-200 ease-in-out transform hover:scale-105 disabled:scale-100"
                                  >
                                    <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                                    {isGeneratingExplanation ? 'Explicando...' : 'Não entendi essa página'}
                                  </button>
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
              )}
            </main>
            
            {pdfDoc && <StatusBar fileName={fileName} onOpenStats={() => setIsStatsModalOpen(true)} tokens={gamification.state.tokens} />}
        </div>
    </div>
  );
};

export default App;