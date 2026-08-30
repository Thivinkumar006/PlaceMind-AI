"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface StudentImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function StudentExcelImportModal({ onClose, onSuccess }: StudentImportModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/import/template`);
      if (!response.ok) throw new Error("Failed to download template");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student_import_template.xlsx';
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
      const res = await fetch(`${API_BASE_URL}/students/import/preview`, {
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
      alert("No valid records to import.");
      return;
    }

    setIsConfirming(true);
    try {
      const res = await fetch(`${API_BASE_URL}/students/import/confirm`, {
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
          totalValid: validRecords.length,
          totalErrors: previewData.summary.error,
          totalUpdates: previewData.summary.update || previewData.summary.duplicate
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-bold text-slate-900">
            {step === 1 && "Upload Excel File"}
            {step === 2 && "Import Preview"}
            {step === 3 && "Confirm Import"}
            {step === 4 && "Import Complete"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5 text-slate-500" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-4 rounded-md text-sm text-blue-800">
                <div>
                  <p className="font-semibold mb-1">Need a template?</p>
                  <p>Download our standard Excel template to ensure perfect formatting.</p>
                </div>
                <Button variant="outline" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50" onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" /> Download Template
                </Button>
              </div>

              <div 
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isUploading ? 'border-slate-300 bg-slate-100' : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50'}`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                style={{ cursor: isUploading ? 'default' : 'pointer' }}
              >
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                    <div>
                      <p className="font-medium text-slate-900">Uploading & Analyzing...</p>
                      <p className="text-sm text-slate-500">Please wait while we validate your data</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-lg">Click to upload Excel file</p>
                      <p className="text-sm text-slate-500">Supports .xlsx and .xls formats</p>
                    </div>
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Select File</Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && previewData && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-500 font-medium">Total Records</p>
                  <p className="text-2xl font-bold text-slate-900">{previewData.summary.total}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 shadow-sm">
                  <p className="text-sm text-emerald-600 font-medium">Valid (Ready)</p>
                  <p className="text-2xl font-bold text-emerald-700">{previewData.summary.valid}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 shadow-sm">
                  <p className="text-sm text-amber-600 font-medium">Updates</p>
                  <p className="text-2xl font-bold text-amber-700">{previewData.summary.update || previewData.summary.duplicate}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 shadow-sm">
                  <p className="text-sm text-red-600 font-medium">Errors</p>
                  <p className="text-2xl font-bold text-red-700">{previewData.summary.error}</p>
                </div>
              </div>

              <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center">
                  <h4 className="font-semibold text-slate-700">Data Preview</h4>
                  <span className="text-xs text-slate-500">File: {previewData.file_name}</span>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 shadow-sm z-10">
                      <tr>
                        <th className="px-4 py-3 font-medium">Row</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Roll No</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Department</th>
                        <th className="px-4 py-3 font-medium">Details/Errors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewData.preview_data.map((row: any, index: number) => {
                        const isUpdate = row.status === 'Update' || row.status === 'Duplicate';
                        return (
                        <tr key={index} className={
                          row.status === 'Valid' ? 'hover:bg-slate-50' : 
                          isUpdate ? 'bg-amber-50/50 hover:bg-amber-50' : 
                          'bg-red-50/50 hover:bg-red-50'
                        }>
                          <td className="px-4 py-2 font-medium text-slate-500">{index + 1}</td>
                          <td className="px-4 py-2">
                            {row.status === 'Valid' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="mr-1 h-3 w-3"/> Valid</span>}
                            {isUpdate && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800"><AlertCircle className="mr-1 h-3 w-3"/> Update</span>}
                            {row.status === 'Error' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"><X className="mr-1 h-3 w-3"/> Error</span>}
                          </td>
                          <td className="px-4 py-2 text-slate-700">{row.data.roll_number || '-'}</td>
                          <td className="px-4 py-2 text-slate-700">{row.data.name || '-'}</td>
                          <td className="px-4 py-2 text-slate-700">{row.data.email || '-'}</td>
                          <td className="px-4 py-2 text-slate-700">{row.data.department || '-'}</td>
                          <td className="px-4 py-2 text-xs">
                            {row.errors.length > 0 ? (
                              <ul className="text-amber-700 list-disc list-inside">
                                {row.errors.map((err: string, i: number) => <li key={i} className={row.status === 'Error' ? 'text-red-600' : ''}>{err}</li>)}
                              </ul>
                            ) : (
                              <span className="text-emerald-600">Ready to import</span>
                            )}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === 4 && importResult && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="bg-emerald-100 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Import Completed Successfully</h3>
              <div className="text-slate-600 max-w-md bg-white p-6 rounded-lg border shadow-sm">
                <p className="text-lg font-medium text-emerald-600 mb-4">{importResult.imported} students imported successfully.</p>
                <div className="space-y-2 text-sm text-left">
                  <p className="flex justify-between border-b pb-1"><span>Total valid records attempted:</span> <span className="font-bold">{importResult.totalValid}</span></p>
                  <p className="flex justify-between border-b pb-1 text-amber-600"><span>Existing records updated:</span> <span className="font-bold">{importResult.totalUpdates}</span></p>
                  <p className="flex justify-between text-red-600"><span>Invalid records skipped:</span> <span className="font-bold">{importResult.totalErrors}</span></p>
                </div>
              </div>
            </div>
          )}
          
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-white flex justify-end gap-3">
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => { setPreviewData(null); setStep(1); }}>Cancel</Button>
              <Button 
                onClick={handleConfirmImport} 
                disabled={isConfirming || ((previewData?.summary.valid || 0) + (previewData?.summary.update || previewData?.summary.duplicate || 0)) === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isConfirming ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
                ) : (
                  `Import ${(previewData?.summary.valid || 0) + (previewData?.summary.update || previewData?.summary.duplicate || 0)} Ready Records`
                )}
              </Button>
            </>
          )}
          {step === 4 && (
            <Button onClick={() => { onSuccess(); onClose(); }} className="bg-blue-600 hover:bg-blue-700 text-white">
              View Students
            </Button>
          )}
        </div>
        
      </div>
    </div>
  );
}
