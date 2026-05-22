import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance, postFormData } from './http.js';

export function useMeQuery() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Record<string, unknown>>('/api/users/me');
      return data;
    },
  });
}

export function useMyEnrollmentsQuery() {
  return useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown[]>('/api/academic/enrollments/me');
      return data;
    },
  });
}

export function useMyResultsQuery() {
  return useQuery({
    queryKey: ['results', 'me'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ results: unknown[]; gpa: number }>(
        '/api/academic/results/me'
      );
      return data;
    },
  });
}

export function useMyStudyPlanQuery(studyYear?: number) {
  return useQuery({
    queryKey: ['study-plan', 'me', studyYear ?? 'current'],
    queryFn: async () => {
      const params = studyYear != null ? { studyYear } : {};
      const { data } = await axiosInstance.get<Record<string, unknown>>(
        '/api/academic/study-plan/me',
        { params }
      );
      return data;
    },
  });
}

export function useMyTranscriptsQuery() {
  return useQuery({
    queryKey: ['transcripts', 'me'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown[]>('/api/student-services/transcripts/me');
      return data;
    },
  });
}

export function useRequestTranscriptMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post<unknown>('/api/student-services/transcripts');
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transcripts', 'me'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useCreateAppealMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { examResultId: string; reason: string }) => {
      const { data } = await axiosInstance.post<unknown>('/api/student-services/appeals', body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['appeals', 'me'] });
    },
  });
}

export function useAppealsListQuery() {
  return useQuery({
    queryKey: ['appeals', 'admin'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown[]>('/api/student-services/appeals');
      return data;
    },
  });
}

export function usePatchAppealMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
      adminResponse?: string;
    }) => {
      const { data } = await axiosInstance.patch<unknown>(
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
      const { data } = await axiosInstance.get<unknown[]>('/api/student-services/transcripts');
      return data;
    },
  });
}

export function usePatchTranscriptMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: string;
      filePath: string;
      status: 'DELIVERED' | 'PROCESSED';
    }) => {
      const { data } = await axiosInstance.patch<unknown>(
        `/api/student-services/transcripts/${args.id}`,
        {
          filePath: args.filePath,
          status: args.status,
        }
      );
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
      const { data } = await axiosInstance.post<unknown>('/api/academic/results', body);
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
      const { data } = await axiosInstance.get<{
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

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  collegeId: string | null;
  createdAt: string;
  college?: { id: string; name: string } | null;
  studentProfile?: {
    id: string;
    academicNumber: string;
    currentSemester: number;
    academicYear: string;
    department?: { id: string; name: string; code: string };
  } | null;
};

export type UsersListFilters = {
  page: number;
  search?: string;
  role?: string;
  collegeId?: string;
  departmentId?: string;
  active?: boolean;
};

export function useUsersListQuery(filters: UsersListFilters) {
  return useQuery({
    queryKey: ['users', 'list', filters],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        items: UserListItem[];
        total: number;
        page: number;
        pageSize: number;
      }>('/api/users', {
        params: {
          page: filters.page,
          pageSize: 20,
          search: filters.search || undefined,
          role: filters.role || undefined,
          collegeId: filters.collegeId || undefined,
          departmentId: filters.departmentId || undefined,
          active: filters.active === undefined ? undefined : String(filters.active),
        },
      });
      return data;
    },
  });
}

export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await axiosInstance.post<UserListItem>('/api/users', body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users', 'list'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; body: Record<string, unknown> }) => {
      const { data } = await axiosInstance.patch<UserListItem>(`/api/users/${args.id}`, args.body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users', 'list'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useDeactivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete<UserListItem>(`/api/users/${id}`);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users', 'list'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export type SectionRosterStudent = {
  studentId: string;
  academicNumber: string;
  name: string;
  email: string;
  department: string;
  currentSemester: number;
};

export function useSectionRosterQuery(facultyCourseId: string | null) {
  return useQuery({
    queryKey: ['academic', 'roster', facultyCourseId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<SectionRosterStudent[]>(
        `/api/academic/faculty-courses/${facultyCourseId}/roster`
      );
      return data;
    },
    enabled: Boolean(facultyCourseId),
  });
}

export type AffairsStudentRow = {
  id: string;
  academicNumber: string;
  currentSemester: number;
  academicYear: string;
  user: { id: string; name: string; email: string; active: boolean };
  department: { id: string; name: string; college?: { name: string } };
  enrollments: { course: { name: string; code: string } }[];
};

export function useAffairsStudentsQuery(params: {
  page: number;
  search?: string;
  departmentId?: string;
}) {
  return useQuery({
    queryKey: ['affairs', 'students', params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        items: AffairsStudentRow[];
        total: number;
        page: number;
        pageSize: number;
      }>('/api/student-services/students', {
        params: {
          page: params.page,
          pageSize: 20,
          search: params.search || undefined,
          departmentId: params.departmentId || undefined,
        },
      });
      return data;
    },
  });
}

export function usePatchAffairsStudentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; body: Record<string, unknown> }) => {
      const { data } = await axiosInstance.patch<AffairsStudentRow>(
        `/api/student-services/students/${args.id}`,
        args.body
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['affairs', 'students'] });
    },
  });
}

export function useAuditLogsQuery(page: number) {
  return useQuery({
    queryKey: ['audit', 'logs', page],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
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
      const { data } = await axiosInstance.get<AdminDashboardData>('/api/admin/dashboard');
      return data;
    },
  });
}

export function useFacultyDirectoryQuery() {
  return useQuery({
    queryKey: ['faculty', 'directory'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown[]>('/api/users/faculty');
      return data;
    },
  });
}

export function useNewsListQuery(page: number) {
  return useQuery({
    queryKey: ['news', 'list', page],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        items: unknown[];
        total: number;
        page: number;
        pageSize: number;
      }>('/api/news', { params: { page, pageSize: 10 } });
      return data;
    },
  });
}

export type LibraryStatsDto = {
  totalBooks: number;
  totalReads: number;
  totalDownloads: number;
  byCategory: Array<{
    category: string;
    count: number;
    reads: number;
    downloads: number;
  }>;
  topByReads: Array<{
    id: string;
    title: string;
    category: string;
    readsCount: number;
    downloadsCount: number;
    publishYear: number;
  }>;
};

export function useLibraryStatsQuery() {
  return useQuery({
    queryKey: ['library', 'stats'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<LibraryStatsDto>('/api/library/stats');
      return data;
    },
  });
}

export function useLibrarianBooksQuery(page: number, categoryFilter?: string) {
  return useQuery({
    queryKey: ['books', 'manage', page, categoryFilter ?? 'all'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ items: unknown[]; total: number }>('/api/library/books', {
        params: {
          page,
          pageSize: 20,
          ...(categoryFilter ? { category: categoryFilter } : {}),
        },
      });
      return data;
    },
  });
}

export function useUpdateBookMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: string;
      body: {
        title?: string;
        category?: string;
        publishYear?: number;
        keywords?: string;
      };
    }) => {
      const { data } = await axiosInstance.patch<unknown>(`/api/library/books/${args.id}`, args.body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['books'] });
      void qc.invalidateQueries({ queryKey: ['library', 'stats'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useDeleteBookMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete<unknown>(`/api/library/books/${id}`);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['books'] });
      void qc.invalidateQueries({ queryKey: ['library', 'stats'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useBooksQuery(page: number, category: string, keyword?: string) {
  return useQuery({
    queryKey: ['books', 'list', page, category, keyword ?? ''],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ items: unknown[]; total: number }>(
        '/api/library/books',
        {
          params: { page, pageSize: 10, category, ...(keyword ? { keyword } : {}) },
        }
      );
      return data;
    },
  });
}

export type DepartmentDto = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  collegeId: string;
  college?: { id: string; name: string };
};

export function useDepartmentsQuery(collegeId?: string) {
  return useQuery({
    queryKey: ['structure', 'departments', collegeId ?? 'all'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<DepartmentDto[]>('/api/structure/departments', {
        params: collegeId ? { collegeId } : undefined,
      });
      return data;
    },
  });
}

export function useCollegesQuery() {
  return useQuery({
    queryKey: ['structure', 'colleges'],
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<{ id: string; name: string; description: string }[]>(
          '/api/structure/colleges'
        );
      return data;
    },
  });
}

export function useCreateNewsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      title: string;
      content: string;
      imageUrl?: string | null;
      collegeId?: string | null;
      category?: 'GENERAL' | 'TUITION';
      enablePayNow?: boolean;
    }) => {
      const { data } = await axiosInstance.post<unknown>('/api/news', body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['news'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export type TuitionSummary = {
  totalDue: number;
  totalPaid: number;
  totalRemaining: number;
  overallStatus: string;
  installments: Array<{
    id: string;
    label: string;
    academicYear: string;
    amountDue: number;
    amountPaid: number;
    remaining: number;
    status: string;
  }>;
};

export function useTuitionSummaryQuery() {
  return useQuery({
    queryKey: ['tuition', 'summary'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TuitionSummary>('/api/tuition/summary/me');
      return data;
    },
  });
}

export function usePayInstallmentQuery(installmentId?: string) {
  return useQuery({
    queryKey: ['tuition', 'pay', installmentId],
    enabled: !!installmentId,
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        installment: {
          id: string;
          label: string;
          academicYear: string;
          amountDue: number;
          amountPaid: number;
          remaining: number;
          status: string;
        };
      }>(`/api/tuition/installments/${installmentId}/pay`);
      return data;
    },
  });
}

export function useSimulatePaymentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (installmentId: string) => {
      const { data } = await axiosInstance.post<{
        referenceCode: string;
        amountPaid: number;
        paidAt: string;
      }>('/api/tuition/payments/simulate', { installmentId });
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tuition'] });
    },
  });
}

export function useMyDiscountsQuery() {
  return useQuery({
    queryKey: ['discounts', 'me'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown[]>('/api/tuition/discounts/me');
      return data;
    },
  });
}

export function useSubmitDiscountMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await postFormData<unknown>('/api/tuition/discounts', formData);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['discounts', 'me'] });
    },
  });
}

export function useAdminDiscountsQuery() {
  return useQuery({
    queryKey: ['discounts', 'admin'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown[]>('/api/tuition/discounts');
      return data;
    },
  });
}

export function useReviewDiscountMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
      discountPercent?: number;
      discountAmount?: number;
      adminResponse?: string;
    }) => {
      const { data } = await axiosInstance.patch<unknown>(
        `/api/tuition/discounts/${args.id}/review`,
        {
          status: args.status,
          discountPercent: args.discountPercent,
          discountAmount: args.discountAmount,
          adminResponse: args.adminResponse,
        }
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['discounts', 'admin'] });
      void qc.invalidateQueries({ queryKey: ['tuition'] });
    },
  });
}

export function useMyAppealsQuery() {
  return useQuery({
    queryKey: ['appeals', 'me'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown[]>('/api/student-services/appeals/me');
      return data;
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
      void qc.invalidateQueries({ queryKey: ['library', 'stats'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}
