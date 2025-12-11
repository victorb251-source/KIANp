
import React, { useState, useRef, useEffect, useEffect as useLayoutEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, BrainIcon } from './Icon';
import { createChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  contextText?: string;
  getContextText: () => Promise<string>;
}

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, getContextText }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'model', text: 'Olá! Sou seu tutor Kian. Posso te ajudar com dúvidas sobre o PDF ou criar exemplos. Como posso ser útil?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasContext, setHasContext] = useState(false);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
        try {
            chatSessionRef.current = createChatSession(
                "Você é o Kian, um tutor de estudos amigável, didático e motivador. Seu objetivo é ajudar o usuário a estudar um documento PDF. Responda de forma concisa e clara. Se o usuário pedir para explicar algo, use analogias. Formate suas respostas usando Markdown simples."
            );
        } catch (e) {
            console.error("Failed to init chat", e);
        }
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: Message = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const resultStream = await chatSessionRef.current.sendMessageStream({ message: input });
      
      const botMsgId = Date.now() + 1;
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

      let fullText = '';
      for await (const chunk of resultStream) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, text: fullText } : msg));
        }
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { id: Date.now(), role: 'model', text: 'Desculpe, ocorreu um erro ao processar sua mensagem.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContextualize = async () => {
      if(!chatSessionRef.current) return;
      setIsLoading(true);
      try {
          const text = await getContextText();
          await chatSessionRef.current.sendMessage({ message: `Este é o conteúdo da página que estou lendo agora. Use isso como contexto para minhas próximas perguntas: \n\n${text}` });
          setHasContext(true);
          setMessages(prev => [...prev, { id: Date.now(), role: 'model', text: 'Entendido! Li o conteúdo da página atual. Pode fazer suas perguntas sobre ela.' }]);
      } catch (e) {
          console.error(e);
          setMessages(prev => [...prev, { id: Date.now(), role: 'model', text: 'Não consegui ler o contexto da página atual.' }]);
      } finally {
          setIsLoading(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-bg-primary border-l border-border-color shadow-2xl z-50 flex flex-col transform transition-transform animate-fade-in">
      {/* Header */}
      <div className="p-4 bg-bg-secondary border-b border-border-color flex justify-between items-center">
        <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
            <BrainIcon className="w-6 h-6 text-accent-primary" />
            Chat Kian
        </h3>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-bg-primary">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-accent-primary text-white rounded-br-none' 
                  : 'bg-bg-secondary text-text-primary border border-border-color rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-bg-secondary p-3 rounded-lg border border-border-color flex gap-1">
                    <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Context Button */}
      {!hasContext && (
          <div className="px-4 py-2 bg-bg-primary border-t border-border-color">
              <button 
                onClick={handleContextualize}
                disabled={isLoading}
                className="w-full py-1.5 text-xs font-bold text-accent-secondary bg-accent-secondary/10 border border-accent-secondary rounded hover:bg-accent-secondary/20 transition-colors"
              >
                  Contextualizar com página atual
              </button>
          </div>
      )}

      {/* Input */}
      <div className="p-4 bg-bg-secondary border-t border-border-color">
        <div className="flex gap-2">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Tire suas dúvidas..."
                className="flex-grow bg-bg-tertiary text-text-primary border border-border-color rounded-md p-2 text-sm focus:ring-2 focus:ring-accent-primary focus:border-accent-primary resize-none h-12"
            />
            <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-3 bg-accent-primary text-white rounded-md hover:bg-accent-primary/80 disabled:opacity-50 transition-colors self-end"
            >
                <PaperAirplaneIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
