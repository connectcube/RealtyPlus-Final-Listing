import React from "react";
import { cn } from "@/lib/utils";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps = {}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn("bg-slate-900 text-white py-8 px-4 md:px-8", className)}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">RealtyZambia</h3>
            <p className="text-slate-300 mb-4">
              Your trusted platform for finding the perfect property in Zambia.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-white hover:text-blue-400 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-white hover:text-pink-400 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-white hover:text-blue-400 transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/properties"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/agents"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Agents
                </Link>
              </li>
              <li>
                <Link
                  to="/agent/signup"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Agent Signup
                </Link>
              </li>
              <li>
                <Link
                  to="/agent/dashboard"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Agent Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/agent/subscription"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Subscription Packages
                </Link>
              </li>
              <li>
                <Link
                  to="/mortgage-calculator"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Mortgage Calculator
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-xl font-bold mb-4">Property Types</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/properties?type=residential"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Residential
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?type=commercial"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Commercial
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?type=land"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Land
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?type=rental"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Rental
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?type=new-developments"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  New Developments
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-slate-400" />
                <span className="text-slate-300">
                  123 Cairo Road, Lusaka, Zambia
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-slate-400" />
                <span className="text-slate-300">+260 97 1234567</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-slate-400" />
                <span className="text-slate-300">info@realtyzambia.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-6 text-center text-slate-400">
          <p>&copy; {currentYear} RealtyZambia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
