import type { Metadata } from 'next';
import './globals.css';
import { AqiProvider } from '@/components/AqiProvider';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'AeroSense Dash',
  description: 'Real-time Air Quality Visualization',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <AqiProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <main className="p-4 md:p-8">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </AqiProvider>
        <Toaster />
      </body>
    </html>
  );
}

