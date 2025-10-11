import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import PaymentForm from "./addpayment"; // Import PaymentForm component
interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function BillingHeader({ searchQuery, setSearchQuery }: SearchProps) {
  // const [searchQuery, setSearchQuery] = useState("");
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex-col items-center justify-between space-y-2 md:flex md:flex-row">
      <h2 className="text-3xl font-bold tracking-tight">Member Payments</h2>
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
        {/* <Button
            onClick={() => setIsPaymentFormOpen(true)} // Open modal on button click
            className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg shadow hover:bg-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--primary))] transition-all duration-200 ease-in-out"
          >
            Add Payment
          </Button> */}
      </div>

      {/* Payment Form Modal */}
      {/* <PaymentForm isOpen={isPaymentFormOpen} handleClose={() => setIsPaymentFormOpen(false)}  /> */}
    </div>
  );
}
