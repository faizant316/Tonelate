
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "@/entities/User";
import { createPageUrl } from "@/utils";
import {
  Brain,
  LayoutDashboard,
  History,
  Settings,
  HelpCircle,
  Menu,
  X,
  Zap,
  User as UserIcon,
  LogOut,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "Tonelater", href: createPageUrl("Tonelater") },
  { name: "Dashboard", href: createPageUrl("Dashboard") },
  { name: "History", href: createPageUrl("History") },
  { name: "Settings", href: createPageUrl("Settings") },
  { name: "Help", href: createPageUrl("Help") },
];

const iconMap = {
    Tonelater: Brain,
    Dashboard: LayoutDashboard,
    History: History,
    Settings: Settings,
    Help: HelpCircle
};

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, [location.pathname]);

  useEffect(() => {
    // Attempt to load dark mode preference from localStorage
    try {
      const storedDarkMode = localStorage.getItem('darkMode');
      if (storedDarkMode === 'true') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch (e) {
      console.warn("Could not access localStorage to set dark mode.");
    }
  }, []);

  const usagePercentage = user ? Math.min(((user.monthly_rewrites_used || 0) / (user.monthly_rewrite_limit || 25)) * 100, 100) : 0;

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.href = createPageUrl("Home");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-primary)] backdrop-blur-sm">
      <div className="p-4 border-b border-[var(--border-primary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-[var(--text-primary)]">Tonelate</span>
              <span className="text-xs text-[var(--text-secondary)]">AI Communication</span>
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-2">
        {navItems.map((item) => {
          const Icon = iconMap[item.name];
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => {
                setIsSidebarOpen(false);
                setIsProfileMenuOpen(false); // Close profile menu when navigating
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentPageName === item.name
                  ? "bg-[var(--bg-active)] text-[var(--accent-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              }`}
            >
              {Icon && <Icon className="w-5 h-5" />}
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile Section */}
      {user && (
        <div className="border-t border-[var(--border-primary)]">
          <DropdownMenu 
            open={isProfileMenuOpen} 
            onOpenChange={setIsProfileMenuOpen}
          >
            <DropdownMenuTrigger asChild>
              <button 
                className="w-full p-3 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[120px]">
                      {user.full_name || 'User'}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] capitalize">
                      {user.subscription_plan || 'Free'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side="top" 
              align="start"
              sideOffset={10}
              alignOffset={8}
              className="w-60 bg-[var(--bg-secondary)] border-[var(--border-primary)] shadow-xl z-[60] lg:z-50"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="p-3 border-b border-[var(--border-secondary)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">{user.full_name || 'User'}</p>
                <p className="text-xs text-[var(--text-secondary)]">{user.email}</p>
              </div>
              
              <div className="p-1">
                <DropdownMenuItem asChild>
                  <Link 
                    to={createPageUrl('Settings?tab=billing')}
                    className="cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md px-3 py-2 mx-1 my-1 flex items-center w-full"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Zap className="mr-3 h-4 w-4" />
                    <span>Upgrade plan</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link 
                    to={createPageUrl('Settings?tab=profile')}
                    className="cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md px-3 py-2 mx-1 my-1 flex items-center w-full"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <UserIcon className="mr-3 h-4 w-4" />
                    <span>Account settings</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link 
                    to={createPageUrl('Settings')}
                    className="cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md px-3 py-2 mx-1 my-1 flex items-center w-full"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link 
                    to={createPageUrl('Help')}
                    className="cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md px-3 py-2 mx-1 my-1 flex items-center w-full"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <HelpCircle className="mr-3 h-4 w-4" />
                    <span>Help</span>
                    <ChevronRight className="ml-auto h-4 w-4 text-[var(--text-tertiary)]" />
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="my-1 bg-[var(--border-secondary)]" />
                
                <DropdownMenuItem 
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsSidebarOpen(false);
                    handleLogout();
                  }}
                  className="cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md px-3 py-2 mx-1 my-1 flex items-center w-full"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Usage Stats */}
          <div className="p-3 border-t border-[var(--border-primary)] space-y-2">
            <div className="text-xs text-[var(--text-secondary)]">
              <div className="flex justify-between mb-1">
                <span>AI Usage</span>
                <span className="font-medium">{Math.round(usagePercentage)}%</span>
              </div>
              <Progress value={usagePercentage} className="h-2 custom-progress-bar" />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (currentPageName === 'Home' || currentPageName === 'Logo') {
    return <>{children}</>;
  }

  return (
    <>
      <style>{`
        :root[data-theme="light"], :root {
          /* Light Theme Colors (Default) */
          --bg-primary: #f8fafc;
          --bg-secondary: #ffffff;
          --bg-tertiary: #f1f5f9;
          --bg-sidebar: rgba(255, 255, 255, 0.95);
          --bg-card: #ffffff;
          --bg-input: #ffffff;
          --bg-hover: #f1f5f9;
          --bg-active: #dbeafe;
          
          --text-primary: #1e293b;
          --text-secondary: #64748b;
          --text-tertiary: #94a3b8;
          --text-placeholder: #9ca3af;
          
          --border-primary: rgba(226, 232, 240, 0.8);
          --border-secondary: #e2e8f0;
          --border-hover: #cbd5e1;
          
          --accent-primary: #3b82f6;
          --accent-secondary: #6366f1;
          --success: #10b981;
          --warning: #f59e0b;
          --error: #ef4444;
          --info: #dbeafe;
          --info-border: #93c5fd;
          --info-text: #1d4ed8;
          --success-border: #86efac;
          --success-text: #166534;
          --text-primary-button: #1e293b;
          --text-primary-button-hover: #334155;
          
          /* Light Mode Slider Variables */
          --slider-track: #e2e8f0;
          --slider-range: #3b82f6;
          --slider-thumb: #ffffff;
          --slider-thumb-border: #3b82f6;
          --slider-thumb-shadow: 0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px rgb(0 0 0 / 0.06);
          
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }

        :root[data-theme="dark"] {
          /* Dark Theme Colors - ChatGPT Inspired */
          --bg-primary: #0d1117;
          --bg-secondary: #21262d;
          --bg-tertiary: #30363d;
          --bg-sidebar: rgba(13, 17, 23, 0.95);
          --bg-card: #21262d;
          --bg-input: #30363d;
          --bg-hover: #262c36;
          --bg-active: #1f6feb33;
          
          --text-primary: #f0f6fc;
          --text-secondary: #8b949e;
          --text-tertiary: #6e7681;
          --text-placeholder: #656d76;
          
          --border-primary: #30363d;
          --border-secondary: #21262d;
          --border-hover: #444c56;
          
          --accent-primary: #1f6feb;
          --accent-secondary: #8b5cf6;
          --success: #238636;
          --warning: #d29922;
          --error: #f85149;
          --info: #1f6feb33;
          --info-border: #1f6feb;
          --info-text: #79c0ff;
          --success-border: #238636;
          --success-text: #7ee787;
          --text-primary-button: #f0f6fc;
          --text-primary-button-hover: #c9d1d9;
          
          /* Dark Mode Slider Variables */
          --slider-track: #21262d;
          --slider-range: #58a6ff;
          --slider-thumb: #8b949e;
          --slider-thumb-border: #58a6ff;
          --slider-thumb-shadow: 0 2px 8px rgb(0 0 0 / 0.6), 0 0 0 1px rgb(88 166 255 / 0.3);
          
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4);
        }

        /* Enhanced Slider Styling - More Responsive */
        .custom-slider [data-radix-collection-item] {
          background-color: var(--slider-track) !important;
          border-radius: 8px;
          height: 8px;
        }

        .custom-slider [data-radix-collection-item] [data-orientation="horizontal"] {
          background-color: var(--slider-range) !important;
          border-radius: 8px;
          height: 100%;
        }

        .custom-slider [role="slider"] {
          background-color: var(--slider-thumb) !important;
          border: 2px solid var(--slider-thumb-border) !important;
          box-shadow: var(--slider-thumb-shadow) !important;
          width: 22px !important;
          height: 22px !important;
          border-radius: 50% !important;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: grab !important;
        }

        .custom-slider [role="slider"]:hover {
          transform: scale(1.15);
          box-shadow: var(--slider-thumb-shadow), 0 0 0 6px rgb(88 166 255 / 0.12) !important;
        }

        .custom-slider [role="slider"]:active {
          cursor: grabbing !important;
          transform: scale(1.2);
          box-shadow: var(--slider-thumb-shadow), 0 0 0 8px rgb(88 166 255 / 0.18) !important;
        }

        .custom-slider [role="slider"]:focus {
          outline: none;
          box-shadow: var(--slider-thumb-shadow), 0 0 0 6px rgb(88 166 255 / 0.2) !important;
        }

        /* Enhanced Switch Styling for Dark Mode */
        :root[data-theme="dark"] [role="switch"] {
            --switch-bg: #30363d;
            --switch-bg-checked: #1f6feb;
            --switch-thumb-bg: #f0f6fc;
            background-color: var(--switch-bg) !important;
        }
        :root[data-theme="dark"] [role="switch"][data-state="checked"] {
            background-color: var(--switch-bg-checked) !important;
        }
        :root[data-theme="dark"] [role="switch"] > span {
            background-color: var(--switch-thumb-bg) !important;
        }

        /* Enhanced Progress Bar Styling */
        .custom-progress-bar [data-radix-collection-item] {
            background-color: var(--accent-primary) !important;
        }

        /* Custom Scrollbar Styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--text-tertiary);
          border-radius: 10px;
          border: 2px solid var(--bg-input);
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: var(--text-secondary);
        }
        
        /* Ensure smooth transitions */
        * {
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        
        /* Mobile-specific dropdown positioning */
        @media (max-width: 1023px) {
          [data-radix-popper-content-wrapper] {
            /* Radix UI handles positioning automatically via Portals, z-index is managed here. */
            z-index: 70 !important;
          }
          
          /* Ensure dropdown appears above sidebar */
          [data-state="open"] [data-radix-popper-content-wrapper] {
            z-index: 70 !important;
          }
        }
        
        /* Desktop dropdown positioning */
        @media (min-width: 1024px) {
          [data-radix-popper-content-wrapper] {
            z-index: 50 !important;
          }
        }
      `}</style>
      <div className="flex h-screen bg-[var(--bg-primary)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-64 flex-shrink-0">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div 
              className="fixed inset-0 bg-black/60" 
              onClick={() => {
                setIsSidebarOpen(false);
                setIsProfileMenuOpen(false);
              }}
            ></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full">
              <SidebarContent />
            </div>
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="lg:hidden p-4 flex items-center justify-between border-b border-[var(--border-primary)] bg-[var(--bg-sidebar)] backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-[var(--text-primary)]">Tonelate</span>
                <span className="text-xs text-[var(--text-secondary)]">AI Communication</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                setIsSidebarOpen(true);
                setIsProfileMenuOpen(false); // Ensure profile menu is closed
              }}
            >
              <Menu className="w-6 h-6 text-[var(--text-primary)]" />
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
