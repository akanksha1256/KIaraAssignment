import { combineEpics, type Epic } from "redux-observable";
import { mergeMap, catchError } from "rxjs/operators";
import { from, of } from "rxjs";
import { ofType } from "redux-observable";
import { api } from "@/client/apiClient/client";
import {
  tenantFetchPayments,
  tenantFetchPaymentsSuccess,
  tenantFetchPaymentsFailure,
  tenantFetchPaymentMethods,
  tenantFetchPaymentMethodsSuccess,
  tenantFetchPaymentMethodsFailure,
  tenantPayRent,
  tenantPayRentSuccess,
  tenantPayRentFailure,
  tenantAddPaymentMethod,
  tenantAddPaymentMethodSuccess,
  tenantAddPaymentMethodFailure,
} from "../tenantPaymentSlice";

const tenantFetchPaymentsEpic: Epic = (action$) =>
  action$.pipe(
    ofType(tenantFetchPayments.type),
    mergeMap((action: ReturnType<typeof tenantFetchPayments>) =>
      from(api.getPayments(action.payload)).pipe(
        mergeMap((payments) =>
          of(tenantFetchPaymentsSuccess({ leaseId: action.payload, payments })),
        ),
        catchError((err: Error) =>
          of(tenantFetchPaymentsFailure({ leaseId: action.payload, error: err.message })),
        ),
      ),
    ),
  );

const tenantFetchPaymentMethodsEpic: Epic = (action$) =>
  action$.pipe(
    ofType(tenantFetchPaymentMethods.type),
    mergeMap((action: ReturnType<typeof tenantFetchPaymentMethods>) =>
      from(api.getPaymentMethods(action.payload)).pipe(
        mergeMap((methods) =>
          of(tenantFetchPaymentMethodsSuccess({ tenantId: action.payload, methods })),
        ),
        catchError((err: Error) =>
          of(tenantFetchPaymentMethodsFailure({ tenantId: action.payload, error: err.message })),
        ),
      ),
    ),
  );

const tenantPayRentEpic: Epic = (action$) =>
  action$.pipe(
    ofType(tenantPayRent.type),
    mergeMap((action: ReturnType<typeof tenantPayRent>) =>
      from(
        api.payRent(
          action.payload.leaseId,
          { periodMonth: action.payload.periodMonth, paymentMethodId: action.payload.paymentMethodId },
          action.payload.fail,
        ),
      ).pipe(
        mergeMap((payment) =>
          of(tenantPayRentSuccess({ leaseId: action.payload.leaseId, payment })),
        ),
        catchError((err: Error) =>
          of(
            tenantPayRentFailure({
              leaseId:     action.payload.leaseId,
              periodMonth: action.payload.periodMonth,
              error:       err.message,
            }),
          ),
        ),
      ),
    ),
  );

const tenantAddPaymentMethodEpic: Epic = (action$) =>
  action$.pipe(
    ofType(tenantAddPaymentMethod.type),
    mergeMap((action: ReturnType<typeof tenantAddPaymentMethod>) =>
      from(api.addPaymentMethod(action.payload.tenantId, action.payload.label)).pipe(
        mergeMap((method) =>
          of(tenantAddPaymentMethodSuccess({ tenantId: action.payload.tenantId, method })),
        ),
        catchError((err: Error) =>
          of(tenantAddPaymentMethodFailure(err.message)),
        ),
      ),
    ),
  );

export const tenantPaymentEpics = combineEpics(
  tenantFetchPaymentsEpic,
  tenantFetchPaymentMethodsEpic,
  tenantPayRentEpic,
  tenantAddPaymentMethodEpic,
);
