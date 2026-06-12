"use client";

import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/client/stateManagement/mainFile";
import { ToastProvider } from "@/client/commonComponents/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ToastProvider>{children}</ToastProvider>
    </ReduxProvider>
  );
}
