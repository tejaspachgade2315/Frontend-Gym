import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import AddLeadForm from "./addlead";

interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function LeadHeader({ searchQuery, setSearchQuery }: SearchProps) {
  // const [searchQuery, setSearchQuery] = useState("");
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="sticky z-10 top-16">
      <div className="flex-col items-center justify-between space-y-2 md:flex md:flex-row">
        <h2 className="text-3xl font-bold tracking-tight">Lead Tracking</h2>
        <div className="flex justify-between items-center space-x-4">
          <Input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search a Payment"
            className="w-full p-3 text-[hsl(var(--foreground))] bg-[hsl(var(--background))] border border-border rounded-lg focus:ring-[hsl(var(--primary))] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] focus:outline-none"
            >
              ✖
            </button>
          )}
          <Button
            onClick={() => setIsLeadFormOpen(true)}
            className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg shadow hover:bg-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--primary))] transition-all duration-200 ease-in-out"
          >
            Add Lead
          </Button>
        </div>
      </div>

      <AddLeadForm isOpen={isLeadFormOpen} handleClose={() => setIsLeadFormOpen(false)} />
    </div>
  );
}
