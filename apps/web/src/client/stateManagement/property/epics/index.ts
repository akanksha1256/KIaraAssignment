import { combineEpics, type Epic, type StateObservable } from "redux-observable";
import { switchMap, mergeMap, catchError, withLatestFrom } from "rxjs/operators";
import { from, of, EMPTY } from "rxjs";
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
import {
  fetchUnitsForPropertySuccess,
  fetchUnitsForPropertyFailure,
} from "../../unit/unitSlice";
import type { RootState } from "../../mainFile";

const fetchPropertiesSummaryEpic: Epic = (action$) =>
  action$.pipe(
    ofType(fetchPropertiesSummary.type),
    switchMap(() =>
      from(api.getPropertiesSummary()).pipe(
        mergeMap((data) => of(fetchPropertiesSummarySuccess(data))),
        catchError((err: Error) => of(fetchPropertiesSummaryFailure(err.message))),
      ),
    ),
  );

const fetchPropertyByIdEpic: Epic = (action$, state$) =>
  action$.pipe(
    ofType(fetchPropertyById.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const typedAction = action as ReturnType<typeof fetchPropertyById>;
      const typedState  = state  as unknown as RootState;
      const id          = typedAction.payload;
      const cached      = typedState.property.propertyDetailById[id];

      // Skip network call — data already in cache
      if (cached?.fetchState.status === "completed") return EMPTY;

      return from(api.getPropertyDetail(id)).pipe(
        mergeMap((data) =>
          of(
            fetchPropertyByIdSuccess({ id, property: data.property }),
            fetchUnitsForPropertySuccess({ propertyId: id, units: data.units }),
          ),
        ),
        catchError((err: Error) =>
          of(
            fetchPropertyByIdFailure({ id, error: err.message }),
            fetchUnitsForPropertyFailure({ propertyId: id, error: err.message }),
          ),
        ),
      );
    }),
  );

export const propertyEpics = combineEpics(
  fetchPropertiesSummaryEpic,
  fetchPropertyByIdEpic,
);
