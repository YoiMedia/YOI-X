import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Handshake,
  FileText,
  FileSignature,
  CheckSquare,
  Calendar,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FolderKanban,
  FileBox,
  Phone,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const salesNavItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Clients", href: "/clients", icon: Users },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Deals", href: "/deals", icon: Handshake },
  { title: "Proposals", href: "/proposals", icon: FileText },
  { title: "Contracts", href: "/contracts", icon: FileSignature },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Employees", href: "/employees", icon: UserCog },
  { title: "Settings", href: "/settings", icon: Settings },
];

const adminNavItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Clients", href: "/clients", icon: Users },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Employees", href: "/employees", icon: UserCog },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Approvals", href: "/approvals-queue", icon: ClipboardCheck },
  { title: "Settings", href: "/settings", icon: Settings },
];

const employeeNavItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "My Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Calendar", href: "/calendar", icon: Calendar },
];

const clientNavItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "My Projects", href: "/portal", icon: FolderKanban },
  { title: "Documents", href: "/contracts", icon: FileBox },
  { title: "Schedule Call", href: "/calendar/onboarding", icon: Phone },
];

const freelancerNavItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Clients", href: "/clients", icon: Users },
  { title: "Documents", href: "/proposals", icon: FileText },
  { title: "Meetings", href: "/calendar", icon: Calendar },
  { title: "Requirements", href: "/requirements", icon: ClipboardCheck },
  { title: "Submissions Review", href: "/submissions", icon: FileBox },
  { title: "Analytics", href: "/analytics", icon: FolderKanban },
  { title: "Settings", href: "/settings", icon: Settings },
];

const navItemsByRole: any = {
  sales: salesNavItems,
  admin: adminNavItems,
  employee: employeeNavItems,
  client: clientNavItems,
  freelancer: freelancerNavItems,
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = navItemsByRole[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r  transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center h-16 px-4  border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src="/y_logo.svg" alt="YOI MEDIA" className="h-8 w-8" />
            <span className="text-lg font-bold text-foreground tracking-tight">
              YOI MEDIA
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors",
            collapsed ? "mx-auto" : "ml-auto"
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item: any) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        {!collapsed && (
          <div className="text-[10px] text-sidebar-foreground/50 text-center">
            © 2026 YOI MEDIA Inc.
          </div>
        )}
      </div>
    </aside>
  );
}
