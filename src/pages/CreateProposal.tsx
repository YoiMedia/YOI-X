import { useState } from "react";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, FileText, Send, Eye, CalendarIcon, IndianRupee, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

const availableServices = [
  { id: "service-a", name: "Service A", basePrice: 50000 },
  { id: "service-b", name: "Service B", basePrice: 75000 },
  { id: "service-c", name: "Service C", basePrice: 100000 },
];

export default function CreateProposal() {
  const navigate = useNavigate();
  const { users, createDocument, sendNotification } = useData();
  const [selectedClientId, setSelectedClientId] = useState<Id<"users"> | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [timeline, setTimeline] = useState<Date | undefined>(undefined);
  const [showPreview, setShowPreview] = useState(false);

  const clients = users.filter(u => u.role === "client");

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const totalPrice = selectedServices.reduce((sum, id) => {
    const service = availableServices.find((s) => s.id === id);
    return sum + (service?.basePrice || 0);
  }, 0);

  const displayPrice = price ? parseInt(price) : totalPrice;

  const handleGeneratePreview = () => {
    setShowPreview(true);
    toast.success("Proposal preview generated");
  };

  const handleSendToClient = async () => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    try {
      const docId = await createDocument({
        clientId: selectedClientId,
        type: "proposal",
        content: JSON.stringify({
          services: selectedServices.map(id => availableServices.find(s => s.id === id)?.name),
          description,
          price: displayPrice,
          timeline: timeline?.toISOString(),
        }),
        status: "pending_signature",
      });

      await sendNotification({
        userId: selectedClientId,
        title: "New Proposal Received",
        message: `You have received a new proposal for ₹${displayPrice.toLocaleString("en-IN")}. Please review and sign.`,
        type: "document",
        link: `/portal/review?docId=${docId}`,
      });

      toast.success("Proposal sent to client successfully");
      navigate("/proposals");
    } catch (err: any) {
      toast.error(err.message || "Failed to send proposal");
    }
  };

  const selectedClient = clients.find(c => c._id === selectedClientId);

  return (
    <AppLayout title="Create Proposal">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/proposals">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Create New Proposal</h2>
              <p className="text-sm text-muted-foreground">Build a proposal for your client</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User size={16} />
                  Select Recipient
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedClientId || ""} onValueChange={(v) => setSelectedClientId(v as Id<"users">)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c._id} value={c._id}>{c.full_name} (@{c.username})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Services & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {availableServices.map((service) => (
                    <div
                      key={service.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
                        selectedServices.includes(service.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-secondary/50"
                      )}
                      onClick={() => toggleService(service.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedServices.includes(service.id)} />
                        <span className="font-medium text-foreground">{service.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        ₹{service.basePrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t space-y-4">
                  <Label>Custom Price (₹)</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <IndianRupee size={16} />
                    </div>
                    <Input
                      type="number"
                      placeholder={totalPrice.toLocaleString("en-IN")}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Details & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Scope of Work</Label>
                  <Textarea
                    placeholder="Describe the deliverables..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !timeline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {timeline ? format(timeline, "PPP") : <span>Select delivery date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={timeline}
                        onSelect={setTimeline}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border h-full min-h-[400px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText size={16} />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showPreview ? (
                  <div className="aspect-[8.5/11] bg-white border rounded-lg p-8 text-sm space-y-6 shadow-sm text-gray-800">
                    <div className="text-center border-b pb-6">
                      <h3 className="font-bold text-2xl tracking-tighter">YOI MEDIA</h3>
                      <p className="text-gray-500 uppercase tracking-widest text-xs mt-1">Service Proposal</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-bold text-gray-400 uppercase">Prepared For:</p>
                        <p className="font-semibold">{selectedClient?.full_name || "Client Name"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-400 uppercase">Date:</p>
                        <p className="font-semibold">{format(new Date(), "PP")}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="font-bold border-b pb-1">SERVICES</p>
                      {selectedServices.map((id) => {
                        const service = availableServices.find((s) => s.id === id);
                        return (
                          <div key={id} className="flex justify-between">
                            <span>{service?.name}</span>
                            <span className="font-semibold">₹{service?.basePrice.toLocaleString("en-IN")}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <p className="font-bold border-b pb-1">SCOPE</p>
                      <p className="text-gray-600 italic whitespace-pre-wrap">{description || "No description provided."}</p>
                    </div>

                    <div className="mt-auto pt-6 border-t">
                      <div className="flex justify-between items-center bg-gray-50 p-4 rounded text-lg">
                        <span className="font-bold">TOTAL INVESTMENT</span>
                        <span className="font-black text-primary">₹{displayPrice.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg p-12 text-center">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">No Preview Selected</p>
                    <p className="text-sm opacity-60">Complete the details and click "Generate Preview"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={handleGeneratePreview}>
            <Eye size={16} className="mr-2" />
            Generate Preview
          </Button>
          <Button onClick={handleSendToClient} disabled={!selectedClientId || selectedServices.length === 0} className="px-8 bg-primary hover:bg-primary/90">
            <Send size={16} className="mr-2" />
            Send for Signature
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
