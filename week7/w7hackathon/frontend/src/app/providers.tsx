"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { ThemeRegistry } from "@/theme/ThemeRegistry";
import { GlobalSnackbar } from "@/components/shared/GlobalSnackbar";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeRegistry>
        {children}
        <GlobalSnackbar />
      </ThemeRegistry>
    </Provider>
  );
}
