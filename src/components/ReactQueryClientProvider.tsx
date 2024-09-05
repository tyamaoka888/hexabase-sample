"use client";

import React, { FC, ReactNode } from "react";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";

interface ReactQueryClientProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

const ReactQueryClientProvider: FC<ReactQueryClientProviderProps> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryClientProvider;
