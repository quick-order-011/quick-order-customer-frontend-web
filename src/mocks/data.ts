import type { ThemeConfig } from '../types/theme'
import type { Category, MenuItem } from '../types/menu'
import { presets } from '../lib/presets'

// ─── Themes per cafe ───

const themes: Record<string, ThemeConfig> = {
  'kafic-arsenal': {
    cafeId: 'kafic-arsenal',
    name: 'Espresso Dark',
    ...presets.warm,
    assets: {
      logoUrl: 'https://placehold.co/120x120/d4843a/1a1008?text=A',
      placeholderImageUrl: 'https://placehold.co/400x300/261a0e/b89a78?text=No+Image',
    },
  },
  'kafic-loft': {
    cafeId: 'kafic-loft',
    name: 'The Loft',
    ...presets.modern,
    assets: {
      logoUrl: 'https://placehold.co/120x120/111111/ffffff?text=L',
      placeholderImageUrl: 'https://placehold.co/400x300/f5f5f5/aaaaaa?text=No+Image',
    },
  },
  'kafic-luxe': {
    cafeId: 'kafic-luxe',
    name: 'Luxe Lounge',
    ...presets.luxury,
    assets: {
      logoUrl: 'https://placehold.co/120x120/c9a84c/0a0e1a?text=LX',
      headerImageUrl: 'https://placehold.co/800x400/0a0e1a/c9a84c?text=Luxe+Lounge',
      placeholderImageUrl: 'https://placehold.co/400x300/12182b/9a8e7a?text=No+Image',
    },
  },
  'kafic-bela': {
    cafeId: 'kafic-bela',
    name: 'Bela Roda',
    ...presets.minimal,
    assets: {
      logoUrl: 'https://placehold.co/120x120/333333/ffffff?text=BR',
      placeholderImageUrl: 'https://placehold.co/400x300/f8f8f8/bbbbbb?text=No+Image',
    },
  },
}

export function getThemeForCafe(cafeId: string): ThemeConfig {
  return themes[cafeId] ?? themes['kafic-arsenal']
}

// ─── Categories & Items ───

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Kafa', icon: '☕', order: 1 },
  { id: 'cat-2', name: 'Topli napici', icon: '🍵', order: 2 },
  { id: 'cat-3', name: 'Hladni napici', icon: '🧊', order: 3 },
  { id: 'cat-4', name: 'Hrana', icon: '🍽️', order: 4 },
  { id: 'cat-5', name: 'Deserti', icon: '🍰', order: 5 },
]

export const mockItems: MenuItem[] = [
  {
    id: 'item-1',
    categoryId: 'cat-1',
    name: 'Espresso',
    description: 'Klasičan espresso, 30ml',
    price: 200,
    imageUrl: 'https://placehold.co/400x300/3d2a18/f5e6d0?text=Espresso',
    available: true,
  },
  {
    id: 'item-2',
    categoryId: 'cat-1',
    name: 'Domaća kafa',
    description: 'Tradicionalna domaća kafa',
    price: 180,
    imageUrl: 'https://placehold.co/400x300/3d2a18/f5e6d0?text=Domaca',
    available: true,
  },
  {
    id: 'item-3',
    categoryId: 'cat-1',
    name: 'Cappuccino',
    description: 'Espresso sa mlevenim mlekom i penom',
    price: 320,
    imageUrl: 'https://placehold.co/400x300/3d2a18/f5e6d0?text=Cappuccino',
    available: true,
  },
  {
    id: 'item-4',
    categoryId: 'cat-1',
    name: 'Latte',
    description: 'Espresso sa puno mleka',
    price: 350,
    imageUrl: 'https://placehold.co/400x300/3d2a18/f5e6d0?text=Latte',
    available: true,
  },
  {
    id: 'item-5',
    categoryId: 'cat-2',
    name: 'Čaj',
    description: 'Voćni ili biljni čaj',
    price: 200,
    imageUrl: 'https://placehold.co/400x300/3d2a18/f5e6d0?text=Caj',
    available: true,
  },
  {
    id: 'item-6',
    categoryId: 'cat-2',
    name: 'Topla čokolada',
    description: 'Gusta topla čokolada sa šlagom',
    price: 350,
    imageUrl: 'https://placehold.co/400x300/3d2a18/f5e6d0?text=Cokolada',
    available: true,
  },
  {
    id: 'item-7',
    categoryId: 'cat-3',
    name: 'Ceđena pomorandža',
    description: 'Sveže ceđena pomorandža',
    price: 400,
    imageUrl: 'https://placehold.co/400x300/3d2a18/f5e6d0?text=Pomorandza',
    available: true,
  },
  {
    id: 'item-8',
    categoryId: 'cat-3',
    name: 'Limunada',
    description: 'Domaća limunada sa mentom',
    price: 350,
    imageUrl: 'https://placehold.co/400x300/3d2a18/f5e6d0?text=Limunada',
    available: true,
  },
  {
    id: 'item-9',
    categoryId: 'cat-4',
    name: 'Club sendvič',
    description: 'Piletina, slanina, jaje, salata',
    price: 650,
    imageUrl: 'https://placehold.co/400x300/3d2a18/f5e6d0?text=Club',
    available: true,
  },
  {
    id: 'item-10',
    categoryId: 'cat-4',
    name: 'Palačinke',
    description: 'Sa nutellom i bananom',
    price: 450,
    imageUrl: 'https://placehold.co/400x300/3d2a18/f5e6d0?text=Palacinke',
    available: true,
  },
  {
    id: 'item-11',
    categoryId: 'cat-5',
    name: 'Cheesecake',
    description: 'New York style cheesecake',
    price: 500,
    imageUrl: 'https://placehold.co/400x300/3d2a18/f5e6d0?text=Cheesecake',
    available: true,
  },
  {
    id: 'item-12',
    categoryId: 'cat-5',
    name: 'Tiramisu',
    description: 'Klasični italijanski tiramisu',
    price: 550,
    imageUrl: 'https://placehold.co/400x300/3d2a18/f5e6d0?text=Tiramisu',
    available: false,
  },
]
