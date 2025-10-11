"use client";
import React, { useState } from "react";
import MainLayout from "@/components/layouts/mainlayout";
import MembershipList from "./component/membershipList";
import Search from "./component/search";
import AddMembershipModal from "./component/addmembershipmodal";

export default function MembershipPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MainLayout headerpath="/membership" header="Membership">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4">
          <div>
            <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} onAddPackage={handleOpenModal} />
            <MembershipList searchQuery={searchQuery} />
          </div>
        </div>
      </div>
      <AddMembershipModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </MainLayout>
  );
}
