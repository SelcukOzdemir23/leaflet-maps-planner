'use client';

import { useEffect, useRef, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { LocationInfo, LineInfo, LocationFunctionArgs, LineFunctionArgs } from '@/lib/types';
import { SYSTEM_INSTRUCTIONS, LOCATION_FUNCTION_DECLARATION, LINE_FUNCTION_DECLARATION } from '@/lib/constants';
import SearchBar from './SearchBar';
import LocationCards from './LocationCards';
import Timeline from './Timeline';

// Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default icon
const DefaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map view when bounds change
function MapUpdater({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);
  
  return null;
}

export default function MapContainer() {
  // State variables
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const [lines, setLines] = useState<LineInfo[]>([]);
  const [popUps, setPopUps] = useState<LocationInfo[]>([]);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isPlannerMode, setIsPlannerMode] = useState(false);
  const [dayPlanItinerary, setDayPlanItinerary] = useState<LocationInfo[]>([]);
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression>([40, 0]);
  const [mapZoom, setMapZoom] = useState(3);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  
  // Functions to control the visibility of the timeline panel
  const showTimeline = () => {
    setIsTimelineVisible(true);
    
    setTimeout(() => {
      if (mapContainerRef.current) {
        mapContainerRef.current.classList.add('map-container-shifted');
      }
      
      if (window.innerWidth <= 768) {
        const mapOverlay = document.getElementById('map-overlay');
        if (mapOverlay) mapOverlay.classList.add('visible');
      }
      
      window.dispatchEvent(new Event('resize'));
    }, 10);
  };
  
  const hideTimeline = () => {
    setIsTimelineVisible(false);
    
    if (mapContainerRef.current) {
      mapContainerRef.current.classList.remove('map-container-shifted');
    }
    
    const mapOverlay = document.getElementById('map-overlay');
    if (mapOverlay) mapOverlay.classList.remove('visible');
    
    window.dispatchEvent(new Event('resize'));
  };
  
  // Reset the map and application state
  const restart = () => {
    setPoints([]);
    setBounds(null);
    setDayPlanItinerary([]);
    setMarkers([]);
    setLines([]);
    setPopUps([]);
    setIsTimelineVisible(false);
    hideTimeline();
  };
  
  // Send the user's prompt to the Google AI
  const sendText = async (prompt: string) => {
    setIsLoading(true);
    setErrorMessage('');
    restart();
    
    try {
      let finalPrompt = prompt;
      if (isPlannerMode) {
        finalPrompt = prompt + ' day trip';
      }
      
      const updatedInstructions = isPlannerMode
        ? SYSTEM_INSTRUCTIONS.replace('DAY_PLANNER_MODE', 'true')
        : SYSTEM_INSTRUCTIONS.replace('DAY_PLANNER_MODE', 'false');
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.0-flash-exp',
        contents: finalPrompt,
        config: {
          systemInstruction: updatedInstructions,
          temperature: 1,
          tools: [
            {
              functionDeclarations: [
                LOCATION_FUNCTION_DECLARATION,
                LINE_FUNCTION_DECLARATION,
              ],
            },
          ],
        },
      });
      
      let text = '';
      let results = false;
      
      for await (const chunk of response) {
        const fns = chunk.functionCalls ?? [];
        for (const fn of fns) {
          if (fn.name === 'location') {
            await setPin(fn.args as unknown as LocationFunctionArgs);
            results = true;
          }
          if (fn.name === 'line') {
            await setLeg(fn.args as unknown as LineFunctionArgs);
            results = true;
          }
        }
        
        if (
          chunk.candidates &&
          chunk.candidates.length > 0 &&
          chunk.candidates[0].content &&
          chunk.candidates[0].content.parts
        ) {
          chunk.candidates[0].content.parts.forEach(part => {
            if (part.text) text += part.text;
          });
        } else if (chunk.text) {
          text += chunk.text;
        }
      }
      
      if (!results) {
        throw new Error(
          'Could not generate any results. Try again, or try a different prompt.'
        );
      }
      
      if (isPlannerMode && dayPlanItinerary.length > 0) {
        const sortedItinerary = [...dayPlanItinerary].sort(
          (a, b) =>
            (a.sequence || Infinity) - (b.sequence || Infinity) ||
            (a.time || '').localeCompare(b.time || '')
        );
        setDayPlanItinerary(sortedItinerary);
        showTimeline();
      }
      
    } catch (e: any) {
      setErrorMessage(e.message);
      console.error('Error generating content:', e);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a pin (marker and popup) to the map
  const setPin = async (args: LocationFunctionArgs) => {
    const lat = Number(args.lat);
    const lng = Number(args.lng);
    const point = new L.LatLng(lat, lng);
    
    setPoints(prev => [...prev, point]);
    
    if (bounds) {
      const newBounds = bounds.extend(point);
      setBounds(newBounds);
    } else {
      // İlk nokta için yeni bir bounds oluştur
      const newBounds = new L.LatLngBounds([point]);
      setBounds(newBounds);
    }
    
    setMapCenter([lat, lng]);
    
    // Create content for popup
    const content = document.createElement('div');
    let timeInfo = '';
    if (args.time) {
      timeInfo = `<div style="margin-top: 4px; font-size: 12px; color: #2196F3;">
                    <i class="fas fa-clock"></i> ${args.time}
                    ${args.duration ? ` • ${args.duration}` : ''}
                  </div>`;
    }
    content.innerHTML = `<b>${args.name}</b><br/>${args.description}${timeInfo}`;
    
    // Create marker and popup (these will be rendered by react-leaflet)
    const marker = new L.Marker(point, { icon: DefaultIcon });
    const popup = new L.Popup().setContent(content);
    
    if (!isPlannerMode) {
      marker.bindPopup(popup);
    }
    
    const locationInfo: LocationInfo = {
      name: args.name,
      description: args.description,
      position: point,
      marker,
      popup,
      content,
      time: args.time,
      duration: args.duration,
      sequence: args.sequence,
    };
    
    setPopUps(prev => [...prev, locationInfo]);
    setMarkers(prev => [...prev, marker]);
    
    if (isPlannerMode && args.time) {
      setDayPlanItinerary(prev => [...prev, locationInfo]);
    }
  };
  
  // Add a line (route) between two locations on the map
  const setLeg = async (args: LineFunctionArgs) => {
    const start = new L.LatLng(Number(args.start.lat), Number(args.start.lng));
    const end = new L.LatLng(Number(args.end.lat), Number(args.end.lng));
    
    setPoints(prev => [...prev, start, end]);
    
    if (bounds) {
      const newBounds = bounds.extend(start).extend(end);
      setBounds(newBounds);
    } else {
      // İlk çizgi için yeni bir bounds oluştur
      const newBounds = new L.LatLngBounds([start, end]);
      setBounds(newBounds);
    }
    
    const polylineOptions = {
      color: isPlannerMode ? '#2196F3' : '#CC0099',
      weight: isPlannerMode ? 4 : 3,
      opacity: 1.0,
      dashArray: isPlannerMode ? '5, 5' : '',
    };
    
    const poly = new L.Polyline([start, end], polylineOptions);
    
    setLines(prev => [
      ...prev,
      {
        poly,
        name: args.name,
        transport: args.transport,
        travelTime: args.travelTime,
      },
    ]);
  };
  
  // Highlight the selected card and corresponding elements
  const highlightCard = (index: number) => {
    setActiveCardIndex(index);
    
    if (popUps[index]) {
      setMapCenter([
        popUps[index].position.lat,
        popUps[index].position.lng
      ]);
    }
    
    if (isPlannerMode) highlightTimelineItem(index);
  };
  
  // Highlight the timeline item corresponding to the selected card
  const highlightTimelineItem = (cardIndex: number) => {
    const timelineItems = document.querySelectorAll('.timeline-content:not(.transport)');
    Array.from(timelineItems).forEach(item => item.classList.remove('active'));
    
    const location = popUps[cardIndex];
    for (const item of Array.from(timelineItems)) {
      const title = item.querySelector('.timeline-title');
      if (title && title.textContent === location.name) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        break;
      }
    }
  };
  
  // Navigate through cards using arrow buttons
  const navigateCards = (direction: number) => {
    const newIndex = activeCardIndex + direction;
    if (newIndex >= 0 && newIndex < popUps.length) {
      highlightCard(newIndex);
    }
  };
  
  // Export the current day plan as a simple text file
  const exportDayPlan = () => {
    if (!dayPlanItinerary.length) return;
    let content = '# Your Day Plan\n\n';
    
    dayPlanItinerary.forEach((item, index) => {
      content += `## ${index + 1}. ${item.name}\n`;
      content += `Time: ${item.time || 'Flexible'}\n`;
      if (item.duration) content += `Duration: ${item.duration}\n`;
      content += `\n${item.description}\n\n`;
      
      if (index < dayPlanItinerary.length - 1) {
        const nextItem = dayPlanItinerary[index + 1];
        const connectingLine = lines.find(
          line =>
            line.name.includes(item.name) || line.name.includes(nextItem.name)
        );
        if (connectingLine) {
          content += `### Travel to ${nextItem.name}\n`;
          content += `Method: ${connectingLine.transport || 'Not specified'}\n`;
          if (connectingLine.travelTime) {
            content += `Time: ${connectingLine.travelTime}\n`;
          }
          content += `\n`;
        }
      }
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'day-plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div id="map-container" className="map-container" ref={mapContainerRef}>
      <SearchBar 
        isPlannerMode={isPlannerMode}
        setIsPlannerMode={setIsPlannerMode}
        sendText={sendText}
        isLoading={isLoading}
        errorMessage={errorMessage}
        hideTimeline={hideTimeline}
      />
      
      <div id="map" style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <LeafletMapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%' }}
          ref={(map: L.Map) => { mapRef.current = map; }}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {markers.map((marker, index) => (
            <Marker 
              key={`marker-${index}`} 
              position={marker.getLatLng()}
              icon={DefaultIcon}
            >
              {!isPlannerMode || index === activeCardIndex ? (
                <Popup>
                  <div dangerouslySetInnerHTML={{ 
                    __html: popUps[index]?.content.innerHTML || '' 
                  }} />
                </Popup>
              ) : null}
            </Marker>
          ))}
          
          {lines.map((line, index) => (
            <Polyline
              key={`line-${index}`}
              positions={line.poly.getLatLngs() as L.LatLngExpression[]}
              color={isPlannerMode ? '#2196F3' : '#CC0099'}
              weight={isPlannerMode ? 4 : 3}
              opacity={1.0}
              dashArray={isPlannerMode ? '5, 5' : ''}
            />
          ))}
          
          <MapUpdater bounds={bounds} />
        </LeafletMapContainer>
      </div>
      
      <LocationCards 
        popUps={popUps}
        isPlannerMode={isPlannerMode}
        activeCardIndex={activeCardIndex}
        highlightCard={highlightCard}
        navigateCards={navigateCards}
        map={mapRef.current}
      />
      
      <button id="reset" className="reset-button" onClick={restart}>
        <i className="fas fa-undo"></i>
      </button>
      
      <div className="map-overlay" id="map-overlay"></div>
      
      <Timeline 
        isVisible={isTimelineVisible}
        dayPlanItinerary={dayPlanItinerary}
        lines={lines}
        popUps={popUps}
        highlightCard={highlightCard}
        hideTimeline={hideTimeline}
        exportDayPlan={exportDayPlan}
        map={mapRef.current}
      />
      
      <div id="spinner" className={`spinner ${!isLoading ? 'hidden' : ''}`}></div>
    </div>
  );
}