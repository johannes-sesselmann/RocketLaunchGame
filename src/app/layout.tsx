
import type {Metadata} from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Standard variable name for sans-serif
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono', // Standard variable name for monospace
});

export const metadata: Metadata = {
  title: 'Boost Brawl',
  description: 'A 2D rocket game: player vs AI. Reach targets to score!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster /> {/* Global Toaster for notifications */}
      </body>
    </html>
  );
}

