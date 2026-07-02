import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Dynami Team',
  description: 'Sistem manajemen keaktifan member squad Mobile Legends DynamiTeam',
  icons: { icon: '/favicon.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="font-body text-slate-100 min-h-screen" style={{ backgroundColor: '#070a12' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
