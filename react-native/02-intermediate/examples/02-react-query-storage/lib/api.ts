import { readAccessToken } from './secureToken';

export type CatalogItem = {
  id: string;
  sku: string;
  name: string;
  stock: number;
};

const MOCK_CATALOG: CatalogItem[] = [
  { id: '1', sku: 'SN-100', name: 'Temperature Probe', stock: 12 },
  { id: '2', sku: 'SN-220', name: 'Humidity Pack', stock: 4 },
  { id: '3', sku: 'CS-010', name: 'Clip Mount', stock: 30 },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** API client จำลอง — แนบ Bearer จาก SecureStore */
export async function fetchCatalog(): Promise<CatalogItem[]> {
  const token = await readAccessToken();
  if (!token) {
    throw new Error('UNAUTHORIZED');
  }
  await delay(500);
  return MOCK_CATALOG;
}

export async function loginRequest(email: string, password: string): Promise<string> {
  await delay(400);
  if (!email.includes('@') || password.length < 4) {
    throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }
  return `token_${email}_${Date.now()}`;
}
