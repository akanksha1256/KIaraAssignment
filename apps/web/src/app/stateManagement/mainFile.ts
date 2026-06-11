import { configureStore } from "@reduxjs/toolkit";
import { createEpicMiddleware, combineEpics } from "redux-observable";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { managerReducer } from "./manager/managerSlice";
import { managerEpics }   from "./manager/epics";

export const rootEpic = combineEpics(managerEpics);

const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
  reducer: { manager: managerReducer },
  middleware: (getDefault) => getDefault().concat(epicMiddleware),
});

epicMiddleware.run(rootEpic);

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch                   = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState>     = useSelector;
