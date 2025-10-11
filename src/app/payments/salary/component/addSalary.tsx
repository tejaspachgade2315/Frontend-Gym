import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/token";
import { getYear, getMonth, subMonths } from "date-fns";

interface SalaryFormData {
  staffId: string;
  salaryMonth: string;
  salaryYear: number;
  amount: number;
  creditedDate: string;
  paymentMethod: "Cash" | "Online" | "Cheque";
  status: "Paid" | "Waiting";
}

const SalaryForm: React.FC<{ isOpen: boolean; handleClose: () => void; prefillData?: Partial<SalaryFormData> }> = ({
  isOpen,
  handleClose,
  prefillData,
}) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SalaryFormData>();

  const { toast } = useToast();
  const [members, setMembers] = useState<{ _id: string; name: string; salary: number }[]>([]);
  const [isDisable, setIsDisable] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<number | null>(null);
  const currentYear = getYear(new Date());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getPreviousMonth = () => {
    const currentMonthIndex = getMonth(new Date());
    if (currentMonthIndex === 2) {
      return ["January", "February"];
    }
    const previousMonthDate = subMonths(new Date(), 1);
    return [months[getMonth(previousMonthDate)]];
  };

  useEffect(() => {
    const fetchMembers = async () => {
      const token = getToken("token");
      if (!token) return;
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/staff`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    if (prefillData) {
      Object.entries(prefillData).forEach(([key, value]) => {
        setValue(key as keyof SalaryFormData, value);
      });
      if (prefillData.amount) {
        setSelectedSalary(prefillData.amount);
      }
    }
  }, [prefillData, setValue]);

  const onSubmit = async (data: SalaryFormData) => {
    try {
      setIsDisable(true);
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/salaries`, data, {
        headers: { Authorization: `Bearer ${getToken("token")}` },
      });
      toast({ title: "Success", description: "Salary entry created successfully." });
      handleClose();
      location.reload();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({ title: "Error", description: error.response?.data?.message, variant: "destructive" });
      }
    } finally {
      setIsDisable(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Salary Entry</DialogTitle>
          <DialogDescription>Fill in the details to add a new salary record.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="staffId">Staff</Label>
            <Controller
              name="staffId"
              control={control}
              rules={{ required: "Staff is required" }}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const selectedMember = members.find((member: any) => member._id === value);
                    if (selectedMember) {
                      setSelectedSalary(selectedMember.salary);
                      setValue("amount", selectedMember.salary);
                    }
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member: any) => (
                      <SelectItem key={member._id} value={member._id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.staffId && <p className="text-red-500 text-sm">{errors.staffId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salaryMonth">Salary Month</Label>
              <Controller
                name="salaryMonth"
                control={control}
                rules={{ required: "Salary Month is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPreviousMonth().map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.salaryMonth && <p className="text-red-500 text-sm">{errors.salaryMonth.message}</p>}
            </div>
            <div>
              <Label htmlFor="salaryYear">Salary Year</Label>
              <Controller
                name="salaryYear"
                control={control}
                defaultValue={currentYear}
                rules={{ required: "Salary Year is required" }}
                render={({ field }) => (
                  <Input
                    id="salaryYear"
                    type="number"
                    {...field}
                    value={field.value || currentYear}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {errors.salaryYear && <p className="text-red-500 text-sm">{errors.salaryYear.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              {...register("amount", { required: "Amount is required", valueAsNumber: true })}
              value={selectedSalary ?? ""}
              readOnly
            />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
          </div>

          <div>
            <Label htmlFor="creditedDate">Credited Date</Label>
            <Input id="creditedDate" type="date" {...register("creditedDate", { required: "Date is required" })} />
            {errors.creditedDate && <p className="text-red-500 text-sm">{errors.creditedDate.message}</p>}
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Controller
              name="paymentMethod"
              control={control}
              rules={{ required: "Payment method is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentMethod && <p className="text-red-500 text-sm">{errors.paymentMethod.message}</p>}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isDisable}>
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SalaryForm;
