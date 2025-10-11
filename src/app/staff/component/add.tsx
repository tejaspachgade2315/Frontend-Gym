"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
interface AddMemberProps {
  onAddMember: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function AddMember({ onAddMember, searchQuery, setSearchQuery }: AddMemberProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="sticky top-16 z-10 bg-background">
      <div className="flex-col items-center justify-between space-y-2 md:flex md:flex-row">
        <h2 className="text-3xl font-bold tracking-tight">STAFF</h2>
        <div className="flex justify-between items-center space-x-4">
          <div className="relative w-full">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search a Staff/Trainer"
              className="w-full p-3 pr-10 text-[hsl(var(--foreground))] bg-[hsl(var(--background))] border border-border rounded-lg focus:ring-[hsl(var(--primary))] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] focus:outline-none"
              >
                ✖
              </button>
            )}
          </div>
          <Button
            onClick={onAddMember}
            className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg shadow hover:bg-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--primary))] transition-all duration-200 ease-in-out"
          >
            Add Staff
          </Button>
        </div>
      </div>
    </div>
  );
}
