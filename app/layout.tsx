import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Briefly - Turn Messy Client Requests into Clear Project Briefs',
  description:
    'Turn messy client requests into clear, actionable project briefs with scope, timelines, unknowns, risks, and next steps.',
  openGraph: {
    title: 'Briefly - Turn Messy Client Requests into Clear Project Briefs',
    description:
      'Turn messy client requests into clear, actionable project briefs with scope, timelines, unknowns, risks, and next steps.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Briefly - Turn Messy Client Requests into Clear Project Briefs',
    description:
      'Turn messy client requests into clear, actionable project briefs with scope, timelines, unknowns, risks, and next steps.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased min-h-screen">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
