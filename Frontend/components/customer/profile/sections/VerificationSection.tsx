"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, Upload, CheckCircle, XCircle, Clock, AlertCircle, X, Download, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { UploadedDocument, DocumentType } from "../types";

type Props = {
  documents: UploadedDocument[];
  setDocuments: (docs: UploadedDocument[]) => void;
  documentTypes: DocumentType[];
};

export default function VerificationSection({ documents, setDocuments, documentTypes }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const counts = {
    approved: documents.filter(d => d.status === "approved").length,
    pending: documents.filter(d => d.status === "pending").length,
    rejected: documents.filter(d => d.status === "rejected").length,
  };

  const status =
    counts.approved >= 2 && counts.pending === 0 && counts.rejected === 0 ? "verified"
    : counts.pending > 0 ? "pending"
    : counts.rejected > 0 ? "action_required"
    : "not_verified";

  const StatusIcon = status === "verified" ? CheckCircle : status === "pending" ? Clock : status === "action_required" ? AlertCircle : XCircle;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
    const ok = ["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(f.type);
    if (!ok) return toast({ title: "Invalid file type", description: "PDF, JPEG, PNG only", variant: "destructive" });
    setFile(f);
  };

  const upload = () => {
    if (!docType || !file) {
      return toast({ title: "Missing information", description: "Select a type and a file.", variant: "destructive" });
    }
    const newDoc: UploadedDocument = {
      id: Date.now().toString(),
      name: file.name,
      type: documentTypes.find(t => t.value === docType)?.label ?? docType,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    setDocuments([...(documents ?? []), newDoc]);
    setOpen(false); setDocType(""); setFile(null);
    toast({ title: "Document Uploaded", description: "Pending verification." });
  };

  const remove = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
    toast({ title: "Document Deleted", description: "Removed from your account." });
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Company Verification Status</CardTitle>
            <CardDescription>Upload required documents to verify and authorize your company</CardDescription>
          </div>
          <Badge className={
            status === "verified" ? "bg-green-100 text-green-800" :
            status === "pending" ? "bg-yellow-100 text-yellow-800" :
            status === "action_required" ? "bg-red-100 text-red-800" :
            "bg-gray-100 text-gray-800"}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {status === "verified" ? "Verified" :
             status === "pending" ? "Pending Review" :
             status === "action_required" ? "Action Required" : "Not Verified"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Alert Banner */}
        {status !== "verified" && (
          <div className={`p-4 rounded-lg border ${
              status === "action_required" ? "bg-red-50 border-red-200" :
              status === "pending" ? "bg-yellow-50 border-yellow-200" :
              "bg-blue-50 border-blue-200"}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 mt-0.5 ${
                status === "action_required" ? "text-red-600" :
                status === "pending" ? "text-yellow-600" : "text-blue-600"}`} />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">
                  {status === "action_required" ? "Action Required" :
                   status === "pending" ? "Documents Under Review" : "Complete Your Verification"}
                </h4>
                <p className="text-sm text-gray-600">
                  {status === "action_required"
                    ? "Some documents were rejected. Please review and resubmit."
                    : status === "pending"
                      ? "Review typically takes 1–2 business days."
                      : "Upload the required verification documents to unlock all features."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Required list (kept brief) */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Required Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {["Business Registration (SSM)","Tax Identification Number","Bank Account Statement","Director's Identification"].map((t)=>(
              <div key={t} className="p-3 border rounded-lg bg-gray-50 flex items-start gap-2">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{t}</p>
                  <p className="text-xs text-gray-500">Required for verification</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Upload button & dialog */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Uploaded Documents</h3>
            <p className="text-sm text-gray-500">Manage your verification documents</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Upload className="w-4 h-4 mr-2" />Upload Document</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Verification Document</DialogTitle>
                <DialogDescription>PDF, JPEG, PNG (Max 10MB)</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Document Type</Label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger><SelectValue placeholder="Select document type" /></SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((t)=>(
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Select File</Label>
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onFile} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                <Button onClick={upload} disabled={!docType || !file}>Upload Document</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Uploaded list */}
        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No documents uploaded yet</p>
              <p className="text-sm text-gray-500">Upload your verification documents to get started</p>
            </div>
          ) : documents.map((doc)=>(
            <div key={doc.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{doc.name}</h4>
                      {doc.status === "approved" && <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>}
                      {doc.status === "pending" && <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>}
                      {doc.status === "rejected" && <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{doc.type}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{doc.size}</span>
                      <span>Uploaded: {doc.uploadDate}</span>
                    </div>
                    {doc.status === "rejected" && doc.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Reason:</strong> {doc.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Download className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => remove(doc.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
