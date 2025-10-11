import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { getToken } from "@/lib/token";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
});

const AddLeadForm: React.FC<{ isOpen: boolean; handleClose: () => void }> = ({ isOpen, handleClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leadSchema),
  });

  const { toast } = useToast();
  const [isDisable, setIsDisable] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      setIsDisable(true);
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lead`, data, {
        headers: { Authorization: `Bearer ${getToken("token")}` },
      });
      toast({ title: "Success", description: "Lead added successfully." });
      handleClose();
      location.reload();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({ title: "Error", description: error.response?.data?.message, variant: "destructive" });
      }
    } finally {
      setIsDisable(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>Enter lead details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} placeholder="John Doe" />
            {errors.name && <p className="text-red-500 text-sm">{String(errors.name.message)}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" {...register("phone")} placeholder="1234567890" />
            {errors.phone && <p className="text-red-500 text-sm">{String(errors.phone.message)}</p>}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isDisable}>
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadForm;
