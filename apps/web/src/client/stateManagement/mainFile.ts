import { configureStore } from "@reduxjs/toolkit";
import { createEpicMiddleware, combineEpics } from "redux-observable";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import { managerReducer } from "./managerDashboard/manager/managerSlice";
import { propertyReducer } from "./managerDashboard/property/propertySlice";
import { tenantReducer } from "./managerDashboard/tenant/tenantSlice";
import { leaseReducer } from "./managerDashboard/lease/leaseSlice";
import { paymentReducer } from "./managerDashboard/payment/paymentSlice";
import { unitReducer } from "./managerDashboard/unit/unitSlice";
import { tenantDashboardReducer } from "./tenantDashboard/tenantDashboardSlice";
import { managerEpics } from "./managerDashboard/manager/epics";
import { propertyEpics } from "./managerDashboard/property/epics";
import { tenantEpics } from "./managerDashboard/tenant/epics";
import { paymentEpics } from "./managerDashboard/payment/epics";
import { tenantDashboardEpics } from "./tenantDashboard/epics";

export const rootEpic = combineEpics(
  managerEpics,
  propertyEpics,
  tenantEpics,
  paymentEpics,
  tenantDashboardEpics,
);

const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
  reducer: {
    manager: managerReducer,
    property: propertyReducer,
    tenant: tenantReducer,
    lease: leaseReducer,
    payment: paymentReducer,
    unit: unitReducer,
    tenantDashboard: tenantDashboardReducer,
  },
  middleware: (getDefault) => getDefault().concat(epicMiddleware),
});

epicMiddleware.run(rootEpic);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
