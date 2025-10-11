import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "@/lib/token";
import { formatToDDMMYYYY } from "@/utils/helper";
import { useToast } from "@/hooks/use-toast";
import { FaWhatsapp } from "react-icons/fa";
import WhatsAppDialog from "@/components/whatsappDialog";
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
  status: z.enum(["converted", "loss"]),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function LeadsTable({ searchQuery }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [whatsAppMember, setWhatsAppMember] = useState<Lead | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
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
      const response = await axios.get<{ leads: Lead[] }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lead/converted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(response.data.leads);
    } catch (error) {
      setError("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };
  const handleExportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(leads);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "leads");
    XLSX.writeFile(wb, "converted_leads.xlsx");
  }


  useEffect(() => {
    fetchLeads();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchLeads();
  };

  const handleWhatsApp = (lead: Lead) => {
    setWhatsAppMember(lead);
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

      {whatsAppMember && <WhatsAppDialog member={whatsAppMember} onClose={() => setWhatsAppMember(null)} />}
    </div>
  );
}
