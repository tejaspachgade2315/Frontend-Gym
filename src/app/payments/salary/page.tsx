"use client";
import MainLayout from "@/components/layouts/mainlayout";
import React, { useState } from "react";
import SalaryHeader from "./component/salaryHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalaryDone from "./component/salarydone";
import AwaitingSalary from "./component/awaitSalary";
import PreviousSalary from "./component/previousSalary";


export default function Salary() {
  const [activeTab, setActiveTab] = useState("salaryDone");
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <MainLayout headerpath="/payments/salary" header="Salary">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-4 sticky top-16 z-10 bg-background">
            <SalaryHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
           
            <TabsList className="sticky top-40 z-10">
              <TabsTrigger value="salaryDone">Salary History</TabsTrigger>
              <TabsTrigger value="requestDone">Awaiting Salary</TabsTrigger>
              <TabsTrigger value="previous">Previous Salary</TabsTrigger>
            </TabsList>
        
            <TabsContent value="salaryDone">
              <SalaryDone searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="requestDone">
              <AwaitingSalary searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="previous">
              <PreviousSalary searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
