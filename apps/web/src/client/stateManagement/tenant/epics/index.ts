import { combineEpics, type Epic } from "redux-observable";
import { switchMap, mergeMap, catchError } from "rxjs/operators";
import { from, of } from "rxjs";
import { ofType } from "redux-observable";
import { api } from "@/client/apiClient/client";
import {
  fetchTenantPayments,
  fetchTenantPaymentsSuccess,
  fetchTenantPaymentsFailure,
  fetchTenantProfile,
  fetchTenantProfileSuccess,
  fetchTenantProfileFailure,
  managerSendReminder,
  managerSendReminderSuccess,
  managerSendReminderFailure,
  managerMarkPaid,
  managerMarkPaidSuccess,
  managerMarkPaidFailure,
} from "../tenantSlice";

const fetchTenantPaymentsEpic: Epic = (action$) =>
  action$.pipe(
    ofType(fetchTenantPayments.type),
    mergeMap((action: ReturnType<typeof fetchTenantPayments>) =>
      from(api.getPayments(action.payload)).pipe(
        mergeMap((payments) =>
          of(fetchTenantPaymentsSuccess({ leaseId: action.payload, payments })),
        ),
        catchError((err: Error) =>
          of(fetchTenantPaymentsFailure({ leaseId: action.payload, error: err.message })),
        ),
      ),
    ),
  );

const managerSendReminderEpic: Epic = (action$) =>
  action$.pipe(
    ofType(managerSendReminder.type),
    mergeMap((action: ReturnType<typeof managerSendReminder>) =>
      from(api.sendReminder(action.payload.leaseId, action.payload.periodMonth)).pipe(
        mergeMap((payment) =>
          of(managerSendReminderSuccess({
            leaseId: action.payload.leaseId,
            payment,
          })),
        ),
        catchError((err: Error) =>
          of(managerSendReminderFailure({
            leaseId:     action.payload.leaseId,
            periodMonth: action.payload.periodMonth,
            error:       err.message,
          })),
        ),
      ),
    ),
  );

const managerMarkPaidEpic: Epic = (action$) =>
  action$.pipe(
    ofType(managerMarkPaid.type),
    mergeMap((action: ReturnType<typeof managerMarkPaid>) =>
      from(api.payRent(action.payload.leaseId, {
        periodMonth:     action.payload.periodMonth,
        paymentMethodId: "",
      })).pipe(
        mergeMap((payment) =>
          of(managerMarkPaidSuccess({ leaseId: action.payload.leaseId, payment })),
        ),
        catchError((err: Error) =>
          of(managerMarkPaidFailure({
            leaseId:     action.payload.leaseId,
            periodMonth: action.payload.periodMonth,
            error:       err.message,
          })),
        ),
      ),
    ),
  );

const fetchTenantProfileEpic: Epic = (action$) =>
  action$.pipe(
    ofType(fetchTenantProfile.type),
    mergeMap((action: ReturnType<typeof fetchTenantProfile>) =>
      from(api.getTenantProfile(action.payload)).pipe(
        mergeMap((profile) =>
          of(fetchTenantProfileSuccess({ id: action.payload, profile })),
        ),
        catchError((err: Error) =>
          of(fetchTenantProfileFailure({ id: action.payload, error: err.message })),
        ),
      ),
    ),
  );

export const tenantEpics = combineEpics(
  fetchTenantPaymentsEpic,
  fetchTenantProfileEpic,
  managerSendReminderEpic,
  managerMarkPaidEpic,
);
