import { getToken } from "@/lib/token";
import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatToDDMMYYYY } from "@/utils/helper";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

interface Payment {
  _id: string;
  name: string;
  email: string;
  userId: {
    name: string;
    email: string;
    remainingAmount: number;
    startDate: string;
    endDate: string;
    phone: number;
    membership: {
      name: string;
      price: number;
    };
  };
  amount: number;
  Date: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface PaymentsDoneProps {
  searchQuery: string;
}

export default function Paymentdone({ searchQuery }: PaymentsDoneProps) {
  const [paymentdone, setPaymentdone] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayment = async () => {
    const token = getToken("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get<Payment[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/paid`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("response", response);
      setPaymentdone(response.data);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchPayment();
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

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      paymentdone.map((payment) => ({
        Name: payment.userId.name,
        Email: payment.userId.email,
        Phone: payment.userId.phone,
        Amount: payment.amount,
        Remaining: payment.userId.remainingAmount,
        "Payment Date": formatToDDMMYYYY(payment.Date),
        "Start Date": formatToDDMMYYYY(payment?.userId?.startDate),
        "End Date": formatToDDMMYYYY(payment?.userId?.endDate),
        "Membership Name": payment.userId.membership.name,
        "Membership Price": payment.userId.membership.price,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "payments.xlsx");
  };

  useEffect(() => {
    fetchPayment();
  }, []);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const filteredPayments = useMemo(() => {
    if (debouncedSearchQuery) {
      return paymentdone.filter((payment) =>
        payment.userId.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
      );
    }
    return paymentdone;
  }, [debouncedSearchQuery, paymentdone]);

  return (
    <div>
      <Button onClick={handleExportToExcel}>Export to Excel</Button>
      {loading ? (
        <>
          {/* Desktop Table Loader - Hidden on Mobile */}
          <div className="max-md:hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr.No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Membership Price</TableHead>
                  <TableHead className="text-right">Membership</TableHead>
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
          {/* Mobile Skeleton Loader - Hidden on Desktop */}
          <div className="md:hidden">
            <MobileSkeletonLoader />
          </div>
        </>
      ) : error ? (
        <div className="text-center mt-8">
          <p className="text-red-500">{error}</p>
          <Button onClick={handleRetry} className="mt-4">
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table - Hidden on Mobile */}
          <div className="max-md:hidden">
            <Table>
              <TableCaption>List of members with completed payments.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Sr.No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Membership Price</TableHead>
                  <TableHead className="text-right">Membership</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment, index) => (
                    <TableRow key={payment._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{payment.userId?.name}</TableCell>
                      <TableCell>{payment.userId?.email}</TableCell>
                      <TableCell>{payment.userId?.phone}</TableCell>
                      <TableCell>{payment?.amount}</TableCell>
                      <TableCell>{payment.userId?.remainingAmount}</TableCell>
                      <TableCell>{formatToDDMMYYYY(payment?.Date)}</TableCell>
                      <TableCell>{formatToDDMMYYYY(payment?.userId?.startDate)}</TableCell>
                      <TableCell>{formatToDDMMYYYY(payment?.userId?.endDate)}</TableCell>
                      <TableCell>{payment?.userId?.membership?.price}</TableCell>
                      <TableCell className="text-right">{payment?.userId?.membership?.name}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-center" colSpan={10}>
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Mobile View - Hidden on Desktop */}
          <div className="md:hidden mb-4">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment, index) => (
                <div key={payment._id} className="p-4 mt-4 border rounded-lg shadow-sm">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{payment.userId?.name}</p>
                    <p className="text-sm text-gray-600">{payment.userId?.email}</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Phone:</span> {payment.userId?.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Payment Date:</span> {formatToDDMMYYYY(payment?.Date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Remaining Amount:</span> ₹
                      {payment?.userId?.remainingAmount}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Membership Price:</span> ₹
                      {payment?.userId?.membership?.price}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Membership:</span> {payment?.userId?.membership?.name}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center">No data available</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
