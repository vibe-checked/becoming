export const DEFAULT_ACCENT_COLOR = '#b088e0';

export const ACCENT_COLORS: { name: string; color: string }[] = [
  { name: 'Purple', color: '#b088e0' },
  { name: 'Teal', color: '#5ec9c0' },
  { name: 'Gold', color: '#e0b04a' },
  { name: 'Rose', color: '#e08aa8' },
  { name: 'Sage', color: '#8fbf8a' },
];

// Tinted background for an accent-colored chip/badge's active state (e.g.
// ReminderPicker's selected hour), since that can't be a static StyleSheet
// value once the accent itself is user-configurable.
export function accentTint(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
