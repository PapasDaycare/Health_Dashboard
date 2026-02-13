import { Link, useLocation } from "wouter";
import { Heart, Home, Users, Calendar, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Physicians", href: "/physicians", icon: Users },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center">
              <Heart className="text-white h-5 w-5" />
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900">MedConnect</h1>
          </div>
        </div>
        <nav className="mt-8 flex-1">
          <div className="px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-medical-blue-light text-medical-blue"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  data-testid={`nav-link-${item.name.toLowerCase()}`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
