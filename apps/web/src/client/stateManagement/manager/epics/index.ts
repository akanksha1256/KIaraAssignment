import { combineEpics, type Epic } from "redux-observable";
import { switchMap, map, catchError } from "rxjs/operators";
import { from, of } from "rxjs";
import { ofType } from "redux-observable";
import { api } from "@/client/apiClient/client";
import {
  fetchManagerDashboard,
  fetchManagerDashboardSuccess,
  fetchManagerDashboardFailure,
} from "../managerSlice";

const fetchDashboardEpic: Epic = (action$) =>
  action$.pipe(
    ofType(fetchManagerDashboard.type),
    switchMap(() =>
      from(api.getManagerDashboard()).pipe(
        map((data) => fetchManagerDashboardSuccess(data)),
        catchError((err: Error) => of(fetchManagerDashboardFailure(err.message))),
      ),
    ),
  );

export const managerEpics = combineEpics(fetchDashboardEpic);
