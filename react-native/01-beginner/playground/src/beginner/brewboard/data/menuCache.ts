import type { MenuItem } from './menu';

let cached: MenuItem[] | null = null;

export function getCachedMenu(): MenuItem[] | null {
  return cached;
}

export function setCachedMenu(items: MenuItem[]): void {
  cached = items;
}

export function clearMenuCache(): void {
  cached = null;
}
