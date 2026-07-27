import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchCatalog, loginRequest } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { clearAccessToken, readAccessToken, saveAccessToken } from '../lib/secureToken';

export function useSessionToken() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: readAccessToken,
    staleTime: Infinity,
  });
}

export function useCatalog(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.catalog,
    queryFn: fetchCatalog,
    enabled,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const token = await loginRequest(email, password);
      await saveAccessToken(token);
      return token;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.session });
      await qc.invalidateQueries({ queryKey: queryKeys.catalog });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearAccessToken,
    onSuccess: async () => {
      qc.removeQueries({ queryKey: queryKeys.catalog });
      await qc.invalidateQueries({ queryKey: queryKeys.session });
    },
  });
}
