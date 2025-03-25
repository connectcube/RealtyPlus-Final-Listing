import React from "react";
import { Button } from "../ui/button";
import { MapPin, Phone, Mail } from "lucide-react";

interface ContactSectionProps {
  address?: string;
  phone?: string;
  email?: string;
}

const ContactSection = ({
  address = "123 Cairo Road, Lusaka, Zambia",
  phone = "+260 97 1234567",
  email = "info@realtyzambia.com",
}: ContactSectionProps) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Have questions about a property or need assistance? Our team is
              here to help you every step of the way.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-realtyplus mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold">Our Office</h3>
                  <p className="text-gray-600">{address}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-realtyplus mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-gray-600">{phone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-realtyplus mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-600">{email}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-6">Send us a Message</h3>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-realtyplus focus:border-realtyplus"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-realtyplus focus:border-realtyplus"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-realtyplus focus:border-realtyplus"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <Button className="w-full bg-realtyplus hover:bg-realtyplus-dark text-white py-3">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
