
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <img src="https://offersmonkey.com/favicon.ico" alt="OffersMonkey Logo" className="w-8 h-8 rounded-full" />
          <span className="text-xl font-bold">OffersMonkey</span>
        </div>
        <p className="text-gray-400 mb-4">
          Your smart shopping companion for the best deals
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-white transition-colors">About Us</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-800 text-gray-500 text-sm">
          © {new Date().getFullYear()} OffersMonkey. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
export default Footer;
