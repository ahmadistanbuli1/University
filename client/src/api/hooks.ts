import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance, patchFormData, postFormData } from './http.js';

export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: ['me'],
    enabled,
    queryFn: async () => {
      const { data } = await axiosInstance.get<Record<string, unknown>>('/api/users/me');
      return data;
    },
  });
}

export function useNotificationsQuery(enabled = true) {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown[]>('/api/notifications');
      return data;
    },
    enabled,
    refetchInterval: enabled ? 45_000 : false,
  });
}

export function useUnreadNotificationsCountQuery() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ count: number }>(
        '/api/notifications/unread-count'
      );
      return data.count;
    },
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.patch(`/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await axiosInstance.patch('/api/notifications/read-all');
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export type MyEnrollmentsByTerm = {
  studyYear: number;
  terms: Array<{
    term: 'FIRST' | 'SECOND';
    courses: Array<{ id: string; name: string; code: string }>;
  }>;
};

export function useMyEnrollmentsQuery() {
  return useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<MyEnrollmentsByTerm>('/api/academic/enrollments/me');
      return data;
    },
  });
}

export function useMyResultsQuery() {
  return useQuery({
    queryKey: ['results', 'me'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        results: unknown[];
        gpa: number | null;
        pendingCurrentTerm?: boolean;
      }>('/api/academic/results/me');
      return data;
    },
    refetchOnWindowFocus: true,
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
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
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
    mutationFn: async (body: { confirmPayment: true }) => {
      const { data } = await axiosInstance.post<unknown>(
        '/api/student-services/transcripts',
        body
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transcripts', 'me'] });
      void qc.invalidateQueries({ queryKey: ['transcripts', 'all'] });
      void qc.invalidateQueries({ queryKey: ['transcripts', 'exam-queue'] });
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

export function useProcessTranscriptMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      args:
        | { id: string; action: 'approve' }
        | { id: string; action: 'reject'; rejectionReason: string }
    ) => {
      const { data } = await axiosInstance.patch<unknown>(
        `/api/student-services/transcripts/${args.id}`,
        args.action === 'approve'
          ? { action: 'approve' }
          : { action: 'reject', rejectionReason: args.rejectionReason }
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transcripts', 'all'] });
      void qc.invalidateQueries({ queryKey: ['transcripts', 'me'] });
      void qc.invalidateQueries({ queryKey: ['transcripts', 'exam-queue'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useExamOfficerTranscriptsQuery() {
  return useQuery({
    queryKey: ['transcripts', 'exam-queue'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown[]>(
        '/api/student-services/transcripts/exam-queue'
      );
      return data;
    },
  });
}

export function useFulfillTranscriptMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.post<unknown>(
        `/api/student-services/transcripts/${id}/fulfill`
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transcripts', 'exam-queue'] });
      void qc.invalidateQueries({ queryKey: ['transcripts', 'all'] });
      void qc.invalidateQueries({ queryKey: ['transcripts', 'me'] });
    },
  });
}

export async function fetchTranscriptPdfBlob(requestId: string): Promise<Blob> {
  const { data } = await axiosInstance.get<Blob>(
    `/api/student-services/transcripts/${requestId}/file`,
    { responseType: 'blob' }
  );
  return data;
}

export type AffairsDashboardStats = {
  totalStudents: number;
  recentlyRegistered: number;
  pendingClearances: number;
  pendingTranscripts: number;
  studentsByCollege: Array<{ collegeId: string; collegeName: string; count: number }>;
  studentsByCollegeYear: Array<{
    collegeId: string;
    collegeName: string;
    studyYear: number;
    count: number;
  }>;
};

export function useAffairsDashboardQuery() {
  return useQuery({
    queryKey: ['affairs', 'dashboard'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<AffairsDashboardStats>(
        '/api/student-services/affairs/dashboard'
      );
      return data;
    },
  });
}

export function useCreateAffairsStudentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      name: string;
      email: string;
      password: string;
      departmentId: string;
      academicNumber: string;
      currentSemester: number;
      academicYear: string;
    }) => {
      const { data } = await axiosInstance.post<AffairsStudentRow>(
        '/api/student-services/students',
        body
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['affairs'] });
      void qc.invalidateQueries({ queryKey: ['manager', 'students'] });
    },
  });
}

export function useDeleteAffairsStudentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete<AffairsStudentRow>(
        `/api/student-services/students/${id}`
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['affairs'] });
      void qc.invalidateQueries({ queryKey: ['manager', 'students'] });
    },
  });
}

export async function fetchStudentProfilePdfBlob(studentId: string): Promise<Blob> {
  const { data } = await axiosInstance.get<Blob>(
    `/api/student-services/students/${studentId}/profile-pdf`,
    { responseType: 'blob' }
  );
  return data;
}

export function useMyClearancesQuery() {
  return useQuery({
    queryKey: ['clearances', 'me'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown[]>('/api/student-services/clearances/me');
      return data;
    },
  });
}

export function useRequestClearanceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { confirmPayment: true }) => {
      const { data } = await axiosInstance.post<unknown>(
        '/api/student-services/clearances',
        body
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['clearances'] });
      void qc.invalidateQueries({ queryKey: ['affairs', 'dashboard'] });
    },
  });
}

export function useAllClearancesQuery() {
  return useQuery({
    queryKey: ['clearances', 'all'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown[]>('/api/student-services/clearances');
      return data;
    },
  });
}

export function useProcessClearanceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; rejectionReason: string }) => {
      const { data } = await axiosInstance.patch<unknown>(
        `/api/student-services/clearances/${args.id}`,
        { action: 'reject', rejectionReason: args.rejectionReason }
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['clearances'] });
      void qc.invalidateQueries({ queryKey: ['affairs', 'dashboard'] });
    },
  });
}

export function useDeliverClearanceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.post<unknown>(
        `/api/student-services/clearances/${id}/deliver`
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['clearances'] });
      void qc.invalidateQueries({ queryKey: ['affairs', 'dashboard'] });
    },
  });
}

export async function fetchClearancePdfBlob(requestId: string): Promise<Blob> {
  const { data } = await axiosInstance.get<Blob>(
    `/api/student-services/clearances/${requestId}/file`,
    { responseType: 'blob' }
  );
  return data;
}

export function usePostResultMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      facultyCourseId: string;
      academicNumber: string;
      practicalScore: number;
      theoryScore: number;
    }) => {
      const { data } = await axiosInstance.post<unknown>('/api/academic/results', body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['results', 'me'] });
      void qc.invalidateQueries({ queryKey: ['study-plan', 'me'] });
      void qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useGradeSubmissionWorkspaceQuery(facultyCourseId: string | null) {
  return useQuery({
    queryKey: ['grade-submissions', 'workspace', facultyCourseId],
    enabled: !!facultyCourseId,
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown>(
        `/api/grade-submissions/faculty/workspace/${facultyCourseId}`
      );
      return data;
    },
  });
}

export function useSaveGradeDraftMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      facultyCourseId: string;
      body:
        | { lines: Array<{ studentId: string; practicalScore: number }> }
        | { lines: Array<{ studentId: string; theoryScore: number }> };
    }) => {
      const { data } = await axiosInstance.put<unknown>(
        `/api/grade-submissions/faculty/workspace/${args.facultyCourseId}/draft`,
        args.body
      );
      return data;
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({
        queryKey: ['grade-submissions', 'workspace', vars.facultyCourseId],
      });
    },
  });
}

export function useSubmitGradeSubmissionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (facultyCourseId: string) => {
      const { data } = await axiosInstance.post<unknown>(
        `/api/grade-submissions/faculty/workspace/${facultyCourseId}/submit`
      );
      return data;
    },
    onSuccess: (_d, facultyCourseId) => {
      void qc.invalidateQueries({ queryKey: ['grade-submissions'] });
      void qc.invalidateQueries({
        queryKey: ['grade-submissions', 'workspace', facultyCourseId],
      });
    },
  });
}

export function useGradeSubmissionQueueQuery() {
  return useQuery({
    queryKey: ['grade-submissions', 'queue'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown[]>(
        '/api/grade-submissions/exam-officer/queue'
      );
      return data;
    },
  });
}

export function useGradeSubmissionDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ['grade-submissions', 'detail', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown>(`/api/grade-submissions/${id}`);
      return data;
    },
  });
}

export function useUpdateGradeSubmissionLinesMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: string;
      body:
        | { lines: Array<{ studentId: string; practicalScore: number }> }
        | { lines: Array<{ studentId: string; theoryScore: number }> };
    }) => {
      const { data } = await axiosInstance.patch<unknown>(
        `/api/grade-submissions/${args.id}/lines`,
        args.body
      );
      return data;
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['grade-submissions', 'detail', vars.id] });
      void qc.invalidateQueries({ queryKey: ['grade-submissions', 'queue'] });
    },
  });
}

export function usePublishGradeSubmissionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.post<unknown>(
        `/api/grade-submissions/${id}/publish`
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['grade-submissions'] });
      void qc.invalidateQueries({ queryKey: ['results', 'me'] });
      void qc.invalidateQueries({ queryKey: ['study-plan', 'me'] });
      void qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useRejectGradeSubmissionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; rejectionReason: string }) => {
      const { data } = await axiosInstance.post<unknown>(
        `/api/grade-submissions/${args.id}/reject`,
        { rejectionReason: args.rejectionReason }
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['grade-submissions'] });
    },
  });
}

export type StructureCourse = {
  id: string;
  name: string;
  code: string;
  department?: { id: string; name: string; code: string; college?: { id: string; name: string } };
};

export function useStructureCoursesQuery() {
  return useQuery({
    queryKey: ['structure', 'courses'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<StructureCourse[]>('/api/structure/courses');
      return data;
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
    placeholderData: keepPreviousData,
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

export function useAdminUserQuery(userId: string | null) {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        id: string;
        facultyCourses?: Array<{ course?: { id: string } }>;
      }>(`/api/users/${userId}`);
      return data;
    },
    enabled: Boolean(userId),
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

export function useExamOfficerStudentsQuery(params: {
  page: number;
  departmentId?: string;
  studyYear?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['exam-officer', 'students', params],
    enabled: params.enabled !== false && Boolean(params.departmentId && params.studyYear),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        items: AffairsStudentRow[];
        total: number;
        page: number;
        pageSize: number;
      }>('/api/student-services/students', {
        params: {
          page: params.page,
          pageSize: 50,
          departmentId: params.departmentId,
          studyYear: params.studyYear,
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useAffairsStudentsQuery(params: {
  page: number;
  search?: string;
  departmentId?: string;
  studyYear?: number;
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
          studyYear: params.studyYear || undefined,
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useManagerStudentsQuery(params: {
  page: number;
  search?: string;
  departmentId?: string;
  studyYear?: number;
}) {
  return useQuery({
    queryKey: ['manager', 'students', params],
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
          studyYear: params.studyYear || undefined,
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
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
      void qc.invalidateQueries({ queryKey: ['manager', 'students'] });
    },
  });
}

export type CurriculumCourseRow = {
  id: string;
  studyYear: number;
  term: 'FIRST' | 'SECOND';
  name: string;
  code: string;
  department: { id: string; name: string; college?: { id: string; name: string } };
};

export type CurriculumGrouped = {
  studyYear: number;
  terms: { term: 'FIRST' | 'SECOND'; courses: CurriculumCourseRow[] }[];
};

export function useCurriculumQuery(params: {
  departmentId?: string;
  studyYear?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['curriculum', params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        grouped: CurriculumGrouped[];
        flat: CurriculumCourseRow[];
      }>('/api/curriculum', {
        params: {
          departmentId: params.departmentId || undefined,
          studyYear: params.studyYear || undefined,
        },
      });
      return data;
    },
    enabled: params.enabled !== false,
  });
}

export function useCreateCurriculumMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      departmentId: string;
      studyYear: number;
      term: 'FIRST' | 'SECOND';
      name: string;
      code?: string;
    }) => {
      const { data } = await axiosInstance.post<CurriculumCourseRow>('/api/curriculum', body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['curriculum'] });
    },
  });
}

export function useUpdateCurriculumMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; name: string }) => {
      const { data } = await axiosInstance.patch<CurriculumCourseRow>(
        `/api/curriculum/${args.id}`,
        { name: args.name }
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['curriculum'] });
    },
  });
}

export function useDeleteCurriculumMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/api/curriculum/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['curriculum'] });
    },
  });
}

export type ManagerRequestRow = {
  id: string;
  subject: string;
  body: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  adminResponse: string | null;
  createdAt: string;
  resolvedAt: string | null;
  manager?: { id: string; name: string; email: string; college?: { name: string } };
  resolvedBy?: { name: string } | null;
};

export function useManagerRequestsQuery() {
  return useQuery({
    queryKey: ['manager', 'requests'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ManagerRequestRow[]>('/api/manager/requests');
      return data;
    },
  });
}

export function useCreateManagerRequestMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { subject: string; body: string }) => {
      const { data } = await axiosInstance.post<ManagerRequestRow>('/api/manager/requests', body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['manager', 'requests'] });
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useAdminManagerRequestsQuery() {
  return useQuery({
    queryKey: ['admin', 'manager-requests'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ManagerRequestRow[]>(
        '/api/admin/manager-requests'
      );
      return data;
    },
  });
}

export function useResolveManagerRequestMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: string;
      status: 'RESOLVED' | 'REJECTED';
      adminResponse: string;
    }) => {
      const { data } = await axiosInstance.patch<ManagerRequestRow>(
        `/api/admin/manager-requests/${args.id}`,
        { status: args.status, adminResponse: args.adminResponse }
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'manager-requests'] });
      void qc.invalidateQueries({ queryKey: ['manager', 'requests'] });
    },
  });
}

export function useMyActivityLogQuery(page: number) {
  return useQuery({
    queryKey: ['activity-log', 'mine', page],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        items: {
          id: string;
          action: string;
          entity: string;
          entityId: string;
          details?: Record<string, unknown> | null;
          createdAt: string;
        }[];
        total: number;
      }>('/api/activity-log/mine', { params: { page, pageSize: 20 } });
      return data;
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

export type AdminFinancialSettings = {
  transcriptFee: number;
  clearanceFee: number;
  updatedAt: string;
  colleges: Array<{
    id: string;
    name: string;
    annualAmount: number;
    semesterAmount: number;
  }>;
};

export function useAdminFinancialSettingsQuery() {
  return useQuery({
    queryKey: ['admin', 'financial-settings'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<AdminFinancialSettings>('/api/admin/financial-settings');
      return data;
    },
  });
}

export function useUpdateAdminFinancialSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      transcriptFee: number;
      clearanceFee: number;
      collegeTuitions: Array<{ collegeId: string; annualAmount: number }>;
    }) => {
      const { data } = await axiosInstance.patch<AdminFinancialSettings>(
        '/api/admin/financial-settings',
        body
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'financial-settings'] });
      void qc.invalidateQueries({ queryKey: ['tuition'] });
      void qc.invalidateQueries({ queryKey: ['service-fees'] });
    },
  });
}

export type ServiceFees = {
  transcriptFee: number;
  clearanceFee: number;
};

export function useServiceFeesQuery() {
  return useQuery({
    queryKey: ['service-fees'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ServiceFees>('/api/student-services/service-fees');
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

export type NewsListFilters = {
  collegeId?: string;
  category?: 'ANNOUNCEMENT' | 'WORKSHOP' | 'TRAINING' | 'TUITION';
};

export function useNewsListQuery(page: number, pageSize = 10, filters?: NewsListFilters) {
  return useQuery({
    queryKey: ['news', 'list', page, pageSize, filters ?? {}],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        items: unknown[];
        total: number;
        page: number;
        pageSize: number;
      }>('/api/news', {
        params: {
          page,
          pageSize,
          collegeId: filters?.collegeId || undefined,
          category: filters?.category || undefined,
        },
      });
      return data;
    },
  });
}

export function useNewsDetailQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: ['news', 'detail', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<unknown>(`/api/news/${id}`);
      return data;
    },
    enabled: enabled && Boolean(id),
  });
}

export function useDeleteNewsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/api/news/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['news'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
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

export function useLibrarianBooksQuery(page: number, filters?: LibraryBooksFilters) {
  return useQuery({
    queryKey: ['books', 'manage', page, filters ?? {}],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ items: unknown[]; total: number }>(
        '/api/library/books',
        { params: libraryListParams(page, 20, filters) }
      );
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
        author?: string | null;
        publisher?: string | null;
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

export type LibraryBooksFilters = {
  category?: string;
  keyword?: string;
  publishYear?: number | '';
  author?: string;
  publisher?: string;
};

function libraryListParams(page: number, pageSize: number, filters?: LibraryBooksFilters) {
  return {
    page,
    pageSize,
    ...(filters?.category ? { category: filters.category } : {}),
    ...(filters?.keyword?.trim() ? { keyword: filters.keyword.trim() } : {}),
    ...(filters?.publishYear ? { publishYear: filters.publishYear } : {}),
    ...(filters?.author?.trim() ? { author: filters.author.trim() } : {}),
    ...(filters?.publisher?.trim() ? { publisher: filters.publisher.trim() } : {}),
  };
}

export function useBooksQuery(page: number, filters?: LibraryBooksFilters) {
  return useQuery({
    queryKey: ['books', 'list', page, filters ?? {}],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ items: unknown[]; total: number }>(
        '/api/library/books',
        { params: libraryListParams(page, 10, filters) }
      );
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
}

export function useFavoriteBookIdsQuery(enabled = true) {
  return useQuery({
    queryKey: ['library', 'favorites', 'ids'],
    enabled,
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ bookIds: string[] }>(
        '/api/library/favorites/ids'
      );
      return new Set(data.bookIds);
    },
    staleTime: 30 * 1000,
  });
}

export function useFavoriteBooksQuery(page: number, filters?: LibraryBooksFilters) {
  return useQuery({
    queryKey: ['library', 'favorites', 'list', page, filters ?? {}],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ items: unknown[]; total: number }>(
        '/api/library/favorites',
        { params: libraryListParams(page, 10, filters) }
      );
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useToggleBookFavoriteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: string) => {
      const { data } = await axiosInstance.post<{ saved: boolean; bookId: string }>(
        `/api/library/favorites/${bookId}/toggle`
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library', 'favorites'] });
    },
  });
}

export function useRemoveBookFavoriteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: string) => {
      const { data } = await axiosInstance.delete<{ saved: boolean; bookId: string }>(
        `/api/library/favorites/${bookId}`
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library', 'favorites'] });
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
    mutationFn: async (args: {
      body: {
        title: string;
        summary: string;
        content: string;
        imageUrl?: string | null;
        collegeId?: string | null;
        category?: 'ANNOUNCEMENT' | 'WORKSHOP' | 'TRAINING' | 'TUITION';
        enablePayNow?: boolean;
        tuitionSemesterKey?: 'semester-1' | 'semester-2' | null;
        scope?: 'COLLEGE' | 'UNIVERSITY';
        removedGalleryIds?: string[];
      };
      coverFile?: File | null;
      galleryFiles?: File[];
    }) => {
      const { buildNewsFormData } = await import('../lib/news-form.js');
      const fd = buildNewsFormData(args.body, args.coverFile, args.galleryFiles);
      const { data } = await postFormData<unknown>('/api/news', fd);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['news'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUpdateNewsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: string;
      body: {
        title: string;
        summary: string;
        content: string;
        imageUrl?: string | null;
        collegeId?: string | null;
        category?: 'ANNOUNCEMENT' | 'WORKSHOP' | 'TRAINING' | 'TUITION';
        enablePayNow?: boolean;
        tuitionSemesterKey?: 'semester-1' | 'semester-2' | null;
        removedGalleryIds?: string[];
      };
      coverFile?: File | null;
      galleryFiles?: File[];
    }) => {
      const { buildNewsFormData } = await import('../lib/news-form.js');
      const fd = buildNewsFormData(args.body, args.coverFile, args.galleryFiles);
      const { data } = await patchFormData<unknown>(`/api/news/${args.id}`, fd);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['news'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      void qc.invalidateQueries({ queryKey: ['notifications'] });
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
    semesterKey?: string;
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
          semesterKey?: string;
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
