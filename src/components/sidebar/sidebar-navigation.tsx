"use client";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/navigation/sidebar/sidebar-items";

export default function SidebarNavigation({ sidebarItems }: { readonly sidebarItems: NavGroup[] }) {
  const pathname = usePathname();
  return (
    <>
      {sidebarItems.map((navGroup) => (
        <SidebarGroup key={navGroup.id}>
          {navGroup.label && <SidebarGroupLabel>{navGroup.label}</SidebarGroupLabel>}
          <SidebarMenu>
            {navGroup.items.map((item) => {
              const isActive = pathname === item.path; // Check if the current item is active

              return (
                <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className={`${isActive ? "font-bold text-primary" : "font-normal text-muted-foreground"}`} // Apply bold styling to active tab
                      >
                        {item.icon && <item.icon />}
                        <a href={item?.path}>
                          <span>{item.title}</span>
                        </a>
                        {item.subItems && (
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {item.subItems && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => {
                            const isSubActive = pathname === subItem.path;
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <a
                                    href={subItem.path}
                                    className={
                                      isSubActive ? "font-bold text-primary" : "font-normal text-muted-foreground"
                                    }
                                  >
                                    <span>{subItem.title}</span>
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
