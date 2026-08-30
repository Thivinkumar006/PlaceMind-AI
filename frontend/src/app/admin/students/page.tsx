"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import StudentExcelImportModal from "@/components/students/student-excel-import-modal";
import { API_BASE_URL } from "@/lib/api";

export default function StudentsPage() {
  const [modalState, setModalState] = useState<"none" | "import">("none");

  const handleDownloadTemplate = () => {
    window.location.href = `${API_BASE_URL}/students/template`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto mt-8">
      <div className="flex flex-col text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Student Data Management</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Upload and manage student records via Excel. Our streamlined import process ensures your data is validated and securely stored.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-emerald-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <Upload className="w-10 h-10 text-emerald-600" />
            </div>
            <CardTitle className="text-xl">Upload Data</CardTitle>
            <CardDescription>
              Import student details using an Excel file
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4 pb-6">
            <Button 
              size="lg" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full max-w-xs text-lg py-6 shadow-md transition-transform hover:scale-105" 
              onClick={() => setModalState("import")}
            >
              <Upload className="mr-2 h-5 w-5" /> Select Excel File
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Download Template</CardTitle>
            <CardDescription>
              Get the standard template for correct formatting
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4 pb-6">
            <Button 
              size="lg"
              variant="outline"
              className="w-full max-w-xs text-lg py-6 border-blue-200 hover:bg-blue-50 text-blue-700 shadow-sm transition-transform hover:scale-105" 
              onClick={handleDownloadTemplate}
            >
              <Download className="mr-2 h-5 w-5" /> Download Template
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-3">Important Instructions:</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li>Ensure the Excel file has the correct column headers as specified in the template.</li>
          <li>Dates should be formatted correctly (YYYY-MM-DD).</li>
          <li>Check for duplicate Roll Numbers before uploading.</li>
          <li>Large files (over 5000 rows) might take a moment to process.</li>
        </ul>
      </div>

      {modalState === "import" && (
        <StudentExcelImportModal 
          onClose={() => setModalState("none")} 
          onSuccess={() => {
            // Optional: Show success toast or redirect to reports
            setModalState("none");
          }} 
        />
      )}
    </div>
  );
}
