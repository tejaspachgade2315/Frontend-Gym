"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Member {
  id: number;
  name: string;
  email: string;
}

interface AddMemberProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddMember: () => void;
}

export default function AddMember({ searchQuery, setSearchQuery, onAddMember }: AddMemberProps) {
  return ( 
    <div className="max-md:sticky max-md:top-16 max-md:z-10 bg-background">
      <div className="flex-col items-center justify-between space-y-2 md:flex md:flex-row">
        <h2 className="text-3xl font-bold tracking-tight">MEMBERS</h2>
        <div className="flex justify-between items-center space-x-4">
          <div className="relative w-full">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search a Member"
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
            Add Member
          </Button>
        </div>
      </div>
    </div>
  );
}
