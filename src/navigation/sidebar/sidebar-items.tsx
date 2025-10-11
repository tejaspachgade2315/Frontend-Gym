import {
  File,
  Inbox,
  Bell,
  BadgeCheck,
  Receipt,
  KeySquare,
  Package,
  Users,
  ShoppingBag,
  Wallet,
  PanelsTopLeft,
  LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  path: string;
}

export interface NavMainItem {
  title: string;
  path?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  subItems?: NavSubItem[];
}

export interface NavGroup {
  id: number;
  label: string;
  items: NavMainItem[];
}

const basePath = "/dashboard";

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        path: basePath,
        icon: PanelsTopLeft,
        isActive: true,
      },
    ],
  },
  {
    id: 2,
    label: "GYM Management",
    items: [
      {
        title: "Members",
        icon: Users, // Changed to Users for representing members
        path: "/members",
      },
      {
        title: "Inactive Members",
        path: "/inactive",
        icon: BadgeCheck, // Changed to BadgeCheck to represent verified membership
      },
      {
        title: "Staff",
        icon: KeySquare, // Keeping KeySquare as it represents authority/trainer
        path: "/staff",
      },
      {
        title: "Membership",
        path: "/membership",
        icon: BadgeCheck, // Changed to BadgeCheck to represent verified membership
      },
    ],
  },
  {
    id: 3,
    label: "Inventory Management",
    items: [
      {
        title: "Equipment",
        path: `/inventory/equipment`,
        icon: ShoppingBag, // Represents gym equipment and related purchases
      },
    ],
  },
  {
    id: 4,
    label: "Payments & Billing",
    items: [
      {
        title: "Salary",
        path: `/payments/salary`,
        icon: Wallet, // Changed to Wallet to represent salary/payments
      },
      {
        title: "Members Payment",
        path: `/payments/billing`,
        icon: Receipt, // Keeping Receipt for billing
      },
    ],
  },
  {
    id: 5,
    label: "Lead Tracking",
    items: [
      {
        title: "All Leads",
        path: "/leads/allleads",
        icon: Users,
      },
    ],
  },
  // {
  //   id: 5,
  //   label: "Notifications",
  //   items: [
  //     {
  //       title: "Notification",
  //       path: `${basePath}/notifications`,
  //       icon: Bell, // Keeping Bell for notifications
  //     },
  //   ],
  // },
];
