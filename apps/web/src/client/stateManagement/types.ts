export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function initialFetch<T>(): FetchState<T> {
  return { data: null, loading: false, error: null };
}

export type FetchStateMap<T> = Record<string, FetchState<T>>;

export function initialFetchMap<T>(): FetchStateMap<T> {
  return {};
}
