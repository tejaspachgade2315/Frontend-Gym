import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "@/lib/token";
import { formatToDDMMYYYY } from "@/utils/helper";
import { useToast } from "@/hooks/use-toast";
import { FaWhatsapp } from "react-icons/fa";
import { Pencil } from "lucide-react";
import WhatsAppDialog from "@/components/whatsappDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";

interface Lead {
  _id: string;
  name: string;
  phone: string;
  createdAt: string;
  status: string;
}

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  status: z.enum(["converted", "loss", "pending"]),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function LeadsTable({ searchQuery }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [whatsAppMember, setWhatsAppMember] = useState<Lead | null>(null);
  const { toast } = useToast();
  const [editdisablebutton, seteditdisablebutton] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
  });

  const fetchLeads = async () => {
    const token = getToken("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get<{ leads: Lead[] }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lead/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(response.data.leads);
    } catch (error) {
      setError("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchLeads();
  };

  const handleEditClick = (lead: Lead) => {
    setEditLead(lead);
  };

  const handleEditSubmit = async (data: LeadFormValues) => {
    seteditdisablebutton(true);
    if (!editLead) return;
    try {
      const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lead/${editLead._id}`, data, {
        headers: { Authorization: `Bearer ${getToken("token")}` },
      });
      toast({
        title: "Success",
        description: "Lead updated successfully",
        variant: "default",
      });
      setLeads((prevLeads) => prevLeads.map((lead) => (lead._id === editLead._id ? { ...lead, ...data } : lead)));
      setEditLead(null);
      fetchLeads();
      // location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
    } finally {
      seteditdisablebutton(false);
    }
  };

  const handleWhatsApp = (lead: Lead) => {
    setWhatsAppMember(lead);
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(leads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "leads.xlsx");
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    if (editLead) {
      setValue("name", editLead.name);
      setValue("phone", editLead.phone);
    }
  }, [editLead, setValue]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handleExportToExcel}>Export to Excel</Button>
      </div>
      <div className="hidden md:block">
        <Table>
          <TableCaption>List of Leads</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Sr.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created At</TableHead>
              {/* <TableHead>Status</TableHead> */}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 6 }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-red-500">
                  {error}
                  <div className="mt-4">
                    <Button onClick={handleRetry} className="ml-4">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLeads.length > 0 ? (
              filteredLeads.map((lead, index) => (
                <TableRow key={lead._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{lead.name}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>{formatToDDMMYYYY(lead.createdAt)}</TableCell>
                  {/* <TableCell>{lead.status}</TableCell> */}
                  <TableCell>
                    <Button variant="outline" onClick={() => handleEditClick(lead)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="outline" onClick={() => handleWhatsApp(lead)}>
                      <FaWhatsapp className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/*Mobile Cards*/}

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
        ) : filteredLeads.length > 0 ? (
          filteredLeads.map((lead, index) => (
            <div key={lead._id} className="p-4 border rounded-lg">
              <p className="font-semibold">Name: {lead.name}</p>
              <p className="font-medium">Phone: {lead.phone}</p>
              <p className="font-medium">Created At: {formatToDDMMYYYY(lead.createdAt)}</p>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => handleEditClick(lead)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="outline" onClick={() => handleWhatsApp(lead)}>
                  <FaWhatsapp className="size-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 border rounded-lg">
            <p>No leads found.</p>
          </div>
        )}
      </div>

      {editLead && (
        <Dialog open={!!editLead} onOpenChange={() => setEditLead(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleEditSubmit)}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register("name")} className="w-full" />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register("phone")} className="w-full" />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select {...register("status")} defaultValue={editLead.status} className="w-full border rounded p-2">
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="converted">Converted</option>
                    <option value="loss">Lost</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={editdisablebutton}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {whatsAppMember && <WhatsAppDialog member={whatsAppMember} onClose={() => setWhatsAppMember(null)} />}
    </div>
  );
}
