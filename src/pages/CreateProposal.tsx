import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, FileText, Send, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const availableServices = [
  { id: "web-design", name: "Website Design", basePrice: 5000 },
  { id: "web-dev", name: "Website Development", basePrice: 8000 },
  { id: "branding", name: "Brand Identity Package", basePrice: 3500 },
  { id: "seo", name: "SEO Optimization", basePrice: 2500 },
  { id: "content", name: "Content Strategy", basePrice: 2000 },
  { id: "social", name: "Social Media Management", basePrice: 1500 },
  { id: "maintenance", name: "Monthly Maintenance", basePrice: 500 },
  { id: "consulting", name: "Consulting (per hour)", basePrice: 150 },
];

export default function CreateProposal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [timeline, setTimeline] = useState("");
  const [showPreview, setShowPreview] = useState(false);

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

  const handleGeneratePreview = () => {
    setShowPreview(true);
    toast({
      title: "Preview generated",
      description: "PDF preview has been generated successfully",
    });
  };

  const handleSendToClient = () => {
    toast({
      title: "Proposal sent to client",
      description: "The proposal has been sent for signature",
    });
    setTimeout(() => {
      navigate("/proposals");
    }, 1500);
  };

  return (
    <AppLayout title="Create Proposal">
      <div className="space-y-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Select Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableServices.map((service) => (
                  <div
                    key={service.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedServices.includes(service.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary/50"
                    }`}
                    onClick={() => toggleService(service.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={selectedServices.includes(service.id)} />
                      <span className="font-medium text-foreground">{service.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      ${service.basePrice.toLocaleString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Proposal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the scope of work, deliverables, and any special terms..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customPrice">Custom Price (optional)</Label>
                    <Input
                      id="customPrice"
                      type="number"
                      placeholder="Override total price"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input
                      id="timeline"
                      placeholder="e.g., 6-8 weeks"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Preview Panel */}
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {selectedServices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No services selected</p>
                  ) : (
                    selectedServices.map((id) => {
                      const service = availableServices.find((s) => s.id === id);
                      return (
                        <div key={id} className="flex justify-between text-sm">
                          <span className="text-foreground">{service?.name}</span>
                          <span className="text-muted-foreground">
                            ${service?.basePrice.toLocaleString()}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary text-lg">
                      ${customPrice ? parseInt(customPrice).toLocaleString() : totalPrice.toLocaleString()}
                    </span>
                  </div>
                  {timeline && (
                    <p className="text-sm text-muted-foreground mt-1">Timeline: {timeline}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* PDF Preview Panel */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText size={16} />
                  PDF Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showPreview ? (
                  <div className="aspect-[8.5/11] bg-white border rounded-lg p-4 text-xs space-y-3">
                    <div className="text-center border-b pb-2">
                      <h3 className="font-bold text-sm text-gray-800">PROPOSAL</h3>
                      <p className="text-gray-500">Business Services Agreement</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-700">Selected Services:</p>
                      {selectedServices.map((id) => {
                        const service = availableServices.find((s) => s.id === id);
                        return (
                          <div key={id} className="flex justify-between text-gray-600">
                            <span>• {service?.name}</span>
                            <span>${service?.basePrice.toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                    {description && (
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-700">Description:</p>
                        <p className="text-gray-600 text-[10px]">{description.slice(0, 150)}...</p>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-auto">
                      <div className="flex justify-between font-bold text-gray-800">
                        <span>Total:</span>
                        <span>${customPrice ? parseInt(customPrice).toLocaleString() : totalPrice.toLocaleString()}</span>
                      </div>
                      {timeline && <p className="text-gray-500">Timeline: {timeline}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[8.5/11] bg-secondary/30 border border-dashed rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <FileText size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Click "Generate Preview"</p>
                      <p className="text-xs">to see PDF preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button className="w-full" variant="outline" onClick={handleGeneratePreview}>
                <Eye size={16} className="mr-2" />
                Generate Preview
              </Button>
              <Button className="w-full" onClick={handleSendToClient} disabled={selectedServices.length === 0}>
                <Send size={16} className="mr-2" />
                Send to Client for Signature
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
