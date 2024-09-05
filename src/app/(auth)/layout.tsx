import React, { FC, ReactNode } from "react";
import { auth, XSession } from "@/auth";
import { redirect } from "next/navigation";
import { container } from "@/shared/config/di";
import { TYPES } from "@/shared/config/types";
import { HexabaseClientManager } from "@/server/infrastructure/config/hexabase";

interface AuthLayoutProps {
  children: ReactNode;
}

const hexabase = container.get<HexabaseClientManager>(
  TYPES.HexabaseClientManager,
);

const AuthLayout: FC<AuthLayoutProps> = async ({ children }) => {
  try {
    const session = (await auth()) as XSession | null;

    if (!session?.user.token) {
      redirect("/");
    }

    if (!hexabase.isInitialized()) {
      await hexabase.login({ token: session.user.token });
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Authentication error:", error);
    redirect("/");
  }
};

export default AuthLayout;
