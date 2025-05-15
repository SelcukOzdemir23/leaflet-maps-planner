/**
 * Returns an appropriate Font Awesome icon class based on transport type
 */
export function getTransportIcon(transportType: string = ''): string {
  const type = transportType.toLowerCase();
  
  if (type.includes('walk')) {
    return 'walking';
  }
  if (type.includes('car') || type.includes('driv')) {
    return 'car-side';
  }
  if (type.includes('bus') || type.includes('transit') || type.includes('public')) {
    return 'bus-alt';
  }
  if (type.includes('train') || type.includes('subway') || type.includes('metro')) {
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
}

/**
 * Generates a placeholder SVG image for location cards
 */
export function getPlaceholderImage(locationName: string): string {
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
}