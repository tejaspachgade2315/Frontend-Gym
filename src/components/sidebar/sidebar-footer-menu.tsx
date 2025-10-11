"use client";

import { CaretSortIcon, ComponentPlaceholderIcon } from "@radix-ui/react-icons";
import { BadgeCheck, Bell, LogOut, Sparkles , Lock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useState } from "react";
import AdminProfileModal from "../adminProfileModal";
import { getToken, removeToken } from "@/lib/token";
import ChangePassword from "../changePassword"

export default function SidebarFooterMenu({ user }) {
  const { isMobile } = useSidebar();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangePassword , setIsChangePassword] = useState(false)
  const handleOpenProfile = () => {
    setIsProfileOpen(true);
  };
  const handleCloseProfile = () => {
    setIsProfileOpen(false);
  };

  const handleOpenChangePassword = () => {
    setIsChangePassword(true);
  };
  const handleCloseChangePassword = () => {
    setIsChangePassword(false);
  };

  const handleLogout = () => {
    console.log("logout");
    const token = getToken("token");
    if (token) {
      removeToken("token");
    }
    window.location.href = "/auth/login";
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user?.image} alt={user?.name} />
                  <AvatarFallback className="rounded-lg">{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
                <CaretSortIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={user?.image} alt={user?.name} />
                    <AvatarFallback className="rounded-lg">{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup></DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleOpenProfile} className="cursor-pointer">
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={handleOpenChangePassword}>
                <Lock />
                  Change Password
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      {isProfileOpen && <AdminProfileModal isOpen={isProfileOpen} onClose={handleCloseProfile} />}
      {isChangePassword && <ChangePassword isOpen={isChangePassword} onClose={handleCloseChangePassword} />}
    </>
  );
}
