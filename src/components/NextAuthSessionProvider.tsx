"use client";

import React, { FC } from "react";
import { SessionProvider, SessionProviderProps } from "next-auth/react";

const NextAuthSessionProvider: FC<SessionProviderProps> = ({
  children,
  session,
}) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default NextAuthSessionProvider;
