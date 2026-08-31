"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Download, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  FileText, 
  ExternalLink 
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface CompanyImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompanyExcelImportModal({ onClose, onSuccess }: CompanyImportModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/import/template`);
      if (!response.ok) throw new Error("Failed to download template");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "companies_import_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error(error);
      alert("Error downloading template.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/companies/import/preview`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewData(data);
        setStep(2);
      } else {
        alert(`Error: ${data.detail || "Failed to preview file"}`);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during upload.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;
    
    // Extract valid and update records
    const validRecords = previewData.preview_data
      .filter((row: any) => row.status === "Valid" || row.status === "Update")
      .map((row: any) => row.data);
      
    if (validRecords.length === 0) {
      alert("No valid company records to import.");
      return;
    }

    setIsConfirming(true);
    try {
      const res = await fetch(`${API_BASE_URL}/companies/import/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: validRecords }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult({
          imported: data.imported,
          created: data.created,
          updated: data.updated,
          totalValid: validRecords.length,
          totalErrors: previewData.summary.error,
        });
        setStep(4);
      } else {
        alert(`Error: ${data.detail?.message || data.detail || "Failed to import"}`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during import.");
    } finally {
      setIsConfirming(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COLD":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "WARM":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "HOT":
        return "bg-red-100 text-red-700 border-red-200";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {step === 1 && "Import Companies via Excel"}
                {step === 2 && "Company Import Preview"}
                {step === 4 && "Import Completed"}
              </h3>
              <p className="text-xs text-slate-500">
                {step === 1 && "Upload an Excel or CSV file containing company records"}
                {step === 2 && "Review and verify parsed company details before importing"}
                {step === 4 && "Company records successfully processed"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* STEP 1: Upload File & Download Template */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-between items-center bg-blue-50/70 border border-blue-100 p-4 rounded-xl text-sm text-blue-900 gap-4">
                <div>
                  <p className="font-semibold text-blue-950 mb-0.5">Need a formatted template?</p>
                  <p className="text-xs text-blue-700">Download our standard Excel template with pre-built headers for company name, location, contact, industry, and status.</p>
                </div>
                <Button 
                  variant="outline" 
                  className="bg-white border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors shadow-sm text-xs font-semibold"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="mr-2 h-4 w-4 text-blue-600" /> Download Template (.xlsx)
                </Button>
              </div>

              <div 
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  isUploading ? 'border-slate-300 bg-slate-100 cursor-default' : 'border-blue-300 bg-blue-50/30 hover:bg-blue-50/80 cursor-pointer'
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                    <div>
                      <p className="font-semibold text-slate-900">Analyzing Company Records...</p>
                      <p className="text-xs text-slate-500">Validating columns and checking for existing companies</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600 shadow-sm">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500 mt-1">Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv)</p>
                    </div>
                    <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium">
                      Select Excel File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Preview & Validation Table */}
          {step === 2 && previewData && (
            <div className="space-y-6">
              {/* Metric Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium">Total Companies</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{previewData.summary.total}</p>
                </div>
                <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-100 shadow-sm">
                  <p className="text-xs text-emerald-700 font-medium">New Companies (Valid)</p>
                  <p className="text-2xl font-bold text-emerald-800 mt-1">{previewData.summary.valid}</p>
                </div>
                <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-100 shadow-sm">
                  <p className="text-xs text-amber-700 font-medium">Existing (To Update)</p>
                  <p className="text-2xl font-bold text-amber-800 mt-1">{previewData.summary.update}</p>
                </div>
                <div className="bg-red-50/80 p-4 rounded-xl border border-red-100 shadow-sm">
                  <p className="text-xs text-red-700 font-medium">Errors / Missing Name</p>
                  <p className="text-2xl font-bold text-red-800 mt-1">{previewData.summary.error}</p>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
                  <h4 className="font-semibold text-sm text-slate-800">Parsed Company Details</h4>
                  <span className="text-xs text-slate-500 font-medium bg-slate-200/70 px-2 py-0.5 rounded">
                    File: {previewData.file_name}
                  </span>
                </div>
                <div className="overflow-x-auto max-h-[420px]">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                      <tr>
                        <th className="px-4 py-3 font-medium">Row</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                        <th className="px-4 py-3 font-medium">Company Name</th>
                        <th className="px-4 py-3 font-medium">Industry</th>
                        <th className="px-4 py-3 font-medium">Location</th>
                        <th className="px-4 py-3 font-medium">Contact Person</th>
                        <th className="px-4 py-3 font-medium">Contact Details</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">JD Link</th>
                        <th className="px-4 py-3 font-medium">Validation Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewData.preview_data.map((row: any, index: number) => {
                        const isUpdate = row.status === "Update";
                        const isError = row.status === "Error";
                        return (
                          <tr key={index} className={
                            isError ? "bg-red-50/40 hover:bg-red-50/70" :
                            isUpdate ? "bg-amber-50/40 hover:bg-amber-50/70" :
                            "hover:bg-slate-50/60"
                          }>
                            <td className="px-4 py-3 font-medium text-xs text-slate-400">{index + 1}</td>
                            <td className="px-4 py-3">
                              {row.status === "Valid" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                                  <CheckCircle className="mr-1 h-3 w-3" /> New
                                </span>
                              )}
                              {isUpdate && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                                  <AlertCircle className="mr-1 h-3 w-3" /> Update
                                </span>
                              )}
                              {isError && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">
                                  <X className="mr-1 h-3 w-3" /> Error
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <span>{row.data.name || "-"}</span>
                                {row.data.website && (
                                  <a href={row.data.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600">
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-xs">{row.data.industry || "-"}</td>
                            <td className="px-4 py-3 text-slate-600 text-xs">
                              {row.data.location ? (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-[150px]" title={row.data.location}>{row.data.location}</span>
                                </div>
                              ) : "-"}
                            </td>
                            <td className="px-4 py-3 text-slate-800 text-xs font-medium">{row.data.contact_person || "-"}</td>
                            <td className="px-4 py-3 text-xs text-slate-600">
                              <div className="flex flex-col gap-0.5">
                                {row.data.contact_email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3 text-slate-400" />
                                    <span>{row.data.contact_email}</span>
                                  </div>
                                )}
                                {row.data.contact_phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-slate-400" />
                                    <span>{row.data.contact_phone}</span>
                                  </div>
                                )}
                                {!row.data.contact_email && !row.data.contact_phone && <span>-</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(row.data.status)}`}>
                                {row.data.status || "COLD"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {row.data.jd_link ? (
                                <a href={row.data.jd_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>View JD</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">None</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {row.errors.length > 0 ? (
                                <ul className="text-amber-700 list-disc list-inside">
                                  {row.errors.map((err: string, i: number) => (
                                    <li key={i} className={isError ? "text-red-600 font-medium" : "text-amber-700"}>{err}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-emerald-600 font-medium">Ready to import</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Success Results Screen */}
          {step === 4 && importResult && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-5">
              <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 shadow-sm animate-in zoom-in-50 duration-300">
                <CheckCircle className="h-16 w-16" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Companies Imported Successfully!</h3>
                <p className="text-sm text-slate-500 mt-1">Your company database has been updated with the imported records.</p>
              </div>

              <div className="text-slate-600 w-full max-w-md bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <p className="text-lg font-bold text-emerald-700 border-b pb-2">
                  {importResult.imported} Total Companies Processed
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-600">New Companies Created:</span>
                    <span className="font-bold text-slate-900">{importResult.created}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5 text-amber-700">
                    <span>Existing Companies Updated:</span>
                    <span className="font-bold">{importResult.updated}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Invalid Rows Skipped:</span>
                    <span className="font-bold">{importResult.totalErrors}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => { setPreviewData(null); setStep(1); }}>
                Back / Choose Another File
              </Button>
              <Button 
                onClick={handleConfirmImport} 
                disabled={isConfirming || ((previewData?.summary.valid || 0) + (previewData?.summary.update || 0)) === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {isConfirming ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing Companies...</>
                ) : (
                  `Import ${(previewData?.summary.valid || 0) + (previewData?.summary.update || 0)} Companies`
                )}
              </Button>
            </>
          )}
          {step === 4 && (
            <Button 
              onClick={() => { onSuccess(); onClose(); }} 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium px-6"
            >
              View Updated Companies List
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
