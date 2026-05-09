import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "ZKTeco Attendance Portal",
  description: "Attendance Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <main className="flex-1">
            {children}
          </main>
          <footer className="py-6 border-t bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-2">
              <p className="text-sm text-slate-500 font-medium">
                © {new Date().getFullYear()} ZKTeco Attendance Portal. All rights reserved.
              </p>
              <p className="text-xs text-slate-400">
                Developed by <a href="https://ashirarif.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">Ashir Arif</a>
              </p>
            </div>
          </footer>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
