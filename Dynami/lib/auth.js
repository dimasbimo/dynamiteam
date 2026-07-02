const CredentialsProvider = require('next-auth/providers/credentials').default;
const bcrypt = require('bcryptjs');
const { prisma } = require('./prisma');

const authOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'ID Login', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username.toLowerCase().trim() },
          include: { member: true },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          username: user.username,
          role: user.role,
          memberId: user.memberId || null,
          nama: user.member ? user.member.nama : 'Admin',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.memberId = user.memberId;
        token.nama = user.nama;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.memberId = token.memberId;
      session.user.nama = token.nama;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

module.exports = { authOptions };