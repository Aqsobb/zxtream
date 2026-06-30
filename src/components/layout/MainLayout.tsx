import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      {/* Subtle ambient bg - no animations, no lag */}
      <div className="bg-ambient" />

      <Sidebar />
      <Header />
      <main className="relative z-10 lg:ml-64 pt-16 min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  );
}
