"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { getToken } from "@/lib/token";
import { set } from "date-fns";

interface AddMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Zod Schema for validation
const membershipSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(1, "Price must be greater than zero"),
  duration: z.number().min(1, "Duration must be at least 1 month"),
  features: z.string().min(1, "Features are required"),
  isActive: z.boolean(),
});

type MembershipFormValues = z.infer<typeof membershipSchema>;

export default function AddMembershipModal({ isOpen, onClose }: AddMembershipModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 0,
      features: "",
      isActive: true,
    },
  });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: MembershipFormValues) => {
    setIsSubmitting(true);
    console.log("Submitted Data:", data);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/membership`, data, {
        headers: {
          Authorization: `Bearer ${getToken("token")}`,
        },
      });
      toast({
        title: "Success!",
        description: "Membership added successfully.",
        variant: "default",
      });
      location.reload();
      reset();
      onClose();
    } catch (error) {
      console.log("error=====", error);
      let errorMessage = "Something went wrong!";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
    finally{
      setIsSubmitting(false);
    }
  };

  const handleclose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleclose}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Add Membership</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Fill in the details to add a new membership.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} placeholder="Enter name" className="w-full" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter description"
              className="w-full"
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                placeholder="Enter price"
                className="w-full"
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
            </div>

            <div>
              <Label htmlFor="duration">Duration (months)</Label>
              <Input
                id="duration"
                type="number"
                {...register("duration", { valueAsNumber: true })}
                placeholder="Enter duration"
                className="w-full"
              />
              {errors.duration && <p className="text-red-500 text-sm">{errors.duration.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="features">Features (comma-separated)</Label>
            <Input id="features" {...register("features")} placeholder="Enter features" className="w-full" />
            {errors.features && <p className="text-red-500 text-sm">{errors.features.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
            />
            <Label>Active Membership</Label>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="outline" onClick={handleclose} className="px-4 py-2 text-sm sm:text-base">
              Cancel
            </Button>
            <Button type="submit" className="px-4 py-2 text-sm sm:text-base" disabled={isSubmitting}>
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


