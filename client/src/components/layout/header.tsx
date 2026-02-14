import { useState } from "react";
import { Search, Bell, Menu, Heart, Home, Users, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth, getUserInitials } from "@/lib/auth";
// import MobileNav from "./mobile-nav";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logout();
      setLocation("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <div className="flex flex-col h-full bg-white">
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center">
                      <Heart className="text-white h-5 w-5" />
                    </div>
                    <h1 className="ml-3 text-xl font-bold text-gray-900">MedConnect</h1>
                  </div>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                  <a href="/" onClick={() => setMobileMenuOpen(false)} className="group flex items-center px-3 py-3 text-base font-medium rounded-lg text-medical-blue bg-medical-blue-light">
                    <Home className="mr-4 h-6 w-6" />
                    Dashboard
                  </a>
                  <a href="/physicians" onClick={() => setMobileMenuOpen(false)} className="group flex items-center px-3 py-3 text-base font-medium rounded-lg text-gray-600 hover:bg-gray-50">
                    <Users className="mr-4 h-6 w-6" />
                    Physicians
                  </a>
                  <a href="/appointments" onClick={() => setMobileMenuOpen(false)} className="group flex items-center px-3 py-3 text-base font-medium rounded-lg text-gray-600 hover:bg-gray-50">
                    <Calendar className="mr-4 h-6 w-6" />
                    Appointments
                  </a>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center ml-2">
            <div className="w-7 h-7 bg-medical-blue rounded-lg flex items-center justify-center">
              <Heart className="text-white h-4 w-4" />
            </div>
            <h1 className="ml-2 text-lg font-bold text-gray-900">MedConnect</h1>
          </div>
          
          {/* Desktop Title */}
          <h2 className="hidden lg:block text-xl sm:text-2xl font-semibold text-gray-900">
            {title || "Healthcare Dashboard"}
          </h2>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search Bar - Hidden on small screens, shown on medium+ */}
          <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 h-4 w-4" />
            </div>
            <Input
              type="text"
              placeholder="Search physicians or appointments..."
              className="w-64 lg:w-80 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          
          {/* Mobile Search Button - Shown on small screens */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            data-testid="button-mobile-search"
          >
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </Button>

          {/* User Profile */}
          {user && (
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue p-1 sm:p-2"
                data-testid="button-user-menu"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-medical-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs sm:text-sm">
                    {getUserInitials(user)}
                  </span>
                </div>
                <span className="hidden sm:block ml-2 text-gray-700 font-medium text-sm">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                </span>
              </Button>
            </div>
          )}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={handleLogout}
              disabled={isLoggingOut}
              data-testid="button-logout"
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
