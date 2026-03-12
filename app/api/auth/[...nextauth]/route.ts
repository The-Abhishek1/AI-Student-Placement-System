import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/app/lib/db/mongodb';
import User from '@/app/lib/db/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          console.log('Attempting login for:', credentials.email);
          
          await connectDB();
          
          // Find user and explicitly include password field
          const user = await User.findOne({ 
            email: credentials.email 
          }).select('+password');

          console.log('User found:', user ? 'Yes' : 'No');

          if (!user || !user.password) {
            console.log('User not found or no password');
            return null;
          }

          // Compare passwords
          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('Password correct:', isCorrectPassword);

          if (!isCorrectPassword) {
            return null;
          }

          // Update last login
          user.lastLogin = new Date();
          user.loginHistory = user.loginHistory || [];
          user.loginHistory.unshift({
            date: new Date(),
            ip: '127.0.0.1',
            device: 'Web Browser',
            location: 'Local'
          });
          await user.save();

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error('Authorize error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug logs
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };