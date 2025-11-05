// src/hooks/usePortfolio.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { PortfolioBalance } from '@/types';

interface PortfolioData {
  balances: PortfolioBalance[];
  totalValue: number;
}

const fetchPortfolio = async (
  chainType: string | null | undefined,
  address: string | null | undefined
): Promise<PortfolioData> => {
  if (!chainType || !address) {
    return { balances: [], totalValue: 0 };
  }

  const { data } = await axios.post<PortfolioData>(
    `/api/portfolio/${chainType.toLowerCase()}`,
    { address }
  );

  return data;
};

export function usePortfolio(chainType: string | null | undefined, address: string | null | undefined) {
  return useQuery<PortfolioData, Error>({
    queryKey: ['portfolio', chainType, address],
    queryFn: () => fetchPortfolio(chainType, address),
    enabled: !!chainType && !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
