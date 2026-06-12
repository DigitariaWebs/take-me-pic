import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/shared/providers';
import { reportApi, type ReportTarget } from '../api/safety-api';

export function useSubmitReport() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: (params: { reason: string; target: ReportTarget }) =>
      reportApi.submit({ reporterId: user!.id, reason: params.reason, target: params.target }),
  });
}
