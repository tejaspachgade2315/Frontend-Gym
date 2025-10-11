"use client";
import MainLayout from "@/components/layouts/mainlayout";
import React, { useState } from "react";
import BillingHeader from "./component/Billing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Paymentdone from "./component/paymentdone";
import AwaitPayment from "./component/awaitpayment";

export default function Billing() {
  const [activeTab, setActiveTab] = useState("paymentDone");
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <MainLayout headerpath="/payments/billing" header="Member Payments">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-background max-md:sticky max-md:z-10 max-md:top-16">
              <div className="flex flex-col gap-4 bg-background">
                <BillingHeader setSearchQuery={setSearchQuery} searchQuery={searchQuery} />
              </div>
              <TabsList className="max-md:mt-4">
                <TabsTrigger value="paymentDone">Payment Done</TabsTrigger>
                <TabsTrigger value="requestDone">Pending Payment</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="paymentDone">
              <Paymentdone searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="requestDone">
              <AwaitPayment searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
