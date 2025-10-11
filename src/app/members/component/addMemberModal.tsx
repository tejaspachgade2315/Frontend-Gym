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
  role: z.enum(["member"]),
  age: z.preprocess((val) => Number(val), z.number().min(1, "Age must be greater than zero")),
  height: z.preprocess((val) => Number(val), z.number().min(1, "Height must be greater than zero")),
  weight: z.preprocess((val) => Number(val), z.number().min(1, "Weight must be greater than zero")),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number must not exceed 10 digits"),
  address: z.string().min(1, "Address is required"),
  startDate: z.string().min(1, "Start date is required"),
  membership: z.string().min(1, "Membership is required"),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
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
      role: "member",
      gender: "male",
      age: 0,
      height: 0,
      weight: 0,
      phone: "",
      address: "",
      startDate: "",
      membership: "", // Default membership type
    },
  });

  const { toast } = useToast();
  const [membership, setMembership] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);

  const onSubmit = async (data: MemberFormValues) => {
    setIsDisabled(true);
    const token = getToken("token");
    if (!token) {
      toast({ title: "Unauthorized", description: "No token found", variant: "destructive" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("gender", data.gender);
      formData.append("age", String(Number(data.age))); // Ensure number conversion
      formData.append("height", String(Number(data.height))); // Ensure number conversion
      formData.append("weight", String(Number(data.weight))); // Ensure number conversion
      formData.append("phone", data.phone);
      formData.append("role", data.role);
      formData.append("address", data.address);
      formData.append("startDate", data.startDate);
      formData.append("membership", data.membership);
      // ✅ Fix Image Upload
      if (data.image && data.image.length > 0) {
        formData.append("image", data.image[0]); // Correct file handling
      }
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/register`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      console.log(response.data);

      toast({ title: "Success!", description: "Member added successfully.", variant: "default" });
      location.reload();
      reset();
      onClose();
    } catch (error) {
      console.log(error);
      let errorMessage = "Something went wrong!";
      if (axios.isAxiosError(error)) {
        console.log(error.response?.status);
        if (error.response?.status === 400) {
          errorMessage = "Email already exists!";
        } else {
          errorMessage = error.response?.data?.message || error.message;
        }
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsDisabled(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    const token = getToken("token");
    const fetchMembership = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/membership`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data);
        setMembership(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMembership();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[95%] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>Fill in the details to add a new member.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <InputField label="Name" id="name" register={register} error={errors.name} />
            <InputField label="Email" id="email" register={register} error={errors.email} />
            <div>
              <Label htmlFor="image">Image</Label>
              <Input id="image" type="file" accept="image/*" {...register("image")} className="w-full" />
              {errors.image && <p className="text-red-500 text-sm">{String(errors.image.message)}</p>}
            </div>
            <InputField label="Phone" id="phone" register={register} error={errors.phone} />
            <InputField label="Address" id="address" register={register} error={errors.address} />
            <InputField label="Start Date" id="startDate" type="date" register={register} error={errors.startDate} />
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
              <Label>Membership Type</Label>
              <select {...register("membership")} className="w-full border rounded p-2">
                <option value="">Select Membership</option>
                {membership.length > 0 ? (
                  membership.map((item: { _id: string; name: string }) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading memberships...</option>
                )}
              </select>
              {errors.membership && <p className="text-red-500 text-sm">{errors.membership.message}</p>}
            </div>
            <InputField label="Age" id="age" type="number" register={register} error={errors.age} />
            <InputField label="Height (cm)" id="height" type="number" register={register} error={errors.height} />
            <InputField label="Weight (kg)" id="weight" type="number" register={register} error={errors.weight} />
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isDisabled}>
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
}

const InputField: React.FC<InputFieldProps> = ({ label, id, register, error, type = "text" }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} type={type} {...register(id)} className="w-full" />
    {error?.message && <p className="text-red-500 text-sm">{error.message}</p>}
  </div>
);
