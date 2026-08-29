import { X, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentDetails({ student, onClose }: { student: any, onClose: () => void }) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-slate-50 rounded-xl shadow-xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 bg-white border-b sticky top-0 z-10 rounded-t-xl">
          <h2 className="text-2xl font-bold text-slate-900">Student Profile</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* PROFILE CARD */}
            <div className="bg-white p-5 rounded-lg border shadow-sm md:col-span-1">
              <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-4 border-b pb-2">Profile</h3>
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden mb-3">
                  {student.photo_link ? (
                    <img src={student.photo_link} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl font-bold">
                      {student.name.charAt(0)}
                    </div>
                  )}
                </div>
                {student.photo_link ? (
                  <Button variant="outline" size="sm" className="mb-3 text-xs h-8" asChild>
                    <a href={student.photo_link} target="_blank" rel="noreferrer">
                      View Photo <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                ) : (
                  <div className="mb-3 text-xs text-slate-400 italic">No photo available</div>
                )}
                <h4 className="text-xl font-bold text-slate-900">{student.name}</h4>
                <p className="text-sm text-slate-500 font-medium">{student.roll_number}</p>
                <div className="mt-3 inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                  {student.department} • Batch {student.batch_year}
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-medium">{student.gender}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Accommodation</span>
                  <span className="font-medium">{student.is_hosteller ? "Hosteller" : "Day Scholar"}</span>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="md:col-span-2 space-y-6">
              
              {/* ACADEMICS */}
              <div className="bg-white p-5 rounded-lg border shadow-sm">
                <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-4 border-b pb-2">Academics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-3 rounded text-center">
                    <p className="text-xs text-slate-500 mb-1">SSLC ({student.sslc_year})</p>
                    <p className="text-lg font-bold">{student.sslc_percentage}%</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded text-center">
                    <p className="text-xs text-slate-500 mb-1">HSC ({student.hsc_year})</p>
                    <p className="text-lg font-bold">{student.hsc_percentage}%</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded text-center">
                    <p className="text-xs text-slate-500 mb-1">UG ({student.ug_year})</p>
                    <p className="text-lg font-bold">{student.ug_percentage}%</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-center border border-blue-100">
                    <p className="text-xs text-blue-600 mb-1 font-bold">CGPA</p>
                    <p className="text-xl font-black text-blue-700">{student.cgpa}</p>
                  </div>
                </div>
                {student.pg_percentage && (
                  <div className="mt-4 bg-slate-50 p-3 rounded flex justify-between items-center">
                    <span className="text-sm font-medium">Post Graduation ({student.pg_year})</span>
                    <span className="font-bold">{student.pg_percentage}%</span>
                  </div>
                )}
              </div>

              {/* CONTACT & PROFILES */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-4 border-b pb-2">Contact</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">Email Address</p>
                      <p className="font-medium mt-0.5"><a href={`mailto:${student.email}`} className="text-blue-600 hover:underline">{student.email}</a></p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Mobile Number</p>
                      <p className="font-medium mt-0.5">{student.mobile_number}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-4 border-b pb-2">Social Profiles</h3>
                  <div className="space-y-3 text-sm">
                    {student.github_link ? (
                      <Button variant="outline" className="w-full justify-between" asChild>
                        <a href={student.github_link} target="_blank" rel="noreferrer">
                          View GitHub <ExternalLink className="ml-2 h-4 w-4 text-slate-400" />
                        </a>
                      </Button>
                    ) : (
                      <div className="text-slate-400 italic text-center py-2 border rounded-md text-xs">No GitHub link</div>
                    )}
                    {student.linkedin_link ? (
                      <Button variant="outline" className="w-full justify-between" asChild>
                        <a href={student.linkedin_link} target="_blank" rel="noreferrer">
                          View LinkedIn <ExternalLink className="ml-2 h-4 w-4 text-slate-400" />
                        </a>
                      </Button>
                    ) : (
                      <div className="text-slate-400 italic text-center py-2 border rounded-md text-xs">No LinkedIn link</div>
                    )}
                    {student.portfolio_link ? (
                      <Button variant="outline" className="w-full justify-between" asChild>
                        <a href={student.portfolio_link} target="_blank" rel="noreferrer">
                          View Portfolio <ExternalLink className="ml-2 h-4 w-4 text-slate-400" />
                        </a>
                      </Button>
                    ) : (
                      <div className="text-slate-400 italic text-center py-2 border rounded-md text-xs">No Portfolio link</div>
                    )}
                  </div>
                </div>
              </div>

              {/* PLACEMENT & DOCUMENTS */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-4 border-b pb-2">Placement Status</h3>
                  <div className="flex flex-col h-full">
                    <span className={`inline-block self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
                      student.placement_status === "Placed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                    }`}>
                      {student.placement_status}
                    </span>
                    {student.placement_status === "Placed" && (
                      <div className="space-y-2 mt-auto">
                        <div className="flex justify-between border-b pb-2 text-sm">
                          <span className="text-slate-500">Company</span>
                          <span className="font-bold text-slate-900">{student.company_name}</span>
                        </div>
                        <div className="flex justify-between pb-1 text-sm">
                          <span className="text-slate-500">Package (CTC)</span>
                          <span className="font-bold text-emerald-600">{student.ctc_lpa} LPA</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-4 border-b pb-2">Documents</h3>
                  <div className="space-y-3">
                    {student.resume_link ? (
                      <Button variant="secondary" className="w-full justify-between" asChild>
                        <a href={student.resume_link} target="_blank" rel="noreferrer">
                          View Resume / CV <ExternalLink className="ml-2 h-4 w-4 text-slate-500" />
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No resume uploaded</p>
                    )}
                    {student.video_link ? (
                      <Button variant="secondary" className="w-full justify-between" asChild>
                        <a href={student.video_link} target="_blank" rel="noreferrer">
                          View Intro Video <ExternalLink className="ml-2 h-4 w-4 text-slate-500" />
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No intro video</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
