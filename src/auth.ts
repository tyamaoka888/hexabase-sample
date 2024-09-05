import NextAuth, { Session, User } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { TYPES } from "@/shared/config/types";
import { container } from "@/shared/config/di";
import { HexabaseClientManager } from "@/server/infrastructure/config/hexabase";

export interface XUser extends User {
  token?: string | null;
}

// 独自のセッション型を定義
export interface XSession extends Session {
  user: XUser;
}

const credentialsConfig = CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "email", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials): Promise<XUser | null> {
    // Email と Password が入力されていない場合は null を返す
    if (!credentials.email || !credentials.password) {
      return null;
    }

    const hexabase = container.get<HexabaseClientManager>(
      TYPES.HexabaseClientManager,
    );

    // ユーザー認証処理
    await hexabase.login({
      email: credentials.email as string,
      password: credentials.password as string,
    });

    return {
      email: hexabase.client?.currentUser?.email as string,
      token: hexabase.client?.tokenHxb as string,
    };
  },
});

const config = {
  providers: [credentialsConfig],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 3600 * 24,
  },
  callbacks: {
    jwt: async ({ token, user }): Promise<JWT> => {
      if (user) {
        token.email = user.email as string;
        token.token = (user as XUser).token;
      }
      return token;
    },
    session: async ({ session, token }): Promise<XSession> => {
      if (session.user && token.email) {
        session.user.email = token.email as string;
        (session.user as unknown as XUser).token = token.token as string;
      }
      return session as unknown as XSession;
    },
  },
  // pages: {
  //   signIn: "/login", // カスタムサインインページのパス
  // },
  ...config,
});
