'use client';

import dynamic from 'next/dynamic';

// Leaflet bileşenlerini client tarafında dinamik olarak yükle
const MapContainer = dynamic(
  () => import('@/components/MapContainer'),
  { ssr: false }
);

export default function Home() {
  return (
    <main>
      <MapContainer />
    </main>
  );
}