import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";
import { FileText, Plus, X, ListTodo, Paperclip, Upload, Hash } from "lucide-react";

interface AddCallOutcomeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: any;
}

export function AddCallOutcome({ open, onOpenChange, meeting }: AddCallOutcomeProps) {
  const { addMeetingOutcome, generateUploadUrl, syncMetadata } = useData();
  const [notes, setNotes] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [existingKeys, setExistingKeys] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && meeting?.outcome) {
      setNotes(meeting.outcome.sales_notes || "");
      setNextSteps(meeting.outcome.next_steps || "");
      setExistingKeys(meeting.outcome.other_files || []);
      setNewFiles([]);
    } else if (open) {
      setNotes("");
      setNextSteps("");
      setExistingKeys([]);
      setNewFiles([]);
    }
  }, [open, meeting]);

  const handleSave = async () => {
    if (!notes) {
      toast.error("Please enter at least some discussion notes");
      return;
    }

    setIsSaving(true);
    try {
      const storageKeys: string[] = [...existingKeys];
      
      for (const file of newFiles) {
        // 1. Get upload URL and storage key from R2 component
        const { key, url } = await generateUploadUrl();
        
        // 2. Post file to R2
        const result = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        
        if (!result.ok) throw new Error(`Failed to upload ${file.name}`);
        
        // 3. Sync metadata to Convex
        await syncMetadata({ key });
        
        storageKeys.push(key);
      }

      await addMeetingOutcome({
        meeting_id: meeting._id,
        sales_notes: notes,
        next_steps: nextSteps,
        other_files: storageKeys,
      });

      toast.success(meeting.outcome ? "Meeting outcome updated successfully" : "Meeting outcome recorded successfully");
      onOpenChange(false);
    } catch (err: any) {
      console.log(err)
      toast.error(err.message || "Failed to save call outcome");
    } finally {
      setIsSaving(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles([...newFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  const removeExistingKey = (index: number) => {
    setExistingKeys(existingKeys.filter((_, i) => i !== index));
  };

  const handleNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = notes.substring(0, start) + '\n• ' + notes.substring(end);
      setNotes(newValue);
      
      // Set cursor position after the bullet
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 3;
      }, 0);
    }
  };

  const handleNextStepsKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = nextSteps.substring(0, start) + '\n• ' + nextSteps.substring(end);
      setNextSteps(newValue);
      
      // Set cursor position after the bullet
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 3;
      }, 0);
    }
  };

  const handleNotesFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!notes) {
      setNotes('• ');
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = 2;
      }, 0);
    }
  };

  const handleNextStepsFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!nextSteps) {
      setNextSteps('• ');
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = 2;
      }, 0);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="text-primary" size={20} />
            {meeting.outcome ? "Edit Call Outcome" : "Record Call Outcome"}
          </SheetTitle>
          <SheetDescription>
            {meeting.outcome 
              ? `Update the takeaways and next steps for "${meeting?.title}"`
              : `Document the key takeaways and next steps for "${meeting?.title}"`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ListTodo size={14} /> Discussion Notes (Bullet Points)
            </Label>
            <p className="text-[10px] text-slate-400 italic mb-2">Press Enter to add a new bullet point.</p>
            <textarea 
              placeholder="Start typing and press Enter for new bullets..."
              className="w-full min-h-[150px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none font-sans"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={handleNotesKeyDown}
              onFocus={handleNotesFocus}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Plus size={14} /> Next Steps
            </Label>
            <p className="text-[10px] text-slate-400 italic mb-2">Press Enter to add a new bullet point.</p>
            <textarea 
              placeholder="Start typing and press Enter for new bullets..."
              className="w-full min-h-[100px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none font-sans"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              onKeyDown={handleNextStepsKeyDown}
              onFocus={handleNextStepsFocus}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Paperclip size={14} /> Attachments
            </Label>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 mb-2 text-slate-400" />
                  <p className="text-xs text-slate-400"><span className="font-bold">Click to upload</span> (Audio, Video, PDF, Docs)</p>
                </div>
                <input type="file" className="hidden" multiple onChange={onFileChange} />
              </label>
            </div>

            {(existingKeys.length > 0 || newFiles.length > 0) && (
              <div className="space-y-2">
                {/* Existing Files */}
                {existingKeys.map((key, i) => (
                  <div key={`existing-${i}`} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg group">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-slate-400" />
                      <span className="text-xs font-medium text-slate-600 truncate">Existing: {key.split('/').pop()}</span>
                    </div>
                    <button onClick={() => removeExistingKey(i)} className="text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {/* New Files */}
                {newFiles.map((file, i) => (
                  <div key={`new-${i}`} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg group">
                    <div className="flex items-center gap-2 min-w-0">
                      <Upload size={14} className="text-primary" />
                      <span className="text-xs font-medium text-slate-600 truncate">{file.name}</span>
                      <span className="text-[10px] text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button onClick={() => removeNewFile(i)} className="text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
            {isSaving ? "Saving..." : (meeting.outcome ? "Update Outcome" : "Save Outcome")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}