export type StockJob = {
  id: string;
  sku: string;
  title: string;
  zone: string;
};

export function buildJobs(count = 1_200): StockJob[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `job-${i + 1}`,
    sku: `SKU-${(1000 + (i % 400)).toString()}`,
    title: `นับชั้นวาง ${i + 1}`,
    zone: `Z-${((i % 20) + 1).toString().padStart(2, '0')}`,
  }));
}
