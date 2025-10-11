"use client";
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/mainlayout";
import Members from "./component/membersList";
import AddMember from "./component/add";
import AddMemberModal from "./component/addMemberModal";

export default function MemberPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  return (
    <MainLayout headerpath="/members" header="Members">
      <div className="flex-col md:flex ">
        <div className="flex-1 space-y-4 px-6">
          <div className="flex flex-col gap-4">
            <AddMember searchQuery={searchQuery} setSearchQuery={setSearchQuery} onAddMember={handleOpenModal} />
            <Members searchQuery={debouncedSearchQuery} />
          </div>
        </div>
      </div>
      <AddMemberModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </MainLayout>
  );
}
