import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileSignature, Receipt, MoreHorizontal } from "lucide-react";

const ndas = [
  { id: 1, title: "Mutual NDA", client: "Acme Corp", status: "signed", date: "Feb 1, 2025" },
  { id: 2, title: "One-way NDA", client: "TechStart Inc", status: "pending", date: "Jan 30, 2025" },
  { id: 3, title: "Mutual NDA", client: "Global Partners", status: "signed", date: "Jan 28, 2025" },
];

const invoices = [
  { id: 1, number: "INV-001", client: "Acme Corp", amount: "$12,500", status: "paid", date: "Feb 1, 2025" },
  { id: 2, number: "INV-002", client: "TechStart Inc", amount: "$8,200", status: "pending", date: "Jan 30, 2025" },
  { id: 3, number: "INV-003", client: "Innovation Labs", amount: "$15,800", status: "overdue", date: "Jan 15, 2025" },
  { id: 4, number: "INV-004", client: "Quantum Solutions", amount: "$4,500", status: "paid", date: "Jan 10, 2025" },
];

const ndaStatusColors = {
  signed: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  expired: "bg-gray-100 text-gray-700 border-gray-200",
};

const invoiceStatusColors = {
  paid: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
};

export default function Contracts() {
  return (
    <AppLayout title="Contracts">
      <Tabs defaultValue="nda" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="nda" className="gap-2">
              <FileSignature size={14} />
              NDAs
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <Receipt size={14} />
              Invoices
            </TabsTrigger>
          </TabsList>
          <Button>
            <Plus size={16} className="mr-2" />
            New Document
          </Button>
        </div>

        <TabsContent value="nda">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Non-Disclosure Agreements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {ndas.map((nda) => (
                  <div key={nda.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="p-2 rounded-lg bg-secondary">
                      <FileSignature size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{nda.title}</p>
                      <p className="text-sm text-muted-foreground">{nda.client}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{nda.date}</span>
                    <Badge variant="outline" className={ndaStatusColors[nda.status]}>
                      {nda.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Receipt size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{invoice.number}</p>
                      <p className="text-sm text-muted-foreground">{invoice.client}</p>
                    </div>
                    <span className="text-sm font-medium text-foreground w-24">{invoice.amount}</span>
                    <span className="text-sm text-muted-foreground w-24">{invoice.date}</span>
                    <Badge variant="outline" className={invoiceStatusColors[invoice.status]}>
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
