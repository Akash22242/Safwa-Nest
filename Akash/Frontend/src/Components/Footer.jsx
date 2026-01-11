import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaBell, FaUser, FaInfoCircle, FaClipboardList, FaLock } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-10">
      <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-3 gap-8">
        
        {/* Company Info */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Our Company</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            We deliver smart and secure web solutions designed to make your
            organization efficient and future-ready.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li><Link to="/home" className="hover:text-white flex items-center gap-2"><FaHome /> Home</Link></li>
            <li><Link to="/notice" className="hover:text-white flex items-center gap-2"><FaBell /> Notice</Link></li>
            <li><Link to="/attendance" className="hover:text-white flex items-center gap-2"><FaClipboardList /> Attendance</Link></li>
            <li><Link to="/profile" className="hover:text-white flex items-center gap-2"><FaUser /> Profile</Link></li>
            <li><Link to="/about" className="hover:text-white flex items-center gap-2"><FaInfoCircle /> About</Link></li>
          </ul>
        </div>

        {/* Admin Login */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Admin Access</h2>
          <Link
            to="/admin-login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition"
          >
            <FaLock /> Admin Login
          </Link>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-8 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} Your Company Name — All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
