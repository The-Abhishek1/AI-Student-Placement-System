import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { getServerSession } from 'next-auth';
import SessionProvider from './components/SessionProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EduPlace AI - Student Placement Intelligence',
  description: 'AI-powered student placement and career matching platform',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1F2937',
                color: '#fff',
                border: '1px solid #374151',
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}