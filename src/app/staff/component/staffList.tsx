/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "@/lib/token";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import AddMemberModal from "./addStaffModal";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import StaffProfileModal from "./staffProfileModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatToDDMMYYYY } from "@/utils/helper";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Member {
  _id: string;
  name: string;
  email: string;
  gender: string;
  age: number;
  role: string;
  image: string;
  phone: string;
  address: string;
  hireDate?: string;
  salary: number;
}

// Zod Schema for validation
const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  image: z.any().optional(), // Accepts File instead of a URL
  gender: z.enum(["male", "female", "other"]),
  role: z.enum(["trainer", "manager", "receptionist", "cleaner"]),
  age: z.preprocess((val) => Number(val), z.number().min(1, "Age must be greater than zero")),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  hireDate: z.string().min(1, "Hire date is required"),
  salary: z.string().min(1, "Salary is required"),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function StaffList({ searchQuery }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* toast*/
  const { toast } = useToast();
  const fetchMembers = async () => {
    const token = getToken("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(response.data);
      console.log(response.data);
    } catch (error) {
      setError("Failed to fetch members");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMembers();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchMembers();
  };

  const handleMemberAdded = (newMember: Member) => {
    setMembers((prevMembers) => [...prevMembers, newMember]);
  };

  /* proflie modal */
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

  const filteredStaff = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.gender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery) ||
      member.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /* edit modal */
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [previewImage, setPreviewImage] = useState<any>();
  const [editImage, seteditImage] = useState<File>();
  const [editdisablebutton, seteditdisablebutton] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
  });

  const handleEdit = (member: Member) => {
    setEditMember(member);
    setPreviewImage(member.image || null);
    reset({
      ...member,
      gender: member.gender as "male" | "female" | "other",
      role: member.role as "trainer" | "manager" | "receptionist" | "cleaner",
      salary: member.salary.toString(),
      hireDate: member.hireDate ? new Date(member.hireDate).toISOString().split("T")[0] : "",
    });
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      members.map((member) => ({
        name: member.name,
        email: member.email,
        gender: member.gender,
        age: member.age,
        role: member.role,
        image: member.image,
        phone: member.phone,
        address: member.address,
        hireDate: member.hireDate,
        salary: member.salary,
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
    XLSX.writeFile(workbook, "staff.xlsx");
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      seteditImage(file);
    }
  };

  const handleUpdate = async (data: MemberFormValues) => {
    seteditdisablebutton(true);
    if (!editMember) return;
    const token = getToken("token");

    console.log("editMember================", editMember);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("gender", data.gender);
      formData.append("age", String(data.age));
      formData.append("phone", data.phone);
      formData.append("role", data.role);
      formData.append("address", data.address);
      formData.append("hireDate", data.hireDate);
      if (editImage instanceof File) {
        formData.append("image", editImage);
      }

      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/staff/${editMember._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      setEditMember(null);
      location.reload();
      toast({ title: "Success!", description: "Staff updated successfully.", variant: "default", duration: 7000 });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update Staff.", variant: "destructive" });
    } finally {
      seteditdisablebutton(false);
    }
  };

  /* delete modal */
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteMemberId) return;
    const token = getToken("token");
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/staff/${deleteMemberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(members.filter((member) => member._id !== deleteMemberId));
      setDeleteMemberId(null);
      toast({ title: "Success!", description: "Staff deleted successfully.", variant: "default" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to delete Staff.", variant: "destructive" });
    }
  };

  return (
    <div>
      <Button onClick={handleExportToExcel} className="mb-4">
        Export to Excel
      </Button>
      <div className="hidden md:block">
        <Table>
          <TableCaption>A list of staff/trainers.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Sr.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Start Date</TableHead>
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
                <TableCell colSpan={11} className="text-center text-red-500">
                  {error}
                  <div className="mt-4">
                    <Button onClick={handleRetry} className="ml-4">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-gray-500">
                  No staff found.
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((member, index) => (
                <TableRow key={member._id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
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
                  <TableCell
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {member.role}
                  </TableCell>
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
                    Rs. {member.salary}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      handleOpenProfile(member._id);
                    }}
                  >
                    {member.hireDate ? formatToDDMMYYYY(member.hireDate) : "N/A"}
                  </TableCell>
                  <TableCell className="flex space-x-2">
                    <Button size="icon" variant="outline" onClick={() => handleEdit(member)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => setDeleteMemberId(member._id)}>
                      <Trash className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
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
        ) : filteredStaff.length === 0 ? (
          <TableRow>
            <TableCell colSpan={12} className="text-center text-gray-500">
              No staff found.
            </TableCell>
          </TableRow>
        ) : (
          filteredStaff.map((member, index) => (
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
                  <Button size="icon" variant="destructive" onClick={() => setDeleteMemberId(member._id)}>
                    <Trash className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p>
                  <span className="font-medium">Gender :</span> {member.gender}
                </p>
                <p>
                  <span className="font-medium">Age :</span> {member.age}
                </p>
                <p>
                  <span className="font-medium">Phone :</span> {member.phone}
                </p>
                <p>
                  <span className="font-medium">Role :</span> {member.role}
                </p>
                <p>
                  <span className="font-medium">Address :</span> {member.address}
                </p>
                <p>
                  <span className="font-medium">Salary :</span> Rs. {member.salary}
                </p>
                <p>
                  <span className="font-medium">Hire Date : </span>
                  {member.hireDate ? formatToDDMMYYYY(member.hireDate) : "N/A"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedId && <StaffProfileModal isOpen={isProfileOpen} onClose={handleCloseProfile} userId={selectedId} />}

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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Age" id="age" type="number" register={register} error={errors.age} />
                <InputField label="Salary" id="salary" register={register} error={errors.salary} />
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
              <DialogDescription>Are you sure you want to delete this staff</DialogDescription>
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
