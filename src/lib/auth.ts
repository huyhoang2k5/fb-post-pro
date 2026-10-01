import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import prisma from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Tài khoản Sale / Marketing",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "marketing@company.com" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Tìm người dùng trong DB
        let user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        // Nếu người dùng chưa tồn tại trong dev, tự động khởi tạo tài khoản Admin/Marketer
        if (!user) {
          const hashedPassword = credentials.password
            ? await bcrypt.hash(credentials.password, 10)
            : null;

          user = await prisma.user.create({
            data: {
              email: credentials.email.toLowerCase(),
              name: credentials.email.split("@")[0],
              password: hashedPassword,
              role: "ADMIN",
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "MARKETER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fb_post_pro_super_secret_auth_key_12345",
};

/**
 * Lấy user session hiện tại từ server component hoặc API route
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
      });
      if (user) return user;
    }

    // Fallback: Tìm hoặc tạo 1 default user để hệ thống luôn vận hành trơn tru
    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: "marketing@fbpostpro.com",
          name: "Trưởng nhóm Marketing",
          role: "ADMIN",
        },
      });
    }
    return defaultUser;
  } catch (err) {
    console.error("Lỗi lấy currentUser:", err);
    return null;
  }
}
