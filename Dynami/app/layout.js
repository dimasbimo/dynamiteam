import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Dynami Team',
  description: 'Sistem manajemen keaktifan member squad Mobile Legends Dynami Team',
  icons: { icon: '/favicon.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="font-body bg-slate-950 text-slate-100 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
