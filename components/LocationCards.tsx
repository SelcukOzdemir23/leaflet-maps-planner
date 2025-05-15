'use client';

import { useState, useEffect, useRef } from 'react';
import { LocationInfo } from '@/lib/types';
import { Map as LeafletMap } from 'leaflet';

interface LocationCardsProps {
  popUps: LocationInfo[];
  isPlannerMode: boolean;
  activeCardIndex: number;
  highlightCard: (index: number) => void;
  navigateCards: (direction: number) => void;
  map: LeafletMap | null;
}

export default function LocationCards({
  popUps,
  isPlannerMode,
  activeCardIndex,
  highlightCard,
  navigateCards,
  map
}: LocationCardsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsVisible(popUps.length > 0);
  }, [popUps]);
  
  // Klavye yön tuşları için event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      
      if (e.key === 'ArrowLeft') {
        navigateCards(-1);
      } else if (e.key === 'ArrowRight') {
        navigateCards(1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, navigateCards]);
  
  // Aktif kart değiştiğinde scroll pozisyonunu güncelle
  useEffect(() => {
    if (cardContainerRef.current && popUps.length > 0) {
      const cards = cardContainerRef.current.querySelectorAll('.location-card');
      if (cards[activeCardIndex]) {
        const card = cards[activeCardIndex] as HTMLElement;
        const containerWidth = cardContainerRef.current.offsetWidth;
        const cardWidth = card.offsetWidth;
        const scrollPosition = card.offsetLeft - containerWidth / 2 + cardWidth / 2;
        
        cardContainerRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [activeCardIndex, popUps.length]);
  
  // Generates a placeholder SVG image for location cards
  const getPlaceholderImage = (locationName: string): string => {
    let hash = 0;
    for (let i = 0; i < locationName.length; i++) {
      hash = locationName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    const saturation = 60 + (hash % 30);
    const lightness = 50 + (hash % 20);
    const letter = locationName.charAt(0).toUpperCase() || '?';

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180">
        <rect width="300" height="180" fill="hsl(${hue}, ${saturation}%, ${lightness}%)" />
        <text x="150" y="95" font-family="Arial, sans-serif" font-size="72" fill="white" text-anchor="middle" dominant-baseline="middle">${letter}</text>
      </svg>
    `)}`;
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="card-carousel" style={{ display: isVisible ? 'block' : 'none' }}>
      <div className="card-container" id="card-container" ref={cardContainerRef}>
        {popUps.map((location, index) => {
          const imageUrl = getPlaceholderImage(location.name);
          
          return (
            <div 
              key={`location-${index}`}
              className={`location-card ${isPlannerMode ? 'day-planner-card' : ''} ${index === activeCardIndex ? 'card-active' : ''}`}
              onClick={() => {
                highlightCard(index);
                if (map) map.setView(location.position, map.getZoom());
              }}
            >
              <div className="card-image" style={{ backgroundImage: `url('${imageUrl}')` }}></div>
              
              {isPlannerMode && location.sequence && (
                <div className="card-sequence-badge">{location.sequence}</div>
              )}
              
              {isPlannerMode && location.time && (
                <div className="card-time-badge">{location.time}</div>
              )}
              
              <div className="card-content">
                <h3 className="card-title">{location.name}</h3>
                <p className="card-description">{location.description}</p>
                
                {isPlannerMode && location.duration && (
                  <div className="card-duration">{location.duration}</div>
                )}
                
                <div className="card-coordinates">
                  {location.position.lat.toFixed(5)}, {location.position.lng.toFixed(5)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="carousel-controls">
        <button 
          className="carousel-arrow prev" 
          id="prev-card"
          onClick={() => navigateCards(-1)}
          disabled={activeCardIndex === 0}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        
        <div className="carousel-indicators" id="carousel-indicators">
          {popUps.map((_, index) => (
            <div 
              key={`dot-${index}`}
              className={`carousel-dot ${index === activeCardIndex ? 'active' : ''}`}
              onClick={() => highlightCard(index)}
            ></div>
          ))}
        </div>
        
        <button 
          className="carousel-arrow next" 
          id="next-card"
          onClick={() => navigateCards(1)}
          disabled={activeCardIndex === popUps.length - 1}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}