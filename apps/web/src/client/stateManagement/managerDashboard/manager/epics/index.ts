import { combineEpics, type Epic } from "redux-observable";
import { switchMap, mergeMap, catchError } from "rxjs/operators";
import { from, of } from "rxjs";
import { ofType } from "redux-observable";
import { api } from "@/client/apiClient/client";
import {
  fetchManagerDashboard,
  fetchManagerDashboardSuccess,
  fetchManagerDashboardFailure,
} from "../managerSlice";
import {
  fetchPropertiesSummarySuccess,
  fetchPropertiesSummaryFailure,
} from "../../property/propertySlice";

const fetchDashboardEpic: Epic = (action$) =>
  action$.pipe(
    ofType(fetchManagerDashboard.type),
    switchMap(() =>
      from(api.getManagerDashboard()).pipe(
        mergeMap((data) => [
          fetchManagerDashboardSuccess(data),
          fetchPropertiesSummarySuccess(data.properties),
        ]),
        catchError((err: Error) =>
          of(
            fetchManagerDashboardFailure(err.message),
            fetchPropertiesSummaryFailure(err.message),
          ),
        ),
      ),
    ),
  );

export const managerEpics = combineEpics(fetchDashboardEpic);
