import { useQuery } from '@tanstack/react-query';

export type DataromaBase = { based_on_person?: unknown[]; based_on_stock?: unknown[]; meta?: Record<string, unknown> };

// Client hook for base dataset.
// 서버 라우트 자체가 30분 TTL 메모리 캐시(`/api/dataroma/base`) + 클라이언트는 무한 stale 로 처리.
// 필요 시: queryClient.invalidateQueries(['dataroma-base']) 로 강제 새로고침.
export default function useDataromaBase() {
  return useQuery<DataromaBase>({
    queryKey: ['dataroma-base'],
    queryFn: async () => {
      const res = await fetch('/api/dataroma/base');
      if (!res.ok) throw new Error('Failed to load dataroma base');
      return res.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
