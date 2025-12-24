import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { BentoGrid } from '@/components/landing/BentoGrid';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <BentoGrid />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
