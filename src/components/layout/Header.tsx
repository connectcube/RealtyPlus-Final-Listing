import React from "react";
import { Link } from "react-router-dom";
import {
  Search,
  User,
  Menu,
  X,
  Phone,
  MapPin,
  Heart,
  Bell,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, fireDataBase } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface HeaderProps {
  className?: string;
}
interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: "user" | "agent" | "admin";
  phoneNumber?: string;
}
const Header = ({ className }: HeaderProps = {}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const checkLogin = () => {
      // Firebase provides a listener for auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
        if (authUser) {
          try {
            // Fetch additional user data from Firestore
            const userDoc = await getDoc(
              doc(fireDataBase, "users", authUser.uid)
            );

            if (userDoc.exists()) {
              // Combine auth user data with Firestore data
              setUser({
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                photoURL: authUser.photoURL,
                ...userDoc.data(), // Spread in additional Firestore data
              });
            } else {
              // If no Firestore document exists, just use auth data
              setUser({
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                photoURL: authUser.photoURL,
              });
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            // Still set basic user data even if Firestore fetch fails
            setUser({
              uid: authUser.uid,
              email: authUser.email,
            });
          }
        } else {
          // User is signed out
          setUser(null);
        }
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    };

    checkLogin();
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // You can add navigation here if needed
      // navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <>
      {/* Top Bar */}
      <div className="bg-realtyplus text-white py-2 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              <span>+260 97 1234567</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>123 Cairo Road, Lusaka, Zambia</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <Link to="/about" className="hover:text-white/80">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-white/80">
              Contact
            </Link>
            <Link to="/blog" className="hover:text-white/80">
              Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "w-full bg-white sticky top-0 z-50 transition-all duration-300",
          isScrolled ? "shadow-md py-2" : "shadow-sm py-4",
          className
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/realtyplus-logo.svg"
                alt="RealtyPlus Logo"
                className="h-8 sm:h-10 w-auto"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://api.dicebear.com/7.x/initials/svg?seed=RP";
                }}
              />
              <span className="ml-2 text-lg sm:text-xl font-bold text-realtyplus hidden sm:inline">
                RealtyPlus
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/properties"
                className="text-gray-700 hover:text-realtyplus font-medium"
              >
                All Properties
              </Link>
              <Link
                to="/buy"
                className="text-gray-700 hover:text-realtyplus font-medium"
              >
                Buy
              </Link>
              <Link
                to="/rent"
                className="text-gray-700 hover:text-realtyplus font-medium"
              >
                Rent
              </Link>
              <Link
                to="/agents"
                className="text-gray-700 hover:text-realtyplus font-medium"
              >
                Agents
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="text-gray-700 hover:text-realtyplus font-medium">
                  More
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link to="/agent/subscription" className="w-full">
                      Subscription Packages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/mortgage-calculator" className="w-full">
                      Mortgage Calculator
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/property-news" className="w-full">
                      Property News
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/faq" className="w-full">
                      FAQ
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Search and User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search properties..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-realtyplus focus:ring focus:ring-realtyplus/20 focus:ring-opacity-50"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>

              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-realtyplus">
                  2
                </Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full relative"
                  >
                    <User className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-realtyplus">
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 text-center">
                    <p className="text-sm font-medium">
                      Welcome to RealtyZambia
                    </p>
                  </div>
                  <DropdownMenuSeparator />

                  {!user ? (
                    <>
                      <DropdownMenuItem>
                        <Link to="/login" className="w-full">
                          Login
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/register" className="w-full">
                          Register
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem>
                        <div className="flex items-center gap-2 w-full">
                          <img
                            src={user.photoURL || "/default-avatar.png"}
                            alt="Profile"
                            className="w-6 h-6 rounded-full"
                          />
                          <span>{user.displayName || user.email}</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/agent/signup" className="w-full">
                          Register as Agent
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left text-red-600 hover:text-red-700"
                        >
                          Sign Out
                        </button>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to="/agent/signup" className="w-full">
                      Register as Agent
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to="/agency/signup" className="w-full">
                      Register as Agency
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link
                      to="/saved-properties"
                      className="w-full flex items-center"
                    >
                      <Heart className="mr-2 h-4 w-4" /> Saved Properties
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      to="/notifications"
                      className="w-full flex items-center"
                    >
                      <Bell className="mr-2 h-4 w-4" /> Notifications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/agent/dashboard" className="w-full">
                      Agent Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/agent/subscription" className="w-full">
                      Subscription Packages
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button className="bg-realtyplus hover:bg-realtyplus-dark text-white">
                <Link to="/list-property" className="text-white">
                  List Property
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/properties"
                  className="text-gray-700 hover:text-realtyplus font-medium py-2"
                >
                  All Properties
                </Link>
                <Link
                  to="/buy"
                  className="text-gray-700 hover:text-realtyplus font-medium py-2"
                >
                  Buy
                </Link>
                <Link
                  to="/rent"
                  className="text-gray-700 hover:text-realtyplus font-medium py-2"
                >
                  Rent
                </Link>
                <Link
                  to="/agents"
                  className="text-gray-700 hover:text-realtyplus font-medium py-2"
                >
                  Agents
                </Link>
                <Link
                  to="/mortgage-calculator"
                  className="text-gray-700 hover:text-realtyplus font-medium py-2"
                >
                  Mortgage Calculator
                </Link>
                <Link
                  to="/saved-properties"
                  className="text-gray-700 hover:text-realtyplus font-medium py-2 flex items-center"
                >
                  <Heart className="mr-2 h-4 w-4" /> Saved Properties
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-realtyplus font-medium py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-gray-700 hover:text-realtyplus font-medium py-2"
                >
                  Register
                </Link>
                <Link
                  to="/agent/signup"
                  className="text-gray-700 hover:text-realtyplus font-medium py-2"
                >
                  Register as Agent/Agency
                </Link>
                <Link
                  to="/agent/dashboard"
                  className="text-gray-700 hover:text-realtyplus font-medium py-2"
                >
                  Agent Dashboard
                </Link>
                <Link
                  to="/agent/subscription"
                  className="text-gray-700 hover:text-realtyplus font-medium py-2"
                >
                  Subscription Packages
                </Link>
                <div className="relative mt-2">
                  <Input
                    type="text"
                    placeholder="Search properties..."
                    className="w-full pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-realtyplus focus:ring focus:ring-realtyplus/20 focus:ring-opacity-50"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                <Button className="bg-realtyplus hover:bg-realtyplus-dark text-white w-full mt-2">
                  <Link to="/list-property" className="w-full text-white">
                    List Property
                  </Link>
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
