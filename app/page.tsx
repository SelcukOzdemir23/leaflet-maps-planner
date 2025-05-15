'use client';

import dynamic from 'next/dynamic';

// Leaflet bileşenlerini client tarafında dinamik olarak yükle
const MapContainer = dynamic(
  () => import('@/components/MapContainer'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="app-container">
      <header className="app-header">
        <div className="app-title">Interactive Map Explorer</div>
      </header>
      <div className="app-content">
        <MapContainer />
      </div>
    </main>
  );
}