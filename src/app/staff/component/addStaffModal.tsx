import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/token";
interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Zod Schema for validation
const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  image: z.any().optional(), // Accepts File instead of a URL
  gender: z.enum(["male", "female", "other"]),
  role: z.enum(["trainer", "manager", "receptionist", "cleaner"]),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  hireDate: z.string().min(1, "Hire date is required"),
  salary: z.preprocess((val) => Number(val), z.number().min(1, "Salary must be greater than 0")),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function AddStaffModal({ isOpen, onClose }: AddMemberModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      email: "",
      image: "",
      role: "trainer",
      gender: "male",
      phone: "",
      address: "",
      hireDate: "",
      salary: 0,
    },
  });

  const { toast } = useToast();

  const [isdisabled, setIsdisabled] = useState(false);

  const onSubmit = async (data: MemberFormValues) => {
    const token = getToken("token");
    if (!token) {
      toast({ title: "Unauthorized", description: "No token found", variant: "destructive" });
      return;
    }

    try {
      setIsdisabled(true);
      console.log("Staff API Called ");
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("gender", data.gender);
      formData.append("phone", data.phone);
      formData.append("role", data.role);
      formData.append("address", data.address);
      formData.append("hireDate", data.hireDate);
      formData.append("salary", data.salary.toString());
      // ✅ Fix Image Upload
      if (data.image && data.image.length > 0) {
        formData.append("image", data.image[0]); // Correct file handling
      }
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/registerstaff`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      console.log(response.data);

      toast({ title: "Success!", description: "Staff added successfully.", variant: "default" });
      location.reload();
      reset();
      onClose();
    } catch (error) {
      console.log(error);
      let errorMessage = "Something went wrong!";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsdisabled(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-4 sm:p-6 md:p-8 overflow-auto">
        <DialogHeader>
          <DialogTitle>Add Staff / Trainer</DialogTitle>
          <DialogDescription>Fill in the details to add a new Staff.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Name" id="name" register={register} error={errors.name} />
            <InputField label="Email" id="email" register={register} error={errors.email} />
            <div>
              <Label htmlFor="image">Image</Label>
              <Input id="image" type="file" accept="image/*" {...register("image")} className="w-full" />
              {errors.image && <p className="text-red-500 text-sm">{String(errors.image.message)}</p>}
            </div>
            <InputField label="Phone" id="phone" register={register} error={errors.phone} />
            <InputField label="Address" id="address" register={register} error={errors.address} />
            <InputField label="Hire Date" id="hireDate" type="date" register={register} error={errors.hireDate} />
            <div>
              <Label>Gender</Label>
              <select {...register("gender")} className="w-full border rounded p-2">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
            </div>
            <div>
              <Label>Role</Label>
              <select {...register("role")} className="w-full border rounded p-2">
                <option value="trainer">Trainer</option>
                <option value="manager">Manager</option>
                <option value="receptionist">Receptionist</option>
                <option value="cleaner">Cleaner</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
            </div>
            <InputField
              label="Salary"
              id="salary"
              register={register}
              error={errors.salary}
              type="number"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isdisabled}>
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface InputFieldProps {
  label: string;
  id: string;
  register: any;
  error?: { message?: string };
  type?: string;
  onInput?: any;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, register, error, type = "text", onInput }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} type={type} {...register(id)} className="w-full" />
    {error?.message && <p className="text-red-500 text-sm">{error.message}</p>}
  </div>
);
