import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { getMenuItemsByRole } from "@/lib/menuConfig";
import { LogOut } from "lucide-react";

export function RoleBasedSidebar() {
  const { open } = useSidebar();
  const { user, logout } = useAuth();

  if (!user) return null;

  const menuItems = getMenuItemsByRole(user.role);
  const roleDisplayName = {
    ADMIN: "Admin Panel",
    LEARNER: "Learner Dashboard",
    MENTOR: "Mentor Panel",
  }[user.role];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Header */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-2">
            {open && <SidebarGroupLabel className="text-lg font-bold">{roleDisplayName}</SidebarGroupLabel>}
            <SidebarTrigger />
          </div>
        </SidebarGroup>

        {/* Menu Items */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === `/${user.role.toLowerCase()}`}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  {open && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info */}
        {open && (
          <SidebarGroup className="border-t pt-4">
            <div className="px-4 py-2 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">{user.name}</p>
              <p>{user.email}</p>
              <p className="mt-1 rounded bg-muted px-2 py-1 text-xs uppercase">{user.role}</p>
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
