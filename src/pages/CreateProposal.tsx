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
import { ArrowLeft, FileText, Send, Eye, CalendarIcon, IndianRupee } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const availableServices = [
  { id: "service-a", name: "Service A", basePrice: 50000 },
  { id: "service-b", name: "Service B", basePrice: 75000 },
  { id: "service-c", name: "Service C", basePrice: 100000 },
];

export default function CreateProposal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [timeline, setTimeline] = useState<Date | undefined>(undefined);
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

  const displayPrice = price ? parseInt(price) : totalPrice;

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Select Services */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Select Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe the scope of work, deliverables, and any special terms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[150px]"
                />
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Pricing</CardTitle>
              </CardHeader>
              <CardContent>
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
                <p className="text-xs text-muted-foreground mt-2">
                  Leave empty to use calculated total: ₹{totalPrice.toLocaleString("en-IN")}
                </p>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
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
                      className="p-3 pointer-events-auto"
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview Panel */}
          <div className="space-y-6">
            {/* PDF Preview Panel */}
            <Card className="border-border h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText size={16} />
                  Proposal PDF Preview (Placeholder)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showPreview ? (
                  <div className="aspect-[8.5/11] bg-white border rounded-lg p-6 text-sm space-y-4 shadow-sm">
                    <div className="text-center border-b pb-4">
                      <h3 className="font-bold text-lg text-gray-800">PROPOSAL</h3>
                      <p className="text-gray-500">Business Services Agreement</p>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="font-semibold text-gray-700">Selected Services:</p>
                      {selectedServices.length > 0 ? (
                        selectedServices.map((id) => {
                          const service = availableServices.find((s) => s.id === id);
                          return (
                            <div key={id} className="flex justify-between text-gray-600 text-sm">
                              <span>• {service?.name}</span>
                              <span>₹{service?.basePrice.toLocaleString("en-IN")}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-400 italic">No services selected</p>
                      )}
                    </div>

                    {description && (
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-700">Description:</p>
                        <p className="text-gray-600 text-xs">{description.slice(0, 200)}...</p>
                      </div>
                    )}

                    <div className="border-t pt-4 mt-auto">
                      <div className="flex justify-between font-bold text-gray-800">
                        <span>Total:</span>
                        <span>₹{displayPrice.toLocaleString("en-IN")}</span>
                      </div>
                      {timeline && (
                        <p className="text-gray-500 text-sm mt-1">
                          Delivery by: {format(timeline, "MMMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[8.5/11] bg-secondary/30 border border-dashed rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <FileText size={48} className="mx-auto mb-3 opacity-50" />
                      <p className="text-base font-medium">PDF Preview</p>
                      <p className="text-sm">Click "Generate Preview" to see document</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Bar Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={handleGeneratePreview}>
            <Eye size={16} className="mr-2" />
            Generate Preview
          </Button>
          <Button onClick={handleSendToClient} disabled={selectedServices.length === 0}>
            <Send size={16} className="mr-2" />
            Send to Client for Signature
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
