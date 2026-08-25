import { Wallet, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200/50 dark:border-gray-700/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg p-1.5">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">InvestWise</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              AI-powered investment advisory platform helping you make smarter financial decisions.
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500 transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-2.5">
              {['Investment Advisor', 'Doc Analyzer', 'Video Guides'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-2.5">
              {['Mutual Funds', 'LIC Policies', 'Gold Rates', 'Post Office Schemes'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Disclaimer'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} InvestWise. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-md text-center sm:text-right">
              Disclaimer: Investment in financial instruments involves risks. Please read all scheme related documents carefully before investing.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
