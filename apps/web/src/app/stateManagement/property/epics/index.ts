import { combineEpics, type Epic } from "redux-observable";
import { switchMap, map, catchError } from "rxjs/operators";
import { from, of } from "rxjs";
import { ofType } from "redux-observable";
import { api } from "@repo/data";
import {
  fetchPropertiesSummary,
  fetchPropertiesSummarySuccess,
  fetchPropertiesSummaryFailure,
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

export const propertyEpics = combineEpics(fetchPropertiesSummaryEpic);
