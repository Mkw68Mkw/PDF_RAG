import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Santia Lucia - Restaurant Chat",
  description: "Chat für das Restaurant Santia Lucia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-red-600 to-red-400`}>
        <header className="bg-red-900/90 backdrop-blur-lg py-6 shadow-2xl border-b border-red-800">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-center text-white font-serif tracking-tight">
              <span className="inline-block mr-3">🍕</span>
              Santia Lucia
              <span className="inline-block ml-3">🍷</span>
            </h1>
            <p className="text-center mt-2 text-red-100 text-lg">Traditionelle italienische Küche</p>
          </div>
        </header>
        
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        
        <footer className="bg-red-900/90 backdrop-blur-lg mt-12 py-6 border-t border-red-800">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center space-x-6 mb-4">
              <a href="#" className="text-red-100 hover:text-white transition-colors">Impressum</a>
              <a href="#" className="text-red-100 hover:text-white transition-colors">Datenschutz</a>
              <a href="#" className="text-red-100 hover:text-white transition-colors">Kontakt</a>
            </div>
            <p className="text-red-100 text-sm">
              &copy; {new Date().getFullYear()} Santia Lucia. 
              <span className="block sm:inline">Alle Rechte vorbehalten</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
