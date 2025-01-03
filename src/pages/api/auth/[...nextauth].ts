import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for generating JWTs
import { NextApiRequest, NextApiResponse } from 'next';

// Extend NextAuth User type to include accessToken and username
declare module 'next-auth' {
  interface User {
    accessToken: string;
    username: string; // Ensure username is included in the User type
  }

  interface Session {
    user: User;
  }
}

const prisma = new PrismaClient();

// Secret key for JWT signing (should be in environment variables for production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials): Promise<NextAuthUser | null> => {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error('Missing identifier or password');
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          },
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        });

        if (!user) {
          throw new Error('User not found');
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error('Invalid email/username or password');
        }

        const permissions = user.role?.permissions
          .filter((rp) => rp.permission !== null) // Filter out null permissions
          .map((rp) => rp.permission!.name) || []; // Use non-null assertion safely after filtering

        // Generate the access token using JWT
        const accessToken = jwt.sign(
          {
            id: user.id,
            username: user.username,
            role: user.role?.name || '',
            permissions,
          },
          JWT_SECRET,
          { expiresIn: '1h' } // You can customize the expiry as needed
        );

        // Return user object with extended properties
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          username: user.username, // Ensure username is included
          role: user.role?.name || '',
          permissions,
          accessToken, // Include access token
        } as NextAuthUser & { username: string; accessToken: string }; // Explicitly cast to include new properties
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || ''; // Ensure role is always a string
        token.permissions = user.permissions || [];
        token.accessToken = user.accessToken || ''; // Store access token in JWT
        token.username = user.username || ''; // Ensure username is included in token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          role: token.role as string, // Explicitly include role
          permissions: token.permissions as string[], // Ensure permissions are string[]
          accessToken: token.accessToken as string, // Attach access token to session
          username: token.username as string, // Attach username to session
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, authOptions);
}
