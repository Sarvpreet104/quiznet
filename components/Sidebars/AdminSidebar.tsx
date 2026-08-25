import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

const AdminSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>QUIZNET</SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/admin"}>Dashboard</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/admin/quizzes"}>Quizzes</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={"/admin/studentlists"}>Student Lists</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <form action={logoutUser}>
          <PrimaryButton name="Logout" type="submit" className="w-full" />
        </form>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
