import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api";

export default function StudentForm({ student, onClose }: { student?: any, onClose: () => void }) {
  const isEditing = !!student;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    roll_number: "", name: "", gender: "Male", is_hosteller: "false", photo_link: "",
    department: "", batch_year: "", sslc_percentage: "", sslc_year: "",
    hsc_percentage: "", hsc_year: "", ug_percentage: "", ug_year: "",
    pg_percentage: "", pg_year: "", cgpa: "",
    email: "", mobile_number: "",
    github_link: "", linkedin_link: "", portfolio_link: "",
    resume_link: "", video_link: "",
    placement_status: "Unplaced", company_name: "", ctc_lpa: ""
  });

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        is_hosteller: student.is_hosteller ? "true" : "false",
        batch_year: student.batch_year || "",
        sslc_percentage: student.sslc_percentage || "",
        sslc_year: student.sslc_year || "",
        hsc_percentage: student.hsc_percentage || "",
        hsc_year: student.hsc_year || "",
        ug_percentage: student.ug_percentage || "",
        ug_year: student.ug_year || "",
        pg_percentage: student.pg_percentage || "",
        pg_year: student.pg_year || "",
        cgpa: student.cgpa || "",
        ctc_lpa: student.ctc_lpa || "",
        company_name: student.company_name || "",
        github_link: student.github_link || "",
        linkedin_link: student.linkedin_link || "",
        portfolio_link: student.portfolio_link || "",
        resume_link: student.resume_link || "",
        video_link: student.video_link || "",
        photo_link: student.photo_link || ""
      });
    }
  }, [student]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Prepare payload (convert types)
    const payload = {
      ...formData,
      is_hosteller: formData.is_hosteller === "true",
      batch_year: parseInt(formData.batch_year as string) || 0,
      sslc_percentage: parseFloat(formData.sslc_percentage as string) || 0,
      sslc_year: parseInt(formData.sslc_year as string) || 0,
      hsc_percentage: parseFloat(formData.hsc_percentage as string) || 0,
      hsc_year: parseInt(formData.hsc_year as string) || 0,
      ug_percentage: parseFloat(formData.ug_percentage as string) || 0,
      ug_year: parseInt(formData.ug_year as string) || 0,
      pg_percentage: formData.pg_percentage ? parseFloat(formData.pg_percentage as string) : null,
      pg_year: formData.pg_year ? parseInt(formData.pg_year as string) : null,
      cgpa: parseFloat(formData.cgpa as string) || 0,
      ctc_lpa: formData.ctc_lpa ? parseFloat(formData.ctc_lpa as string) : null,
    };

    try {
      const url = isEditing 
        ? `${API_BASE_URL}/students/${student.id}` 
        : `${API_BASE_URL}/students/`;
        
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Failed to save student.");
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-slate-50 rounded-xl shadow-xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 bg-white border-b sticky top-0 z-10 rounded-t-xl">
          <h2 className="text-2xl font-bold text-slate-900">{isEditing ? "Edit Student" : "Add New Student"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-8 flex-1">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm font-medium">{error}</div>}
            
            {/* Section 1: Personal Info */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">1. Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Roll Number *</Label><Input required name="roll_number" value={formData.roll_number} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>Full Name *</Label><Input required name="name" value={formData.name} onChange={handleChange} /></div>
                <div className="space-y-1">
                  <Label>Gender *</Label>
                  <select required name="gender" value={formData.gender} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background">
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Accommodation *</Label>
                  <select required name="is_hosteller" value={formData.is_hosteller} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background">
                    <option value="false">Day Scholar</option><option value="true">Hosteller</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Academic Info */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">2. Academic Information</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1"><Label>Department *</Label><Input required name="department" value={formData.department} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>Batch (Graduation Year) *</Label><Input required type="number" name="batch_year" value={formData.batch_year} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>CGPA *</Label><Input required type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} /></div>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-1"><Label>SSLC % *</Label><Input required type="number" step="0.01" name="sslc_percentage" value={formData.sslc_percentage} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>SSLC Year *</Label><Input required type="number" name="sslc_year" value={formData.sslc_year} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>HSC % *</Label><Input required type="number" step="0.01" name="hsc_percentage" value={formData.hsc_percentage} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>HSC Year *</Label><Input required type="number" name="hsc_year" value={formData.hsc_year} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>UG % *</Label><Input required type="number" step="0.01" name="ug_percentage" value={formData.ug_percentage} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>UG Year *</Label><Input required type="number" name="ug_year" value={formData.ug_year} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>PG % (Optional)</Label><Input type="number" step="0.01" name="pg_percentage" value={formData.pg_percentage} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>PG Year (Optional)</Label><Input type="number" name="pg_year" value={formData.pg_year} onChange={handleChange} /></div>
              </div>
            </div>

            {/* Section 3: Contact */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">3. Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Email Address *</Label><Input required type="email" name="email" value={formData.email} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>Mobile Number *</Label><Input required pattern="[0-9]{10}" title="10 digit mobile number" name="mobile_number" value={formData.mobile_number} onChange={handleChange} /></div>
              </div>
            </div>

            {/* Section 4 & 5: Profiles & Media */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">4. Professional Profiles & Media (Links)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>GitHub URL</Label><Input type="url" name="github_link" value={formData.github_link} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>LinkedIn URL</Label><Input type="url" name="linkedin_link" value={formData.linkedin_link} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>Portfolio URL</Label><Input type="url" name="portfolio_link" value={formData.portfolio_link} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>Resume URL</Label><Input type="url" name="resume_link" value={formData.resume_link} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>Video Intro URL</Label><Input type="url" name="video_link" value={formData.video_link} onChange={handleChange} /></div>
                <div className="space-y-1"><Label>Photo URL</Label><Input type="url" name="photo_link" value={formData.photo_link} onChange={handleChange} /></div>
              </div>
            </div>
            
            {/* Section 6: Placement */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">5. Placement Info</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Status</Label>
                  <select name="placement_status" value={formData.placement_status} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background">
                    <option value="Unplaced">Unplaced</option><option value="Placed">Placed</option>
                  </select>
                </div>
                <div className="space-y-1"><Label>Company Name</Label><Input name="company_name" value={formData.company_name} onChange={handleChange} disabled={formData.placement_status !== 'Placed'} /></div>
                <div className="space-y-1"><Label>CTC (LPA)</Label><Input type="number" step="0.01" name="ctc_lpa" value={formData.ctc_lpa} onChange={handleChange} disabled={formData.placement_status !== 'Placed'} /></div>
              </div>
            </div>
            
          </div>
          
          <div className="p-6 bg-white border-t rounded-b-xl flex justify-end gap-3 sticky bottom-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : (isEditing ? "Save Changes" : "Add Student")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
