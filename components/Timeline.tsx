'use client';

import { useEffect, useRef } from 'react';
import { LocationInfo, LineInfo } from '@/lib/types';
import { Map as LeafletMap } from 'leaflet';

interface TimelineProps {
  isVisible: boolean;
  dayPlanItinerary: LocationInfo[];
  lines: LineInfo[];
  popUps: LocationInfo[];
  highlightCard: (index: number) => void;
  hideTimeline: () => void;
  exportDayPlan: () => void;
  map: LeafletMap | null;
}

export default function Timeline({
  isVisible,
  dayPlanItinerary,
  lines,
  popUps,
  highlightCard,
  hideTimeline,
  exportDayPlan,
  map
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.display = isVisible ? 'block' : 'none';
    }
  }, [isVisible]);
  
  // Returns an appropriate Font Awesome icon class based on transport type
  const getTransportIcon = (transportType: string = ''): string => {
    const type = transportType.toLowerCase();
    if (type.includes('walk')) {
      return 'walking';
    }
    if (type.includes('car') || type.includes('driv')) {
      return 'car-side';
    }
    if (
      type.includes('bus') ||
      type.includes('transit') ||
      type.includes('public')
    ) {
      return 'bus-alt';
    }
    if (
      type.includes('train') ||
      type.includes('subway') ||
      type.includes('metro')
    ) {
      return 'train';
    }
    if (type.includes('bike') || type.includes('cycl')) {
      return 'bicycle';
    }
    if (type.includes('taxi') || type.includes('cab')) {
      return 'taxi';
    }
    if (type.includes('boat') || type.includes('ferry')) {
      return 'ship';
    }
    if (type.includes('plane') || type.includes('fly')) {
      return 'plane-departure';
    }
    return 'route'; // Default icon
  };
  
  if (!dayPlanItinerary.length) return null;
  
  return (
    <div 
      className={`timeline-container ${isVisible ? 'visible' : ''}`} 
      id="timeline-container"
      ref={containerRef}
    >
      <button id="timeline-toggle" className="timeline-toggle">
        <i className="fas fa-calendar-alt"></i>
      </button>

      <div className="timeline-header">
        <h3>Your Day Plan</h3>
        <div className="timeline-actions">
          <button id="export-plan" className="export-button" onClick={exportDayPlan}>
            <i className="fas fa-download"></i> Export
          </button>
          <button id="close-timeline" className="close-button" onClick={hideTimeline}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div className="timeline" id="timeline" ref={timelineRef}>
        {dayPlanItinerary.map((item, index) => {
          const timeDisplay = item.time || 'Flexible';
          
          // Find the index of this location in the popUps array
          const popupIndex = popUps.findIndex(p => p.name === item.name);
          
          return (
            <div key={`timeline-item-${index}`}>
              <div className="timeline-item">
                <div className="timeline-time">{timeDisplay}</div>
                <div className="timeline-connector">
                  <div className="timeline-dot"></div>
                  <div className="timeline-line"></div>
                </div>
                <div 
                  className="timeline-content" 
                  data-index={index}
                  onClick={() => {
                    if (popupIndex !== -1) {
                      highlightCard(popupIndex);
                      if (map) map.setView(popUps[popupIndex].position, map.getZoom());
                    }
                  }}
                >
                  <div className="timeline-title">{item.name}</div>
                  <div className="timeline-description">{item.description}</div>
                  {item.duration && <div className="timeline-duration">{item.duration}</div>}
                </div>
              </div>
              
              {/* Add transport item if this isn't the last item */}
              {index < dayPlanItinerary.length - 1 && (() => {
                const nextItem = dayPlanItinerary[index + 1];
                const connectingLine = lines.find(
                  line =>
                    line.name.includes(item.name) ||
                    line.name.includes(nextItem.name)
                );
                
                if (connectingLine && (connectingLine.transport || connectingLine.travelTime)) {
                  return (
                    <div className="timeline-item transport-item" key={`transport-${index}`}>
                      <div className="timeline-time"></div>
                      <div className="timeline-connector">
                        <div className="timeline-dot" style={{ backgroundColor: '#999' }}></div>
                        <div className="timeline-line"></div>
                      </div>
                      <div className="timeline-content transport">
                        <div className="timeline-title">
                          <i className={`fas fa-${getTransportIcon(connectingLine.transport || 'travel')}`}></i>
                          {' '}{connectingLine.transport || 'Travel'}
                        </div>
                        <div className="timeline-description">{connectingLine.name}</div>
                        {connectingLine.travelTime && (
                          <div className="timeline-duration">{connectingLine.travelTime}</div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}