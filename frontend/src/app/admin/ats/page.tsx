"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Star, 
  ChevronRight, 
  MoreVertical, 
  Mail, 
  MessageSquare, 
  Activity, 
  X, 
  FileText, 
  Upload, 
  Download, 
  Building2, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  ExternalLink, 
  Sliders, 
  Award, 
  Zap, 
  Globe,
  Check,
  Layers,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import * as XLSX from "xlsx";

// Default Preset Placement Drives / JDs (tailored to college departments including Cyber Security, IT, Management)
const defaultDrives = [
  { 
    id: 1, 
    company: "Palo Alto Networks / Cisco", 
    role: "Cyber Security & SOC Analyst", 
    minCgpa: 7.0,
    requiredSkills: ["Network Security", "Cryptography", "Linux", "Python", "Ethical Hacking", "SQL", "Git", "Wireshark"],
    eligibleDepts: ["Cyber Security", "Information Technology", "Computer Science", "CSE", "IT"],
    description: "Seeking Cyber Security engineering graduates to join the threat intelligence, SOC monitoring, and network defense teams."
  },
  { 
    id: 2, 
    company: "Google", 
    role: "Software Development Engineer (SDE 1)", 
    minCgpa: 7.5,
    requiredSkills: ["Python", "Java", "C++", "Data Structures", "Algorithms", "System Design", "SQL", "Git"],
    eligibleDepts: ["Computer Science", "Information Technology", "Cyber Security", "CSE", "IT", "AIDS"],
    description: "Seeking high-caliber software engineering graduates with solid foundations in algorithms, data structures, backend systems, and clean coding practices."
  },
  { 
    id: 3, 
    company: "Microsoft", 
    role: "Full Stack Cloud Engineer", 
    minCgpa: 7.0,
    requiredSkills: ["React", "TypeScript", "Node.js", "Python", "SQL", "Docker", "Git", "Data Structures"],
    eligibleDepts: ["Information Technology", "Computer Science", "Cyber Security", "CSE", "IT", "AIDS"],
    description: "Looking for versatile Full Stack developers passionate about building resilient web applications and microservices on cloud infrastructure."
  },
  { 
    id: 4, 
    company: "Deloitte / EY", 
    role: "Business & Technology Analyst", 
    minCgpa: 6.5,
    requiredSkills: ["Business Analysis", "Financial Analysis", "Project Management", "MS Excel", "SQL", "Data Analysis", "Communication"],
    eligibleDepts: ["Business Administration", "Information Technology", "Computer Science", "BBA", "CSE", "IT"],
    description: "Consulting role analyzing business processes, financial data modeling, requirements gathering, and tech transformation initiatives."
  },
  { 
    id: 5, 
    company: "Amazon AWS", 
    role: "Cloud & DevOps Associate", 
    minCgpa: 6.5,
    requiredSkills: ["Linux", "AWS", "Docker", "Python", "Git", "SQL", "Network Security"],
    eligibleDepts: ["Information Technology", "Cyber Security", "Computer Science", "ECE", "EEE"],
    description: "Fast-paced DevOps and Cloud role maintaining enterprise AWS infrastructure, container pipelines, and automated deployments."
  }
];

const COMMON_SKILLS_LIST = [
  "Network Security", "Cryptography", "Linux", "Python", "Ethical Hacking", "Wireshark",
  "Java", "C++", "C#", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", 
  "SQL", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Git", "Data Structures", 
  "Algorithms", "System Design", "Machine Learning", "Business Analysis", "Financial Analysis", "MS Excel"
];

// Helper to infer department skills
function getDepartmentSkills(dept: string): string[] {
  const d = (dept || "").toLowerCase();
  if (d.includes("cyber") || d.includes("security")) {
    return ["Network Security", "Cryptography", "Linux", "Python", "Ethical Hacking", "SQL", "Git", "C++", "Wireshark"];
  } else if (d.includes("info") || d.includes("it") || d.includes("computer") || d.includes("cse") || d.includes("software")) {
    return ["Python", "Java", "SQL", "Data Structures", "Algorithms", "React", "Node.js", "Git", "C++", "System Design"];
  } else if (d.includes("ai") || d.includes("data")) {
    return ["Python", "Machine Learning", "Data Analysis", "SQL", "Pandas", "PyTorch", "TensorFlow", "Deep Learning", "Git"];
  } else if (d.includes("electronic") || d.includes("ece") || d.includes("communi")) {
    return ["Embedded Systems", "IoT", "C", "C++", "MATLAB", "Linux", "Microcontrollers", "Python"];
  } else if (d.includes("electri") || d.includes("eee")) {
    return ["Power Systems", "Control Systems", "MATLAB", "C", "Circuit Design", "Python"];
  } else if (d.includes("mech")) {
    return ["AutoCAD", "SolidWorks", "Finite Element Analysis", "Thermodynamics", "Python"];
  } else if (d.includes("business") || d.includes("bba") || d.includes("management") || d.includes("commerce")) {
    return ["Business Analysis", "Financial Analysis", "Project Management", "MS Excel", "SQL", "Data Analysis", "Communication"];
  }
  return ["Problem Solving", "Python", "SQL", "Data Structures", "Git"];
}

// Helper to fuzzy match department eligibility
function checkDeptMatch(candDept: string, eligibleDepts: string[]): boolean {
  if (!eligibleDepts || eligibleDepts.length === 0 || eligibleDepts.includes("ALL") || eligibleDepts.includes("All Branches")) return true;
  const cLower = (candDept || "").trim().toLowerCase();
  return eligibleDepts.some(req => {
    const rLower = req.trim().toLowerCase();
    if (rLower === cLower || cLower.includes(rLower) || rLower.includes(cLower)) return true;
    if (rLower === "cse" && (cLower.includes("computer") || cLower.includes("cse") || cLower.includes("cyber") || cLower.includes("software"))) return true;
    if (rLower === "it" && (cLower.includes("info") || cLower.includes("it") || cLower.includes("cyber"))) return true;
    if (rLower === "bba" && (cLower.includes("business") || cLower.includes("management") || cLower.includes("bba") || cLower.includes("commerce"))) return true;
    if (rLower === "aids" && (cLower.includes("ai") || cLower.includes("data"))) return true;
    if (rLower === "ece" && (cLower.includes("electronic") || cLower.includes("ece") || cLower.includes("communi"))) return true;
    if (rLower === "eee" && (cLower.includes("electri") || cLower.includes("eee") || cLower.includes("power"))) return true;
    return false;
  });
}

// Helper to normalize status for filtering and display
function normalizeStatus(status: string | undefined): "Shortlisted" | "Interviewing" | "Offered" | "Applied" | "Rejected" {
  if (!status) return "Applied";
  const s = status.trim().toUpperCase();
  if (s === "SHORTLISTED") return "Shortlisted";
  if (s === "INTERVIEWING" || s === "INTERVIEW") return "Interviewing";
  if (s === "OFFERED" || s === "PLACED") return "Offered";
  if (s === "REJECTED") return "Rejected";
  return "Applied";
}

const atsColumns = [
  { id: "Applied", label: "Applied / In Pool", icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { id: "Shortlisted", label: "Shortlisted", icon: Star, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { id: "Interviewing", label: "Interviewing", icon: Clock, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  { id: "Offered", label: "Offered / Placed", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { id: "Rejected", label: "Rejected", icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
];

export default function AtsMatchingPage() {
  const [activeTab, setActiveTab] = useState<"results" | "pipeline">("results");
  const [isJdModalOpen, setIsJdModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [selectedCandidateResult, setSelectedCandidateResult] = useState<any>(null);

  const [availableDrives, setAvailableDrives] = useState<any[]>(defaultDrives);

  const [activeJd, setActiveJd] = useState({
    company_name: defaultDrives[0].company,
    role_title: defaultDrives[0].role,
    min_cgpa: defaultDrives[0].minCgpa,
    required_skills: defaultDrives[0].requiredSkills,
    eligible_departments: defaultDrives[0].eligibleDepts,
    description_text: defaultDrives[0].description
  });

  const [customSkillInput, setCustomSkillInput] = useState("");

  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidateSource, setCandidateSource] = useState<"database" | "excel" | "sample">("database");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterTier, setFilterTier] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [minScoreFilter, setMinScoreFilter] = useState(0);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const fetchPlacementDrives = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/drives`);
      if (res.ok) {
        const data = await res.json();
        const drivesList = data.items || data || [];
        if (drivesList.length > 0) {
          const formatted = drivesList.map((d: any) => ({
            id: d.id,
            company: d.company_name || d.company?.name || "Company Drive",
            role: d.title || "Campus Recruitment Role",
            minCgpa: parseFloat(d.eligibility_criteria?.match(/\d+(\.\d+)?/)?.[0] || "6.5"),
            requiredSkills: d.required_skills && d.required_skills.length ? d.required_skills : ["Python", "SQL", "Data Structures", "Git"],
            eligibleDepts: ["Computer Science", "Information Technology", "Cyber Security", "CSE", "IT", "BBA"],
            description: d.description || `Campus recruitment drive for ${d.company_name || 'graduates'}.`
          }));
          setAvailableDrives([...formatted, ...defaultDrives]);
        }
      }
    } catch (err) {
      console.warn("Could not load backend drives, using default drives.", err);
    }
  };

  const fetchStudentsFromDatabase = async () => {
    setIsLoadingStudents(true);
    try {
      const res = await fetch(`${API_BASE_URL}/students/?limit=10000`);
      if (res.ok) {
        const data = await res.json();
        const studentsList = data.items || (Array.isArray(data) ? data : []);
        if (studentsList && studentsList.length > 0) {
          const formatted = studentsList.map((s: any) => {
            let cgpaVal = parseFloat(s.cgpa) || 0;
            const ugPct = parseFloat(s.ug_percentage) || 0;
            if (cgpaVal <= 1.0 && ugPct > 10.0) {
              cgpaVal = Math.round(ugPct) / 10.0;
            } else if (cgpaVal === 0) {
              cgpaVal = 7.5;
            }

            let skills: string[] = s.skills && s.skills.length ? s.skills : getDepartmentSkills(s.department);
            if (s.github_link && !skills.includes("Git")) skills = [...skills, "Git", "GitHub"];
            if (s.portfolio_link && !skills.includes("React")) skills = [...skills, "Web Development"];

            const mappedStatus = normalizeStatus(s.placement_status);

            return {
              id: s.id,
              rollNumber: s.roll_number || `STU${s.id}`,
              name: s.name,
              department: s.department || "CSE",
              cgpa: cgpaVal,
              ugPercentage: s.ug_percentage,
              skills: Array.from(new Set(skills)),
              email: s.email || `${(s.name || "student").toLowerCase().replace(/\s+/g, ".")}@college.edu`,
              mobile: s.mobile_number || "9876543210",
              resumeLink: s.resume_link,
              githubLink: s.github_link,
              linkedinLink: s.linkedin_link,
              portfolioLink: s.portfolio_link,
              placement_status: s.placement_status,
              status: mappedStatus
            };
          });

          setCandidates(formatted);
          setCandidateSource("database");
          showToast(`✓ Loaded ${formatted.length} students from database roster`);
        }
      }
    } catch (err) {
      console.error("Failed to load students from database:", err);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchPlacementDrives();
    fetchStudentsFromDatabase();
  }, []);

  const runATSComparison = () => {
    if (candidates.length === 0) return;
    setIsMatching(true);
    
    setTimeout(() => {
      const results = candidates.map(cand => {
        const jdSkills = activeJd.required_skills.map(s => s.trim().toLowerCase());
        const candSkills = (cand.skills || []).map((s: string) => s.trim().toLowerCase());

        const matchedSkills: string[] = [];
        const missingSkills: string[] = [];

        activeJd.required_skills.forEach(req => {
          const reqLower = req.toLowerCase();
          if (candSkills.some((cs: string) => cs.includes(reqLower) || reqLower.includes(cs))) {
            matchedSkills.push(req);
          } else {
            missingSkills.push(req);
          }
        });

        const skillScore = jdSkills.length > 0 ? (matchedSkills.length / jdSkills.length) * 100 : 80;

        const candCgpa = parseFloat(cand.cgpa) || 7.5;
        const reqCgpa = parseFloat(activeJd.min_cgpa as any) || 6.0;
        const cgpaEligible = candCgpa >= reqCgpa;
        const cgpaScore = cgpaEligible ? 100 : Math.max(0, (candCgpa / (reqCgpa || 1)) * 75);

        const deptEligible = checkDeptMatch(cand.department, activeJd.eligible_departments);
        const deptScore = deptEligible ? 100 : 45;

        const profileScore = cand.resumeLink ? 100 : (cand.githubLink || cand.linkedinLink ? 85 : 70);

        const overallScore = Math.round(
          (skillScore * 0.50) +
          (cgpaScore * 0.25) +
          (deptScore * 0.15) +
          (profileScore * 0.10)
        );

        let recommendation = "Low Match";
        let tier = "low";
        let statusColor = "text-rose-600 bg-rose-50 border-rose-200";

        if (overallScore >= 80 && cgpaEligible && deptEligible) {
          recommendation = "Strong Match";
          tier = "strong";
          statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
        } else if (overallScore >= 65) {
          recommendation = "Good Match";
          tier = "good";
          statusColor = "text-blue-700 bg-blue-50 border-blue-200";
        } else if (overallScore >= 50) {
          recommendation = "Potential Match";
          tier = "potential";
          statusColor = "text-amber-700 bg-amber-50 border-amber-200";
        }

        return {
          id: cand.id,
          candidate: cand,
          matchScore: overallScore,
          skillScore: Math.round(skillScore),
          cgpaScore: Math.round(cgpaScore),
          deptScore: Math.round(deptScore),
          matchedSkills,
          missingSkills,
          cgpaEligible,
          deptEligible,
          recommendation,
          tier,
          statusColor,
          status: cand.status || "Applied"
        };
      });

      results.sort((a, b) => b.matchScore - a.matchScore);
      setMatchResults(results);
      setIsMatching(false);
    }, 150);
  };

  useEffect(() => {
    runATSComparison();
  }, [activeJd, candidates]);

  const distinctDepartments = Array.from(new Set(candidates.map(c => (c.department || "").trim()).filter(Boolean)));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("The uploaded Excel file appears to be empty.");
          setIsUploading(false);
          return;
        }

        const parsedCandidates = data.map((row: any, idx: number) => {
          const normalized: Record<string, any> = {};
          Object.keys(row).forEach(key => {
            normalized[key.toLowerCase().replace(/[^a-z0-9]/g, "")] = row[key];
          });

          const rollNumber = 
            normalized["rollnumber"] || 
            normalized["rollno"] || 
            normalized["roll"] || 
            normalized["regno"] || 
            normalized["registrationnumber"] || 
            normalized["id"] || 
            normalized["studentid"] || 
            `STU${idx + 101}`;

          const name = 
            normalized["name"] || 
            normalized["studentname"] || 
            normalized["fullname"] || 
            normalized["firstname"] || 
            normalized["candidatename"] || 
            `Student ${idx + 1}`;

          const department = (
            normalized["department"] || 
            normalized["dept"] || 
            normalized["branch"] || 
            normalized["stream"] || 
            normalized["course"] || 
            "CSE"
          ).toString().trim();
          
          let cgpaVal = parseFloat(normalized["cgpa"] || normalized["gpa"] || "0") || 0;
          const ugPct = parseFloat(normalized["ugpercentage"] || normalized["ug%"] || normalized["ug"] || "0") || 0;
          if (cgpaVal <= 1.0 && ugPct > 10.0) {
            cgpaVal = Math.round(ugPct) / 10.0;
          } else if (cgpaVal === 0) {
            cgpaVal = 7.5;
          }

          let skills: string[] = [];
          const rawSkills = 
            normalized["skills"] || 
            normalized["technicalskills"] || 
            normalized["keyskills"] || 
            normalized["skillset"] || 
            "";

          if (typeof rawSkills === "string" && rawSkills.trim()) {
            skills = rawSkills.split(/[,;|/\n]+/).map(s => s.trim()).filter(Boolean);
          } else if (Array.isArray(rawSkills)) {
            skills = rawSkills;
          } else {
            skills = getDepartmentSkills(department);
          }

          const resumeLink = 
            normalized["resumelink"] || 
            normalized["resume"] || 
            normalized["portfolio"] || 
            normalized["portfoliolink"] || 
            "";

          const email = 
            normalized["email"] || 
            normalized["emailid"] || 
            normalized["mail"] || 
            `${name.toLowerCase().replace(/\s+/g, ".")}@college.edu`;

          const mobile = 
            normalized["mobilenumber"] || 
            normalized["mobile"] || 
            normalized["phone"] || 
            normalized["phonenumber"] || 
            normalized["contact"] || 
            "9876543210";

          const rawStatus = normalized["placementstatus"] || normalized["status"] || "Applied";
          const status = normalizeStatus(rawStatus);

          return {
            id: idx + 10001,
            rollNumber: String(rollNumber),
            name: String(name),
            department,
            cgpa: cgpaVal,
            ugPercentage: ugPct,
            skills: Array.from(new Set(skills)),
            resumeLink: String(resumeLink),
            email: String(email),
            mobile: String(mobile),
            placement_status: rawStatus,
            status
          };
        });

        setCandidates(parsedCandidates);
        setCandidateSource("excel");
        setIsUploading(false);
        setIsResumeModalOpen(false);
        showToast(`✓ Successfully imported & matched ${parsedCandidates.length} students from ${file.name}`);
      } catch (err: any) {
        console.error("Error reading Excel:", err);
        alert("Failed to parse the Excel file. Please ensure it's a valid .xlsx or .csv format.");
        setIsUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      { "Roll Number": "RCAS2024BCY001", "Name": "Aarav Sharma", "Department": "Cyber Security", "CGPA": 8.8, "Skills": "Network Security, Python, Cryptography, Linux, Wireshark, SQL", "Resume Link": "https://example.com/resume1.pdf", "Email": "aarav.s@college.edu", "Mobile Number": "9876543210" },
      { "Roll Number": "RCAS2024BIT002", "Name": "Diya Nair", "Department": "Information Technology", "CGPA": 9.2, "Skills": "Java, Spring Boot, React, SQL, Cloud, Docker", "Resume Link": "https://example.com/resume2.pdf", "Email": "diya.n@college.edu", "Mobile Number": "9876543211" },
      { "Roll Number": "RCAS2024BBA003", "Name": "Mythili B", "Department": "Business Administration", "CGPA": 8.9, "Skills": "Business Analysis, Financial Analysis, MS Excel, SQL, Project Management", "Resume Link": "https://example.com/resume3.pdf", "Email": "mythili.b@college.edu", "Mobile Number": "9876543212" },
      { "Roll Number": "RCAS2024BCY004", "Name": "Naveen V", "Department": "Cyber Security", "CGPA": 9.4, "Skills": "Ethical Hacking, Linux, Python, SQL, Git, Penetration Testing", "Resume Link": "https://example.com/resume4.pdf", "Email": "naveen.v@college.edu", "Mobile Number": "9876543213" },
      { "Roll Number": "RCAS2024BCS005", "Name": "Vikram Sen", "Department": "Computer Science", "CGPA": 8.5, "Skills": "Python, React, Node.js, SQL, Algorithms, Data Structures", "Resume Link": "https://example.com/resume5.pdf", "Email": "vikram.s@college.edu", "Mobile Number": "9876543214" }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ATS_Resumes_Template");
    XLSX.writeFile(wb, "ats_student_resumes_bulk_template.xlsx");
  };

  const handleExportResults = () => {
    const exportRows = filteredResults.map((r, i) => ({
      "Rank": i + 1,
      "Roll Number": r.candidate.rollNumber,
      "Name": r.candidate.name,
      "Department": r.candidate.department,
      "CGPA": r.candidate.cgpa,
      "ATS Match Score (%)": r.matchScore,
      "Recommendation": r.recommendation,
      "CGPA Eligible": r.cgpaEligible ? "Yes" : "No",
      "Dept Eligible": r.deptEligible ? "Yes" : "No",
      "Matched Skills": r.matchedSkills.join(", "),
      "Missing Skills": r.missingSkills.join(", "),
      "All Skills": (r.candidate.skills || []).join(", "),
      "Email": r.candidate.email,
      "Mobile": r.candidate.mobile,
      "Resume Link": r.candidate.resumeLink || "",
      "Status": r.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ATS_Comparison_Results");
    XLSX.writeFile(wb, `ATS_Match_Results_${activeJd.company_name.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`);
  };

  const handleUpdateStatus = async (candidateId: number, newStatus: string) => {
    const norm = normalizeStatus(newStatus);
    
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: norm, placement_status: newStatus } : c));
    setMatchResults(prev => prev.map(r => r.id === candidateId ? { 
      ...r, 
      status: norm,
      candidate: { ...r.candidate, status: norm, placement_status: newStatus }
    } : r));

    if (selectedCandidateResult && selectedCandidateResult.id === candidateId) {
      setSelectedCandidateResult((prev: any) => ({ 
        ...prev, 
        status: norm,
        candidate: { ...prev.candidate, status: norm, placement_status: newStatus }
      }));
    }

    showToast(`✓ Candidate status updated to "${norm}"`);

    try {
      await fetch(`${API_BASE_URL}/students/${candidateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placement_status: newStatus })
      });
    } catch (err) {
      console.warn("Could not persist status to backend for student", candidateId, err);
    }
  };

  const handleBulkShortlistTop = async () => {
    const topCandidates = matchResults.filter(r => r.matchScore >= 70 && r.status !== "Shortlisted");
    if (topCandidates.length === 0) {
      alert("All candidates with match score ≥ 70% are already shortlisted.");
      return;
    }

    if (!confirm(`Are you sure you want to shortlist all ${topCandidates.length} candidates with match score ≥ 70%?`)) {
      return;
    }

    const idsToUpdate = new Set(topCandidates.map(r => r.id));

    setCandidates(prev => prev.map(c => idsToUpdate.has(c.id) ? { ...c, status: "Shortlisted", placement_status: "Shortlisted" } : c));
    setMatchResults(prev => prev.map(r => idsToUpdate.has(r.id) ? { 
      ...r, 
      status: "Shortlisted",
      candidate: { ...r.candidate, status: "Shortlisted", placement_status: "Shortlisted" }
    } : r));

    showToast(`⭐ Shortlisted ${topCandidates.length} top matching candidates!`);

    for (const c of topCandidates) {
      try {
        await fetch(`${API_BASE_URL}/students/${c.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ placement_status: "Shortlisted" })
        });
      } catch (e) {
        // silent catch
      }
    }
  };

  const filteredResults = matchResults.filter(item => {
    const matchesSearch = 
      item.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.candidate.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.candidate.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.candidate.skills || []).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = filterDept === "ALL" || item.candidate.department.trim().toLowerCase() === filterDept.trim().toLowerCase();
    const matchesTier = filterTier === "ALL" || item.tier === filterTier;
    
    let matchesStatus = true;
    if (filterStatus !== "ALL") {
      const curStatus = normalizeStatus(item.status);
      const targetStatus = normalizeStatus(filterStatus);
      matchesStatus = curStatus === targetStatus;
    }

    const matchesMinScore = item.matchScore >= minScoreFilter;

    return matchesSearch && matchesDept && matchesTier && matchesStatus && matchesMinScore;
  });

  const totalAnalyzed = matchResults.length;
  const shortlistedCount = matchResults.filter(r => normalizeStatus(r.status) === "Shortlisted").length;
  const strongCount = matchResults.filter(r => r.matchScore >= 80).length;
  const goodCount = matchResults.filter(r => r.matchScore >= 65 && r.matchScore < 80).length;
  const interviewingCount = matchResults.filter(r => normalizeStatus(r.status) === "Interviewing").length;
  const offeredCount = matchResults.filter(r => normalizeStatus(r.status) === "Offered").length;
  const appliedCount = matchResults.filter(r => normalizeStatus(r.status) === "Applied").length;
  const avgScore = totalAnalyzed > 0 ? Math.round(matchResults.reduce((acc, r) => acc + r.matchScore, 0) / totalAnalyzed) : 0;
  const eligibleCount = matchResults.filter(r => r.cgpaEligible && r.deptEligible).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-300">
      
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-semibold">{notificationMsg}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> AI-Powered ATS & Resume Matching Engine
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            ATS & Candidate Matching
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Live matching of <strong>{candidates.length} student resumes</strong> against company Job Descriptions (JDs) with multi-factor scoring (Skills, CGPA, Branch eligibility, and Profile completeness).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
          <button
            onClick={() => setIsJdModalOpen(true)}
            className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-indigo-200 group text-left"
          >
            <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Button 1</div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                🏢 Companies JD
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 max-w-[120px] truncate">
                  {activeJd.company_name}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                {activeJd.required_skills.length} skills • Min {activeJd.min_cgpa} CGPA
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsResumeModalOpen(true)}
            className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-emerald-200 group text-left"
          >
            <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Button 2</div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                📄 Student Resumes
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  {candidates.length} Loaded
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                {candidateSource === "excel" ? `Excel: ${uploadedFileName || "Uploaded"}` : `${candidates.length} Portal Students`}
              </div>
            </div>
          </button>

          <Button 
            onClick={runATSComparison}
            disabled={isMatching}
            className="h-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isMatching && "animate-spin")} />
            {isMatching ? "Matching..." : "⚡ Re-Run Match"}
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase text-slate-400">Target JD:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold">
            <Building2 className="h-3.5 w-3.5 text-indigo-400" />
            {activeJd.company_name} — {activeJd.role_title}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
            Min CGPA: <strong className="font-bold">{activeJd.min_cgpa}</strong>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
            Eligible: {activeJd.eligible_departments.slice(0, 3).join(", ")}{activeJd.eligible_departments.length > 3 ? "..." : ""}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
            <Users className="h-3.5 w-3.5 text-emerald-600" />
            {candidates.length} Student Resumes in Pool
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
            <Star className="h-3.5 w-3.5 text-amber-600" />
            {shortlistedCount} Shortlisted
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={handleBulkShortlistTop}
            className="text-xs h-8 bg-amber-500 hover:bg-amber-600 text-white font-bold gap-1.5 shadow-sm"
          >
            <Star className="h-3.5 w-3.5 fill-white" /> Shortlist Top Fits (≥70%)
          </Button>

          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleExportResults}
            className="text-xs h-8 border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" /> Export Excel ({filteredResults.length})
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsResumeModalOpen(true)}
            className="text-xs h-8 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 gap-1.5 font-medium"
          >
            <Upload className="h-3.5 w-3.5 text-emerald-600" /> Upload Excel Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Total Students</p>
              <p className="text-xl font-black text-slate-900">{totalAnalyzed}</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer",
            filterStatus === "Shortlisted" ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400" : "bg-white"
          )}
          onClick={() => setFilterStatus(filterStatus === "Shortlisted" ? "ALL" : "Shortlisted")}
        >
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-700 uppercase">Shortlisted</p>
              <p className="text-xl font-black text-amber-600">{shortlistedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer",
            filterTier === "strong" ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400" : "bg-white"
          )}
          onClick={() => setFilterTier(filterTier === "strong" ? "ALL" : "strong")}
        >
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Strong (≥80%)</p>
              <p className="text-xl font-black text-emerald-600">{strongCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer",
            filterTier === "good" ? "bg-blue-50 border-blue-300 ring-2 ring-blue-400" : "bg-white"
          )}
          onClick={() => setFilterTier(filterTier === "good" ? "ALL" : "good")}
        >
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Good (65-79%)</p>
              <p className="text-xl font-black text-blue-600">{goodCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Eligible (CGPA+Dept)</p>
              <p className="text-xl font-black text-purple-600">{eligibleCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Avg Match Score</p>
              <p className="text-xl font-black text-indigo-600">{avgScore}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="h-3.5 w-3.5" /> Stage Filter:
        </span>
        <button
          onClick={() => setFilterStatus("ALL")}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-bold transition-all",
            filterStatus === "ALL" 
              ? "bg-slate-900 text-white shadow-sm" 
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          All Candidates ({matchResults.length})
        </button>
        <button
          onClick={() => setFilterStatus("Shortlisted")}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
            filterStatus === "Shortlisted" 
              ? "bg-amber-500 text-white shadow-sm" 
              : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
          )}
        >
          ⭐ Shortlisted ({shortlistedCount})
        </button>
        <button
          onClick={() => setFilterStatus("Interviewing")}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
            filterStatus === "Interviewing" 
              ? "bg-purple-600 text-white shadow-sm" 
              : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
          )}
        >
          📅 Interviewing ({interviewingCount})
        </button>
        <button
          onClick={() => setFilterStatus("Offered")}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
            filterStatus === "Offered" 
              ? "bg-emerald-600 text-white shadow-sm" 
              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          )}
        >
          🎉 Offered / Placed ({offeredCount})
        </button>
        <button
          onClick={() => setFilterStatus("Applied")}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
            filterStatus === "Applied" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
          )}
        >
          📋 Applied / In Pool ({appliedCount})
        </button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("results")}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "results" 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <Activity className="h-4 w-4 text-blue-600" />
            Ranked Match Results ({filteredResults.length})
          </button>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "pipeline" 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <Clock className="h-4 w-4 text-amber-600" />
            ATS Hiring Pipeline
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by student name, roll #, skill..."
              className="pl-9 h-9 text-xs bg-white border-slate-200"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="h-9 px-3 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-700 cursor-pointer max-w-[180px]"
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
          >
            <option value="ALL">All Departments ({candidates.length})</option>
            {distinctDepartments.map(d => (
              <option key={d} value={d}>
                {d} ({candidates.filter(c => c.department === d).length})
              </option>
            ))}
          </select>

          <select
            className="h-9 px-3 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-700 cursor-pointer"
            value={filterTier}
            onChange={e => setFilterTier(e.target.value)}
          >
            <option value="ALL">All Match Scores</option>
            <option value="strong">Strong Match (≥80%)</option>
            <option value="good">Good Match (65-79%)</option>
            <option value="potential">Potential (50-64%)</option>
            <option value="low">Low Match (&lt;50%)</option>
          </select>

          <select
            className="h-9 px-3 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-700 cursor-pointer"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses ({matchResults.length})</option>
            <option value="Shortlisted">⭐ Shortlisted ({shortlistedCount})</option>
            <option value="Interviewing">📅 Interviewing ({interviewingCount})</option>
            <option value="Offered">🎉 Offered / Placed ({offeredCount})</option>
            <option value="Applied">📋 Applied / In Pool ({appliedCount})</option>
            <option value="Rejected">❌ Rejected</option>
          </select>
        </div>
      </div>

      {activeTab === "results" && (
        <div className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/70 py-4 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  Candidate ATS Match Scores & Skill Gap Analysis
                </CardTitle>
                <CardDescription className="text-xs">
                  Matched against {activeJd.company_name} ({activeJd.role_title}) • Ordered by highest overall fit
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="px-2.5 py-1 bg-white border rounded-md shadow-2xs">
                  Showing <strong>{filteredResults.length}</strong> of <strong>{matchResults.length}</strong> candidates
                </span>
                {filterStatus === "Shortlisted" && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">
                    Filtered: Shortlisted Only
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">Rank & Candidate</th>
                      <th className="px-6 py-3.5 font-bold text-center">ATS Match Score</th>
                      <th className="px-6 py-3.5 font-bold">Eligibility (CGPA / Dept)</th>
                      <th className="px-6 py-3.5 font-bold">Matched Skills ({activeJd.required_skills.length} Required)</th>
                      <th className="px-6 py-3.5 font-bold">Missing Skills</th>
                      <th className="px-6 py-3.5 font-bold text-center">Status</th>
                      <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResults.map((item, idx) => {
                      const isShortlisted = normalizeStatus(item.status) === "Shortlisted";

                      return (
                        <tr 
                          key={item.id || idx}
                          className={cn(
                            "hover:bg-indigo-50/30 transition-colors group cursor-pointer",
                            isShortlisted && "bg-amber-50/20"
                          )}
                          onClick={() => setSelectedCandidateResult(item)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-8 w-8 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 transition-colors",
                                isShortlisted ? "bg-amber-100 text-amber-800 font-extrabold ring-1 ring-amber-300" : "bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700"
                              )}>
                                #{idx + 1}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                  {item.candidate.name}
                                  {item.candidate.resumeLink && (
                                    <a 
                                      href={item.candidate.resumeLink} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      onClick={e => e.stopPropagation()}
                                      title="View Resume PDF / Link"
                                    >
                                      <FileText className="h-3.5 w-3.5 text-blue-500 hover:text-blue-700" />
                                    </a>
                                  )}
                                  {isShortlisted && (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-200">
                                      ⭐ Shortlisted
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {item.candidate.rollNumber} • <span className="font-medium text-slate-700">{item.candidate.department}</span> • <strong className="text-slate-800">{item.candidate.cgpa} CGPA</strong>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 min-w-[170px] text-center">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-lg font-black",
                                  item.matchScore >= 80 ? "text-emerald-600" : item.matchScore >= 65 ? "text-blue-600" : item.matchScore >= 50 ? "text-amber-600" : "text-rose-600"
                                )}>
                                  {item.matchScore}%
                                </span>
                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", item.statusColor)}>
                                  {item.recommendation}
                                </span>
                              </div>
                              <div className="w-28 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    item.matchScore >= 80 ? "bg-emerald-500" : item.matchScore >= 65 ? "bg-blue-500" : item.matchScore >= 50 ? "bg-amber-500" : "bg-rose-500"
                                  )}
                                  style={{ width: `${item.matchScore}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1.5">
                                {item.cgpaEligible ? (
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-rose-600 flex-shrink-0" />
                                )}
                                <span className={item.cgpaEligible ? "text-emerald-700 font-medium" : "text-rose-600 font-semibold"}>
                                  CGPA: {item.candidate.cgpa} (Cutoff: {activeJd.min_cgpa})
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {item.deptEligible ? (
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                                )}
                                <span className={item.deptEligible ? "text-slate-700 font-medium truncate max-w-[150px]" : "text-amber-700 font-medium truncate max-w-[150px]"}>
                                  Dept: {item.candidate.department}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 max-w-[260px]">
                            <div className="flex flex-wrap gap-1">
                              {item.matchedSkills.length > 0 ? (
                                item.matchedSkills.map((s: string) => (
                                  <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold">
                                    ✓ {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 italic">No direct matches</span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 max-w-[220px]">
                            <div className="flex flex-wrap gap-1">
                              {item.missingSkills.length > 0 ? (
                                item.missingSkills.slice(0, 4).map((s: string) => (
                                  <span key={s} className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[11px] font-medium">
                                    ✗ {s}
                                  </span>
                                ))
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold">
                                  🌟 All Skills Matched!
                                </span>
                              )}
                              {item.missingSkills.length > 4 && (
                                <span className="text-[10px] text-slate-400 font-semibold">+{item.missingSkills.length - 4} more</span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block",
                              isShortlisted && "bg-amber-50 text-amber-700 border-amber-200",
                              normalizeStatus(item.status) === "Interviewing" && "bg-purple-50 text-purple-700 border-purple-200",
                              normalizeStatus(item.status) === "Offered" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                              normalizeStatus(item.status) === "Rejected" && "bg-rose-50 text-rose-700 border-rose-200",
                              normalizeStatus(item.status) === "Applied" && "bg-blue-50 text-blue-700 border-blue-200",
                            )}>
                              {item.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end items-center gap-1.5">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setSelectedCandidateResult(item)}
                                className="h-8 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                              >
                                Scorecard
                              </Button>

                              {!isShortlisted ? (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleUpdateStatus(item.id, "Shortlisted")}
                                  className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm gap-1"
                                >
                                  <Star className="h-3 w-3 fill-white" /> Shortlist
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleUpdateStatus(item.id, "Interviewing")}
                                  className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm"
                                >
                                  Interview
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredResults.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                          <AlertCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                          <p className="font-semibold text-slate-600">No candidates match your active filters</p>
                          <p className="text-xs text-slate-400 mt-1">Try broadening your search criteria or resetting filters.</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3 text-xs"
                            onClick={() => {
                              setSearchQuery("");
                              setFilterDept("ALL");
                              setFilterTier("ALL");
                              setFilterStatus("ALL");
                            }}
                          >
                            Reset All Filters
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "pipeline" && (
        <div className="space-y-4">
          <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x">
            {atsColumns.map(column => {
              const columnItems = matchResults.filter(r => normalizeStatus(r.status) === column.id);
              const Icon = column.icon;

              return (
                <div key={column.id} className="min-w-[320px] max-w-[320px] flex flex-col gap-3 snap-start">
                  <div className={cn("flex items-center justify-between p-3.5 rounded-xl border shadow-sm", column.bg, column.border)}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-5 w-5", column.color)} />
                      <h3 className={cn("font-bold text-sm", column.color)}>{column.label}</h3>
                    </div>
                    <span className={cn("text-xs font-black px-2.5 py-0.5 rounded-full bg-white shadow-sm", column.color)}>
                      {columnItems.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 min-h-[400px] max-h-[700px] overflow-y-auto pr-1">
                    {columnItems.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => setSelectedCandidateResult(item)}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-indigo-300"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
                              {item.candidate.name}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                              {item.candidate.rollNumber} • {item.candidate.department} • <strong className="text-slate-800">{item.candidate.cgpa} CGPA</strong>
                            </p>
                          </div>
                          <span className={cn(
                            "text-xs font-black px-2 py-0.5 rounded-md",
                            item.matchScore >= 80 ? "bg-emerald-100 text-emerald-800" : item.matchScore >= 65 ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"
                          )}>
                            {item.matchScore}%
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 my-2.5">
                          {item.matchedSkills.slice(0, 3).map((s: string) => (
                            <span key={s} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold border border-emerald-100">
                              ✓ {s}
                            </span>
                          ))}
                          {item.matchedSkills.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold">+{item.matchedSkills.length - 3}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                          <span className="text-slate-400 text-[11px]">{item.recommendation}</span>
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            {column.id === "Applied" && (
                              <Button size="sm" variant="ghost" className="h-6 text-[11px] text-amber-600 hover:bg-amber-50 px-2 font-bold" onClick={() => handleUpdateStatus(item.id, "Shortlisted")}>
                                Shortlist →
                              </Button>
                            )}
                            {column.id === "Shortlisted" && (
                              <Button size="sm" variant="ghost" className="h-6 text-[11px] text-purple-600 hover:bg-purple-50 px-2 font-bold" onClick={() => handleUpdateStatus(item.id, "Interviewing")}>
                                Interview →
                              </Button>
                            )}
                            {column.id === "Interviewing" && (
                              <Button size="sm" variant="ghost" className="h-6 text-[11px] text-emerald-600 hover:bg-emerald-50 px-2 font-bold" onClick={() => handleUpdateStatus(item.id, "Offered")}>
                                Offer →
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {columnItems.length === 0 && (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                        <span className="text-xs font-semibold">No candidates in {column.label}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isJdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Button 1: Companies Job Description (JD)</h3>
                  <p className="text-xs text-slate-500">Select active drive or configure required skills & cutoff criteria</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsJdModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                  Select from Active Placement Drives & Companies
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {availableDrives.map((drive, idx) => (
                    <button
                      key={drive.id || idx}
                      type="button"
                      onClick={() => {
                        setActiveJd({
                          company_name: drive.company,
                          role_title: drive.role,
                          min_cgpa: drive.minCgpa,
                          required_skills: drive.requiredSkills,
                          eligible_departments: drive.eligibleDepts,
                          description_text: drive.description
                        });
                      }}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all flex flex-col justify-between",
                        activeJd.company_name === drive.company
                          ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 text-sm">{drive.company}</span>
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-white text-indigo-700 border border-indigo-100">
                          {drive.minCgpa} CGPA
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 font-medium mt-1">{drive.role}</span>
                      <div className="text-[11px] text-slate-400 mt-2 truncate">
                        Skills: {drive.requiredSkills.slice(0, 3).join(", ")}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                    <Input
                      value={activeJd.company_name}
                      onChange={e => setActiveJd(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="e.g. Google, Amazon, Cisco"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Role Title</label>
                    <Input
                      value={activeJd.role_title}
                      onChange={e => setActiveJd(prev => ({ ...prev, role_title: e.target.value }))}
                      placeholder="e.g. SDE 1, SOC Analyst"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Minimum CGPA Cutoff</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={activeJd.min_cgpa}
                      onChange={e => setActiveJd(prev => ({ ...prev, min_cgpa: parseFloat(e.target.value) || 0 }))}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Eligible Departments (Comma separated)</label>
                    <Input
                      value={activeJd.eligible_departments.join(", ")}
                      onChange={e => setActiveJd(prev => ({ ...prev, eligible_departments: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                      placeholder="e.g. CSE, IT, Cyber Security, AIDS"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Required Technical Skills ({activeJd.required_skills.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 min-h-[50px] mb-2">
                    {activeJd.required_skills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 shadow-2xs">
                        {skill}
                        <button
                          type="button"
                          onClick={() => setActiveJd(prev => ({ ...prev, required_skills: prev.required_skills.filter(s => s !== skill) }))}
                          className="hover:text-rose-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom skill requirement..."
                      value={customSkillInput}
                      onChange={e => setCustomSkillInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && customSkillInput.trim()) {
                          e.preventDefault();
                          if (!activeJd.required_skills.includes(customSkillInput.trim())) {
                            setActiveJd(prev => ({ ...prev, required_skills: [...prev.required_skills, customSkillInput.trim()] }));
                          }
                          setCustomSkillInput("");
                        }
                      }}
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (customSkillInput.trim() && !activeJd.required_skills.includes(customSkillInput.trim())) {
                          setActiveJd(prev => ({ ...prev, required_skills: [...prev.required_skills, customSkillInput.trim()] }));
                          setCustomSkillInput("");
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setIsJdModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    setIsJdModalOpen(false);
                    runATSComparison();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6"
                >
                  Save & Apply Company JD
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Button 2: Student Resumes & Bulk Excel Upload</h3>
                  <p className="text-xs text-slate-500">Upload bulk student resume Excel sheets or sync with student database</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsResumeModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl p-8 text-center relative hover:bg-emerald-50/70 transition-all">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <Upload className="h-7 w-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Upload Bulk Student Resumes Excel / CSV</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Drag and drop your spreadsheet containing 100+ student details, CGPA, branch, email, mobile, and extracted resume skills.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                  >
                    <Upload className="h-4 w-4 mr-1.5" />
                    {isUploading ? "Parsing Excel..." : "Browse Excel File"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 font-semibold"
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    Download Sample Template
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-blue-600" />
                      <h5 className="font-bold text-slate-900 text-sm">Portal Database Students ({candidates.length})</h5>
                    </div>
                    <p className="text-xs text-slate-500">
                      Sync all active enrolled students currently registered in your placement portal database.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchStudentsFromDatabase}
                    disabled={isLoadingStudents}
                    className="mt-3 text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {isLoadingStudents ? "Syncing..." : "🔄 Re-Sync Portal Students"}
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <h5 className="font-bold text-slate-900 text-sm">Active Evaluation Pool</h5>
                    </div>
                    <p className="text-xs text-slate-500">
                      Currently evaluating <strong>{candidates.length}</strong> candidates across <strong>{distinctDepartments.length}</strong> departments.
                    </p>
                  </div>
                  <div className="flex gap-1 flex-wrap mt-2">
                    {distinctDepartments.slice(0, 4).map(d => (
                      <span key={d} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded">
                        {d}
                      </span>
                    ))}
                    {distinctDepartments.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-semibold">+{distinctDepartments.length - 4}</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-xs font-bold uppercase text-slate-500">
                    Currently Loaded Resumes ({candidates.length})
                  </h5>
                  <span className="text-xs text-emerald-600 font-semibold">
                    Source: {candidateSource.toUpperCase()}
                  </span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Roll #</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Dept</th>
                        <th className="px-3 py-2">CGPA</th>
                        <th className="px-3 py-2">Resume</th>
                        <th className="px-3 py-2">Skills</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {candidates.map((c, i) => (
                        <tr key={c.id || i} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono font-medium">{c.rollNumber}</td>
                          <td className="px-3 py-2 font-bold text-slate-800">{c.name}</td>
                          <td className="px-3 py-2">{c.department}</td>
                          <td className="px-3 py-2 font-bold">{c.cgpa}</td>
                          <td className="px-3 py-2">
                            {c.resumeLink ? (
                              <span className="text-emerald-600 font-semibold">✓ Attached</span>
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-slate-500 truncate max-w-[200px]">
                            {(c.skills || []).join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setIsResumeModalOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsResumeModalOpen(false);
                    runATSComparison();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
                >
                  Apply & Run Comparison
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCandidateResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-900 text-white">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center text-2xl font-black">
                  {selectedCandidateResult.candidate.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{selectedCandidateResult.candidate.name}</h2>
                    <span className={cn(
                      "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                      normalizeStatus(selectedCandidateResult.status) === "Shortlisted" ? "bg-amber-500/20 text-amber-300 border-amber-400/30" : "bg-white/10 text-white"
                    )}>
                      {selectedCandidateResult.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedCandidateResult.candidate.rollNumber} • {selectedCandidateResult.candidate.department} • CGPA: {selectedCandidateResult.candidate.cgpa}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-full" onClick={() => setSelectedCandidateResult(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Target Drive</span>
                  <p className="text-sm font-black text-slate-900">{activeJd.company_name} — {activeJd.role_title}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase text-slate-400">Overall ATS Fit</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-2xl font-black",
                      selectedCandidateResult.matchScore >= 80 ? "text-emerald-600" : selectedCandidateResult.matchScore >= 65 ? "text-blue-600" : "text-amber-600"
                    )}>
                      {selectedCandidateResult.matchScore}%
                    </span>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-md border", selectedCandidateResult.statusColor)}>
                      {selectedCandidateResult.recommendation}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500">Evaluation Breakdown</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Skills Match (50% weight)</span>
                      <span>{selectedCandidateResult.skillScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${selectedCandidateResult.skillScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>CGPA Eligibility (25% weight)</span>
                      <span>{selectedCandidateResult.cgpaEligible ? `Eligible (${selectedCandidateResult.candidate.cgpa} >= ${activeJd.min_cgpa})` : `Below Cutoff (${selectedCandidateResult.candidate.cgpa} < ${activeJd.min_cgpa})`}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={cn("h-2 rounded-full", selectedCandidateResult.cgpaEligible ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${selectedCandidateResult.cgpaScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Department Match (15% weight)</span>
                      <span>{selectedCandidateResult.deptEligible ? "Eligible Department" : "Non-target Department"}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={cn("h-2 rounded-full", selectedCandidateResult.deptEligible ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${selectedCandidateResult.deptScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <h5 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Matched Skills ({selectedCandidateResult.matchedSkills.length})
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedCandidateResult.matchedSkills.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-white text-emerald-800 font-semibold rounded text-xs border border-emerald-200">
                        {s}
                      </span>
                    ))}
                    {selectedCandidateResult.matchedSkills.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No direct matches</span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200">
                  <h5 className="text-xs font-bold text-rose-900 mb-2 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-rose-600" />
                    Missing Skills ({selectedCandidateResult.missingSkills.length})
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedCandidateResult.missingSkills.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-white text-rose-700 font-medium rounded text-xs border border-rose-200">
                        {s}
                      </span>
                    ))}
                    {selectedCandidateResult.missingSkills.length === 0 && (
                      <span className="text-xs text-emerald-700 font-bold">100% Skills Complete!</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Candidate Contact</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {selectedCandidateResult.candidate.email} • {selectedCandidateResult.candidate.mobile}
                    </div>
                  </div>
                  {selectedCandidateResult.candidate.resumeLink && (
                    <a
                      href={selectedCandidateResult.candidate.resumeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm"
                    >
                      <FileText className="h-3.5 w-3.5" /> View Resume PDF
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60 text-xs">
                  {selectedCandidateResult.candidate.githubLink && (
                    <a href={selectedCandidateResult.candidate.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-slate-700 hover:text-indigo-600 font-medium">
                      <ExternalLink className="h-3.5 w-3.5" /> GitHub
                    </a>
                  )}
                  {selectedCandidateResult.candidate.linkedinLink && (
                    <a href={selectedCandidateResult.candidate.linkedinLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium">
                      <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  )}
                  {selectedCandidateResult.candidate.portfolioLink && (
                    <a href={selectedCandidateResult.candidate.portfolioLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-purple-700 hover:text-purple-900 font-medium">
                      <Globe className="h-3.5 w-3.5" /> Portfolio
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                <Button 
                  onClick={() => handleUpdateStatus(selectedCandidateResult.id, "Shortlisted")}
                  className={cn(
                    "flex-1 text-xs font-bold gap-1",
                    normalizeStatus(selectedCandidateResult.status) === "Shortlisted" ? "bg-amber-600 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"
                  )}
                >
                  <Star className="h-3.5 w-3.5 fill-white" /> ⭐ Shortlist
                </Button>
                <Button 
                  onClick={() => handleUpdateStatus(selectedCandidateResult.id, "Interviewing")}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                >
                  📅 Interview
                </Button>
                <Button 
                  onClick={() => handleUpdateStatus(selectedCandidateResult.id, "Offered")}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  🎉 Offer
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedCandidateResult.id, "Rejected")}
                  className="flex-1 text-rose-600 hover:bg-rose-50 border-rose-200 text-xs font-bold"
                >
                  ❌ Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
