import { configureStore } from "@reduxjs/toolkit";
import { createEpicMiddleware, combineEpics } from "redux-observable";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { managerReducer } from "./manager/managerSlice";
import { propertyReducer } from "./property/propertySlice";
import { tenantReducer } from "./tenant/tenantSlice";
import { managerEpics } from "./manager/epics";
import { propertyEpics } from "./property/epics";
import { tenantEpics } from "./tenant/epics";

export const rootEpic = combineEpics(managerEpics, propertyEpics, tenantEpics);

const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
  reducer: {
    manager:  managerReducer,
    property: propertyReducer,
    tenant:   tenantReducer,
  },
  middleware: (getDefault) => getDefault().concat(epicMiddleware),
});

epicMiddleware.run(rootEpic);

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch              = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
