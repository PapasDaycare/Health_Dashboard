import { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getUserInitials } from "@/lib/auth";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const user = getCurrentUser();
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="ml-2 lg:ml-0 text-2xl font-semibold text-gray-900">
            Healthcare Dashboard
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 h-4 w-4" />
            </div>
            <Input
              type="text"
              placeholder="Search physicians or appointments..."
              className="w-80 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          
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
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue"
              data-testid="button-user-menu"
            >
              <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {getUserInitials(user)}
                </span>
              </div>
              <span className="ml-2 text-gray-700 font-medium">
                {user.firstName} {user.lastName}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
