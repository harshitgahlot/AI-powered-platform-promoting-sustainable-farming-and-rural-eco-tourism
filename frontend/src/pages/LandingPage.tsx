import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Compass, ShoppingBag, BarChart4, ArrowRight, Star } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Decorative Blob */}
      <div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 -z-10 h-80 w-80 rounded-full bg-primary-600/5 blur-3xl" />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/5 dark:bg-primary-950/20 text-xs font-bold text-primary-600 dark:text-primary-400">
          <Sprout className="w-4 h-4 animate-bounce" />
          <span>Bridging Rural Growth & Sustainable Travel</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Empowering Rural Communities <br />
          Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500">AI-Driven Ecosystems</span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          RuralConnect AI links organic farmers, eco-lodges, and rural artisans directly with conscious tourists and buyers. Boost your income, share your culture, and support biodiversity.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link to="/marketplace">
            <Button variant="primary" size="lg" className="gap-2">
              Explore Marketplace <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="glass" size="lg">
              Join as Partner
            </Button>
          </Link>
        </div>
      </section>

      {/* Core Services grid  */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-12">
          An Integrated Four-Layer Ecosystem
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hoverEffect className="space-y-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit rounded-xl">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Agri-Allied Services</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Farming profiles highlighting sustainable techniques. Direct customer visit booking for farm experiences and workshops.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit rounded-xl">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Eco-Tourism Booking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Find beautiful community-owned homestays. Set reservations, coordinate calendar booking, and experience local culture.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Farm Marketplace</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Order fresh products directly from rural farmers. Secure cart checkouts, orders inventory tracking, and direct local shipping.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4">
            <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit rounded-xl">
              <BarChart4 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">AI & Analytics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Advanced similarity recommendation matching. Chatbot tourist assistance, reviews sentiment scoring, and sales forecasting.
            </p>
          </Card>
        </div>
      </section>

      {/* Featured Testimonial */}
      <section className="bg-slate-100 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <div className="flex justify-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
          </div>
          <blockquote className="text-lg font-medium italic text-slate-700 dark:text-slate-300">
            "Using RuralConnect AI, we welcomed over 40 guests to our organic apple farm. Our homestay occupancy increased by 60%, and we sell our apple cider honey directly on the marketplace. It has transformed our local village!"
          </blockquote>
          <div>
            <cite className="text-sm font-extrabold text-slate-900 dark:text-white not-italic">Ramesh Kumar</cite>
            <p className="text-xs text-slate-500">Farmer Partner from Himachal Pradesh</p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
