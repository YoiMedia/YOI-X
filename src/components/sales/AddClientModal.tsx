import { useState } from "react";
import { User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddClientModal({ open, onOpenChange }: AddClientModalProps) {
  const { toast } = useToast();
  const [clientForm, setClientForm] = useState({
    clientName: "",
    phone: "",
    altPhone: "",
    email: "",
    website: "",
    address: "",
    uniqueId: "CL-1001",
  });

  const resetForm = () => {
    setClientForm({
      clientName: "",
      phone: "",
      altPhone: "",
      email: "",
      website: "",
      address: "",
      uniqueId: "CL-" + String(Math.floor(Math.random() * 9000) + 1000),
    });
  };

  const handleSaveClient = (sendLink: boolean) => {
    onOpenChange(false);
    toast({
      title: "Client created successfully",
      description: sendLink 
        ? `Login link sent to ${clientForm.email}` 
        : `${clientForm.clientName} has been added to your clients`,
    });
    resetForm();
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  const isFormValid = clientForm.clientName && clientForm.phone && clientForm.email;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={20} className="text-primary" />
            Add New Client
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              placeholder="Enter client or company name"
              value={clientForm.clientName}
              onChange={(e) => setClientForm({ ...clientForm, clientName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="altPhone">Alternate Phone</Label>
              <Input
                id="altPhone"
                type="tel"
                placeholder="+91 98765 43210"
                value={clientForm.altPhone}
                onChange={(e) => setClientForm({ ...clientForm, altPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@company.com"
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.company.com"
                value={clientForm.website}
                onChange={(e) => setClientForm({ ...clientForm, website: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter full address"
              value={clientForm.address}
              onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uniqueId">Client Unique ID</Label>
            <Input
              id="uniqueId"
              value={clientForm.uniqueId}
              disabled
              className="bg-secondary text-muted-foreground"
              placeholder="CL-1001"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => handleSaveClient(false)} disabled={!isFormValid}>
            Save Only
          </Button>
          <Button onClick={() => handleSaveClient(true)} disabled={!isFormValid}>
            Save & Send Login Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
