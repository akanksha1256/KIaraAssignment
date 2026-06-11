export type FetchStateWithError = {
  status: "not-started";
  error: {};
};

export const defaultFetchState: FetchStateWithError = {
  status: "not-started",
  error: {},
};
