import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Menu,
  X,
  Phone,
  MapPin,
  Heart,
  Bell,
  Home,
  MapPinIcon,
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
import { signOut } from "firebase/auth";
import { auth, fireDataBase } from "@/lib/firebase";
import { useZustand } from "@/lib/zustand";
import { LISTING } from "@/lib/typeDefinitions";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

interface HeaderProps {
  className?: string;
}
interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  userType?: "user" | "agent" | "admin" | "agency";
  phoneNumber?: string;
}
const Header = ({ className }: HeaderProps = {}) => {
  const [isFavOpen, setIsFavOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { user, clearUser, setUser } = useZustand();
  const navigate = useNavigate();
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsFavOpen(!isFavOpen);
  };
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      clearUser();
      // You can add navigation here if needed
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const handleRedirections = () => {
    if (user?.userType === "users") {
      navigate("/user/dashboard");
    } else if (user?.userType === "agents") {
      navigate("/agent/dashboard");
    } else if (user?.userType === "agencies") {
      navigate("/agency/dashboard");
    } else {
      navigate("/login");
    }
  };
  const getUserType = () => {
    if (user?.userType === "agents") {
      return "an Agent";
    } else if (user?.userType === "agencies") {
      return "an Agency";
    } else {
      return "a User";
    }
  };
  //if()
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
              <Link
                to="/agencies"
                className="text-gray-700 hover:text-realtyplus font-medium"
              >
                Agencies
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => setIsFavOpen(!isFavOpen)}
                  >
                    <Heart className="h-5 w-5 text-gray-600" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-realtyplus">
                      {user?.savedProperties?.length || 0}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="transform translate-x-1/2 left-1/2"
                >
                  <div className="bg-slate-50 p-2 border border-gray-400 rounded">
                    <p className="text-xs text-gray-600">Favorites</p>
                    <SavedPropertiesDropDown user={user} setUser={setUser} />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full relative"
                  >
                    <User className="h-5 w-5" />
                    {/* <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-realtyplus">
                      3
                    </Badge>*/}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 transform translate-x-1/2 left-1/2"
                >
                  <div className="p-2 text-center">
                    <p className="text-sm font-medium">
                      Welcome to RealtyZambia
                    </p>
                    <p className="text-sm font-medium">
                      {user && `You are ${getUserType()}`}
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
                        <div
                          className="flex flex-col items-center gap-2 w-full"
                          onClick={handleRedirections}
                        >
                          <img
                            src={user.pfp || "/default-avatar.png"}
                            alt="Profile"
                            className="w-6 h-6 rounded-full"
                          />
                          <span>
                            {`${user.firstName} ${user.lastName}` || user.email}
                          </span>

                          <span className="text-center overflow-hidden">
                            {user.email}
                          </span>
                        </div>
                      </DropdownMenuItem>

                      <DropdownMenuItem>
                        <button
                          onClick={handleSignOut}
                          className=" mx-auto  text-left text-red-600 hover:text-red-700"
                        >
                          Sign Out
                        </button>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  {user === null && (
                    <>
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
                    </>
                  )}
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
                  {user !== null && user.userType === "agents" && (
                    <>
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
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {user !== null && user.userType !== "users" && (
                <Button className="bg-realtyplus hover:bg-realtyplus-dark text-white">
                  <Link to="/list-property" className="text-white">
                    List Property
                  </Link>
                </Button>
              )}
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

const SavedPropertiesDropDown = ({ user, setUser }) => {
  const [savedProperties, setSavedProperties] = React.useState<LISTING[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigate = useNavigate(); // Assuming you're using react-router

  React.useEffect(() => {
    const fetchSavedProperties = async () => {
      try {
        if (!user.savedProperties || user.savedProperties.length === 0) {
          setIsLoading(false);
          return;
        }

        const propertiesPromises = user.savedProperties.map(async (ref) => {
          const docRef = doc(fireDataBase, "listings", ref);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { uid: docSnap.id, ...docSnap.data() } as LISTING;
          }
          return null;
        });

        const properties = await Promise.all(propertiesPromises);
        setSavedProperties(
          properties.filter((prop): prop is LISTING => prop !== null)
        );
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching saved properties:", error);
        setIsLoading(false);
      }
    };

    fetchSavedProperties();
  }, [user.savedProperties]);

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleRemoveFavorite = async (
    propertyId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      if (!user || !user.uid) {
        console.log("User not logged in");
        return;
      }

      // Filter out the property to remove
      const updatedSavedProperties = user.savedProperties.filter(
        (id) => id !== propertyId
      );

      // Update local state
      setUser({
        ...user,
        savedProperties: updatedSavedProperties,
      });

      // Update Firebase
      const userRef = doc(fireDataBase, user.userType, user.uid);
      await updateDoc(userRef, {
        savedProperties: updatedSavedProperties,
      });

      // Optional: Show success message
      toast?.success("Property removed from favorites");
    } catch (error) {
      console.error("Error removing property from favorites:", error);
      // Revert local state if Firebase update fails
      setUser({
        ...user,
        savedProperties: [...user.savedProperties],
      });
      // Optional: Show error message
      toast?.error("Failed to remove property from favorites");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading saved properties...</p>
      </div>
    );
  }

  if (!savedProperties.length) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 mb-2">
          <Heart className="h-12 w-12 mx-auto" />{" "}
          {/* Import from your icon library */}
        </div>
        <p className="text-gray-600">No saved properties yet</p>
        <button
          onClick={() => navigate("/properties")}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700"
        >
          Browse Properties
        </button>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] w-[320px] overflow-y-auto p-3 divide-y divide-gray-100">
      <div className="pb-2 mb-2 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Saved Properties</h3>
        <span className="text-sm text-gray-500">
          {savedProperties.length} items
        </span>
      </div>

      {savedProperties.map((property) => (
        <div
          key={property.uid}
          onClick={() => handlePropertyClick(property.uid)}
          className="group w-full text-wrap p-3 hover:bg-gray-50 transition-all cursor-pointer rounded-lg"
        >
          <div className="flex items-start gap-3">
            <div className="relative">
              <img
                src={property.coverPhoto}
                alt={property.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                {property.propertyCategory}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex  justify-between items-start">
                <h3 className="font-medium text-sm group-hover:text-blue-600 truncate">
                  {property.title}
                </h3>
                <button
                  onClick={(e) => handleRemoveFavorite(property.uid, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />{" "}
                  {/* Import from your icon library */}
                </button>
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                <span className="flex items-center">
                  <Home className="h-3 w-3 mr-1" />{" "}
                  {/* Import from your icon library */}
                  {property.propertyType}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <MapPinIcon className="h-3 w-3 mr-1" />{" "}
                  {/* Import from your icon library */}
                  {property.address}
                </span>
              </div>

              <div className="mt-2 flex justify-between items-center">
                <div className="text-sm font-semibold text-blue-600">
                  ${property.price.toLocaleString()}
                </div>
                <span className="text-xs text-gray-500">
                  Added {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default Header;
