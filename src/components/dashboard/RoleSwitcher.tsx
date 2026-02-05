import { Shield, TrendingUp, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type UserRole = "admin" | "sales" | "employee" | "client";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roles = [
  { id: "admin" as UserRole, label: "Admin", icon: Shield, description: "Full system access" },
  { id: "sales" as UserRole, label: "Sales", icon: TrendingUp, description: "Deals & clients" },
  { id: "employee" as UserRole, label: "Employee", icon: User, description: "Tasks & deadlines" },
  { id: "client" as UserRole, label: "Client", icon: Users, description: "Projects & docs" },
];

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  return (
    <div className="flex gap-2 p-1 bg-secondary rounded-lg">
      {roles.map((role) => (
        <button
          key={role.id}
          onClick={() => onRoleChange(role.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            currentRole === role.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          )}
        >
          <role.icon size={16} />
          <span>{role.label}</span>
        </button>
      ))}
    </div>
  );
}
