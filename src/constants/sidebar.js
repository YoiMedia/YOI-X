import {
    LayoutDashboard,
    Users,
    UserPlus,
    Settings,
    ShieldCheck,
    UserCheck,
    TrendingUp,
    Briefcase,
    FileText,
    Calendar,
    ClipboardCheck,
    Archive, // Used as substitute for FileBox
    CheckSquare,
    FolderKanban,
    FileSignature,
    Phone,
    UserCog,
    MessageCircle,
} from "lucide-react";

// ==================== SUPERADMIN MENU ====================
export const superadminMenu = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        link: "/",
        pageTitle: "Superadmin Dashboard",
        subtitle: "System Overview",
    },
    {
        label: "User Management",
        icon: Users,
        children: [
            {
                label: "View Users",
                link: "/users",
                icon: UserCheck,
                pageTitle: "All Users",
                subtitle: "Manage system users",
            },
            {
                label: "Add User",
                link: "/users/add",
                icon: UserPlus,
                pageTitle: "Add New User",
                subtitle: "Create a new user account",
            },
        ],
    },
    { label: "Queries", icon: MessageCircle, link: "/queries" },
    {
        label: "Settings",
        icon: Settings,
        link: "/settings",
        pageTitle: "System Settings",
        subtitle: "Global configuration",
    },
];

// ==================== ADMIN MENU ====================
export const adminMenu = [
    { label: "Dashboard", icon: LayoutDashboard, link: "/" },
    { label: "Clients", icon: Users, link: "/clients" },
    { label: "Projects", icon: FolderKanban, link: "/requirements" },
    { label: "Meetings", icon: Calendar, link: "/meetings" },
    { label: "Queries", icon: MessageCircle, link: "/queries" },
    { label: "Employees", icon: UserCog, link: "/employees" },
    { label: "Approvals", icon: ClipboardCheck, link: "/approvals-queue" },
    { label: "Settings", icon: Settings, link: "/settings" },
];

// ==================== EMPLOYEE MENU ====================
export const employeeMenu = [
    { label: "Dashboard", icon: LayoutDashboard, link: "/" },
    { label: "Meetings", icon: Calendar, link: "/meetings" },
    { label: "Projects", icon: FolderKanban, link: "/requirements?tab=projects" },
    { label: "My Tasks", icon: CheckSquare, link: "/my-tasks" },
    { label: "Queries", icon: MessageCircle, link: "/queries" },
    { label: "Submissions", icon: Archive, link: "/submissions" },
];

// ==================== SALES MENU (Freelancer in description) ====================
export const salesMenu = [
    { label: "Dashboard", icon: LayoutDashboard, link: "/" },
    { label: "Clients", icon: Users, link: "/clients" },
    { label: "Documents", icon: FileText, link: "/proposals" },
    { label: "Meetings", icon: Calendar, link: "/meetings" },
    { label: "Requirements", icon: ClipboardCheck, link: "/requirements" },
    { label: "Queries", icon: MessageCircle, link: "/queries" },
    { label: "Submissions Review", icon: Archive, link: "/submissions" },
    { label: "Analytics", icon: FolderKanban, link: "/analytics" },
    { label: "Settings", icon: Settings, link: "/settings" },
];

// ==================== CLIENT MENU ====================
export const clientMenu = [
    { label: "Dashboard", icon: LayoutDashboard, link: "/" },
    { label: "My Project", icon: FolderKanban, link: "/requirements" },
    { label: "Queries", icon: MessageCircle, link: "/queries" },
    { label: "Documents", icon: FileText, link: "/documents" },
    { label: "Meetings", icon: Calendar, link: "/meetings" },
    { label: "Submissions", icon: FileSignature, link: "/submissions" },
    { label: "Feedback", icon: ClipboardCheck, link: "/feedback" },
    { label: "Support", icon: Phone, link: "/support" },
];

// ==================== HELPER FUNCTION ====================
export const getMenuByRole = (role) => {
    const menus = {
        superadmin: superadminMenu,
        admin: adminMenu,
        employee: employeeMenu,
        sales: salesMenu,
        client: clientMenu,
    };

    return menus[role?.toLowerCase()] || [];
};

export default {
    superadminMenu,
    adminMenu,
    employeeMenu,
    salesMenu,
    clientMenu,
    getMenuByRole,
};
