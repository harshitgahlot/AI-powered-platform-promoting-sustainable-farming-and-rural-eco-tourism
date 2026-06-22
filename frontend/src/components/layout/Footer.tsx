import React from 'react';
import { Sprout, Mail, Phone, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-xl font-extrabold text-primary-400">
              <Sprout className="w-6 h-6" />
              <span>RuralConnect AI</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Empowering farmers, homestay owners, and rural entrepreneurs to grow together through eco-tourism, local commerce, and advanced analytics.
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 mb-4">Ecosystem</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Farms Experiences</li>
              <li>Organic Homestays</li>
              <li>Local Marketplace</li>
              <li>Sustainable Practices</li>
            </ul>
          </div>

          {/* Contacts Column */}
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 mb-4">Contact Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400" />
                info@ruralconnect.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400" />
                +91 98765 43210
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} RuralConnect AI Platform. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-4 md:mt-0">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for sustainable rural growth.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
