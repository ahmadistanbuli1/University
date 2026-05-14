import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, postFormData } from './http.js';

export function useMeQuery() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await http.get<Record<string, unknown>>('/api/users/me');
      return data;
    },
  });
}

export function useMyEnrollmentsQuery() {
  return useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: async () => {
      const { data } = await http.get<unknown[]>('/api/academic/enrollments/me');
      return data;
    },
  });
}

export function useMyResultsQuery() {
  return useQuery({
    queryKey: ['results', 'me'],
    queryFn: async () => {
      const { data } = await http.get<{ results: unknown[]; gpa: number }>('/api/academic/results/me');
      return data;
    },
  });
}

export function useMyTranscriptsQuery() {
  return useQuery({
    queryKey: ['transcripts', 'me'],
    queryFn: async () => {
      const { data } = await http.get<unknown[]>('/api/student-services/transcripts/me');
      return data;
    },
  });
}

export function useRequestTranscriptMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await http.post<unknown>('/api/student-services/transcripts');
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transcripts', 'me'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useCreateAppealMutation() {
  return useMutation({
    mutationFn: async (body: { examResultId: string; reason: string }) => {
      const { data } = await http.post<unknown>('/api/student-services/appeals', body);
      return data;
    },
  });
}

export function useAppealsListQuery() {
  return useQuery({
    queryKey: ['appeals', 'admin'],
    queryFn: async () => {
      const { data } = await http.get<unknown[]>('/api/student-services/appeals');
      return data;
    },
  });
}

export function usePatchAppealMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; status: 'APPROVED' | 'REJECTED'; adminResponse?: string }) => {
      const { data } = await http.patch<unknown>(
        `/api/student-services/appeals/${args.id}/status`,
        { status: args.status, adminResponse: args.adminResponse }
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['appeals', 'admin'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useAllTranscriptsQuery() {
  return useQuery({
    queryKey: ['transcripts', 'all'],
    queryFn: async () => {
      const { data } = await http.get<unknown[]>('/api/student-services/transcripts');
      return data;
    },
  });
}

export function usePatchTranscriptMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; filePath: string; status: 'DELIVERED' | 'PROCESSED' }) => {
      const { data } = await http.patch<unknown>(`/api/student-services/transcripts/${args.id}`, {
        filePath: args.filePath,
        status: args.status,
      });
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transcripts', 'all'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function usePostResultMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      studentId: string;
      facultyCourseId: string;
      score: number;
      semester: string;
      academicYear: string;
      attemptNumber?: number;
    }) => {
      const { data } = await http.post<unknown>('/api/academic/results', body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['results', 'me'] });
      void qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useAnalyticsQuery(facultyCourseId: string | null) {
  return useQuery({
    queryKey: ['analytics', facultyCourseId],
    queryFn: async () => {
      const { data } = await http.get<{
        facultyCourseId: string;
        averageScore: number;
        passRatePercent: number;
        sampleSize: number;
        scoreDistribution: { range: string; count: number }[];
      }>('/api/academic/results/analytics', { params: { facultyCourseId } });
      return data;
    },
    enabled: Boolean(facultyCourseId),
  });
}

export function useUsersListQuery(page: number) {
  return useQuery({
    queryKey: ['users', 'list', page],
    queryFn: async () => {
      const { data } = await http.get<{
        items: { id: string; name: string; email: string; role: string; collegeId: string | null; createdAt: string }[];
        total: number;
        page: number;
        pageSize: number;
      }>('/api/users', { params: { page, pageSize: 20 } });
      return data;
    },
  });
}

export function useAuditLogsQuery(page: number) {
  return useQuery({
    queryKey: ['audit', 'logs', page],
    queryFn: async () => {
      const { data } = await http.get<{
        items: {
          id: string;
          userId: string | null;
          action: string;
          entity: string;
          entityId: string | null;
          createdAt: string;
          user?: { email?: string; name?: string } | null;
        }[];
        total: number;
      }>('/api/admin/audit-logs', { params: { page, pageSize: 20 } });
      return data;
    },
  });
}

export type AdminDashboardData = {
  usersByRole: { role: string; count: number }[];
  pendingAppeals: number;
  pendingTranscripts: number;
  totalBooks: number;
  totalNews: number;
  totalUsers: number;
  auditByDay: { date: string; count: number }[];
};

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const { data } = await http.get<AdminDashboardData>('/api/admin/dashboard');
      return data;
    },
  });
}

export function useFacultyDirectoryQuery() {
  return useQuery({
    queryKey: ['faculty', 'directory'],
    queryFn: async () => {
      const { data } = await http.get<unknown[]>('/api/users/faculty');
      return data;
    },
  });
}

export function useNewsListQuery(page: number) {
  return useQuery({
    queryKey: ['news', 'list', page],
    queryFn: async () => {
      const { data } = await http.get<{ items: unknown[]; total: number; page: number; pageSize: number }>(
        '/api/news',
        { params: { page, pageSize: 10 } }
      );
      return data;
    },
  });
}

export function useBooksQuery(page: number, keyword?: string) {
  return useQuery({
    queryKey: ['books', 'list', page, keyword ?? ''],
    queryFn: async () => {
      const { data } = await http.get<{ items: unknown[]; total: number }>('/api/library/books', {
        params: { page, pageSize: 10, ...(keyword ? { keyword } : {}) },
      });
      return data;
    },
  });
}

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: ['structure', 'departments'],
    queryFn: async () => {
      const { data } = await http.get<{ id: string; name: string }[]>('/api/structure/departments');
      return data;
    },
  });
}

export function useCreateNewsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; content: string; imageUrl?: string | null; collegeId?: string | null }) => {
      const { data } = await http.post<unknown>('/api/news', body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['news'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useCreateBookMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await postFormData<unknown>('/api/library/books', formData);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['books'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}
