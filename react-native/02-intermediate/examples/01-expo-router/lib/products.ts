export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
};

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Sensor Kit',
    price: 1290,
    description: 'ชุดเซ็นเซอร์อุณหภูมิสำหรับงานภาคสนาม',
  },
  {
    id: 'p2',
    name: 'Rugged Case',
    price: 890,
    description: 'เคสกันกระแทกสำหรับมือถืออุตสาหกรรม',
  },
  {
    id: 'p3',
    name: 'Barcode Strap',
    price: 450,
    description: 'สายคล้องพร้อมที่วางสแกนเนอร์',
  },
];

export function getProduct(id?: string) {
  if (!id) return undefined;
  return PRODUCTS.find((p) => p.id === id);
}
