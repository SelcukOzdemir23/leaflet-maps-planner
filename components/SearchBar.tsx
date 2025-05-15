'use client';

import { useState, KeyboardEvent } from 'react';

interface SearchBarProps {
  isPlannerMode: boolean;
  setIsPlannerMode: (value: boolean) => void;
  sendText: (prompt: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string;
  hideTimeline: () => void;
}

export default function SearchBar({
  isPlannerMode,
  setIsPlannerMode,
  sendText,
  isLoading,
  errorMessage,
  hideTimeline
}: SearchBarProps) {
  const [prompt, setPrompt] = useState('');
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      
      if (prompt.trim()) {
        handleSearch();
      }
    }
  };
  
  const handleSearch = () => {
    if (prompt.trim()) {
      sendText(prompt);
      setPrompt('');
    }
  };
  
  const handleModeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = e.target.checked;
    setIsPlannerMode(newMode);
    
    if (!newMode) {
      hideTimeline();
    }
  };
  
  return (
    <div className="search-container">
      <div className="mode-toggle">
        <label className="switch">
          <input 
            type="checkbox" 
            id="planner-mode-toggle" 
            checked={isPlannerMode}
            onChange={handleModeToggle}
          />
          <span className="slider round"></span>
        </label>
        <span className="mode-label">Day Planner Mode</span>
      </div>

      <div className="search-bar">
        <i className="fas fa-search search-icon"></i>
        <textarea
          id="prompt-input"
          placeholder={isPlannerMode 
            ? "Create a day plan in... (e.g. 'Plan a day exploring Central Park' or 'One day in Paris')"
            : "Explore places, history, events, or ask about any location..."
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          id="generate" 
          className={`search-button ${isLoading ? 'loading' : ''}`}
          onClick={handleSearch}
          disabled={isLoading}
        >
          <i className="fas fa-arrow-right"></i>
          <div className="spinner"></div>
        </button>
      </div>

      {errorMessage && <div className="error" id="error-message">{errorMessage}</div>}
    </div>
  );
}