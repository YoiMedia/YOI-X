import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, RotateCcw, Upload, Image, FileText, Send, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const deliverable = {
  title: "Homepage Redesign - Final Version",
  description: "Complete homepage redesign with responsive layout, hero section, feature cards, and optimized performance.",
  submittedBy: "Alex Rivera",
  submittedDate: "Feb 10, 2025",
  version: "v2.1",
  files: [
    { name: "homepage-desktop.png", type: "image", size: "2.4 MB" },
    { name: "homepage-mobile.png", type: "image", size: "1.8 MB" },
    { name: "design-specs.pdf", type: "document", size: "456 KB" },
  ],
};

export default function ClientReview() {
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionComment, setRevisionComment] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = () => {
    // Simulate file upload
    setUploadedFiles([...uploadedFiles, `Screenshot-${uploadedFiles.length + 1}.png`]);
  };

  return (
    <AppLayout title="Review Deliverable">
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/portal">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Review Deliverable</h2>
              <p className="text-sm text-muted-foreground">
                Submitted by {deliverable.submittedBy} · {deliverable.submittedDate}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Awaiting Review
          </Badge>
        </div>

        {/* Preview Section */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">{deliverable.title}</CardTitle>
              <Badge variant="secondary">{deliverable.version}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">{deliverable.description}</p>

            {/* Preview Area */}
            <div className="bg-secondary/50 rounded-lg p-8 min-h-[400px] flex flex-col items-center justify-center border border-dashed border-border">
              <Image size={64} className="text-muted-foreground mb-4" />
              <p className="font-semibold text-foreground">Deliverable Preview</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Click to view full-size</p>
              <Button variant="outline">
                <Eye size={16} className="mr-2" />
                View Full Preview
              </Button>
            </div>

            {/* Files */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Attached Files</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {deliverable.files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    {file.type === "image" ? (
                      <Image size={18} className="text-primary" />
                    ) : (
                      <FileText size={18} className="text-primary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons or Revision Form */}
        {!showRevisionForm ? (
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
                  <CheckCircle size={18} className="mr-2" />
                  Approve Deliverable
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-orange-400 text-orange-600 hover:bg-orange-50"
                  size="lg"
                  onClick={() => setShowRevisionForm(true)}
                >
                  <RotateCcw size={18} className="mr-2" />
                  Request Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <RotateCcw size={18} className="text-orange-500" />
                Request Revision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Comment Box */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Describe the changes needed
                </label>
                <Textarea
                  placeholder="Please specify what needs to be revised, including any specific areas or elements that require changes..."
                  value={revisionComment}
                  onChange={(e) => setRevisionComment(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Attach Reference Files (optional)
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload screenshots or reference files
                  </p>
                  <Button variant="outline" size="sm" onClick={handleFileUpload}>
                    <Upload size={14} className="mr-2" />
                    Choose Files
                  </Button>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {uploadedFiles.map((file, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        <Image size={12} />
                        {file}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRevisionForm(false);
                    setRevisionComment("");
                    setUploadedFiles([]);
                  }}
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
                  <Send size={16} className="mr-2" />
                  Submit Revision Request
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
