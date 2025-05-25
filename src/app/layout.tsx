import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Magic Link Auth',
  description: 'Secure authentication with magic links',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}