import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { LoadingSpinner } from "../globalScreens/Loader";

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
  const useCurrentPath = () => {
    const location = useLocation();
    return location.pathname;
  };
  const currentPath = useCurrentPath();

  // Add this function to check if a link is active
  const isActivePath = (path: string) => {
    if (path === "/") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };
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
      <div className="hidden md:block bg-realtyplus py-2 text-white">
        <div className="flex justify-between items-center mx-auto px-4 container">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Phone className="mr-2 w-4 h-4" />
              <span>+260 97 1234567</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 w-4 h-4" />
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
          "w-full bg-white sticky top-0 transition-all duration-300",
          isScrolled ? "shadow-md py-2" : "shadow-sm py-4",
          useCurrentPath() === "/" ? "z-[15]" : "z-20",
          className
        )}
      >
        <div className="mx-auto px-4 container">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/realtyplus-logo.svg"
                alt="RealtyPlus Logo"
                className="w-auto h-8 sm:h-10"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://api.dicebear.com/7.x/initials/svg?seed=RP";
                }}
              />
              <span className="hidden sm:inline ml-2 font-bold text-realtyplus text-lg sm:text-xl">
                RealtyPlus
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/properties"
                className={cn(
                  "text-gray-700 hover:text-realtyplus font-medium transition-colors",
                  isActivePath("/properties") && "text-realtyplus"
                )}
              >
                All Properties
              </Link>
              <Link
                to="/buy"
                className={cn(
                  "text-gray-700 hover:text-realtyplus font-medium transition-colors",
                  isActivePath("/buy") && "text-realtyplus"
                )}
              >
                Buy
              </Link>
              <Link
                to="/rent"
                className={cn(
                  "text-gray-700 hover:text-realtyplus font-medium transition-colors",
                  isActivePath("/rent") && "text-realtyplus"
                )}
              >
                Rent
              </Link>
              <Link
                to="/agents"
                className={cn(
                  "text-gray-700 hover:text-realtyplus font-medium transition-colors",
                  isActivePath("/agents") && "text-realtyplus"
                )}
              >
                Agents
              </Link>
              <Link
                to="/agencies"
                className={cn(
                  "text-gray-700 hover:text-realtyplus font-medium transition-colors",
                  isActivePath("/agencies") && "text-realtyplus"
                )}
              >
                Agencies
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="font-medium text-gray-700 hover:text-realtyplus">
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
                  className="focus:ring-opacity-50 py-2 pr-4 pl-10 border-gray-300 focus:border-realtyplus rounded-full focus:ring focus:ring-realtyplus/20 w-full sm:w-64"
                />
                <Search className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => setIsFavOpen(!isFavOpen)}
                  >
                    <Heart className="w-5 h-5 text-gray-600" />
                    <Badge className="-top-1 -right-1 absolute flex justify-center items-center bg-realtyplus p-0 w-5 h-5">
                      {user?.savedProperties?.length || 0}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="left-1/2 translate-x-1/2 transform"
                >
                  <div className="bg-slate-50 p-2 border border-gray-400 rounded">
                    <p className="text-gray-600 text-xs">Favorites</p>
                    <SavedPropertiesDropDown user={user} setUser={setUser} />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                  >
                    <User className="w-5 h-5" />
                    {/* <Badge className="-top-1 -right-1 absolute flex justify-center items-center bg-realtyplus p-0 w-5 h-5">
                      3
                    </Badge>*/}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="left-1/2 w-56 translate-x-1/2 transform"
                >
                  <div className="p-2 text-center">
                    <p className="font-medium text-sm">
                      Welcome to RealtyZambia
                    </p>
                    <p className="font-medium text-sm">
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
                            className="rounded-full w-6 h-6"
                          />
                          <span>
                            {`${user.firstName} ${user.lastName}` || user.email}
                          </span>

                          <span className="overflow-hidden text-center">
                            {user.email}
                          </span>
                        </div>
                      </DropdownMenuItem>

                      <DropdownMenuItem>
                        <button
                          onClick={handleSignOut}
                          className="mx-auto text-red-600 hover:text-red-700 text-left"
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
                      className="flex items-center w-full"
                    >
                      <Heart className="mr-2 w-4 h-4" /> Saved Properties
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      to="/notifications"
                      className="flex items-center w-full"
                    >
                      <Bell className="mr-2 w-4 h-4" /> Notifications
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
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/properties"
                  className="py-2 font-medium text-gray-700 hover:text-realtyplus"
                >
                  All Properties
                </Link>
                <Link
                  to="/buy"
                  className="py-2 font-medium text-gray-700 hover:text-realtyplus"
                >
                  Buy
                </Link>
                <Link
                  to="/rent"
                  className="py-2 font-medium text-gray-700 hover:text-realtyplus"
                >
                  Rent
                </Link>
                <Link
                  to="/agents"
                  className="py-2 font-medium text-gray-700 hover:text-realtyplus"
                >
                  Agents
                </Link>
                <Link
                  to="/mortgage-calculator"
                  className="py-2 font-medium text-gray-700 hover:text-realtyplus"
                >
                  Mortgage Calculator
                </Link>
                <Link
                  to="/saved-properties"
                  className="flex items-center py-2 font-medium text-gray-700 hover:text-realtyplus"
                >
                  <Heart className="mr-2 w-4 h-4" /> Saved Properties
                </Link>
                <Link
                  to="/login"
                  className="py-2 font-medium text-gray-700 hover:text-realtyplus"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="py-2 font-medium text-gray-700 hover:text-realtyplus"
                >
                  Register
                </Link>
                <Link
                  to="/agent/signup"
                  className="py-2 font-medium text-gray-700 hover:text-realtyplus"
                >
                  Register as Agent/Agency
                </Link>
                <Link
                  to="/agent/dashboard"
                  className="py-2 font-medium text-gray-700 hover:text-realtyplus"
                >
                  Agent Dashboard
                </Link>
                <Link
                  to="/agent/subscription"
                  className="py-2 font-medium text-gray-700 hover:text-realtyplus"
                >
                  Subscription Packages
                </Link>
                <div className="relative mt-2">
                  <Input
                    type="text"
                    placeholder="Search properties..."
                    className="focus:ring-opacity-50 py-2 pr-4 pl-10 border-gray-300 focus:border-realtyplus rounded-full focus:ring focus:ring-realtyplus/20 w-full"
                  />
                  <Search className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                </div>
                <Button className="bg-realtyplus hover:bg-realtyplus-dark mt-2 w-full text-white">
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
        console.log(properties);
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
      <div className="p-3 divide-y divide-gray-100 w-[320px] max-h-[500px] overflow-y-auto">
        <LoadingSpinner />
      </div>
    );
  }

  if (!savedProperties.length) {
    return (
      <div className="p-6 text-center">
        <div className="mb-2 text-gray-400">
          <Heart className="mx-auto w-12 h-12" />{" "}
          {/* Import from your icon library */}
        </div>
        <p className="text-gray-600">No saved properties yet</p>
        <button
          onClick={() => navigate("/properties")}
          className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
        >
          Browse Properties
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 divide-y divide-gray-100 w-[320px] max-h-[500px] overflow-y-auto">
      <div className="flex justify-between items-center mb-2 pb-2">
        <h3 className="font-semibold text-gray-800">Saved Properties</h3>
        <span className="text-gray-500 text-sm">
          {savedProperties.length} items
        </span>
      </div>

      {savedProperties.map((property) => (
        <div
          key={property.uid}
          onClick={() => handlePropertyClick(property.uid)}
          className="group hover:bg-gray-50 p-3 rounded-lg w-full text-wrap transition-all cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="relative">
              <img
                src={property.images[property.coverPhotoIndex]}
                alt={property.title}
                className="rounded-lg w-20 h-20 object-cover"
              />
              <span className="top-1 right-1 absolute bg-blue-600 px-2 py-1 rounded text-white text-xs">
                {property.propertyCategory}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium group-hover:text-blue-600 text-sm truncate">
                  {property.title}
                </h3>
                <button
                  onClick={(e) => handleRemoveFavorite(property.uid, e)}
                  className="hover:bg-gray-100 opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity"
                >
                  <X className="w-4 h-4 text-gray-500" />{" "}
                  {/* Import from your icon library */}
                </button>
              </div>

              <div className="flex items-center gap-2 mt-1 text-gray-600 text-xs">
                <span className="flex items-center">
                  <Home className="mr-1 w-3 h-3" />{" "}
                  {/* Import from your icon library */}
                  {property.propertyType}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <MapPinIcon className="mr-1 w-3 h-3" />{" "}
                  {/* Import from your icon library */}
                  {property.address}
                </span>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="font-semibold text-blue-600 text-sm">
                  K {property.price.toLocaleString()}
                </div>
                <span className="text-gray-500 text-xs">
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
