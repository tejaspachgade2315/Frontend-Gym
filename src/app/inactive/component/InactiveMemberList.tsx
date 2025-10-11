"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { getToken } from "@/lib/token";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Pencil, Trash, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileModal from "../../members/component/profileModal";
import { formatToDDMMYYYY } from "@/utils/helper";
import * as XLSX from "xlsx";

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  image: z.any().optional(), // Accepts File instead of a URL
  gender: z.enum(["male", "female", "other"]),
  role: z.enum(["member"]),
  age: z.preprocess((val) => Number(val), z.number().min(1, "Age must be greater than zero")),
  height: z.preprocess((val) => Number(val), z.number().min(1, "Height must be greater than zero")),
  weight: z.preprocess((val) => Number(val), z.number().min(1, "Weight must be greater than zero")),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  startDate: z.string().min(1, "Start date is required"),
  membership: z.string().min(1, "Membership is required"),
  isActive: z.boolean(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface InactiveMembers {
  _id: string;
  name: string;
  email: string;
  gender: "male" | "female" | "other";
  age: number;
  height: number;
  weight: number;
  phone: string;
  address: string;
  startDate?: string;
  endDate?: string;
  membership?: { _id: string; name: string } | null;
  isActive: boolean;
  image?: string;
  className?: string;
}

export default function InactiveMemberList({searchQuery}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [inactiveMembers, setInactiveMembers] = useState<InactiveMembers[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editMember, setEditMember] = useState<InactiveMembers | null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [membership, setMembership] = useState([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
  });
  const fetchInactiveMembers = async () => {
    const token = getToken("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/inactive`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      setInactiveMembers(response.data);
    } catch (error) {
      setError("Failed to fetch inactive members.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchInactiveMembers();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchInactiveMembers();
  };

  const handleEdit = (member: InactiveMembers) => {
    setEditMember(member);
    reset({
      ...member,
      membership: member.membership?._id || "",
      startDate: member.startDate ? new Date(member.startDate).toISOString().split("T")[0] : "",
    });
  };

  const handleUpdate = async (data: MemberFormValues) => {
    if (!editMember) return;
    const token = getToken("token");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("gender", data.gender);
      formData.append("age", String(data.age));
      formData.append("height", String(data.height));
      formData.append("weight", String(data.weight));
      formData.append("phone", data.phone);
      formData.append("role", "member");
      formData.append("address", data.address);
      formData.append("startDate", data.startDate);
      formData.append("membership", data.membership);
      formData.append("isActive", String(data.isActive));
      if (data.image && data.image.length > 0) {
        formData.append("image", data.image[0]);
      }

      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${editMember._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      const newInactiveMembers = inactiveMembers.map((member) => ({
        ...member,
        membership: { _id: member.membership?._id || "", name: member.membership?.name || "" }, // assuming the membership name is empty
      }));

      setInactiveMembers(newInactiveMembers);
      setEditMember(null);
      toast({ title: "Success!", description: "Member updated successfully.", variant: "default", duration: 7000 });

      location.reload();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update member.", variant: "destructive" });
    }
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      inactiveMembers.map((member) => ({
        Name: member.name,
        Email: member.email,
        Gender: member.gender,
        Age: member.age,
        Height: member.height,
        Weight: member.weight,
        Phone: member.phone,
        Address: member.address,
        "Start Date": member.startDate ? formatToDDMMYYYY(member.startDate) : "N/A",
        "End Date": member.endDate ? formatToDDMMYYYY(member.endDate) : "N/A",
        Membership: member.membership ? member.membership.name : "No Membership",
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
    XLSX.writeFile(workbook, "inactiveMembers.xlsx");
  };

  const handleDelete = async () => {
    if (!deleteMemberId) return;
    const token = getToken("token");
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${deleteMemberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInactiveMembers(inactiveMembers.filter((member) => member._id !== deleteMemberId));
      setDeleteMemberId(null);
      toast({ title: "Success!", description: "Member deleted successfully.", variant: "default" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to delete member.", variant: "destructive" });
    }
  };

  useEffect(() => {
    const token = getToken("token");
    const fetchMembership = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/membership`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembership(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMembership();
  }, []);

  /* Profile modal */
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const handleOpenProfile = (id: string) => {
    setIsProfileOpen(true);
    setSelectedId(id);
  };
  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedId("");
  };

  const filteredMembers = inactiveMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.gender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery) ||
      member.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member?.membership?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <Button onClick={handleExportToExcel} className="mb-4">
        Export to Excel
      </Button>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableCaption>A list of inactive members.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Sr.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Age</TableHead>
              {/* <TableHead>Height (cm)</TableHead>
              <TableHead>Weight (kg)</TableHead> */}
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-right">Membership</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 11 }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-red-500">
                  {error}
                  <div className="mt-4">
                    <Button onClick={handleRetry} className="ml-4">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member, index) => (
                <TableRow key={member._id}>
                  <TableCell
                    className="font-medium"
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {member.name}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {member.email}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {member.gender}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {member.age}
                  </TableCell>
                  {/* <TableCell
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {member.height} cm
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {member.weight} kg
                  </TableCell> */}
                  <TableCell
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {member.phone}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {member.address}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {member.startDate ? formatToDDMMYYYY(member.startDate) : "N/A"}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {member.endDate ? formatToDDMMYYYY(member.endDate) : "N/A"}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {member.membership ? member.membership.name : "No Membership"}
                  </TableCell>
                  <TableCell className="flex space-x-2">
                    {/* <Button size="icon" variant="outline" onClick={() => handleEdit(member)}>
                      <Pencil className="size-4" />
                    </Button> */}
                    {/* <Button size="icon" variant="destructive" onClick={() => setDeleteMemberId(member._id)}>
                      <Trash className="size-4" />
                    </Button> */}
                    <Button size="icon" variant="outline" onClick={() => handleEdit(member)}>
                      <RefreshCcw className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 p-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
            </div>
          ))
        ) : error ? (
          <div>
            <p className="text-center text-red-500">{error}</p>
            <div className="flex justify-center">
              <Button onClick={handleRetry} className="m-4">
                Retry
              </Button>
            </div>
          </div>
        ) : (
          filteredMembers.map((member, index) => (
            <div key={member._id} className="p-4 border rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="icon" variant="outline" onClick={() => handleEdit(member)}>
                    <RefreshCcw className="size-4" />
                  </Button>
                  {/* <Button size="icon" variant="outline" onClick={() => handleEdit(member)}>
                    <Pencil className="size-4" />
                  </Button> */}
                  {/* <Button size="icon" variant="destructive" onClick={() => setDeleteMemberId(member._id)}>
                    <Trash className="size-4" />
                  </Button> */}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p>
                  <span className="font-medium">Gender:</span> {member.gender}
                </p>
                <p>
                  <span className="font-medium">Age:</span> {member.age}
                </p>
                <p>
                  <span className="font-medium">Height:</span> {member.height} cm
                </p>
                <p>
                  <span className="font-medium">Weight:</span> {member.weight} kg
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {member.phone}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {member.address}
                </p>
                <p>
                  <span className="font-medium">Start Date:</span>{" "}
                  {member.startDate ? formatToDDMMYYYY(member.startDate) : "N/A"}
                </p>
                <p>
                  <span className="font-medium">Membership:</span>{" "}
                  {member.membership ? member.membership.name : "No Membership"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editMember && (
        <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
          <DialogContent className="w-full max-w-[95%] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Renew Membership</DialogTitle>
              <DialogDescription>Update the details of the member.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
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
                <InputField
                  label="Start Date"
                  id="startDate"
                  type="date"
                  register={register}
                  error={errors.startDate}
                />
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <InputField label="Age" id="age" type="number" register={register} error={errors.age} />
                <InputField label="Height (cm)" id="height" type="number" register={register} error={errors.height} />
                <InputField label="Weight (kg)" id="weight" type="number" register={register} error={errors.weight} />
              </div>

              {/* <Controller
                control={control}
                name="isActive"
                render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
              />
              <Label>Active Member</Label> */}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditMember(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {/* Edit Modal */}
      {editMember && (
        <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
          <DialogContent className="w-full max-w-[95%] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Renew Membership</DialogTitle>
              <DialogDescription>Update the details of the member.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Name" id="name" register={register} error={errors.name} />
                <InputField label="Email" id="email" register={register} error={errors.email} />
                <div className="col-span-1 sm:col-span-2">
                  <Label htmlFor="image">Image</Label>
                  <Input id="image" type="file" accept="image/*" {...register("image")} className="w-full" />
                  {errors.image && <p className="text-red-500 text-sm">{String(errors.image.message)}</p>}
                </div>
                <InputField label="Phone" id="phone" register={register} error={errors.phone} />
                <InputField label="Address" id="address" register={register} error={errors.address} />
                <InputField
                  label="Start Date"
                  id="startDate"
                  type="date"
                  register={register}
                  error={errors.startDate}
                />
                <div className="col-span-1 sm:col-span-2">
                  <Label>Gender</Label>
                  <select {...register("gender")} className="w-full border rounded p-2">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
                </div>
                <div className="col-span-1 sm:col-span-2">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="Age" id="age" type="number" register={register} error={errors.age} />
                <InputField label="Height (cm)" id="height" type="number" register={register} error={errors.height} />
                <InputField label="Weight (kg)" id="weight" type="number" register={register} error={errors.weight} />
              </div>

              {/* <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                />
                <Label>Active Member</Label>
              </div> */}

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditMember(null)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteMemberId && (
        <Dialog open={!!deleteMemberId} onOpenChange={() => setDeleteMemberId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>Are you sure you want to delete this member?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteMemberId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedId && <ProfileModal isOpen={isProfileOpen} onClose={handleCloseProfile} userId={selectedId} />}
    </div>
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
