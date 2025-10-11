"use client";
import MainLayout from "@/components/layouts/mainlayout";
import React, { useState } from "react";
import LeadHeader from "./component/lead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllLeads from "./component/alllead";
import ConvertedLeads from "./component/convertedlead";
import LossLeads from "./component/losslead";

export default function Billing() {
  const [activeTab, setActiveTab] = useState("allLeads");
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <MainLayout headerpath="/leads/allleads" header="Leads">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-background max-md:sticky max-md:z-10 max-md:top-16">
              <div className="flex flex-col gap-4 bg-background">
                <LeadHeader setSearchQuery={setSearchQuery} searchQuery={searchQuery} />
              </div>
              <TabsList className="max-md:mt-4">
                <TabsTrigger value="allLeads">All Leads</TabsTrigger>
                <TabsTrigger value="convertedLeads">Converted Leads</TabsTrigger>
                <TabsTrigger value="lossLeads">Lost Leads</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="allLeads">
              <AllLeads searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="convertedLeads">
              <ConvertedLeads searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="lossLeads">
              <LossLeads searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
