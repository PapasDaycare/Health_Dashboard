import { Link, useLocation } from "wouter";
import { Heart, Home, Users, Calendar, Bell, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Physicians", href: "/physicians", icon: Users },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface MobileNavProps {
  onClose: () => void;
}

export default function MobileNav({ onClose }: MobileNavProps) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center">
            <Heart className="text-white h-5 w-5" />
          </div>
          <h1 className="ml-3 text-xl font-bold text-gray-900">MedConnect</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          data-testid="button-close-mobile-nav"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-medical-blue-light text-medical-blue"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              data-testid={`mobile-nav-link-${item.name.toLowerCase()}`}
            >
              <Icon className="mr-4 h-6 w-6" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © 2024 MedConnect
        </p>
      </div>
    </div>
  );
}