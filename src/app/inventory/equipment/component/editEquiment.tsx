/* eslint-disable security/detect-object-injection */
/* eslint-disable @next/next/no-img-element */
 
"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios, { AxiosError } from "axios";
import { getToken } from "@/lib/token";
import { Camera } from "lucide-react"; // Icon for the upload button
import { useToast } from "@/hooks/use-toast";
import Skeleton from "react-loading-skeleton"; // Import Skeleton Loader
import "react-loading-skeleton/dist/skeleton.css"; // Import Skeleton CSS

// Define Zod Schema
const equipmentSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be at most 50 characters long" }),

  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters long" })
    .max(500, { message: "Description must be at most 500 characters long" }),

  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .min(1, { message: "Quantity must be at least 1" })
    .max(10000, { message: "Quantity must be at most 10,000" }),

  status: z.enum(["Available", "Unavailable"], {
    message: "Status must be either 'Available' or 'Unavailable'",
  }),

  lastMaintenanceDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Last Maintenance Date must be a valid date",
  }),

  nextMaintenanceDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Next Maintenance Date must be a valid date",
  }),
  image: z.any().optional(),
});

const EditEquipment = ({ isOpen, onClose, id }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setimage] = useState<File | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(true); // Add fetching state
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 1,
      status: "Available",
      lastMaintenanceDate: "",
      nextMaintenanceDate: "",
      image: "",
    },
  });

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setimage(file);
      setImagePreview(imageUrl);
    }
  };

  const fetchdatabyuser = async () => {
    const token = getToken("token");
    if (!token) return;
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedData = response.data;

      reset({
        name: fetchedData.name || "",
        description: fetchedData.description || "",
        quantity: fetchedData.quantity || 1,
        status: fetchedData.status || "Available",
        lastMaintenanceDate: fetchedData.lastMaintenanceDate
          ? new Date(fetchedData.lastMaintenanceDate).toISOString().split("T")[0]
          : "",
        nextMaintenanceDate: fetchedData.nextMaintenanceDate
          ? new Date(fetchedData.nextMaintenanceDate).toISOString().split("T")[0]
          : "",
        image: fetchedData.image,
      });

      if (response.data.image) {
        setImagePreview(response.data.image);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsFetching(false); // Set fetching state to false after data is fetched
    }
  };

  useEffect(() => {
    if (id) {
      setIsFetching(true); // Set fetching state to true when id changes
      fetchdatabyuser();
    }
  }, [id]);

  const { toast } = useToast();

  // Submit form data
  const onSubmit = async (data) => {
    const token = getToken("token");
    if (!token) return;

    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (key !== "image") {
        console.log(key, data[key]);
        formData.append(key, data[key]);
      }
      if (image !== undefined && key === "image") {
        console.log(key, image);
        formData.append(key, image);
      } else if (key === "image") {
        console.log(key, data[key]);
        formData.append(key, data[key]);
      }
    });

    try {
      setIsLoading(true);
      const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("response", response);

      toast({
        title: "Success",
        description: "Equipment updated successfully",
      });
      reset();
      setImagePreview(null);
      onClose();
      location.reload();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;

        if (axiosError.response?.status === 400) {
          toast({
            title: "Update failed",
            description: "Invalid data",
          });
        } else if (axiosError.response?.status === 500) {
          toast({
            title: "Server error",
            description: "Something went wrong on our end. Please try again later.",
          });
        } else {
          toast({
            title: "Network error",
            description: "Please check your internet connection and try again.",
          });
        }
      } else {
        toast({
          title: "Unexpected error",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleclose = () => {
    onClose();
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleclose}>
      <DialogContent className="max-w-md sm:max-w-lg p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Equipment</DialogTitle>
        </DialogHeader>

        {isFetching ? ( // Show loader while data is being fetched
          <div className="space-y-4">
            <Skeleton height={30} />
            <Skeleton height={30} />
            <Skeleton height={50} />
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-row gap-4 w-full">
              {/* Image Upload */}
              <div className="flex flex-col items-center space-y-2 ">
                <Label>Equipment Image</Label>
                <label
                  htmlFor="imageUpload"
                  className="relative size-32 border rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="size-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <Camera className="size-6" />
                      <span className="text-sm">Choose Image</span>
                    </div>
                  )}
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
                {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
              </div>

              {/* Name & Quantity */}
              <div className="w-full">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" {...register("quantity", { valueAsNumber: true })} />
                  {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
                </div>
              </div>
            </div>
            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register("description")}
                className="w-full border rounded-md p-2 resize-none h-24"
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>
            {/* Status Selection */}
            <div>
              <Label htmlFor="status">Status</Label>
              <select id="status" {...register("status")} className="w-full border rounded-md p-2">
                <option value="Available">Available</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
            </div>
            {/* Maintenance Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastMaintenanceDate">Last Maintenance</Label>
                <Input id="lastMaintenanceDate" type="date" {...register("lastMaintenanceDate")} />
                {errors.lastMaintenanceDate && (
                  <p className="text-red-500 text-sm">{errors.lastMaintenanceDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="nextMaintenanceDate">Next Maintenance</Label>
                <Input id="nextMaintenanceDate" type="date" {...register("nextMaintenanceDate")} />
                {errors.nextMaintenanceDate && (
                  <p className="text-red-500 text-sm">{errors.nextMaintenanceDate.message}</p>
                )}
              </div>
            </div>
            {/* Form Actions */}
            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isLoading}>
                {isLoading ? "Loading..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditEquipment;
