/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { Pencil, Trash, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileModal from "@/app/members/component/profileModal";
import * as XLSX from "xlsx";
import { formatToDDMMYYYY } from "@/utils/helper";
import WhatsAppDialog from "@/components/whatsappDialog";
import { FaWhatsapp } from "react-icons/fa";

// Zod Schema for validation
const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  image: z.any().optional(),
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

interface Member {
  _id: string;
  name: string;
  email: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  phone: string;
  address: string;
  startDate?: string;
  endDate?: string;
  membership?: { _id: string; name: string } | null;
  image: any;
}

export default function Members({ searchQuery }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [membership, setMembership] = useState([]);
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<any>();
  const [editImage, seteditImage] = useState<File>();
  const [editdisablebutton, seteditdisablebutton] = useState(false);

  const [whatsAppMember, setWhatsAppMember] = useState<Member | null>(null);
  const handleWhatsApp = (member: Member) => {
    setWhatsAppMember(member);
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
  });
  const fetchMembers = async () => {
    const token = getToken("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(response.data);
    } catch (error) {
      setError("Failed to fetch members");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchMembers();
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleEdit = (member: Member) => {
    setEditMember(member);
    console.log("member", member);
    setPreviewImage(member.image || null);
    reset({
      ...member,
      gender: member.gender as "male" | "female" | "other",
      membership: member.membership?._id || "",
      startDate: member.startDate ? new Date(member.startDate).toISOString().split("T")[0] : "",
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      seteditImage(file);
    }
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      members.map((member) => ({
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
    XLSX.writeFile(workbook, "members_list.xlsx");
  };

  const handleUpdate = async (data: MemberFormValues) => {
    seteditdisablebutton(true);
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
      if (editImage instanceof File) {
        formData.append("image", editImage);
      }

      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${editMember._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      setMembers(
        members.map((m) =>
          m._id === editMember._id
            ? {
                ...m,
                ...data,
                membership: membership.find((mem: any) => mem._id === data.membership) || null,
              }
            : m,
        ),
      );
      setEditMember(null);
      toast({ title: "Success!", description: "Member updated successfully.", variant: "default", duration: 7000 });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update member.", variant: "destructive" });
    } finally {
      seteditdisablebutton(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteMemberId) return;
    const token = getToken("token");
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${deleteMemberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(members.filter((member) => member._id !== deleteMemberId));
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
  const filteredMembers = members.filter(
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
          <TableCaption>A list of members.</TableCaption>
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
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-gray-500">
                  No members found.
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
                    <Button size="icon" variant="outline" onClick={() => handleEdit(member)}>
                      <Pencil className="size-4" />
                    </Button>

                    {/* <Button size="icon" variant="destructive" onClick={() => setDeleteMemberId(member._id)}>
                      <Trash className="size-4" />
                    </Button> */}
                    <Button size="icon" variant="outline" onClick={() => handleWhatsApp(member)}>
                      {/* <MessageCircle className="size-4" />  */}
                      <FaWhatsapp />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <WhatsAppDialog member={whatsAppMember} onClose={() => setWhatsAppMember(null)} />
      </div>

      {/* Mobile Cards */}

      <div className="md:hidden space-y-4 mb-4">
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
        ) : filteredMembers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={12} className="text-center text-gray-500">
              No members found.
            </TableCell>
          </TableRow>
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
                    <Pencil className="size-4" />
                  </Button>
                  {/* <Button size="icon" variant="destructive" onClick={() => setDeleteMemberId(member._id)}>
                    <Trash className="size-4" />
                  </Button> */}
                  <Button size="icon" variant="outline" onClick={() => handleWhatsApp(member)}>
                    {/* <MessageCircle className="size-4" />  */}
                    <FaWhatsapp />
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p>
                  <span className="font-medium">Gender:</span> {member.gender}
                </p>
                <p>
                  <span className="font-medium">Age:</span> {member.age}
                </p>
                {/* <p>
                  <span className="font-medium">Height:</span> {member.height} cm
                </p>
                <p>
                  <span className="font-medium">Weight:</span> {member.weight} kg
                </p> */}
                <p>
                  <span className="font-medium">Phone:</span> {member.phone}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {member.address}
                </p>
                <p>
                  <span className="font-medium">Start Date:</span>
                  {member.startDate ? formatToDDMMYYYY(member.startDate) : "N/A"}
                </p>
                <p>
                  <span className="font-medium">End Date:</span>
                  {member.endDate ? formatToDDMMYYYY(member.endDate) : "N/A"}
                </p>
                <p>
                  <span className="font-medium">Membership:</span>
                  {member.membership ? member.membership.name : "No Membership"}
                </p>
              </div>
            </div>
          ))
        )}
        <WhatsAppDialog member={whatsAppMember} onClose={() => setWhatsAppMember(null)} />
      </div>

      {/* Edit Modal */}
      {editMember && (
        <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
          <DialogContent className="w-full max-w-[95%] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
              <DialogDescription>Update the details of the member.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Name" id="name" register={register} error={errors.name} />
                <InputField label="Email" id="email" register={register} error={errors.email} />
                <div className="flex flex-col">
                  <Label htmlFor="image">Image</Label>
                  <label
                    htmlFor="image"
                    className="cursor-pointer w-full flex items-center justify-center border border-gray-300 rounded-md overflow-hidden p-2"
                  >
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-auto object-cover" />
                    ) : (
                      <span className="text-gray-500 text-sm">Click to upload</span>
                    )}
                  </label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register("image")}
                    onChange={handleImageChange}
                  />
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="Age" id="age" type="number" register={register} error={errors.age} />
                <InputField label="Height (cm)" id="height" type="number" register={register} error={errors.height} />
                <InputField label="Weight (kg)" id="weight" type="number" register={register} error={errors.weight} />
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setEditMember(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editdisablebutton}>
                  Save Changes
                </Button>
              </div>
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

      {/* Profile Modal */}
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
