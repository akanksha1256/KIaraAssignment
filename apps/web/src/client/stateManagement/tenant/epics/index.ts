import { combineEpics, type Epic } from "redux-observable";
import { mergeMap, catchError } from "rxjs/operators";
import { from, of } from "rxjs";
import { ofType } from "redux-observable";
import { api } from "@/client/apiClient/client";
import {
  fetchTenantProfile,
  fetchTenantProfileSuccess,
  fetchTenantProfileFailure,
} from "../tenantSlice";

const fetchTenantProfileEpic: Epic = (action$) =>
  action$.pipe(
    ofType(fetchTenantProfile.type),
    mergeMap((action: ReturnType<typeof fetchTenantProfile>) =>
      from(api.getTenantProfile(action.payload)).pipe(
        mergeMap((profile) =>
          of(
            fetchTenantProfileSuccess({
              id: action.payload,
              profile,
            }),
          ),
        ),
        catchError((err: Error) =>
          of(
            fetchTenantProfileFailure({
              id: action.payload,
              error: err.message,
            }),
          ),
        ),
      ),
    ),
  );

export const tenantEpics = combineEpics(fetchTenantProfileEpic);
