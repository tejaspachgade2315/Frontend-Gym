"use client";
import React, { useState } from "react";
import MainLayout from "@/components/layouts/mainlayout";
import StaffList from "./component/staffList";
import AddMember from "./component/add";
import AddStaffModal from "./component/addStaffModal";

export default function MemberPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const [searchQuery, setSearchQuery] = useState("");
  return (
    <MainLayout headerpath="/staff" header="Staff">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4 px-6">
          <div className="flex flex-col gap-4">
            <AddMember searchQuery={searchQuery} setSearchQuery={setSearchQuery} onAddMember={handleOpenModal} />
            <StaffList searchQuery={searchQuery} />
          </div>
        </div>
      </div>
      <AddStaffModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </MainLayout>
  );
}
