import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import NextAuth, { DefaultSession } from 'next-auth';

type Credentials = {
    email: string;
    password: string;
};

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            tenantId?: string;
        } & DefaultSession["user"];
    }
    interface User {
        tenantId?: string;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) return null;

                const isValid = await compare(credentials.password, user.password);
                if (!isValid) return null;

                // Importante: só retorna os campos necessários para o token!
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    tenantId: user.tenantId,
                };
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            // Só na primeira vez (login) o user existe
            if (user) {
                token.id = user.id;
                token.tenantId = user.tenantId;
            }
            return token;
        },
        async session({ session, token }) {
            // Passa o id e tenantId para a sessão exposta ao frontend
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.tenantId = token.tenantId as string | undefined;
            }
            return session;
        },
    },
};