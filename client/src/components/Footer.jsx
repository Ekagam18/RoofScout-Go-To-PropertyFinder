import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[#134074] text-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center font-bold text-4xl">
              <h1 className="text-2xl font-bold text-yellow-500">
                <Link to="/">Roof</Link>
              </h1>
              <h1 className="text-2xl font-bold text-blue-600 ml-1">
                <Link to="/">Scout</Link>
              </h1>
            </div>
            <p className="text-sm text-gray-400">
              Your trusted property partner for buying and renting homes.
            </p>
            <div className="flex space-x-4 mt-4 gap-4 text-white">
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
          <div className="md:ml-12">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/" className="hover:text-[#d9ed92] transition-colors text-white">Home</Link>
              </li>
              <li>
                <Link to="/allproperties" className="hover:text-[#d9ed92] transition-colors text-white">Buy Property</Link>
              </li>
              <li>
                <Link to="/postproperty" className="hover:text-[#d9ed92] transition-colors text-white">Sell Property</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Explore</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/allproperties" className="hover:text-[#d9ed92] transition-colors text-white">Apartments for Rent</Link>
              </li>
              <li>
                <Link to="/allproperties" className="hover:text-[#d9ed92] transition-colors text-white">Houses for Sale</Link>
              </li>
              <li>
                <Link to="/states?state=punjab" className="hover:text-[#d9ed92] transition-colors text-white">Properties in Punjab</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center">
                <span className="mr-3 text-yellow-500">📞</span>
                <a href="tel:+911234567890" className="hover:text-[#d9ed92] transition-colors text-white">+91 1234567890</a>
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-yellow-500">📧</span>
                <a href="mailto:hello@gmail.com" className="hover:text-[#d9ed92] transition-colors text-white">RoofScout@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

