import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import axios from "axios";
import { getToken, removeToken } from "@/lib/token";
import { useRouter } from "next/navigation";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface ChangePasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePassword({ isOpen, onClose }: ChangePasswordProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const [isdisabled, setIsdisabled] = useState(false);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggleVisibility = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const onSubmit = async (data: any) => {
    console.log("data", data);
    const token = getToken("token");
    if (!token) {
      return;
    }
    try {
      setIsdisabled(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/changepassword`,
        {
          oldPassword: data.currentPassword,
          newPassword: data.confirmPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("response---", response);
      removeToken("token");
      router.push("/auth/login");
      
      onClose();
    } catch (error) {
      console.log("err-----", error);
    } finally {
      setIsdisabled(false);
    }
  };

  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {["current", "new", "confirm"].map((field) => (
            <div key={field} className="relative">
              <Label htmlFor={`${field}-password`}>
                {field === "current" ? "Current Password" : field === "new" ? "New Password" : "Confirm New Password"}
              </Label>
              <div className="relative">
                <Input
                  id={`${field}-password`}
                  type={showPassword[field] ? "text" : "password"}
                  {...register(`${field}Password` as "currentPassword" | "newPassword" | "confirmPassword")}
                  placeholder={
                    field === "current"
                      ? "Enter current password"
                      : field === "new"
                        ? "Enter new password"
                        : "Confirm new password"
                  }
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={() => toggleVisibility(field as "current" | "new" | "confirm")}
                >
                  {showPassword[field] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors[`${field}Password`]?.message && (
                <p className="text-red-500 text-sm">{String(errors[`${field}Password`]?.message)}</p>
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="submit" disabled={isdisabled}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
