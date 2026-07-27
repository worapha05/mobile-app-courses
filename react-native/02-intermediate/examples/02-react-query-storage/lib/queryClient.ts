import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 30 * 60_000,
        retry: (failureCount, error) => {
          if (error instanceof Error && error.message === 'UNAUTHORIZED') return false;
          return failureCount < 2;
        },
      },
    },
  });
}

export const queryKeys = {
  catalog: ['catalog'] as const,
  session: ['session'] as const,
};
