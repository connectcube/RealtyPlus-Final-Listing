import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle, Users, Building, Award, MapPin } from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-realtyplus py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              About RealtyPlus
            </h1>
            <p className="text-lg text-white/90 max-w-3xl mx-auto mb-8">
              The leading real estate platform in Zambia, connecting property
              buyers, sellers, and renters with the best agents and listings
              across the country.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-realtyplus hover:bg-gray-100"
              >
                <Link to="/properties">Browse Properties</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white/10"
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <Badge className="mb-4 bg-realtyplus/10 text-realtyplus hover:bg-realtyplus/20">
                Our Mission
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Transforming Real Estate in Zambia
              </h2>
              <p className="text-lg text-gray-600">
                Our mission is to simplify the property journey for everyone in
                Zambia. We're building a transparent, efficient, and accessible
                real estate marketplace that empowers both professionals and
                consumers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <Card className="bg-gray-50 border-none">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-realtyplus/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-realtyplus" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    For Buyers & Renters
                  </h3>
                  <p className="text-gray-600">
                    We provide the most comprehensive property listings with
                    detailed information, high-quality images, and tools to make
                    informed decisions.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-none">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-realtyplus/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="h-6 w-6 text-realtyplus" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">For Sellers</h3>
                  <p className="text-gray-600">
                    We connect property owners with qualified buyers and
                    renters, providing maximum exposure and efficient
                    transaction processes.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-none">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-realtyplus/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-realtyplus" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">For Agents</h3>
                  <p className="text-gray-600">
                    We offer powerful tools and platforms for real estate
                    professionals to showcase properties, manage listings, and
                    grow their business.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-realtyplus/10 text-realtyplus hover:bg-realtyplus/20">
                  Our Story
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Building Zambia's Premier Real Estate Platform
                </h2>
                <p className="text-gray-600 mb-6">
                  Founded in 2023, RealtyPlus was born from a vision to
                  revolutionize the real estate market in Zambia. We recognized
                  the challenges faced by property seekers and professionals
                  alike - from lack of reliable information to inefficient
                  processes.
                </p>
                <p className="text-gray-600 mb-6">
                  Starting with a small team of real estate enthusiasts and
                  technology experts, we've grown to become the most trusted
                  property platform in the country, serving thousands of users
                  daily.
                </p>
                <p className="text-gray-600">
                  Our journey continues as we expand our services across Zambia
                  and into neighboring countries, constantly innovating to
                  provide the best real estate experience in Africa.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80"
                    alt="Modern office building"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-lg mt-8">
                  <img
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&q=80"
                    alt="Luxury property"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80"
                    alt="Residential home"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-lg mt-8">
                  <img
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80"
                    alt="Modern apartment"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <Badge className="mb-4 bg-realtyplus/10 text-realtyplus hover:bg-realtyplus/20">
                Our Values
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What Drives Us Every Day
              </h2>
              <p className="text-lg text-gray-600">
                Our core values shape everything we do at RealtyPlus, from how
                we build our platform to how we interact with our users and
                partners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-realtyplus" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Transparency</h3>
                  <p className="text-gray-600">
                    We believe in complete transparency in all property
                    information, pricing, and processes, helping users make
                    confident decisions.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-realtyplus" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                  <p className="text-gray-600">
                    We continuously innovate our platform and services to solve
                    real estate challenges and improve user experiences.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-realtyplus" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Integrity</h3>
                  <p className="text-gray-600">
                    We operate with the highest standards of integrity, ensuring
                    trust and reliability in all our interactions and services.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-realtyplus" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Accessibility</h3>
                  <p className="text-gray-600">
                    We're committed to making real estate information and
                    services accessible to everyone across Zambia, regardless of
                    location or background.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <Badge className="mb-4 bg-realtyplus/10 text-realtyplus hover:bg-realtyplus/20">
                Our Team
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Meet the People Behind RealtyPlus
              </h2>
              <p className="text-lg text-gray-600">
                Our diverse team combines expertise in real estate, technology,
                and customer service to deliver the best property platform in
                Zambia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {/* Team Member 1 */}
              <div className="text-center">
                <div className="mb-4 relative mx-auto w-48 h-48 rounded-full overflow-hidden">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                    alt="John Mwanza"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold">John Mwanza</h3>
                <p className="text-realtyplus font-medium">CEO & Founder</p>
                <p className="text-gray-600 mt-2">
                  15+ years in real estate and technology leadership
                </p>
              </div>

              {/* Team Member 2 */}
              <div className="text-center">
                <div className="mb-4 relative mx-auto w-48 h-48 rounded-full overflow-hidden">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                    alt="Sarah Tembo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold">Sarah Tembo</h3>
                <p className="text-realtyplus font-medium">COO</p>
                <p className="text-gray-600 mt-2">
                  Expert in operations and real estate market analysis
                </p>
              </div>

              {/* Team Member 3 */}
              <div className="text-center">
                <div className="mb-4 relative mx-auto w-48 h-48 rounded-full overflow-hidden">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=David"
                    alt="David Phiri"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold">David Phiri</h3>
                <p className="text-realtyplus font-medium">CTO</p>
                <p className="text-gray-600 mt-2">
                  Technology innovator with focus on user experience
                </p>
              </div>

              {/* Team Member 4 */}
              <div className="text-center">
                <div className="mb-4 relative mx-auto w-48 h-48 rounded-full overflow-hidden">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mary"
                    alt="Mary Banda"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold">Mary Banda</h3>
                <p className="text-realtyplus font-medium">Head of Marketing</p>
                <p className="text-gray-600 mt-2">
                  Digital marketing specialist with real estate background
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Location */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-realtyplus/10 text-realtyplus hover:bg-realtyplus/20">
                  Our Location
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Visit Our Office
                </h2>
                <p className="text-gray-600 mb-6">
                  Our headquarters is located in the heart of Lusaka, with
                  regional offices across major cities in Zambia. We're always
                  happy to meet our users and partners in person.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-realtyplus mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Headquarters</h3>
                      <p className="text-gray-600">
                        123 Cairo Road, Lusaka, Zambia
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-realtyplus mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Copperbelt Office</h3>
                      <p className="text-gray-600">
                        45 Independence Avenue, Kitwe, Zambia
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-realtyplus mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">
                        Southern Province Office
                      </h3>
                      <p className="text-gray-600">
                        78 Mosi-oa-Tunya Road, Livingstone, Zambia
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="mt-8 bg-realtyplus hover:bg-realtyplus-dark">
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>

              <div className="h-[400px] rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15461.965147237144!2d28.2833!3d-15.4167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19408b8cfa7a6b7d%3A0x2b5c3a0f0bd2a1be!2sKabulonga%2C%20Lusaka%2C%20Zambia!5e0!3m2!1sen!2sus!4v1625764298760!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="RealtyPlus Office Location"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-realtyplus">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Find Your Perfect Property?
            </h2>
            <p className="text-lg text-white/90 max-w-3xl mx-auto mb-8">
              Join thousands of satisfied users who have found their dream homes
              through RealtyPlus.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-realtyplus hover:bg-gray-100"
              >
                <Link to="/properties">Browse Properties</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white/10"
              >
                <Link to="/list-property">List Your Property</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
