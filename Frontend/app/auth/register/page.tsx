"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Upload,
  X,
  Plus,
  ChevronRight,
  ChevronLeft,
  FileText,
  Award,
  Briefcase,
  Globe,
  Calendar,
  Building2,
  CheckCircle,
  AlertCircle,
  Building,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

// Malaysian states
const malaysianStates = [
  "Kuala Lumpur",
  "Selangor",
  "Penang",
  "Johor",
  "Perak",
  "Kedah",
  "Kelantan",
  "Terengganu",
  "Pahang",
  "Negeri Sembilan",
  "Melaka",
  "Perlis",
  "Sabah",
  "Sarawak",
];

// Predefined skills
const popularSkills = [
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "PHP",
  "Mobile Development",
  "iOS",
  "Android",
  "Flutter",
  "React Native",
  "Cloud Computing",
  "AWS",
  "Azure",
  "Google Cloud",
  "DevOps",
  "Database",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "UI/UX Design",
  "Figma",
  "Adobe XD",
  "Photoshop",
  "Cybersecurity",
  "Blockchain",
  "IoT",
  "AI/ML",
  "Data Science",
];

// Languages
const commonLanguages = [
  "English",
  "Bahasa Malaysia",
  "Mandarin",
  "Tamil",
  "Cantonese",
  "Hokkien",
  "Hindi",
  "Arabic",
  "Japanese",
  "Korean",
  "French",
  "German",
];

// Registration steps for providers
const PROVIDER_STEPS = [
  { id: 1, title: "Account Setup", description: "Basic account information" },
  {
    id: 2,
    title: "Profile & CV",
    description: "Professional info & resume upload",
  },
  { id: 3, title: "Skills & Experience", description: "Technical expertise" },
  { id: 4, title: "Portfolio & Links", description: "Additional work samples" },
  { id: 5, title: "Certifications", description: "Professional credentials" },
  { id: 6, title: "Review & Submit", description: "Confirm your information" },
];

// Registration steps for customers
const CUSTOMER_STEPS = [
  { id: 1, title: "Account Setup", description: "Basic account information" },
  { id: 2, title: "Company Profile", description: "Company information" },
  { id: 3, title: "Review & Submit", description: "Confirm your information" },
];

type Certification = {
  name: string;
  issuer: string;
  issuedDate: string;
  verified?: boolean;
  // NEW
  serialNumber?: string;
  sourceUrl?: string;
};

export default function SignupPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [roleSelected, setRoleSelected] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [customLanguage, setCustomLanguage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [newCertification, setNewCertification] = useState<Certification>({
    name: "",
    issuer: "",
    issuedDate: "",
    verified: false,
    // NEW
    serialNumber: "",
    sourceUrl: "",
  });

  const [isProcessingCV, setIsProcessingCV] = useState(false);
  const [cvExtractedData, setCvExtractedData] = useState<any>(null);
  const [showAIResults, setShowAIResults] = useState(false);
  const [aiProcessingComplete, setAiProcessingComplete] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Account Setup
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",

    // Step 2: Profile Details
    bio: "",
    location: "",
    website: "",
    profileVideoUrl: "",
    companyName: "",
    companySize: "",
    industry: "",

    // Step 3: Skills & Experience (Provider only)
    yearsExperience: "",
    hourlyRate: "",
    availability: "",
    minimumProjectBudget: "",
    maximumProjectBudget: "",
    preferredProjectDuration: "",
    workPreference: "remote",
    teamSize: "1",

    // Company-specific fields
    employeeCount: "",
    establishedYear: "",
    annualRevenue: "",
    fundingStage: "",
    preferredContractTypes: [] as string[],
    averageBudgetRange: "",
    remotePolicy: "",
    hiringFrequency: "",
    categoriesHiringFor: [] as string[],
    mission: "",
    values: [] as string[],
  });

  const [kycDocType, setKycDocType] = useState<
    "" | "PASSPORT" | "IC" | "COMPANY_REGISTRATION"
  >("");
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);
  // once role is known, lock company doc type
  useEffect(() => {
    if (userRole === "customer") setKycDocType("COMPANY_REGISTRATION");
  }, [userRole]);

  // Upload helper: call your Express KYC routes after we know userId
  const uploadResume = async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", userId);

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/upload`, {
      method: "POST",
      body: formData,
    });
  };

  const uploadCertifications = async (userId: string, certs: Certification[]) => {
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/certifications/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, certifications: certs }),
    });
  };

  const uploadKyc = async (userId: string) => {
    if (!kycFile) return { ok: true }; // allow register to succeed with no KYC

    try {
      setIsUploadingKyc(true);
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append(
        "docType",
        userRole === "provider" ? kycDocType : "COMPANY_REGISTRATION"
      );
      fd.append("document", kycFile); // must match multer field name

      const endpoint =
        userRole === "provider"
          ? `${API_BASE}/kyc/upload/provider`
          : `${API_BASE}/kyc/upload/company`;

      const res = await fetch(endpoint, { method: "POST", body: fd });

      // ---- safer parsing: prefer JSON, else read text (HTML/other)
      const ctype = res.headers.get("content-type") || "";
      const payload = ctype.includes("application/json")
        ? await res.json()
        : { error: await res.text() };

      if (!res.ok)
        throw new Error(payload?.error || `KYC upload failed (${res.status})`);

      return { ok: true };
    } catch (e: any) {
      setError(e.message || "KYC upload failed");
      return { ok: false, error: e?.message };
    } finally {
      setIsUploadingKyc(false);
    }
  };

  const isStrongPassword = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|;:'",.<>/?`~]).{8,}$/.test(
      pwd
    );
  // 1) Helper + state (place with other hooks)
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "checking" | "available" | "used"
  >("idle");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});

  // Make sure there's NO trailing slash
  const RAW_API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
  const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

  // in page.tsx
  const checkEmailAvailability = async (email: string) => {
    try {
      setEmailStatus("checking");
      const res = await fetch(
        `${API_BASE}/check-email?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (!res.ok || typeof data.available !== "boolean")
        throw new Error(data?.error || "Failed");
      setEmailStatus(data.available ? "available" : "used");
      return data.available; // true if available, false if taken
    } catch {
      setEmailStatus("idle");
      setFieldErrors((p) => ({
        ...p,
        email: "Could not verify email right now.",
      }));
      return null; // ⟵ was `false`
    }
  };

  // Step navigation: go to next step with validation + email check
  const nextStep = async () => {
    // 1) Local validation first (required fields + strong+match password)
    if (!validateStep(currentStep)) {
      setError("Please fill in all required fields before proceeding.");
      return;
    }

    if (currentStep === 1) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
      setError("");
      const available = await checkEmailAvailability(formData.email);

      if (available === false) {
        setEmailStatus("used");
        setFieldErrors((prev) => ({
          ...prev,
          email: "This email is already in use.",
        }));
        setError("This email is already in use. Please use a different email.");
        emailRef?.current?.focus();
        emailRef?.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }
      if (available === null) {
        // backend/network error – don’t claim “used”
        setError("We couldn’t verify your email right now. Please try again.");
        return;
      }

      // available === true
      setEmailStatus("available");
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
      setError("");
    }

    // 3) Advance to the next step
    setCurrentStep((prev) => Math.min(prev + 1, getCurrentSteps().length));
  };

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const getCurrentSteps = () => {
    return userRole === "provider" ? PROVIDER_STEPS : CUSTOMER_STEPS;
  };

  useEffect(() => {
    const qp = (searchParams.get("role") || "").toLowerCase();
    if (qp === "customer" || qp === "provider") {
      setUserRole(qp);
      setRoleSelected(true);
      setCurrentStep(1);
    }
  }, [searchParams]);

  const handleRoleSelection = (role: "customer" | "provider") => {
    setUserRole(role);
    setRoleSelected(true);
    setCurrentStep(1);
    // keep URL truthful so refresh/share works
    router.replace(`/auth/register?role=${role}`);
  };

  // If you have a "Change Role" link/button, wire it to this:
  const handleChangeRole = () => {
    setRoleSelected(false);
    setUserRole("");
    setCurrentStep(1);
    router.replace(`/auth/register`); // remove role from URL
  };

  const handleContinueWithRole = () => {
    if (userRole) {
      setRoleSelected(true);
    }
  };

  const handleInputChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === "email") {
      setEmailStatus("idle");
      setFieldErrors((p) => ({ ...p, email: undefined }));
      setError(""); // optional: clear banner
    }
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language]
    );
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills((prev) => [...prev, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleAddCustomLanguage = () => {
    if (
      customLanguage.trim() &&
      !selectedLanguages.includes(customLanguage.trim())
    ) {
      setSelectedLanguages((prev) => [...prev, customLanguage.trim()]);
      setCustomLanguage("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleRemoveLanguage = (language: string) => {
    setSelectedLanguages((prev) => prev.filter((l) => l !== language));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("PDF files only.");
      return;
    }

    setResumeFile(file);
    setIsProcessingCV(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("http://localhost:4000/api/resume/analyze", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setCvExtractedData(result.data); // ✅ store AI result
      setShowAIResults(true); // ✅ show confirmation preview
      setAiProcessingComplete(true); // ✅ show success badge
    } catch (err) {
      console.error("Resume upload failed:", err);
      alert("Resume analysis failed.");
    } finally {
      setIsProcessingCV(false);
    }
  };

  const handleAddPortfolioUrl = () => {
    if (
      newPortfolioUrl.trim() &&
      !portfolioUrls.includes(newPortfolioUrl.trim())
    ) {
      setPortfolioUrls((prev) => [...prev, newPortfolioUrl.trim()]);
      setNewPortfolioUrl("");
    }
  };

  const handleRemovePortfolioUrl = (url: string) => {
    setPortfolioUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleAddCertification = () => {
    const hasSerialOrUrl =
      (newCertification.serialNumber && newCertification.serialNumber.trim()) ||
      (newCertification.sourceUrl && newCertification.sourceUrl.trim());

    if (
      newCertification.name.trim() &&
      newCertification.issuer.trim() &&
      newCertification.issuedDate &&
      hasSerialOrUrl
    ) {
      setCertifications((prev) => [...prev, { ...newCertification }]);
      setNewCertification({
        name: "",
        issuer: "",
        issuedDate: "",
        verified: false,
        serialNumber: "",
        sourceUrl: "",
      });
    }
  };

  const handleRemoveCertification = (index: number) => {
    setCertifications((prev) => prev.filter((_, i) => i !== index));
  };

  const processResumeWithAI = async (file: File) => {
    setIsProcessingCV(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/ai/extract-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process resume");
      }

      const extractedData = await response.json();
      setCvExtractedData(extractedData);
      setShowAIResults(true);
      setAiProcessingComplete(true);
    } catch (error) {
      console.error("AI processing error:", error);
      setError(
        "Failed to process resume with AI. You can continue filling the form manually."
      );
    } finally {
      setIsProcessingCV(false);
    }
  };

  const applyAIExtractedData = () => {
    if (!cvExtractedData) return;

    setFormData((prev) => ({
      ...prev,
      bio: cvExtractedData.bio || prev.bio,
      yearsExperience: cvExtractedData.yearsExperience || prev.yearsExperience,
      hourlyRate: cvExtractedData.suggestedHourlyRate || prev.hourlyRate,
    }));

    if (cvExtractedData.skills && cvExtractedData.skills.length > 0) {
      setSelectedSkills((prev) => {
        const newSkills = cvExtractedData.skills.filter(
          (skill: string) => !prev.includes(skill)
        );
        return [...prev, ...newSkills];
      });
    }

    if (cvExtractedData.languages && cvExtractedData.languages.length > 0) {
      setSelectedLanguages((prev) => {
        const newLanguages = cvExtractedData.languages.filter(
          (lang: string) => !prev.includes(lang)
        );
        return [...prev, ...newLanguages];
      });
    }

    if (
      cvExtractedData.certifications &&
      cvExtractedData.certifications.length > 0
    ) {
      setCertifications((prev) => [...prev, ...cvExtractedData.certifications]);
    }

    setShowAIResults(false);
    setSuccess(
      "AI extracted data has been applied to your profile! Please review and adjust as needed."
    );
    setTimeout(() => setSuccess(""), 5000);
  };

  const validateStep = (step: number): boolean => {
    if (userRole === "customer") {
      switch (step) {
        case 1: {
          const requiredFilled =
            !!formData.name &&
            !!formData.email &&
            !!formData.password &&
            !!formData.confirmPassword &&
            !!formData.phone;

          const strongAndMatch =
            isStrongPassword(formData.password) &&
            formData.password === formData.confirmPassword;

          return requiredFilled && strongAndMatch;
        }
        case 2:
          return !!(
            formData.companyName &&
            formData.location &&
            formData.industry
          );
        default:
          return true;
      }
    } else {
      // provider
      switch (step) {
        case 1: {
          const requiredFilled =
            !!formData.name &&
            !!formData.email &&
            !!formData.password &&
            !!formData.confirmPassword &&
            !!formData.phone;
          const strongAndMatch =
            isStrongPassword(formData.password) &&
            formData.password === formData.confirmPassword;
          return requiredFilled && strongAndMatch;
        }
        case 2: {
          const bioOk = !!formData.bio?.trim();
          const locOk = !!formData.location;
          const resumeOk = Boolean(resumeFile); // you labeled it "*"
          const kycOk = Boolean(kycDocType) && Boolean(kycFile); // both labeled "*"
          return bioOk && locOk && resumeOk && kycOk;
        }
        default:
          return true;
      }
    }
  };

  // const nextStep = () => {
  //   if (validateStep(currentStep)) {
  //     setCurrentStep((prev) => Math.min(prev + 1, getCurrentSteps().length));
  //     setError("");
  //   } else {
  //     setError("Please fill in all required fields before proceeding.");
  //   }
  // };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Determine the correct endpoint based on user role
      const endpoint = userRole === "provider" 
        ? `${process.env.NEXT_PUBLIC_API_URL}/provider/auth/register`
        : `${process.env.NEXT_PUBLIC_API_URL}/company/auth/register`;

      // Prepare data according to backend DTO structure
      const requestData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
      };

      if (userRole === "customer") {
        // Customer-specific data matching RegisterCompanyDto
        requestData.customerProfile = {
          description: formData.companyName || "",
          industry: formData.industry || "",
          location: formData.location || "",
          website: formData.website || null,
          companySize: formData.companySize || null,
          employeeCount: formData.employeeCount || null,
          establishedYear: formData.establishedYear || null,
          annualRevenue: formData.annualRevenue || null,
          fundingStage: formData.fundingStage || null,
          preferredContractTypes: formData.preferredContractTypes || [],
          averageBudgetRange: formData.averageBudgetRange || null,
          remotePolicy: formData.remotePolicy || null,
          hiringFrequency: formData.hiringFrequency || null,
          categoriesHiringFor: formData.categoriesHiringFor || [],
          mission: formData.mission || null,
          values: formData.values || [],
          languages: selectedLanguages,
        };
      } else if (userRole === "provider") {
        // Provider-specific data matching RegisterProviderDto
        requestData.providerProfile = {
          bio: formData.bio || "",
          location: formData.location || "",
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
          availability: formData.availability || null,
          languages: selectedLanguages,
          website: formData.website || null,
          profileVideoUrl: formData.profileVideoUrl || null,
          skills: selectedSkills,
          yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
          minimumProjectBudget: formData.minimumProjectBudget ? parseFloat(formData.minimumProjectBudget) : null,
          maximumProjectBudget: formData.maximumProjectBudget ? parseFloat(formData.maximumProjectBudget) : null,
          preferredProjectDuration: formData.preferredProjectDuration || null,
          workPreference: formData.workPreference || "remote",
          teamSize: formData.teamSize || 1,
        };
      }

      // POST to the backend registration endpoint
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      const newUserId: string | undefined = data?.user?.id;

      // Handle KYC upload if file exists
      if (newUserId && kycFile) {
        const kycRes = await uploadKyc(newUserId);
        if (!kycRes.ok) {
          console.warn("KYC upload failed but account created.");
        }
      }

      // Handle resume upload for providers
      if (newUserId && userRole === "provider" && resumeFile) {
        await uploadResume(newUserId, resumeFile);
      }

      // Handle certifications for providers
      if (newUserId && userRole === "provider" && certifications.length > 0) {
        await uploadCertifications(newUserId, certifications);
      }

      setSuccess("Account created successfully! Redirecting...");

      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => (currentStep / getCurrentSteps().length) * 100;

  const renderStepContent = () => {
    if (userRole === "customer") {
      return renderCustomerStepContent();
    } else {
      return renderProviderStepContent();
    }
  };

  const renderCustomerStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Account Setup
              </h2>
              <p className="text-gray-600">
                Let's start with your basic information
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              {/* ========== Step 1: Email (with inline availability status) ========== */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    ref={emailRef}
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    aria-invalid={Boolean(
                      fieldErrors.email || emailStatus === "used"
                    )}
                    className={`pl-10 bg-white/50 ${
                      fieldErrors.email || emailStatus === "used"
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* When we check */}
                {emailStatus === "checking" && (
                  <p className="text-xs text-gray-500">Checking email…</p>
                )}
                {(fieldErrors.email || emailStatus === "used") && (
                  <p className="text-xs text-red-600">
                    This email is already in use.
                  </p>
                )}
                {emailStatus === "available" &&
                  !fieldErrors.email &&
                  formData.email && (
                    <p className="text-xs text-green-600">
                      Email is available.
                    </p>
                  )}
              </div>
              {/* ========== /Email ========== */}

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+60 12-345 6789"
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Inline guidance + mismatch indicator */}
                {!isStrongPassword(formData.password) &&
                  formData.password.length > 0 && (
                    <p className="text-xs text-red-600">
                      Use at least 8 characters with uppercase, lowercase,
                      number, and symbol.
                    </p>
                  )}
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-600">
                      Passwords do not match.
                    </p>
                  )}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Company Profile
              </h2>
              <p className="text-gray-600">Tell us about your company</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="companyName"
                    placeholder="Enter your company name"
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.companyName}
                    onChange={(e) =>
                      handleInputChange("companyName", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (State) *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      handleInputChange("location", value)
                    }
                  >
                    <SelectTrigger className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {malaysianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) =>
                    handleInputChange("industry", value)
                  }
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance & Banking</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail & E-commerce</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="media">Media & Entertainment</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="nonprofit">Non-profit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize">
                  Company Size (number of employees)
                </Label>
                <Input
                  id="companySize"
                  type="number"
                  placeholder="e.g. 150"
                  className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  value={formData.companySize}
                  onChange={(e) =>
                    handleInputChange("companySize", e.target.value)
                  }
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Company Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://your-company.com"
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* === KYC (Company) === */}
            <div className="space-y-4 mt-8 p-4 border rounded-lg bg-white/50">
              <h3 className="text-lg font-semibold text-gray-900">
                KYC Verification (Company)
              </h3>
              <p className="text-sm text-gray-600">
                Upload your <strong>Company Registration</strong> document (PDF
                or image).
              </p>

              <div className="space-y-2">
                <Label htmlFor="kycFileCompany">
                  Company Registration Paper *
                </Label>
                <Input
                  id="kycFileCompany"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setKycFile(e.target.files?.[0] ?? null)}
                  className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                {kycFile && (
                  <p className="text-xs text-green-700">
                    Selected:{" "}
                    <span className="font-medium">{kycFile.name}</span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Review & Submit
              </h2>
              <p className="text-gray-600">
                Please review your information before submitting
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-4 border rounded-lg bg-white/50">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{formData.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{formData.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{formData.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-medium">
                      {formData.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-white/50">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Company:</span>
                    <span className="ml-2 font-medium">
                      {formData.companyName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Industry:</span>
                    <span className="ml-2 font-medium">
                      {formData.industry}
                    </span>
                  </div>
                  {formData.companySize && (
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <span className="ml-2 font-medium">
                        {formData.companySize}
                      </span>
                    </div>
                  )}
                  {formData.website && (
                    <div>
                      <span className="text-gray-600">Website:</span>
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-700"
                      >
                        {formData.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2 p-4 border rounded-lg bg-blue-50">
                <Checkbox id="terms" className="mt-1" required />
                <Label
                  htmlFor="terms"
                  className="text-sm text-gray-700 leading-relaxed"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Privacy Policy
                  </Link>
                  . I understand that my information will be used in accordance
                  with Malaysian data protection laws.
                </Label>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const renderProviderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Account Setup
              </h2>
              <p className="text-gray-600">
                Let's start with your basic information
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              {/* ========== Step 1: Email (with inline availability status) ========== */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Clarifying note about when email is checked */}
                <p className="text-xs text-gray-500">
                  We’ll use this email <strong>now</strong> when you click{" "}
                  <em>Next</em> to check availability.
                </p>

                {/* Inline email status (STEP 3) */}
                {emailStatus === "checking" && (
                  <p className="text-xs text-gray-500">Checking email…</p>
                )}
                {fieldErrors.email && (
                  <p className="text-xs text-red-600">{fieldErrors.email}</p>
                )}
                {emailStatus === "available" &&
                  !fieldErrors.email &&
                  formData.email && (
                    <p className="text-xs text-green-600">
                      Email is available.
                    </p>
                  )}
              </div>
              {/* ========== /Email ========== */}

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+60 12-345 6789"
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Inline guidance + mismatch indicator */}
                {!isStrongPassword(formData.password) &&
                  formData.password.length > 0 && (
                    <p className="text-xs text-red-600">
                      Use at least 8 characters with uppercase, lowercase,
                      number, and symbol.
                    </p>
                  )}
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-600">
                      Passwords do not match.
                    </p>
                  )}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            {/* CV Upload Section */}
            <div className="space-y-2 border-t pt-6">
              <Label htmlFor="resume">Resume (PDF only) *</Label>
              <p className="text-sm text-gray-600 mb-4">
                Upload your CV to get AI-powered assistance filling out your
                profile
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white/50 hover:border-blue-400 transition-colors">
                <input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
                <label htmlFor="resume" className="cursor-pointer">
                  {isProcessingCV ? (
                    <div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                        className="w-10 h-10 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"
                      />
                      <p className="text-lg font-medium text-blue-600 mb-2">
                        AI is analyzing your resume...
                      </p>
                      <p className="text-sm text-gray-500">
                        This will help fill your profile automatically
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                      {resumeFile ? (
                        <div>
                          <p className="text-lg font-medium text-green-600 mb-2">
                            {resumeFile.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Click to change file
                          </p>
                          {aiProcessingComplete && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                <span className="text-green-700 font-medium">
                                  Resume uploaded & AI processed!
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-medium text-gray-600 mb-2">
                            Upload your resume
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            PDF files only, max 5MB
                          </p>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                            <div className="flex items-center justify-center">
                              <Zap className="w-5 h-5 text-blue-600 mr-2" />
                              <span className="text-blue-700 font-medium text-sm">
                                AI will auto-fill your profile from your CV!
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* AI Results Modal/Section */}
            {showAIResults && cvExtractedData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50"
              >
                <div className="flex items-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-900">
                    AI Extracted Information
                  </h3>
                </div>

                <div className="space-y-4 mb-6">
                  {cvExtractedData.bio && (
                    <div>
                      <Label className="text-sm font-medium text-blue-800">
                        Professional Summary:
                      </Label>
                      <p className="text-sm text-blue-700 bg-white/50 p-3 rounded border mt-1">
                        {cvExtractedData.bio}
                      </p>
                    </div>
                  )}

                  {cvExtractedData.skills &&
                    cvExtractedData.skills.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-blue-800">
                          Skills Found ({cvExtractedData.skills.length}):
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {cvExtractedData.skills.map(
                            (skill: string, index: number) => (
                              <Badge
                                key={index}
                                className="bg-blue-600 text-white"
                              >
                                {skill}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {cvExtractedData.languages &&
                    cvExtractedData.languages.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-blue-800">
                          Languages ({cvExtractedData.languages.length}):
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {cvExtractedData.languages.map(
                            (lang: string, index: number) => (
                              <Badge
                                key={index}
                                className="bg-green-600 text-white"
                              >
                                {lang}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cvExtractedData.yearsExperience && (
                      <div>
                        <Label className="text-sm font-medium text-blue-800">
                          Experience:
                        </Label>
                        <p className="text-sm text-blue-700">
                          {cvExtractedData.yearsExperience}
                        </p>
                      </div>
                    )}
                    {cvExtractedData.suggestedHourlyRate && (
                      <div>
                        <Label className="text-sm font-medium text-blue-800">
                          Suggested Rate:
                        </Label>
                        <p className="text-sm text-blue-700">
                          RM {cvExtractedData.suggestedHourlyRate}/hour
                        </p>
                      </div>
                    )}
                  </div>

                  {cvExtractedData.certifications &&
                    cvExtractedData.certifications.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-blue-800">
                          Certifications Found:
                        </Label>
                        <div className="space-y-2 mt-2">
                          {cvExtractedData.certifications.map(
                            (cert: any, index: number) => (
                              <div
                                key={index}
                                className="text-sm text-blue-700 bg-white/50 p-2 rounded border"
                              >
                                <span className="font-medium">{cert.name}</span>{" "}
                                - {cert.issuer}
                                {cert.issuedDate && (
                                  <span className="text-blue-600">
                                    {" "}
                                    ({cert.issuedDate})
                                  </span>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={applyAIExtractedData}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Apply This Information
                  </Button>
                  <Button
                    onClick={() => setShowAIResults(false)}
                    variant="outline"
                    className="bg-white/50"
                  >
                    Skip & Fill Manually
                  </Button>
                </div>

                <p className="text-xs text-blue-600 mt-3">
                  💡 You can review and edit all information in the next steps
                </p>
              </motion.div>
            )}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Profile & CV Upload
              </h2>
              <p className="text-gray-600">
                Tell clients about yourself and upload your resume for AI
                assistance
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio *</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell clients about your experience, expertise, and what makes you unique..."
                  className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 min-h-[120px]"
                  maxLength={500}
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (State) *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      handleInputChange("location", value)
                    }
                  >
                    <SelectTrigger className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {malaysianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website/Portfolio URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://your-website.com"
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileVideo">Profile Video URL</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="profileVideo"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.profileVideoUrl}
                    onChange={(e) =>
                      handleInputChange("profileVideoUrl", e.target.value)
                    }
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Optional: Add a video introduction to stand out
                </p>
              </div>
            </div>
            {/* === KYC (Provider) === */}
            <div className="space-y-4 mt-8 p-4 border rounded-lg bg-white/50">
              <h3 className="text-lg font-semibold text-gray-900">
                KYC Verification (Provider)
              </h3>
              <p className="text-sm text-gray-600">
                Upload a valid <strong>Passport</strong> or <strong>IC</strong>{" "}
                image for verification.
              </p>

              {/* Doc type selector */}
              <div className="space-y-2">
                <Label htmlFor="kycDocType">Document Type *</Label>
                <Select
                  value={kycDocType}
                  onValueChange={(v) => setKycDocType(v as "PASSPORT" | "IC")}
                >
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select KYC document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PASSPORT">Passport</SelectItem>
                    <SelectItem value="IC">IC</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Accepted types: JPG, PNG, or PDF (max ~10MB)
                </p>
              </div>

              {/* File input */}
              <div className="space-y-2">
                <Label htmlFor="kycFile">KYC Document *</Label>
                <Input
                  id="kycFile"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setKycFile(e.target.files?.[0] ?? null)}
                  className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                {kycFile && (
                  <p className="text-xs text-green-700">
                    Selected:{" "}
                    <span className="font-medium">{kycFile.name}</span>
                  </p>
                )}
              </div>

              {kycDocType === "" && (
                <p className="text-xs text-amber-600">
                  Please choose <strong>Passport</strong> or <strong>IC</strong>
                  .
                </p>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Skills & Experience
              </h2>
              <p className="text-gray-600">Showcase your technical expertise</p>
            </div>

            <div className="space-y-6">
              {/* Skills Section */}
              <div className="space-y-4">
                <Label>Technical Skills *</Label>

                <div className="flex gap-2">
                  <Input
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Type a skill and press Add"
                    className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddCustomSkill())
                    }
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomSkill}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {selectedSkills.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Selected Skills ({selectedSkills.length})
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white/50 max-h-32 overflow-y-auto">
                      {selectedSkills.map((skill) => (
                        <Badge
                          key={skill}
                          className="bg-blue-600 hover:bg-blue-700 text-white pr-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 hover:bg-blue-800 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Popular Skills (click to add)
                  </Label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border rounded-lg bg-white/50">
                    {popularSkills
                      .filter((skill) => !selectedSkills.includes(skill))
                      .map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                          onClick={() => handleSkillToggle(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>

              {/* Languages Section */}
              <div className="space-y-4">
                <Label>Languages *</Label>

                <div className="flex gap-2">
                  <Input
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    placeholder="Type a language and press Add"
                    className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddCustomLanguage())
                    }
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomLanguage}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {selectedLanguages.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Selected Languages ({selectedLanguages.length})
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white/50">
                      {selectedLanguages.map((language) => (
                        <Badge
                          key={language}
                          className="bg-green-600 hover:bg-green-700 text-white pr-1"
                        >
                          {language}
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(language)}
                            className="ml-1 hover:bg-green-800 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Common Languages (click to add)
                  </Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white/50">
                    {commonLanguages
                      .filter(
                        (language) => !selectedLanguages.includes(language)
                      )
                      .map((language) => (
                        <Badge
                          key={language}
                          variant="outline"
                          className="cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                          onClick={() => handleLanguageToggle(language)}
                        >
                          {language}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>

              {/* Experience and Rate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min={0}
                    max={50}
                    placeholder="e.g. 4"
                    value={formData.yearsExperience}
                    onChange={(e) =>
                      handleInputChange("yearsExperience", e.target.value)
                    }
                    className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (RM) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="e.g., 50"
                    min="10"
                    max="1000"
                    className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      handleInputChange("hourlyRate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Portfolio & Links
              </h2>
              <p className="text-gray-600">
                Showcase your work and professional profiles
              </p>
            </div>

            <div className="space-y-6">
              {/* Portfolio URLs */}
              <div className="space-y-4">
                <Label>Portfolio URLs</Label>
                <p className="text-sm text-gray-600">
                  Add links to your GitHub, LinkedIn, or other professional
                  profiles
                </p>

                <div className="flex gap-2">
                  <Input
                    value={newPortfolioUrl}
                    onChange={(e) => setNewPortfolioUrl(e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    type="url"
                  />
                  <Button
                    type="button"
                    onClick={handleAddPortfolioUrl}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {portfolioUrls.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Portfolio Links ({portfolioUrls.length})
                    </Label>
                    <div className="space-y-2">
                      {portfolioUrls.map((url, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white/50 border rounded-lg"
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm truncate flex-1"
                          >
                            {url}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemovePortfolioUrl(url)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {portfolioUrls.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No portfolio links added yet</p>
                    <p className="text-sm">
                      Add links to showcase your work and professional profiles
                    </p>
                  </div>
                )}
              </div>

              {/* Popular Portfolio Platforms */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Popular Platforms</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      name: "GitHub",
                      placeholder: "https://github.com/username",
                    },
                    {
                      name: "LinkedIn",
                      placeholder: "https://linkedin.com/in/username",
                    },
                    {
                      name: "Behance",
                      placeholder: "https://behance.net/username",
                    },
                    {
                      name: "Dribbble",
                      placeholder: "https://dribbble.com/username",
                    },
                  ].map((platform) => (
                    <Button
                      key={platform.name}
                      type="button"
                      variant="outline"
                      className="h-auto p-3 bg-white/50 hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => setNewPortfolioUrl(platform.placeholder)}
                    >
                      <div className="text-center">
                        <Globe className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                        <span className="text-sm">{platform.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Certifications
              </h2>
              <p className="text-gray-600">
                Add your professional certifications (optional but recommended)
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      Why add certifications?
                    </p>
                    <p className="text-sm text-blue-700">
                      Certifications help build trust with clients and showcase
                      your expertise in specific technologies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Add New Certification */}
              <div className="space-y-4 p-4 border rounded-lg bg-white/50">
                <h3 className="font-medium text-gray-900">Add Certification</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certName">Certification Name</Label>
                    <Input
                      id="certName"
                      placeholder="e.g., AWS Certified Solutions Architect"
                      className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      value={newCertification.name}
                      onChange={(e) =>
                        setNewCertification((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certIssuer">Issuing Organization</Label>
                    <Input
                      id="certIssuer"
                      placeholder="e.g., Amazon Web Services"
                      className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      value={newCertification.issuer}
                      onChange={(e) =>
                        setNewCertification((prev) => ({
                          ...prev,
                          issuer: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certDate">Issue Date</Label>
                    <Input
                      id="certDate"
                      type="date"
                      className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      value={newCertification.issuedDate}
                      onChange={(e) =>
                        setNewCertification((prev) => ({
                          ...prev,
                          issuedDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="certSerial">
                        Serial Number (optional*)
                      </Label>
                      <Input
                        id="certSerial"
                        placeholder="e.g. ABC-123-XYZ"
                        className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        value={newCertification.serialNumber || ""}
                        onChange={(e) =>
                          setNewCertification((prev) => ({
                            ...prev,
                            serialNumber: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="certLink">
                        Verification Link (optional*)
                      </Label>
                      <Input
                        id="certLink"
                        type="url"
                        placeholder="https://verify.issuer.com/cert/ABC-123"
                        className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        value={newCertification.sourceUrl || ""}
                        onChange={(e) =>
                          setNewCertification((prev) => ({
                            ...prev,
                            sourceUrl: e.target.value,
                          }))
                        }
                      />
                      <p className="text-xs text-gray-500">
                        *At least one of Serial Number or Verification Link is
                        required.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddCertification}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={
                        !newCertification.name ||
                        !newCertification.issuer ||
                        !newCertification.issuedDate ||
                        !(
                          newCertification.serialNumber?.trim() ||
                          newCertification.sourceUrl?.trim()
                        )
                      }
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Add Certification
                    </Button>
                  </div>
                </div>
              </div>

              {/* Certifications List */}
              {certifications.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">
                    Your Certifications ({certifications.length})
                  </h3>
                  <div className="space-y-3">
                    {certifications.map((cert, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg bg-white/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <Award className="w-5 h-5 text-blue-600 mr-2" />
                              <h4 className="font-medium text-gray-900">
                                {cert.name}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <Building2 className="w-4 h-4 inline mr-1" />
                              {cert.issuer}
                            </p>
                            <p className="text-sm text-gray-600">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {new Date(cert.issuedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCertification(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {certifications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No certifications added yet</p>
                  <p className="text-sm">
                    Add your professional certifications to stand out to clients
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Review & Submit
            </h2>

            <p className="text-gray-600 text-center">
              Please review your profile details before submission.
            </p>

            <div className="bg-white/50 p-4 rounded-lg border">
              <p>
                <strong>Name:</strong> {formData.name}
              </p>
              <p>
                <strong>Email:</strong> {formData.email}
              </p>
              <p>
                <strong>Bio:</strong> {formData.bio}
              </p>
              <p>
                <strong>Location:</strong> {formData.location}
              </p>
              <p>
                <strong>Years of Experience:</strong> {formData.yearsExperience}
              </p>
              <p>
                <strong>Hourly Rate:</strong> RM {formData.hourlyRate}
              </p>
              <p>
                <strong>Skills:</strong> {selectedSkills.join(", ")}
              </p>
              <p>
                <strong>Languages:</strong> {selectedLanguages.join(", ")}
              </p>
              <p>
                <strong>Portfolio URLs:</strong> {portfolioUrls.join(", ")}
              </p>
              <p>
                <strong>Certifications:</strong>{" "}
                {certifications.map((c) => c.name).join(", ")}
              </p>
            </div>
          </motion.div>
        );

      default:
        return (
          <div>
            Provider step {currentStep} content (implement remaining steps)
          </div>
        );
    }
  };

  // Role Selection Screen
  if (!roleSelected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
            animate={{ rotate: -360 }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        </div>

        <motion.div
          className="w-full max-w-4xl relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Link href="/" className="inline-flex items-center space-x-2 group">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TechConnect
              </span>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Join TechConnect
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Choose how you want to use our platform
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Customer Option */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 h-full ${
                        userRole === "customer"
                          ? "ring-2 ring-blue-500 bg-blue-50/50 border-blue-300"
                          : "hover:bg-blue-50/30 hover:border-blue-300 border-gray-200"
                      }`}
                      onClick={() => handleRoleSelection("customer")}
                    >
                      <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                        <div>
                          <div className="mb-6">
                            <Building className="w-16 h-16 mx-auto text-blue-600" />
                          </div>
                          <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                            Hire Freelancers
                          </h3>
                          <p className="text-gray-600 mb-6 leading-relaxed">
                            I'm a company looking to hire talented ICT
                            professionals for my projects
                          </p>
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2 text-blue-500" />
                              <span>Access to verified freelancers</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                              <span>Post unlimited projects</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                              <span>Simple 3-step setup</span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            userRole === "customer"
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : "bg-blue-50 text-blue-600 border-blue-200"
                          }`}
                        >
                          Quick Setup
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Provider Option */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 h-full ${
                        userRole === "provider"
                          ? "ring-2 ring-purple-500 bg-purple-50/50 border-purple-300"
                          : "hover:bg-purple-50/30 hover:border-purple-300 border-gray-200"
                      }`}
                      onClick={() => handleRoleSelection("provider")}
                    >
                      <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                        <div>
                          <div className="mb-6">
                            <User className="w-16 h-16 mx-auto text-purple-600" />
                          </div>
                          <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                            Work as Freelancer
                          </h3>
                          <p className="text-gray-600 mb-6 leading-relaxed">
                            I'm a freelancer offering ICT services and want to
                            find exciting projects
                          </p>
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-sm text-gray-600">
                              <Zap className="w-4 h-4 mr-2 text-purple-500" />
                              <span>AI-powered profile setup</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Upload className="w-4 h-4 mr-2 text-purple-500" />
                              <span>CV auto-fill with AI</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Globe className="w-4 h-4 mr-2 text-purple-500" />
                              <span>Showcase your portfolio</span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            userRole === "provider"
                              ? "bg-purple-100 text-purple-700 border-purple-300"
                              : "bg-purple-50 text-purple-600 border-purple-200"
                          }`}
                        >
                          AI-Powered Setup
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Continue Button */}
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleContinueWithRole}
                    disabled={!userRole}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue as{" "}
                    {userRole === "customer"
                      ? "Company"
                      : userRole === "provider"
                      ? "Freelancer"
                      : "..."}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Main Registration Flow
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{ rotate: -360 }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <motion.div
        className="w-full max-w-4xl relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TechConnect
            </span>
          </Link>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Button
                  variant="ghost"
                  onClick={() => setRoleSelected(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Change Role
                </Button>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {userRole === "customer"
                  ? "Company Registration"
                  : "Freelancer Registration"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {userRole === "customer"
                  ? "Create your company account to start hiring freelancers"
                  : "Complete your profile to start offering your ICT services"}
              </CardDescription>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Step {currentStep} of {getCurrentSteps().length}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(getStepProgress())}% Complete
                  </span>
                </div>
                <Progress value={getStepProgress()} className="h-2" />
              </div>

              {/* Step Indicators */}
              <div className="flex justify-between mt-4 text-xs">
                {getCurrentSteps().map((step) => (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center ${
                      step.id <= currentStep ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                        step.id < currentStep
                          ? "bg-blue-600 text-white"
                          : step.id === currentStep
                          ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {step.id < currentStep ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span className="hidden sm:block text-center">
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              {/* Error/Success Messages */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < getCurrentSteps().length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={emailStatus === "checking" || isLoading}
                    className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white
              ${
                emailStatus === "checking"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
                  >
                    {emailStatus === "checking" ? "Checking..." : "Next"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                )}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
