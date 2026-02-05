import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileSignature, Receipt, Send, Eye, Download } from "lucide-react";
import { Link } from "react-router-dom";

const ndaDetails = {
  title: "Mutual Non-Disclosure Agreement",
  client: "Acme Corporation",
  date: "February 5, 2025",
  type: "Mutual NDA",
  duration: "2 years",
  status: "draft",
};

const invoiceDetails = {
  number: "INV-2025-003",
  client: "Acme Corporation",
  date: "February 5, 2025",
  dueDate: "February 20, 2025",
  items: [
    { description: "Website Design", amount: 5000 },
    { description: "Website Development", amount: 8000 },
    { description: "SEO Optimization", amount: 2500 },
  ],
  status: "pending",
};

export default function SendDocuments() {
  const invoiceTotal = invoiceDetails.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <AppLayout title="Send NDA & Invoice">
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/contracts">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Send NDA & Invoice</h2>
            <p className="text-sm text-muted-foreground">Review and send documents to client</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* NDA Panel */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileSignature size={18} className="text-primary" />
                  NDA Document
                </CardTitle>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  {ndaDetails.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview Area */}
              <div className="bg-secondary/50 rounded-lg p-6 min-h-[300px] flex flex-col items-center justify-center border border-dashed border-border">
                <FileSignature size={48} className="text-muted-foreground mb-4" />
                <p className="font-semibold text-foreground">{ndaDetails.title}</p>
                <p className="text-sm text-muted-foreground mt-1">Click to preview full document</p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium text-foreground">{ndaDetails.client}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium text-foreground">{ndaDetails.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{ndaDetails.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{ndaDetails.date}</span>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Eye size={16} className="mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="icon">
                  <Download size={16} />
                </Button>
              </div>

              <Button className="w-full">
                <Send size={16} className="mr-2" />
                Send NDA
              </Button>
            </CardContent>
          </Card>

          {/* Invoice Panel */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Receipt size={18} className="text-primary" />
                  Invoice Document
                </CardTitle>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  {invoiceDetails.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview Area */}
              <div className="bg-secondary/50 rounded-lg p-6 border border-dashed border-border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-foreground">{invoiceDetails.number}</p>
                    <p className="text-sm text-muted-foreground">{invoiceDetails.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Issue Date</p>
                    <p className="text-sm font-medium text-foreground">{invoiceDetails.date}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {invoiceDetails.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-foreground">{item.description}</span>
                      <span className="font-medium text-foreground">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${invoiceTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium text-foreground">{invoiceDetails.client}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-medium text-foreground">{invoiceDetails.dueDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-primary">${invoiceTotal.toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Eye size={16} className="mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="icon">
                  <Download size={16} />
                </Button>
              </div>

              <Button className="w-full">
                <Send size={16} className="mr-2" />
                Send Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
