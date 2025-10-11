import { getToken } from "@/lib/token";
import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatToDDMMYYYY } from "@/utils/helper";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { IndianRupee } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from "./addpayment";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component

interface Membership {
  _id: string;
  price: number;
  name: string;
}

interface Payment {
  _id: string;
  name: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  membership: Membership;
  remainingAmount: number;
}

interface PaymentFormData {
  userId: string;
  amount: number;
  Date: string;
  status: "Paid";
}
interface PaymentsAwaitProps {
  searchQuery: string;
}

export default function AwaitPayment({ searchQuery }: PaymentsAwaitProps) {
  const [totallyIncompleted, setTotallyIncompleted] = useState<Payment[]>([]);
  const [partiallyIncompleted, setPartiallyIncompleted] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>();

  const fetchPayments = async () => {
    const token = getToken("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }
    try {
      setLoading(true); // Set loading state to true
      const response = await axios.get<{ totallyIncompleted: Payment[]; partiallyIncompleted: Payment[] }>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/awaiting`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTotallyIncompleted(response.data.totallyIncompleted);
      setPartiallyIncompleted(response.data.partiallyIncompleted);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch payments");
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  const openModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const token = getToken("token");
      if (!token) return;
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "Success",
        description: "Payment submitted successfully",
        variant: "default",
      });
      closeModal();
      fetchPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit payment",
        variant: "destructive",
      });
    }
  };

  const handleExportToExcelOne = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      partiallyIncompleted.map((payment) => ({
        Name: payment.name,
        Email: payment.email,
        Phone: payment.phone,
        "Start Date": formatToDDMMYYYY(payment.startDate),
        "End Date": formatToDDMMYYYY(payment.endDate),
        Membership: payment.membership.name,
        Amount: payment.membership.price,
        RemaingAmount: payment.remainingAmount,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "partiallyincompleted.xlsx");
  };

  const handleExportToExcelTwo = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      totallyIncompleted.map((payment) => ({
        Name: payment.name,
        Email: payment.email,
        Phone: payment.phone,
        "Start Date": formatToDDMMYYYY(payment.startDate),
        "End Date": formatToDDMMYYYY(payment.endDate),
        Membership: payment.membership.name,
        Amount: payment.membership.price,
        RemaingAmount: payment.remainingAmount,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "totallyincompleted.xlsx");
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchPayments();
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredPartiallyIncompleted = partiallyIncompleted.filter((payment) => {
    return payment.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || payment.email.toLowerCase().includes(debouncedSearch.toLowerCase());
  });

  const filteredTotallyIncompleted = totallyIncompleted.filter((payment) => {
    return payment.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || payment.email.toLowerCase().includes(debouncedSearch.toLowerCase());
  });

  return (
    <div className="md:mt-8">
      {isModalOpen && selectedPayment && (
        <PaymentForm
          isOpen={isModalOpen}
          handleClose={closeModal}
          selectedPayment={selectedPayment}
          fetchPayments={fetchPayments}
        />
      )}
      <div className="flex items-center justify-between py-3">
        <h2 className="text-lg font-semibold">Totally Incompleted Payments</h2>
        <Button onClick={handleExportToExcelTwo}>Export to Excel</Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-sm">
              <Skeleton className="h-6 w-1/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4 mb-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          {error}
          <div className="mt-4">
            <Button onClick={handleRetry} className="ml-4">
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="max-md:hidden">
            <Table>
              <TableCaption>List of members with completely unpaid memberships.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr.No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTotallyIncompleted.map((payment, index) => (
                  <TableRow key={payment._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{payment.name}</TableCell>
                    <TableCell>{payment.email}</TableCell>
                    <TableCell>{payment.phone}</TableCell>
                    <TableCell>{payment.membership?.price}</TableCell>
                    <TableCell>{payment.remainingAmount}</TableCell>
                    <TableCell>{formatToDDMMYYYY(payment.startDate)}</TableCell>
                    <TableCell>{formatToDDMMYYYY(payment.endDate)}</TableCell>
                    <TableCell>{payment.membership?.name}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="outline" onClick={() => openModal(payment)}>
                        <IndianRupee className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden">
            {filteredTotallyIncompleted.map((payment, index) => (
              <div key={payment._id} className="p-4 border rounded-lg shadow-sm mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{payment.name}</p>
                    <p className="text-sm text-gray-600">{payment.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="icon" variant="outline" onClick={() => openModal(payment)}>
                      <IndianRupee className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p>
                    <span className="font-medium">Phone:</span> {payment.phone}
                  </p>
                  <p>
                    <span className="font-medium">Membership Price:</span> {payment.membership?.price}
                  </p>
                  <p>
                    <span className="font-medium">Membership :</span>
                    {payment.membership?.name}
                  </p>
                  <p>
                    <span className="font-medium">Remaining Amount :</span>
                    {payment.remainingAmount}
                  </p>
                  <p>
                    <span className="font-medium">Start Date :</span>
                    {formatToDDMMYYYY(payment.startDate)}
                  </p>
                  <p>
                    <span className="font-medium">End Date :</span>
                    {formatToDDMMYYYY(payment.endDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between py-3">
            <h2 className="text-lg font-semibold">Partially Incompleted Payments</h2>
            <Button onClick={handleExportToExcelOne}>Export to Excel</Button>
          </div>

          <div className="max-md:hidden">
            <Table>
              <TableCaption>List of members with partially paid memberships.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr.No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartiallyIncompleted.map((payment, index) => (
                  <TableRow key={payment._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{payment.name}</TableCell>
                    <TableCell>{payment.email}</TableCell>
                    <TableCell>{payment.phone}</TableCell>
                    <TableCell>{payment.membership?.price}</TableCell>
                    <TableCell>{payment.remainingAmount}</TableCell>
                    <TableCell>{formatToDDMMYYYY(payment.startDate)}</TableCell>
                    <TableCell>{formatToDDMMYYYY(payment.endDate)}</TableCell>
                    <TableCell>{payment.membership?.name}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="outline" onClick={() => openModal(payment)}>
                        <IndianRupee className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden">
            {filteredPartiallyIncompleted.map((payment, index) => (
              <div key={payment._id} className="p-4 border rounded-lg shadow-sm mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{payment.name}</p>
                    <p className="text-sm text-gray-600">{payment.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="icon" variant="outline" onClick={() => openModal(payment)}>
                      <IndianRupee className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p>
                    <span className="font-medium">Phone:</span> {payment.phone}
                  </p>
                  <p>
                    <span className="font-medium">Membership Price:</span> {payment.membership?.price}
                  </p>
                  <p>
                    <span className="font-medium">Membership :</span>
                    {payment.membership?.name}
                  </p>
                  <p>
                    <span className="font-medium">Remaining Amount :</span>
                    {payment.remainingAmount}
                  </p>
                  <p>
                    <span className="font-medium">Start Date :</span>
                    {formatToDDMMYYYY(payment.startDate)}
                  </p>
                  <p>
                    <span className="font-medium">End Date :</span>
                    {formatToDDMMYYYY(payment.endDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
