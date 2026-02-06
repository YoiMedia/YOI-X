import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Send, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

export default function AddClient() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addClient, addActivity } = useData();
  const [formData, setFormData] = useState({
    clientName: "",
    uniqueId: `CLT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    phone: "",
    altPhone: "",
    email: "",
    website: "",
    address: "",
  });

  const handleSave = (sendLink: boolean) => {
    if (!formData.clientName || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (*)",
        variant: "destructive",
      });
      return;
    }

    addClient({
      name: formData.clientName,
      contact: formData.clientName.split(' ')[0],
      email: formData.email,
      status: "active",
      value: "$0",
      phone: formData.phone,
      website: formData.website,
      address: formData.address,
    });

    addActivity({
      actor_name: "Admin",
      actor_initials: "AD",
      action_text: `added new client: ${formData.clientName}`,
      timestamp: "Just now",
    });

    toast({
      title: "Client Added",
      description: sendLink ? "Client saved and magic link sent." : "Client saved successfully.",
    });

    navigate("/clients");
  };

  return (
    <AppLayout title="Add New Client">
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Add New Client</h2>
            <p className="text-sm text-muted-foreground">Enter client details to create a new account</p>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User size={18} className="text-primary" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  placeholder="Enter client or company name"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uniqueId">Unique ID</Label>
                <Input
                  id="uniqueId"
                  value={formData.uniqueId}
                  disabled
                  className="bg-secondary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="altPhone">Alternate Phone</Label>
                <Input
                  id="altPhone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.altPhone}
                  onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.company.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter full address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1" onClick={() => handleSave(true)}>
                <Send size={16} className="mr-2" />
                Save & Send Magic Link
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => handleSave(false)}>
                <Save size={16} className="mr-2" />
                Save Only
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
