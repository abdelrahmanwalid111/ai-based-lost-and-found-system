import './globals.css';
import { Inter } from 'next/font/google';
import Providers from './providers';
import ConditionalLayout from '@/app/components/ConditionalLayout';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'LostLink - Admin Dashboard',
  description: 'LostLink Admin Dashboard - Manage lost and found items efficiently',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// Enhanced script to prevent theme flash and ensure proper synchronization
const themeScript = `
  (function() {
    try {
      // Get theme from localStorage or system preference
      var theme = localStorage.getItem('theme');
      if (!theme || (theme !== 'light' && theme !== 'dark')) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      // Apply theme immediately to prevent flash
      var root = document.documentElement;
      var body = document.body;
      
      if (theme === 'dark') {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
        body.style.backgroundColor = '#0f172a';
        body.style.color = '#f8fafc';
        body.style.transition = 'background-color 0.2s ease, color 0.2s ease';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
        body.style.backgroundColor = '#f9fafb';
        body.style.color = '#111827';
        body.style.transition = 'background-color 0.2s ease, color 0.2s ease';
      }
      
      // Store the applied theme for React hydration
      window.__INITIAL_THEME__ = theme;
      
    } catch (e) {
      // Fallback to light theme
      var root = document.documentElement;
      var body = document.body;
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      body.style.backgroundColor = '#f9fafb';
      body.style.color = '#111827';
      body.style.transition = 'background-color 0.2s ease, color 0.2s ease';
      window.__INITIAL_THEME__ = 'light';
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
