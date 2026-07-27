import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchProduct, fetchProducts, login } from '../lib/api';
import { clearToken, readToken, saveToken } from '../lib/authStorage';
import { keys } from '../lib/query';

export function useSession() {
  return useQuery({ queryKey: keys.session, queryFn: readToken, staleTime: Infinity });
}

export function useProducts(enabled: boolean) {
  return useQuery({ queryKey: keys.products, queryFn: fetchProducts, enabled });
}

export function useProduct(id: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.product(id),
    queryFn: () => fetchProduct(id),
    enabled: enabled && Boolean(id),
  });
}

export function useLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const token = await login(input.email, input.password);
      await saveToken(token);
      return token;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.session });
      await qc.invalidateQueries({ queryKey: keys.products });
    },
  });
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearToken,
    onSuccess: async () => {
      qc.removeQueries({ queryKey: keys.products });
      await qc.invalidateQueries({ queryKey: keys.session });
    },
  });
}
