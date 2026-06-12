import { combineEpics, type Epic } from "redux-observable";
import { mergeMap, catchError } from "rxjs/operators";
import { from, of } from "rxjs";
import { ofType } from "redux-observable";
import { api } from "@/client/apiClient/client";
import {
  fetchTenantDashboard,
  fetchTenantDashboardSuccess,
  fetchTenantDashboardFailure,
} from "../tenantDashboardSlice";

const fetchTenantDashboardEpic: Epic = (action$) =>
  action$.pipe(
    ofType(fetchTenantDashboard.type),
    mergeMap((action: ReturnType<typeof fetchTenantDashboard>) =>
      from(api.getTenantDashboard(action.payload)).pipe(
        mergeMap((data) =>
          of(fetchTenantDashboardSuccess({ id: action.payload, data })),
        ),
        catchError((err: Error) =>
          of(fetchTenantDashboardFailure({ id: action.payload, error: err.message })),
        ),
      ),
    ),
  );

export const tenantDashboardEpics = combineEpics(fetchTenantDashboardEpic);
