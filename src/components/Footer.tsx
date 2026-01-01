import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#333] bg-[#111111] pb-20 md:pb-8 md:ml-16 w-full md:w-[calc(100%-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 overflow-hidden">
          {/* About Section */}
          <div className="min-w-0">
            <h3 className="text-white font-semibold mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-base">About</h3>
            <ul className="space-y-1 sm:space-y-1.5 md:space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm break-words"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm break-words"
                >
                  Press
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm break-words"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="min-w-0">
            <h3 className="text-white font-semibold mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-base">Legal</h3>
            <ul className="space-y-1 sm:space-y-1.5 md:space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm break-words"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm break-words"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/copyright"
                  className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm break-words"
                >
                  Copyright Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="min-w-0">
            <h3 className="text-white font-semibold mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-base">Support</h3>
            <ul className="space-y-1 sm:space-y-1.5 md:space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm break-words"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm break-words"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm break-words"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Section */}
          <div className="min-w-0">
            <h3 className="text-white font-semibold mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-base">Connect</h3>
            <ul className="space-y-1 sm:space-y-1.5 md:space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm break-words"
                >
                  Blog
                </Link>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm break-words"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm break-words"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-[#333] pt-4 sm:pt-5 md:pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 md:gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              © {currentYear} UniTube. All rights reserved.
            </p>
            <div className="flex gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm flex-wrap justify-center sm:justify-end">
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

