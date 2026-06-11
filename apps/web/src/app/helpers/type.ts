export type FetchStatus = "not-started" | "pending" | "completed" | "failed";

export type FetchStateWithError = {
  status: FetchStatus;
  error: string | null;
};

export const defaultFetchState: FetchStateWithError = {
  status: "not-started",
  error: null,
};
