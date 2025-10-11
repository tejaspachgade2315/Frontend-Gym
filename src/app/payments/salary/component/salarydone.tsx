import { getToken } from "@/lib/token";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import * as XLSX from "xlsx";
import { formatToDDMMYYYY } from "@/utils/helper";
import { Button } from "@/components/ui/button";

interface Salary {
  _id: string;
  staffId?: {
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
  createdAt: string;
  updatedAt: string;
}

export default function SalaryDone({ searchQuery }) {
  const [salaries, setSalaries] = useState<Record<string, Salary[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAwaitingSalaries = async () => {
    const token = getToken("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get<Salary[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/salaries/paid`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const groupedSalaries = response.data.reduce(
        (acc, salary) => {
          const key = `${salary.salaryMonth} ${salary.salaryYear}`;
          // eslint-disable-next-line security/detect-object-injection
          if (!acc[key]) acc[key] = [];
          // eslint-disable-next-line security/detect-object-injection
          acc[key].push(salary);
          return acc;
        },
        {} as Record<string, Salary[]>,
      );

      setSalaries(groupedSalaries);
    } catch (error) {
      console.log(error);
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

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      Object.values(salaries)
        .flat()
        .map((salary) => ({
          Name: salary.staffId?.name ?? "N/A",
          Email: salary.staffId?.email ?? "N/A",
          Phone: salary.staffId?.phone ?? "N/A",
          Role: salary.staffId?.role ?? "N/A",
          "Hire Date": formatToDDMMYYYY(salary.staffId?.hireDate ?? "N/A"),
          Salary: salary.staffId?.salary ?? "N/A",
          Amount: salary.amount,
          "Payment Method": salary.paymentMethod,
          "Credited Date": formatToDDMMYYYY(salary.creditedDate),
          Status: salary.status,
        })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salaries");
    XLSX.writeFile(workbook, "salaries.xlsx");
  };

  useEffect(() => {
    fetchAwaitingSalaries();
  }, []);

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

  return (
    <div>
      <Button onClick={handleExportToExcel} className="md:mt-8">
        Export to Excel
      </Button>
      {loading ? (
        <>
          <div className="max-md:hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr.No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Credited Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 11 }).map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden">
            <MobileSkeletonLoader />
          </div>
        </>
      ) : error ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Credited Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={11} className="text-center text-red-500">
                {error}
                <div className="mt-4">
                  <Button onClick={handleRetry} className="ml-4">
                    Retry
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ) : Object.keys(salaries).length === 0 ? (
        <div className="text-center text-gray-500">No salaries found.</div>
      ) : (
        Object.entries(salaries)
          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
          .map(([monthYear, salaryList]) => (
            <div key={monthYear} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{monthYear}</h2>
              <div className="max-md:hidden">
                {" "}
                <Table>
                  <TableCaption>Paid Salaries for {monthYear}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr.No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Hire Date</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Credited Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading
                      ? Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            {Array.from({ length: 12 }).map((_, colIndex) => (
                              <TableCell key={colIndex}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      : salaryList.map((salary, index) => (
                          <TableRow key={salary._id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{salary.staffId?.name ?? "N/A"}</TableCell>
                            <TableCell>{salary.staffId?.email ?? "N/A"}</TableCell>
                            <TableCell>{salary.staffId?.phone ?? "N/A"}</TableCell>
                            <TableCell>{salary.staffId?.role ?? "N/A"}</TableCell>
                            <TableCell>{formatToDDMMYYYY(salary.staffId?.hireDate ?? "N/A")}</TableCell>
                            <TableCell>{salary.staffId?.salary ?? "N/A"}</TableCell>
                            <TableCell>{salary.amount}</TableCell>
                            <TableCell>{salary.paymentMethod}</TableCell>
                            <TableCell>{formatToDDMMYYYY(salary.creditedDate)}</TableCell>
                            <TableCell>{salary.status}</TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-4">
                {salaryList.map((salary) => (
                  <div key={salary._id} className="p-4 border rounded-lg shadow-md">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-800">{salary.staffId?.name ?? "N/A"}</p>
                      <p className="text-sm text-gray-600">{salary.staffId?.email ?? "N/A"}</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-700">Phone:</span> {salary.staffId?.phone ?? "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-700">Hire Date:</span>{" "}
                        {formatToDDMMYYYY(salary.staffId?.hireDate ?? "N/A")}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-700">Salary:</span> {salary.staffId?.salary ?? "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-700">Credited Date:</span>{" "}
                        {formatToDDMMYYYY(salary.creditedDate)}
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
  );
}
