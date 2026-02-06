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
import { toast } from "sonner";

export default function AddClient() {
  const navigate = useNavigate();
  const { createUser, sendNotification } = useData();
  const [formData, setFormData] = useState({
    clientName: "",
    username: "",
    phone: "",
    altPhone: "",
    email: "",
    website: "",
    address: "",
    password: Math.random().toString(36).slice(-8), // Generate initial password
  });

  const handleSave = async (sendLink: boolean) => {
    if (!formData.clientName || !formData.email || !formData.phone || !formData.username) {
      toast.error("Please fill in all required fields (*)");
      return;
    }

    try {
      const clientId = await createUser({
        fullname: formData.clientName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        altPhone: formData.altPhone,
        website: formData.website,
        password: formData.password,
        role: "client",
      });

      if (sendLink) {
        // In a real app, this would trigger an email. 
        // Here we'll simulate by adding a notification for the client.
        toast.success("Client account created and magic link simulated");
      } else {
        toast.success("Client account created successfully");
      }

      navigate("/clients");
    } catch (err: any) {
      toast.error(err.message || "Failed to create client account");
    }
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
                <Label htmlFor="username">Unique ID (Username) *</Label>
                <Input
                  id="username"
                  placeholder="e.g. acme_corp"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
