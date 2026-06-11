import { combineEpics, type Epic } from "redux-observable";
import { switchMap, mergeMap, map, catchError } from "rxjs/operators";
import { from, of } from "rxjs";
import { ofType } from "redux-observable";
import { api } from "@/client/apiClient/client";
import {
  fetchPropertiesSummary,
  fetchPropertiesSummarySuccess,
  fetchPropertiesSummaryFailure,
  fetchPropertyById,
  fetchPropertyByIdSuccess,
  fetchPropertyByIdFailure,
} from "../propertySlice";

const fetchPropertiesSummaryEpic: Epic = (action$) =>
  action$.pipe(
    ofType(fetchPropertiesSummary.type),
    switchMap(() =>
      from(api.getPropertiesSummary()).pipe(
        map((data) => fetchPropertiesSummarySuccess(data)),
        catchError((err: Error) => of(fetchPropertiesSummaryFailure(err.message))),
      ),
    ),
  );

const fetchPropertyByIdEpic: Epic = (action$) =>
  action$.pipe(
    ofType(fetchPropertyById.type),
    mergeMap((action: ReturnType<typeof fetchPropertyById>) =>
      from(api.getPropertyDetail(action.payload)).pipe(
        map((data) => fetchPropertyByIdSuccess(data)),
        catchError((err: Error) => of(fetchPropertyByIdFailure(err.message))),
      ),
    ),
  );

export const propertyEpics = combineEpics(
  fetchPropertiesSummaryEpic,
  fetchPropertyByIdEpic,
);
