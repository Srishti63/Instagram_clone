import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { 
  Home, Search, Compass, MessageCircle, Heart, PlusSquare, 
  User, Menu, LogOut
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Search", icon: Search, path: "/search" },
    { name: "Explore", icon: Compass, path: "/explore" },
    { name: "Messages", icon: MessageCircle, path: "/messages" },
    { name: "Notifications", icon: Heart, path: "/notifications" },
    { name: "Create", icon: PlusSquare, path: "/create" },
    { name: "Profile", icon: User, path: `/profile/${user?._id}` },
  ];

  return (
    <div className="fixed top-0 left-0 h-screen w-16 md:w-64 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 z-50">
      
      {/* Logo */}
      <div className="p-4 md:py-8 md:px-6 flex items-center justify-center md:justify-start">
        <Link to="/" className="hidden md:block">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent italic">
            InstaClone
          </h1>
        </Link>
        <Link to="/" className="block md:hidden text-pink-500">
          <Menu size={28} />
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex-1 flex flex-col gap-2 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex items-center gap-4 p-3 md:px-6 mx-2 rounded-xl transition-all duration-200 group
                ${isActive ? "bg-gray-100 font-bold" : "hover:bg-gray-50 text-gray-700"}
              `}
            >
              <div className="ml-1 md:ml-0 group-hover:scale-110 transition-transform duration-200">
                <Icon size={26} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className={`hidden md:block text-[15px] ${isActive ? "font-bold" : "font-normal"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="p-2 mb-4">
        <button 
          onClick={logout}
          className="flex items-center w-full gap-4 p-3 md:px-6 mx-2 rounded-xl hover:bg-gray-50 text-red-500 transition-all duration-200 group"
        >
          <div className="ml-1 md:ml-0 group-hover:scale-110 transition-transform duration-200">
            <LogOut size={26} strokeWidth={1.5} />
          </div>
          <span className="hidden md:block text-[15px] font-medium">Log out</span>
        </button>
      </div>
    </div>
  );
}
