
'use client';
import MainLayout from "@/components/layouts/mainlayout";
import React, { useState } from "react";
import InactiveMemberList from "./component/InactiveMemberList";
import InactiveMember from "./component/InactiveMember";

export default function Inactive() {
    const [searchQuery, setSearchQuery] = useState("");
  return (
    <MainLayout headerpath="/inactive" header="Inactive Member">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-4">
            <InactiveMember searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <InactiveMemberList searchQuery={searchQuery} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
