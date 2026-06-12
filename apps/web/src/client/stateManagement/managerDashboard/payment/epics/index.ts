import { combineEpics, type Epic } from "redux-observable";
import { mergeMap, catchError } from "rxjs/operators";
import { from, of } from "rxjs";
import { ofType } from "redux-observable";
import { api } from "@/client/apiClient/client";
import {
  fetchTenantPayments,
  fetchTenantPaymentsSuccess,
  fetchTenantPaymentsFailure,
  fetchPaymentMethods,
  fetchPaymentMethodsSuccess,
  fetchPaymentMethodsFailure,
  tenantPayRent,
  tenantPayRentSuccess,
  tenantPayRentFailure,
  addPaymentMethod,
  addPaymentMethodSuccess,
  addPaymentMethodFailure,
  managerSendReminder,
  managerSendReminderSuccess,
  managerSendReminderFailure,
  managerMarkPaid,
  managerMarkPaidSuccess,
  managerMarkPaidFailure,
} from "../paymentSlice";

const fetchTenantPaymentsEpic: Epic = (action$) =>
  action$.pipe(
    ofType(fetchTenantPayments.type),
    mergeMap((action: ReturnType<typeof fetchTenantPayments>) =>
      from(api.getPayments(action.payload)).pipe(
        mergeMap((payments) =>
          of(
            fetchTenantPaymentsSuccess({
              leaseId: action.payload,
              payments,
            }),
          ),
        ),
        catchError((err: Error) =>
          of(
            fetchTenantPaymentsFailure({
              leaseId: action.payload,
              error: err.message,
            }),
          ),
        ),
      ),
    ),
  );

const managerSendReminderEpic: Epic = (action$) =>
  action$.pipe(
    ofType(managerSendReminder.type),
    mergeMap((action: ReturnType<typeof managerSendReminder>) =>
      from(
        api.sendReminder(action.payload.leaseId, action.payload.periodMonth),
      ).pipe(
        mergeMap((payment) =>
          of(
            managerSendReminderSuccess({
              leaseId: action.payload.leaseId,
              payment,
            }),
          ),
        ),
        catchError((err: Error) =>
          of(
            managerSendReminderFailure({
              leaseId: action.payload.leaseId,
              periodMonth: action.payload.periodMonth,
              error: err.message,
            }),
          ),
        ),
      ),
    ),
  );

const managerMarkPaidEpic: Epic = (action$) =>
  action$.pipe(
    ofType(managerMarkPaid.type),
    mergeMap((action: ReturnType<typeof managerMarkPaid>) =>
      from(
        api.payRent(action.payload.leaseId, {
          periodMonth: action.payload.periodMonth,
          paymentMethodId: "",
        }),
      ).pipe(
        mergeMap((payment) =>
          of(
            managerMarkPaidSuccess({
              leaseId: action.payload.leaseId,
              payment,
            }),
          ),
        ),
        catchError((err: Error) =>
          of(
            managerMarkPaidFailure({
              leaseId: action.payload.leaseId,
              periodMonth: action.payload.periodMonth,
              error: err.message,
            }),
          ),
        ),
      ),
    ),
  );

const fetchPaymentMethodsEpic: Epic = (action$) =>
  action$.pipe(
    ofType(fetchPaymentMethods.type),
    mergeMap((action: ReturnType<typeof fetchPaymentMethods>) =>
      from(api.getPaymentMethods(action.payload)).pipe(
        mergeMap((methods) =>
          of(fetchPaymentMethodsSuccess({ tenantId: action.payload, methods })),
        ),
        catchError((err: Error) =>
          of(fetchPaymentMethodsFailure({ tenantId: action.payload, error: err.message })),
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
          {
            periodMonth: action.payload.periodMonth,
            paymentMethodId: action.payload.paymentMethodId,
          },
          action.payload.fail,
        ),
      ).pipe(
        mergeMap((payment) =>
          of(tenantPayRentSuccess({ leaseId: action.payload.leaseId, payment })),
        ),
        catchError((err: Error) =>
          of(
            tenantPayRentFailure({
              leaseId: action.payload.leaseId,
              periodMonth: action.payload.periodMonth,
              error: err.message,
            }),
          ),
        ),
      ),
    ),
  );

const addPaymentMethodEpic: Epic = (action$) =>
  action$.pipe(
    ofType(addPaymentMethod.type),
    mergeMap((action: ReturnType<typeof addPaymentMethod>) =>
      from(api.addPaymentMethod(action.payload.tenantId, action.payload.label)).pipe(
        mergeMap((method) =>
          of(addPaymentMethodSuccess({ tenantId: action.payload.tenantId, method })),
        ),
        catchError((err: Error) =>
          of(addPaymentMethodFailure(err.message)),
        ),
      ),
    ),
  );

export const paymentEpics = combineEpics(
  fetchTenantPaymentsEpic,
  fetchPaymentMethodsEpic,
  tenantPayRentEpic,
  addPaymentMethodEpic,
  managerSendReminderEpic,
  managerMarkPaidEpic,
);
