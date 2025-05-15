import { LatLng, Marker, Popup, Polyline } from 'leaflet';

export interface LocationInfo {
  name: string;
  description: string;
  position: LatLng;
  marker: Marker;
  popup: Popup;
  content: HTMLElement;
  time?: string;
  duration?: string;
  sequence?: number;
}

export interface LineInfo {
  poly: Polyline;
  name: string;
  transport?: string;
  travelTime?: string;
}

export interface LocationFunctionArgs {
  name: string;
  description: string;
  lat: string;
  lng: string;
  time?: string;
  duration?: string;
  sequence?: number;
}

export interface LineFunctionArgs {
  name: string;
  start: {
    lat: string;
    lng: string;
  };
  end: {
    lat: string;
    lng: string;
  };
  transport?: string;
  travelTime?: string;
}