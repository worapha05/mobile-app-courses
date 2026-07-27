import { readToken } from './authStorage';

export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
};

const DB: Product[] = [
  { id: 'fs-1', name: 'Pallet Jack Tag', sku: 'PJ-01', price: 120, stock: 40 },
  { id: 'fs-2', name: 'Zone Beacon', sku: 'ZB-09', price: 890, stock: 8 },
  { id: 'fs-3', name: 'Shrink Wrap', sku: 'SW-2', price: 250, stock: 100 },
  { id: 'fs-4', name: 'Scan Glove', sku: 'SG-1', price: 560, stock: 15 },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(email: string, password: string) {
  await wait(350);
  if (!email || password.length < 3) throw new Error('ข้อมูลไม่ถูกต้อง');
  return `fs_${email}`;
}

export async function fetchProducts(): Promise<Product[]> {
  const token = await readToken();
  if (!token) throw new Error('UNAUTHORIZED');
  await wait(450);
  return DB;
}

export async function fetchProduct(id: string): Promise<Product | undefined> {
  const all = await fetchProducts();
  return all.find((p) => p.id === id);
}
