import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, UserPlus, Shield, User, Briefcase } from "lucide-react";

export default function CreateAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const superadminId = localStorage.getItem("yoi_superadminId") as Id<"superadmins"> | null;
  const createAccountMutation = useMutation(api.superadmins.createAccount);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    role: "employee",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!superadminId) {
    navigate("/superadmin/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createAccountMutation({
        superadminId: superadminId,
        ...formData
      });
      toast({
        title: "Account Created",
        description: `Successfully created ${formData.role} account for ${formData.fullName}.`,
      });
      navigate("/superadmin/dashboard");
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "An error occurred while creating the account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/superadmin/dashboard")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </Button>

        <Card className="border-slate-200 shadow-lg bg-white">
          <CardHeader className="border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-900 rounded-lg text-white">
                <UserPlus size={24} />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">Create New Account</CardTitle>
            </div>
            <CardDescription className="text-slate-500">
              Generate credentials for a new system user. Password hashing is applied automatically.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <Input 
                    placeholder="John Doe" 
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Role</label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => handleChange("role", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-red-500" /> Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="employee">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-blue-500" /> Employee
                        </div>
                      </SelectItem>
                      <SelectItem value="freelancer">
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} className="text-purple-500" /> Freelancer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                  <Input 
                    placeholder="+91 98765 43210" 
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Username</label>
                  <Input 
                    placeholder="johndoe123" 
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <Input 
                    type="password" 
                    placeholder="Secure password" 
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-slate-100 mt-4 pt-6">
              <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-xl transition-all shadow-md active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Confirm & Create Account"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
