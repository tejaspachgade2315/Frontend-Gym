import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { getToken } from "@/lib/token";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { formatToDDMMYYYY } from "@/utils/helper";

interface PaymentFormData {
  userId: string;
  amount: number;
  Date: string;
  status: "Paid";
  name: string;
  phone: string;
}

interface Payment {
  _id: string;
  name: string;
  phone: string;
  remainingAmount: number;
  membership: {
    name: string;
  };
}

interface PaymentFormProps {
  isOpen: boolean;
  handleClose: () => void;
  selectedPayment: Payment;
  fetchPayments: () => void;
}

interface Membership {
  _id: string;
  price: number;
}

interface Member {
  _id: string;
  name: string;
  membership?: Membership;
  remainingAmount?: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ isOpen, handleClose, selectedPayment, fetchPayments }) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>();

  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [isdisable, setIsdisable] = useState(false);
  const x = "Rs. ";

  const fetchMembers = async () => {
    const token = getToken("token");
    if (!token) {
      return;
    }
    try {
      const response = await axios.get<Member[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response);
      setMembers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMembers();
    if (selectedPayment) {
      setValue("userId", selectedPayment._id);
      setValue("amount", selectedPayment.remainingAmount);
      setValue("Date", new Date().toISOString().split("T")[0]);
      setValue("status", "Paid");
      setValue("name", selectedPayment.name);
      setValue("phone", selectedPayment.phone);
    }
  }, [selectedPayment]);

  const generateInvoicePDF = async (id) => {
    console.log("idd", id);
    const doc = new jsPDF();

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken("token")}`,
        },
      });

      console.log("response.data", response.data);

      // Set invoice title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("INVOICE", 105, 20, { align: "center" });

      // Company details
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Aeons Gym", 14, 30);
      doc.text("123, Business Street, City, Country", 14, 36);
      doc.text("Email: support@xyz.com", 14, 42);
      doc.text(`Date: ${formatToDDMMYYYY(new Date().toLocaleDateString())}`, 150, 30);

      // Customer details
      doc.setFont("helvetica", "bold");
      doc.text("Bill To:", 14, 55);
      doc.setFont("helvetica", "normal");
      doc.text(response.data.userId.name, 14, 62);
      doc.text(response.data.userId.email, 14, 68);
      doc.text(`Phone: ${response.data.userId.phone}`, 14, 74);

      // Line Separator
      doc.line(14, 80, 196, 80);

      // Invoice Items
      let startY = 90;
      doc.setFont("helvetica", "bold");
      doc.text("Description", 14, startY);
      doc.text("Amount", 180, startY, { align: "right" });

      doc.setFont("helvetica", "normal");
      startY += 10;

      startY += 8;
      doc.text("Membership Name", 14, startY);
      doc.text(`${response.data.userId.membership.name}`, 180, startY, { align: "right" });

      startY += 8;
      doc.text("Membership Price", 14, startY);
      doc.text(`${x}${response.data.userId.membership.price}`, 180, startY, { align: "right" });

      startY += 8;
      doc.text("Amount Paid", 14, startY);
      doc.text(`${x}${response.data.amount}`, 180, startY, { align: "right" });

      startY += 8;
      doc.text("Remaining Balance", 14, startY);
      doc.text(`${x}${response.data.userId.remainingAmount}`, 180, startY, { align: "right" });

      startY += 8;
      doc.text("Payment Date", 14, startY);
      doc.text(formatToDDMMYYYY(response.data.Date), 180, startY, { align: "right" });

      // Line Separator
      doc.line(14, startY + 10, 196, startY + 10);

      // Total Amount
      startY += 20;
      doc.setFont("helvetica", "bold");
      doc.text("Total Amount", 14, startY);
      doc.text(`${x}${response.data.amount}`, 180, startY, { align: "right" });

      // Footer
      startY += 20;
      doc.setFont("helvetica", "italic");
      doc.text("Thanks for joining Aeons Gym!", 105, startY, { align: "center" });

      // Save the PDF to a Blob
      const pdfBlob = doc.output("blob");

      return pdfBlob;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  };

  const handleSend = async ({ phone, name, organization, invoice }) => {
    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("name", name);
    formData.append("organization", organization);
    formData.append("invoice", invoice, "invoice.pdf");

    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/send-receipt`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${getToken("token")}` },
      });
      console.log("response", response);
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          const errorMessage = error.response?.data?.error || "Unauthorized";
          console.log(errorMessage === "Whatsapp messaging limit exceeded");
          if (errorMessage === "Whatsapp messaging limit exceeded") {
            toast({
              title: "Error",
              variant: "destructive",
              description: "WhatsApp message limit reached. Please try again later.",
            });
          } else {
            toast({
              title: "Error",
              variant: "destructive",
              description: errorMessage,
            });
          }
        } else {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to send message",
            variant: "destructive",
          });
        }
      }
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setIsdisable(true);
      console.log(data);
      const response: any = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment`, data, {
        headers: {
          Authorization: `Bearer ${getToken("token")}`,
        },
      });

      console.log("response", response.data);

      const pdfBlob = await generateInvoicePDF(response.data.payment._id);

      const result = await handleSend({
        phone: selectedPayment.phone,
        name: selectedPayment.name,
        organization: "Aeons Gym",
        invoice: pdfBlob,
      });
      // if (result === undefined) {
      //   handleClose();
      //   toast({
      //     title: "Error",
      //     variant: "destructive",
      //     description: "WhatsApp message limit reached. Please try again later.",
      //   });
      //   fetchPayments();
      // } else {
      handleClose();
      toast({
        title: "Success!",
        description: "Payment done successfully and payment receipt sent to customer.",
        variant: "default",
      });
      fetchPayments();
      // }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error",
          description: error.response?.data?.message,
          variant: "destructive",
        });
        console.log("error=====", error.response?.data?.message);
      }
    } finally {
      setIsdisable(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Submit Payment</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Fill in the details to submit a new payment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="userId">Member</Label>
            <Controller
              name="userId"
              control={control}
              rules={{ required: "User is required" }}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    field.onChange(e);
                    const selectedMember = members.find((member: any) => member._id === e.target.value);
                    if (selectedMember) {
                      setValue("amount", selectedMember?.remainingAmount ?? 0);
                    }
                  }}
                >
                  <option value="">Select a user</option>
                  {members.map((member: any) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.userId && <p className="text-red-500 text-sm">{errors.userId.message}</p>}
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              {...register("amount", { required: "Amount is required", valueAsNumber: true })}
              placeholder="Enter amount"
              className="w-full"
            />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
          </div>

          <div>
            <Label htmlFor="Date">Date</Label>
            <Input id="Date" type="date" {...register("Date", { required: "Date is required" })} className="w-full" />
            {errors.Date && <p className="text-red-500 text-sm">{errors.Date.message}</p>}
          </div>

          <div>
            <Label htmlFor="membershipPlan">Membership Plan</Label>
            <Input
              id="membershipPlan"
              type="text"
              value={selectedPayment?.membership?.name ?? ""}
              readOnly
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Input value="Paid" {...register("status")} />
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="px-4 py-2 text-sm sm:text-base">
              Cancel
            </Button>
            <Button type="submit" className="px-4 py-2 text-sm sm:text-base" disabled={isdisable}>
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm;
