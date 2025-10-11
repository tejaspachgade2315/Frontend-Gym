"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/token";
import axios from "axios";
import { useState } from "react";

interface WhatsAppDialogProps {
  member: { name: string; phone: string } | null;
  onClose: () => void;
}

export default function WhatsAppDialog({ member, onClose }: WhatsAppDialogProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const handleSend = async () => {
    const token = getToken("token");
    if (!token) {
      toast({
        variant: "destructive",
        title: "Unauthorized",
        description: "No token found. Please log in.",
      });
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }
    if (!member) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/send-message`,
        {
          phone: "9767335965",
          message: message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = response.data;
      if (data.success) {
        toast({
          title: "Success",
          description: "Message sent successfully!",
        });
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to send message",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.error || "Unauthorized",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to send message. Please try again.",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!member} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send WhatsApp Message</DialogTitle>
          <DialogDescription>
            Send a message to {member?.name} ({member?.phone})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[150px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
