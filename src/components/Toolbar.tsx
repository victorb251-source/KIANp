


import React, { useState } from 'react';
import { BoardStyle, GeneratedQuestion, StudyGoal } from '../types';
import { BOARD_STYLES } from '../constants';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ZoomInIcon,
    ZoomOutIcon,
    FitToWidthIcon,
    XMarkIcon,
    BookmarkSquareIcon,
    PlayIcon,
    PauseIcon,
    ClockIcon,
    ClipboardDocumentCheckIcon,
    MagnifyingGlassIcon,
    SelectionIcon,
    ListBulletIcon,
    ChatBubbleLeftRightIcon
} from './Icon';

interface ToolbarProps {
    boardStyle: BoardStyle;
    setBoardStyle: (style: BoardStyle) => void;
    currentPage: number;
    totalPages: number;
    goToPreviousPage: () => void;
    goToNextPage: () => void;
    sessionErrors: GeneratedQuestion[];
    handleReviewMistakes: () => void;
    isGeneratingQuestions: boolean;
    isReviewing: boolean;
    scale: number;
    handleZoomOut: () => void;
    handleZoomIn: () => void;
    handleFitToWidth: () => void;
    onOpenGoalModal: () => void;
    onOpenMockExamSetup: () => void;
    sessionTimer: { isRunning: boolean; seconds: number };
    onPlayPauseTimer: () => void;
    studyGoal: StudyGoal | null;
    
    // Search Props
    onSearch: (query: string) => void;
    searchResults: number[];
    currentSearchIndex: number;
    onNextResult: () => void;
    onPrevResult: () => void;
    isSearching: boolean;
    onClearSearch: () => void;

    // Selection Props
    isSelectionMode: boolean;
    onToggleSelectionMode: () => void;
    
    // Outline Props
    isOutlineOpen: boolean;
    onToggleOutline: () => void;
    hasOutline: boolean;

    // Chat
    onToggleChat: () => void;
    isChatOpen: boolean;
}

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
};

const Toolbar: React.FC<ToolbarProps> = ({
    boardStyle, setBoardStyle, currentPage, totalPages, goToPreviousPage, goToNextPage,
    sessionErrors, handleReviewMistakes, isGeneratingQuestions, isReviewing,
    scale, handleZoomOut, handleZoomIn, handleFitToWidth,
    onOpenGoalModal, onOpenMockExamSetup, sessionTimer, onPlayPauseTimer, studyGoal,
    onSearch, searchResults, currentSearchIndex, onNextResult, onPrevResult, isSearching, onClearSearch,
    isSelectionMode, onToggleSelectionMode,
    isOutlineOpen, onToggleOutline, hasOutline,
    onToggleChat, isChatOpen
}) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchText);
    };

    const toggleSearch = () => {
        if (isSearchOpen) {
            setIsSearchOpen(false);
            onClearSearch();
            setSearchText('');
        } else {
            setIsSearchOpen(true);
        }
    };

    return (
        <div className="bg-bg-secondary/70 backdrop-blur-md border-b border-border-color/50 p-2 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {!isSearchOpen ? (
                        <>
                            <button 
                                onClick={onToggleOutline} 
                                title="Sumário" 
                                className={`p-2 rounded-md transition-colors ${isOutlineOpen ? 'bg-bg-interactive' : 'bg-bg-tertiary hover:bg-bg-interactive'} ${!hasOutline ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!hasOutline}
                            >
                                <ListBulletIcon className="w-5 h-5" />
                            </button>

                            <label htmlFor="board-style" className="sr-only">Estilo da Banca</label>
                            <select
                                id="board-style"
                                value={boardStyle}
                                onChange={(e) => setBoardStyle(e.target.value as BoardStyle)}
                                className="w-full sm:w-auto p-2 bg-bg-tertiary text-text-primary text-sm border border-border-color rounded-md focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
                            >
                                {BOARD_STYLES.map((style) => (
                                    <option key={style} value={style}>{style}</option>
                                ))}
                            </select>

                            <button onClick={onOpenGoalModal} title={studyGoal?.isActive ? `Meta Ativa: ${studyGoal.target} ${studyGoal.type}` : "Definir Meta de Estudo"} className="relative p-2 rounded-md bg-bg-tertiary hover:bg-bg-interactive transition-colors">
                                <BookmarkSquareIcon className="w-5 h-5" />
                                {studyGoal?.isActive && (
                                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-accent-success ring-2 ring-bg-secondary" />
                                )}
                            </button>
                            <button onClick={onOpenMockExamSetup} title="Criar Simulado" className="p-2 rounded-md bg-bg-tertiary hover:bg-bg-interactive transition-colors">
                                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                            </button>
                            <button onClick={toggleSearch} title="Buscar no documento" className="p-2 rounded-md bg-bg-tertiary hover:bg-bg-interactive transition-colors">
                                <MagnifyingGlassIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={onToggleSelectionMode} 
                                title="Selecionar área para gerar questões" 
                                className={`p-2 rounded-md transition-colors ${isSelectionMode ? 'bg-accent-primary text-white' : 'bg-bg-tertiary hover:bg-bg-interactive'}`}
                            >
                                <SelectionIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={onToggleChat} 
                                title="Chat com IA" 
                                className={`p-2 rounded-md transition-colors ${isChatOpen ? 'bg-accent-primary text-white' : 'bg-bg-tertiary hover:bg-bg-interactive'}`}
                            >
                                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 w-full animate-fade-in">
                            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-grow">
                                <input 
                                    type="text" 
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="Buscar..."
                                    className="p-2 text-sm bg-bg-tertiary text-text-primary border border-border-color rounded-md focus:ring-2 focus:ring-accent-primary focus:border-accent-primary w-full"
                                    autoFocus
                                />
                                <button type="submit" disabled={isSearching} className="p-2 rounded-md bg-accent-primary text-white hover:bg-accent-primary/80 disabled:opacity-50">
                                   {isSearching ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"/> : <MagnifyingGlassIcon className="w-5 h-5" />}
                                </button>
                            </form>
                            
                            {searchResults.length > 0 && (
                                <div className="flex items-center gap-1 bg-bg-tertiary rounded-md p-1">
                                    <button onClick={onPrevResult} className="p-1 hover:bg-bg-interactive rounded"><ChevronLeftIcon className="w-4 h-4"/></button>
                                    <span className="text-xs font-mono px-2">{currentSearchIndex + 1}/{searchResults.length}</span>
                                    <button onClick={onNextResult} className="p-1 hover:bg-bg-interactive rounded"><ChevronRightIcon className="w-4 h-4"/></button>
                                </div>
                            )}

                            <button onClick={toggleSearch} className="p-2 rounded-md hover:bg-bg-interactive text-text-tertiary">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-4 flex-wrap order-first sm:order-none w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        <button onClick={goToPreviousPage} disabled={currentPage <= 1} className="p-1.5 rounded-md hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Página anterior">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <span className="font-semibold text-sm tabular-nums">Página {currentPage} / {totalPages}</span>
                        <button onClick={goToNextPage} disabled={currentPage >= totalPages} className="p-1.5 rounded-md hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Próxima página">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {sessionErrors.length > 0 && (
                        <button
                            onClick={handleReviewMistakes}
                            disabled={isGeneratingQuestions || isReviewing}
                            className="relative inline-flex items-center justify-center px-3 py-1 text-xs border-2 border-accent-error text-accent-error font-bold rounded-md hover:bg-accent-error/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-accent-error disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 ease-in-out transform hover:scale-105 disabled:scale-100"
                            title="Gerar novas questões com base nos seus erros"
                        >
                            {isReviewing ? (
                                <div className="w-4 h-4 mr-2 border-2 border-current border-solid rounded-full animate-spin border-t-transparent"></div>
                            ) : (
                                <>
                                    <XMarkIcon className="w-4 h-4 mr-1.5" />
                                    Revisão ({sessionErrors.length})
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                    <div className="flex items-center bg-bg-tertiary rounded-md p-1 gap-1">
                        <button onClick={onPlayPauseTimer} className="p-1 rounded-md hover:bg-bg-interactive transition-colors" aria-label={sessionTimer.isRunning ? "Pausar cronômetro" : "Iniciar cronômetro"}>
                            {sessionTimer.isRunning ? <PauseIcon className="w-5 h-5 text-yellow-400"/> : <PlayIcon className="w-5 h-5"/>}
                        </button>
                        <div className="flex items-center gap-1 font-semibold tabular-nums w-24 text-center text-sm px-1">
                            <ClockIcon className="w-4 h-4 text-text-tertiary"/>
                            <span>{formatTime(sessionTimer.seconds)}</span>
                        </div>
                    </div>
                    <div className="flex items-center bg-bg-tertiary rounded-md">
                        <button onClick={handleZoomOut} className="p-1.5 rounded-md hover:bg-bg-interactive transition-colors" aria-label="Diminuir zoom">
                            <ZoomOutIcon className="w-5 h-5" />
                        </button>
                        <span className="font-semibold tabular-nums w-12 text-center text-sm border-x border-border-color">{Math.round(scale * 100)}%</span>
                        <button onClick={handleZoomIn} className="p-1.5 rounded-md hover:bg-bg-interactive transition-colors" aria-label="Aumentar zoom">
                            <ZoomInIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center bg-bg-tertiary rounded-md">
                        <button onClick={handleFitToWidth} className="p-1.5 rounded-md hover:bg-bg-interactive transition-colors" title="Ajustar à Largura" aria-label="Ajustar à Largura">
                            <FitToWidthIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toolbar;
