import { getToken } from "@/lib/token";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatToDDMMYYYY } from "@/utils/helper";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { IndianRupee } from "lucide-react";
import SalaryForm from "./addSalary"; // Import SalaryForm component
interface SalaryFormData {
  staffId: string;
  salaryMonth: string;
  salaryYear: number;
  amount: number;
  creditedDate: string;
  paymentMethod: "Cash" | "Online" | "Cheque";
  status: "Paid" | "Waiting";
}
interface Salary {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  isActive: boolean;
  gender: string;
  age: number;
  phone: string;
  address: string;
  hireDate: string;
  salary: number;
  createdAt: string;
  updatedAt: string;
}

export default function AwaitSalary({ searchQuery }) {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [prefillData, setPrefillData] = useState<Partial<SalaryFormData> | undefined>(undefined);

  const fetchAwaitingSalaries = async () => {
    const token = getToken("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get<Salary[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/salaries/awaiting`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalaries(response.data);
    } catch (error) {
      setError("Failed to fetch salaries");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchAwaitingSalaries();
  };

  const dateFormatter = (dateString: string): string => {
    const date = new Date(dateString);
    date.setMonth(date.getMonth() - 1); // Adjust to show the previous month
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  useEffect(() => {
    fetchAwaitingSalaries();
  }, []);

  const filteredSalary = salaries.filter(
    (salary) =>
      salary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salary.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      salaries.map((salary) => ({
        Name: salary.name,
        Email: salary.email,
        Phone: salary.phone,
        Role: salary.role,
        "Hire Date": formatToDDMMYYYY(salary.hireDate),
        Salary: salary.salary,
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salaries");
    XLSX.writeFile(workbook, "awaiting_salaries.xlsx");
  };

  const MobileSkeletonLoader = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="p-4 border rounded-lg shadow-md">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
  const handleOpenForm = (salary: Salary) => {
    setPrefillData({
      staffId: salary._id,
      salaryMonth: new Date().toLocaleString("en-US", { month: "long" }),
      salaryYear: new Date().getFullYear(),
      amount: salary.salary,
      creditedDate: new Date().toISOString().split("T")[0],
      paymentMethod: "Cash",
      status: "Paid",
    });
    setIsFormOpen(true);
  };

  return (
    <div>
      <Button onClick={handleExportToExcel} className="md:mt-8">
        Export to Excel
      </Button>
      {!loading && !error && <h2 className="text-lg font-semibold mb-2">{dateFormatter(new Date().toISOString())}</h2>}
      <div className="hidden md:block">
        <Table>
          <TableCaption>List of Staff with awaiting salaries.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Sr.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 8 }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-red-500">
                  {error}
                  <div className="mt-4">
                    <Button onClick={handleRetry} className="ml-4">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSalary.length > 0 ? (
              filteredSalary.map((salary, index) => (
                <TableRow key={salary._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{salary.name}</TableCell>
                  <TableCell>{salary.email}</TableCell>
                  <TableCell>{salary.phone}</TableCell>
                  <TableCell>{salary.role}</TableCell>
                  <TableCell>{formatToDDMMYYYY(salary.hireDate)}</TableCell>
                  <TableCell>{salary.salary}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="outline" onClick={() => handleOpenForm(salary)}>
                      <IndianRupee className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <SalaryForm isOpen={isFormOpen} handleClose={() => setIsFormOpen(false)} prefillData={prefillData} />
    </div>
  );
}
