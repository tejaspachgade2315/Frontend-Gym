"use client";

import * as React from "react";

import { AudioWaveform, Command, Frame, GalleryVerticalEnd, Map, PieChart } from "lucide-react";

import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

import SidebarFooterMenu from "./sidebar-footer-menu";
import SidebarNavigation from "./sidebar-navigation";
import SidebarProjects from "./sidebar-projects";
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "@/lib/token";

const user = {
  name: "admin",
  email: "admin@example.com",
  avatar: "",
};

const teams = [
  {
    name: "Aeons Gym",
    logo: GalleryVerticalEnd,
    plan: "Premium",
  },
];

interface SocialMedia {
  facebook: string;
  instagram: string;
  twitter: string;
}

interface OpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface Owner {
  isPaid: boolean;
  remainingAmount: number;
  _id: string;
  name: string;
  email: string;
  password: string;
  image: string;
  role: string;
  isActive: boolean;
  gender: string;
  age: number;
  height: number;
  weight: number;
  phone: string;
  address: string;
  startDate: string;
  package: string;
  activityCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface MembershipPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
interface GymProfile {
  socialMedia: SocialMedia;
  openingHours: OpeningHours;
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  owner: Owner;
  image: string[];
  membershipPlans: MembershipPlan[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const token = getToken("token");

  const [admindata, SetAdmindata] = useState();
  const fetchadminData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response);
      SetAdmindata(response.data.userInfo);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchadminData();
  }, []);
  const [gym, setGym] = useState<GymProfile | null>(null);
  const fetchGymProfile = async () => {
    try {
      // setLoading(true);
      const token = getToken("token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gymprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        setGym(response.data[0]);
      } else {
        setGym(null);
      }
    } catch (error) {
      console.error("Failed to fetch gym profile:", error);
      setGym(null);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchGymProfile();
  }, []);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} gym={gym} />
      </SidebarHeader>
      <SidebarContent className="scrollbar-hide">
        <SidebarNavigation sidebarItems={sidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterMenu user={admindata} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
