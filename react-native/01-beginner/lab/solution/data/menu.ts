export type MenuCategory = 'coffee' | 'tea' | 'snack';

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  inStock: boolean;
};

const CATALOG: Omit<MenuItem, 'inStock'>[] = [
  { id: 'c1', name: 'Latte', category: 'coffee', price: 85 },
  { id: 'c2', name: 'Americano', category: 'coffee', price: 70 },
  { id: 'c3', name: 'Cappuccino', category: 'coffee', price: 90 },
  { id: 't1', name: 'ไทยเย็น', category: 'tea', price: 60 },
  { id: 't2', name: 'Matcha Latte', category: 'tea', price: 95 },
  { id: 't3', name: 'ชาดำเย็น', category: 'tea', price: 55 },
  { id: 's1', name: 'ครัวซองต์', category: 'snack', price: 75 },
  { id: 's2', name: 'บราวนี่', category: 'snack', price: 65 },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** API จำลอง — สุ่มของหมดบางรายการทุกครั้งที่เรียก */
export async function fetchMenu(): Promise<MenuItem[]> {
  await delay(600 + Math.floor(Math.random() * 200));
  return CATALOG.map((item) => ({
    ...item,
    inStock: Math.random() > 0.18,
  }));
}
