import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 45_000, retry: 1 },
  },
});

export const keys = {
  session: ['session'] as const,
  products: ['products'] as const,
  product: (id: string) => ['product', id] as const,
};
