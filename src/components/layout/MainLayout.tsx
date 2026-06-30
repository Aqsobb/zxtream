import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      {/* Galaxy background */}
      <div className="bg-galaxy" />

      {/* Animated stars layer */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${1.5 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <Sidebar />
      <Header />
      <main className="relative z-10 lg:ml-64 pt-16 min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  );
}
