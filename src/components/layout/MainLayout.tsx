import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />
      <main className="lg:ml-64 pt-16 min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  );
}
