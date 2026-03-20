import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import Sentry from "./config/sentry.js";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import "./index.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 1, // 1 minute - data is considered fresh for 1 min
            gcTime: 1000 * 60 * 10, // 10 minutes - unused data stays in cache for 10 mins (formerly cacheTime)
            retry: 1, // Retry failed requests once
            refetchOnWindowFocus: false, // Don't refetch when window regains focus (set to true if you want fresh data)
        },
        mutations: {
            retry: false, // Don't retry failed mutations
        },
    },
});

createRoot(document.getElementById("root")!, {
    onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
        console.warn("Uncaught error", error, errorInfo.componentStack);
    }),
    onCaughtError: Sentry.reactErrorHandler(),
    onRecoverableError: Sentry.reactErrorHandler(),
}).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </StrictMode>,
);
