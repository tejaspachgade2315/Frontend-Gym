"use client";
import React, { useState } from "react";
import MainLayout from "@/components/layouts/mainlayout";
import InventoryHeader from "./component/inventory";
import EquipmentList from "./component/EquipmentList";

export default function Equipment() {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <MainLayout headerpath="/inventory/equipment" header="Inventory Management">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-4">
            <InventoryHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <EquipmentList searchQuery={searchQuery} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
