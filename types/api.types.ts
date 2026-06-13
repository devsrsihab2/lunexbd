export type ApiPagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: unknown;
  status?: number;
  headers?: Record<string, string>;
  pagination?: ApiPagination;
};
