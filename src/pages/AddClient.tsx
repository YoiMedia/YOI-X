import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Send, User, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AddClient() {
  const navigate = useNavigate();
  const { addClient } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phone: "",
    altPhone: "",
    email: "",
    website: "",
    address: "",
    companyName: "",
    industry: "",
    companySize: "",
    password: Math.random().toString(36).slice(-8), // Generate initial password
  });

  useEffect(() => {
    if (user && user.role !== "freelancer") {
      toast.error("Access denied. Only freelancers can create clients.");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSave = async (sendLink: boolean) => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.username || !formData.companyName) {
      toast.error("Please fill in all required fields (*)");
      return;
    }

    if (!user || user.role !== "freelancer") {
      toast.error("You must be logged in as a freelancer to create a client.");
      return;
    }

    try {
      await addClient({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        alternatePhone: formData.altPhone,
        website: formData.website,
        address: formData.address,
        password: formData.password,
        companyName: formData.companyName,
        industry: formData.industry,
        companySize: formData.companySize ? parseInt(formData.companySize) : undefined,
        salesPersonId: user._id,
        status: "active",
      });

      if (sendLink) {
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
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username (Unique ID) *</Label>
                <Input
                  id="username"
                  placeholder="e.g. johndoe_client"
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
                  placeholder="client@example.com"
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
          </CardContent>

          <CardHeader className="pb-4 pt-4 border-t border-border">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 size={18} className="text-primary" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g. Technology, Retail"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size (Employees)</Label>
                <Input
                  id="companySize"
                  type="number"
                  placeholder="e.g. 50"
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                />
              </div>
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
