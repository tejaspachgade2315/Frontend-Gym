import { getToken } from "@/lib/token";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatToDDMMYYYY } from "@/utils/helper";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

interface Salary {
  _id: string;
  staff: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    hireDate: string;
    salary: number;
  };
  salaryMonth: string;
  salaryYear: number;
  amount: number;
  creditedDate: string;
  paymentMethod: string;
  status: string;
}

interface SalaryGroup {
  _id: { salaryMonth: string; salaryYear: number };
  totalAmount: number;
  salaries: Salary[];
}

export default function PreviousSalary({ searchQuery }) {
  const [salaryGroups, setSalaryGroups] = useState<SalaryGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalaries = async () => {
    const token = getToken("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get<SalaryGroup[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/salaries/previous`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      setSalaryGroups(response.data);
    } catch (error) {
      console.error("Error fetching salaries:", error);
      setError("Failed to fetch salaries");
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      salaryGroups.flatMap((group) =>
        group.salaries.map((salary) => ({
          Name: salary.staff.name,
          Email: salary.staff.email,
          Phone: salary.staff.phone,
          Role: salary.staff.role,
          "Hire Date": formatToDDMMYYYY(salary.staff.hireDate),
          Month: salary.salaryMonth,
          Year: salary.salaryYear,
          Salary: salary.staff.salary,
          "Credited Date": formatToDDMMYYYY(salary.creditedDate),
          "Payment Method": salary.paymentMethod,
          Status: salary.status,
        })),
      ),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Previous Salaries");
    XLSX.writeFile(workbook, "previous_salaries.xlsx");
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchSalaries();
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  return (
    <div>
      <div className="md:mt-12">
        <Button onClick={handleExportToExcel}>Export to Excel</Button>
      </div>
      <div className="max-md:hidden"><Table>
        <TableCaption>List of previous salaries.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Hire Date</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Credited Date</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 9 }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-red-500">
                {error}
                <div className="mt-4">
                  <Button onClick={handleRetry} className="ml-4">
                    Retry
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : salaryGroups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-gray-500">
                No salary records found.
              </TableCell>
            </TableRow>
          ) : (
            salaryGroups.map((group) => (
              <React.Fragment key={`${group._id.salaryMonth}-${group._id.salaryYear}`}>
                <TableRow className="bg-gray-100">
                  <TableCell colSpan={9} className="text-center font-semibold">
                    {group._id.salaryMonth} {group._id.salaryYear} - Total: ₹{group.totalAmount}
                  </TableCell>
                </TableRow>
                  {group.salaries.map((salary) => (
                    <TableRow key={salary._id}>
                      <TableCell>{salary.staff.name}</TableCell>
                      <TableCell>{salary.staff.email}</TableCell>
                      <TableCell>{salary.staff.phone}</TableCell>
                      <TableCell>{salary.staff.role}</TableCell>
                      <TableCell>{formatToDDMMYYYY(salary.staff.hireDate)}</TableCell>
                      <TableCell>₹{salary.staff.salary}</TableCell>
                      <TableCell>{formatToDDMMYYYY(salary.creditedDate)}</TableCell>
                      <TableCell>{salary.paymentMethod}</TableCell>
                      <TableCell>{salary.status}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table></div>
      
      <div className="md:hidden">
  {loading ? (
    <Skeleton className="h-6 w-full" />
  ) : error ? (
    <div>{error}</div>
  ) : salaryGroups.length === 0 ? (
    <div>No salary records found.</div>
  ) : (
    salaryGroups.map((group) => (
      <div key={`${group._id.salaryMonth}-${group._id.salaryYear}`} className="mb-6">
        <p className="text-center font-semibold mb-4">
          {group._id.salaryMonth} {group._id.salaryYear} - Total: ₹{group.totalAmount}
        </p>

        <div className="space-y-4">
          {group.salaries.map((salary) => (
            <div key={salary._id} className="p-4 border rounded-lg shadow-sm">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-800">{salary.staff.name}</p>
                <p className="text-sm text-gray-600">{salary.staff.email}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Phone:</span> {salary.staff.phone}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Role:</span> {salary.staff.role}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Credited Date:</span> {formatToDDMMYYYY(salary.creditedDate)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Salary:</span> ₹{salary.staff.salary}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Payment Method:</span> {salary.paymentMethod}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))
  )}
</div>

    </div>
  );
}
