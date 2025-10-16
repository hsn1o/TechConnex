"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Zap,
  ArrowRight,
  ChevronLeft,
  CheckCircle,
  Building,
  Users,
  Briefcase,
  User,
  Upload,
  Globe,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import CustomerRegistration from "./components/company";
import ProviderRegistration from "./components/Provider";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

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
  { id: 2, title: "Company Profile", description: "Basic company information" },
  {
    id: 3,
    title: "Company Details",
    description: "Additional company information",
  },
  { id: 4, title: "Review & Submit", description: "Confirm your information" },
];

export type Certification = {
  name: string;
  issuer: string;
  issuedDate: string;
  verified?: boolean;
  serialNumber?: string;
  sourceUrl?: string;
};

export type RegistrationFormData = {
  // Step 1: Account Setup
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;

  // Step 2: Profile Details
  bio: string;
  location: string;
  website: string;
  profileVideoUrl: string;
  companyName: string;
  companyDescription: string;
  companySize: string;
  industry: string;

  // Step 3: Skills & Experience (Provider only)
  yearsExperience: string;
  hourlyRate: string;
  availability: string;
  minimumProjectBudget: string;
  maximumProjectBudget: string;
  preferredProjectDuration: string;
  workPreference: string;
  teamSize: string;

  // Company-specific fields
  employeeCount: string;
  establishedYear: string;
  annualRevenue: string;
  fundingStage: string;
  preferredContractTypes: string[];
  averageBudgetRange: string;
  remotePolicy: string;
  hiringFrequency: string;
  categoriesHiringFor: string[];
  mission: string;
  values: string[];
  socialLinks: string[];
  acceptedTerms: boolean; // Change from string to boolean
};

export default function SignupPage() {
  const emailRef = useRef<HTMLInputElement>(null!);
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
  const [socialUrls, setSocialUrls] = useState<string[]>([]);
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [newCertification, setNewCertification] = useState<Certification>({
    name: "",
    issuer: "",
    issuedDate: "",
    verified: false,
    serialNumber: "",
    sourceUrl: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editCertification, setEditCertification] = useState<Certification | null>(null);
const handleEditCertification = (index: number) => {
  setEditingIndex(index);
  setEditCertification({ ...certifications[index] });
};


  const [isProcessingCV, setIsProcessingCV] = useState(false);
  const [cvExtractedData, setCvExtractedData] = useState<any>(null);
  const [showAIResults, setShowAIResults] = useState(false);
  const [aiProcessingComplete, setAiProcessingComplete] = useState(false);

  const [formData, setFormData] = useState<RegistrationFormData>({
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
    companyDescription: "",
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
    preferredContractTypes: [],
    averageBudgetRange: "",
    remotePolicy: "",
    hiringFrequency: "",
    categoriesHiringFor: [],
    mission: "",
    values: [],
    socialLinks: [],

    acceptedTerms: false, // Change from "false" to false
  });

  const [kycDocType, setKycDocType] = useState<
    "" | "PASSPORT" | "IC" | "COMPANY_REGISTRATION"
  >("");
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "checking" | "available" | "used"
  >("idle");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  // Helper functions
  const isStrongPassword = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|;:'",.<>/?`~]).{8,}$/.test(
      pwd
    );

  const checkEmailAvailability = async (email: string) => {
    try {
      setEmailStatus("checking");
      const res = await fetch(
        `${API_BASE}/auth/check-email?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (!res.ok || typeof data.available !== "boolean")
        throw new Error(data?.error || "Failed");
      setEmailStatus(data.available ? "available" : "used");
      return data.available;
    } catch {
      setEmailStatus("idle");
      setFieldErrors((p) => ({
        ...p,
        email: "Could not verify email right now.",
      }));
      return null;
    }
  };

  const uploadResume = async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", userId);

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/resume/upload`, {
      method: "POST",
      body: formData,
    });
  };

  const uploadCertifications = async (
    userId: string,
    certs: Certification[]
  ) => {
    return fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/certifications/upload`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, certifications: certs }),
      }
    );
  };

  const uploadKyc = async (userId: string) => {
    if (!kycFile) return { ok: true }; // skip if no file

    // ✅ Check if user accidentally selected a folder
    if ((kycFile as any).type === "" && (kycFile as any).size === 0) {
      setError("You cannot upload a folder. Please select a valid file.");
      return { ok: false, error: "Folder selected instead of file" };
    }

    try {
      setIsUploadingKyc(true);

      const fd = new FormData();
      fd.append("userId", userId);
      fd.append(
        "type",
        userRole === "provider" ? "PROVIDER_ID" : "COMPANY_REG"
      );
      fd.append("file", kycFile); // must match backend multer.single("file")

      const res = await fetch(`${API_BASE}/kyc`, {
        method: "POST",
        body: fd,
      });

      const contentType = res.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await res.json()
        : { error: await res.text() };

      if (!res.ok) throw new Error(payload.error || "KYC upload failed");

      return { ok: true, data: payload.data };
    } catch (e: any) {
      console.error("KYC upload error:", e);
      setError(e.message || "KYC upload failed");
      return { ok: false, error: e.message };
    } finally {
      setIsUploadingKyc(false);
    }
  };

  const getCurrentSteps = () => {
    return userRole === "provider" ? PROVIDER_STEPS : CUSTOMER_STEPS;
  };

  const getStepProgress = () => (currentStep / getCurrentSteps().length) * 100;

  useEffect(() => {
    const qp = (searchParams.get("role") || "").toLowerCase();
    if (qp === "customer" || qp === "provider") {
      setUserRole(qp);
      setRoleSelected(true);
      setCurrentStep(1);
    }
  }, [searchParams]);

  useEffect(() => {
    if (userRole === "customer") setKycDocType("COMPANY_REGISTRATION");
  }, [userRole]);

  const handleRoleSelection = (role: "customer" | "provider") => {
    setUserRole(role);
    setRoleSelected(true);
    setCurrentStep(1);
    router.replace(`/auth/register?role=${role}`);
  };

  const handleChangeRole = () => {
    setRoleSelected(false);
    setUserRole("");
    setCurrentStep(1);
    router.replace(`/auth/register`);
  };

  const handleContinueWithRole = () => {
    if (userRole) {
      setRoleSelected(true);
    }
  };

  const handleInputChange = (
    key: keyof RegistrationFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === "email") {
      setEmailStatus("idle");
      setFieldErrors((p) => ({ ...p, email: undefined }));
      setError("");
    }
  };
  const handleBooleanInputChange = (
    key: keyof RegistrationFormData,
    value: boolean
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const validateStep = (step: number): boolean => {
    if (userRole === "customer") {
      switch (step) {
        case 1: {
          const requiredFilled =
            !!formData.companyName &&
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
          return !!(formData.location && formData.industry);
        case 3:
          formData.companyDescription &&
            formData.companySize &&
            formData.establishedYear &&
            formData.annualRevenue &&
            formData.fundingStage &&
            formData.preferredContractTypes &&
            formData.averageBudgetRange &&
            formData.remotePolicy &&
            formData.hiringFrequency &&
            formData.categoriesHiringFor &&
            formData.mission &&
            formData.values;
          return true;
        case 4:
          return Boolean(formData.acceptedTerms); // or Boolean(formData.acceptedTerms) if using boolean

        default:
          return true;
      }
    } else {
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
          const resumeOk = Boolean(resumeFile);
          const kycOk = Boolean(kycDocType) && Boolean(kycFile);
          return bioOk && locOk && resumeOk && kycOk;
        }
        case 5: {
          const requiredFilled =
            (!!newCertification.name &&
              !!newCertification.issuedDate &&
              !!newCertification.issuer &&
              !!newCertification.serialNumber) ||
            !!newCertification.sourceUrl;

          return requiredFilled;
        }
        default:
          return true;
      }
    }
  };

  const nextStep = async () => {
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
        setError("We couldn't verify your email right now. Please try again.");
        return;
      }

      setEmailStatus("available");
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
      setError("");
    }

    setCurrentStep((prev) => Math.min(prev + 1, getCurrentSteps().length));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1️⃣ Register user
      const endpoint =
        userRole === "provider"
          ? `${process.env.NEXT_PUBLIC_API_URL}/auth/provider/register`
          : `${process.env.NEXT_PUBLIC_API_URL}/auth/company/register`;

      const requestData: any = {
        email: formData.email,
        password: formData.password,
        name: formData.companyName,
        phone: formData.phone || null,
      };

      if (userRole === "customer") {
        requestData.customerProfile = {
          description: formData.companyDescription || "",
          industry: formData.industry || "",
          location: formData.location || "",
          website: formData.website || null,
          socialLinks: formData.socialLinks || null,
          companySize: formData.companySize || null,
          employeeCount: formData.employeeCount
            ? parseInt(formData.employeeCount, 10)
            : null,
          establishedYear: formData.establishedYear
            ? parseInt(formData.establishedYear, 10)
            : null,
          annualRevenue: formData.annualRevenue
            ? parseFloat(formData.annualRevenue).toFixed(2)
            : null,
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
        requestData.providerProfile = {
          bio: formData.bio || "",
          location: formData.location || "",
          hourlyRate: formData.hourlyRate
            ? parseFloat(formData.hourlyRate)
            : null,
          availability: formData.availability || null,
          languages: selectedLanguages,
          website: formData.website || null,
          profileVideoUrl: formData.profileVideoUrl || null,
          skills: selectedSkills,
          yearsExperience: formData.yearsExperience
            ? parseInt(formData.yearsExperience)
            : null,
          minimumProjectBudget: formData.minimumProjectBudget
            ? parseFloat(formData.minimumProjectBudget)
            : null,
          maximumProjectBudget: formData.maximumProjectBudget
            ? parseFloat(formData.maximumProjectBudget)
            : null,
          preferredProjectDuration: formData.preferredProjectDuration || null,
          workPreference: formData.workPreference || "remote",
          teamSize: formData.teamSize || 1,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      const newUserId: string | undefined = data?.user?.user.id;
      if (!newUserId) throw new Error("User ID missing after registration");

      // 2️⃣ Upload KYC only after successful registration
      if (kycFile) {
        const kycRes = await uploadKyc(newUserId);
        if (!kycRes.ok) throw new Error("KYC upload failed, please try again.");
      }

      // 3️⃣ Optional provider files
      if (userRole === "provider") {
        if (resumeFile) await uploadResume(newUserId, resumeFile);
        if (certifications.length > 0)
          await uploadCertifications(newUserId, certifications);
      }

      // 4️⃣ Success → navigate to login
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

  // Role Selection Screen
  if (!roleSelected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
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
                  onClick={handleChangeRole}
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
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {userRole === "customer" ? (
                    <CustomerRegistration
                      currentStep={currentStep}
                      formData={formData}
                      handleInputChange={handleInputChange}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      emailStatus={emailStatus}
                      fieldErrors={fieldErrors}
                      emailRef={emailRef}
                      kycFile={kycFile}
                      setKycFile={setKycFile}
                      selectedLanguages={selectedLanguages}
                      setSelectedLanguages={setSelectedLanguages}
                      socialUrls={socialUrls}
                      setSocialUrls={setSocialUrls}
                      newSocialUrl={newSocialUrl}
                      setNewSocialUrl={setNewSocialUrl}
                      handleBooleanInputChange={handleBooleanInputChange}
                    />
                  ) : (
                    <ProviderRegistration
                      currentStep={currentStep}
                      formData={formData}
                      handleInputChange={handleInputChange}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      emailStatus={emailStatus}
                      fieldErrors={fieldErrors}
                      emailRef={emailRef}
                      kycFile={kycFile}
                      setKycFile={setKycFile}
                      kycDocType={kycDocType}
                      setKycDocType={setKycDocType}
                      resumeFile={resumeFile}
                      setResumeFile={setResumeFile}
                      selectedSkills={selectedSkills}
                      setSelectedSkills={setSelectedSkills}
                      selectedLanguages={selectedLanguages}
                      setSelectedLanguages={setSelectedLanguages}
                      customSkill={customSkill}
                      setCustomSkill={setCustomSkill}
                      customLanguage={customLanguage}
                      setCustomLanguage={setCustomLanguage}
                      portfolioUrls={portfolioUrls}
                      setPortfolioUrls={setPortfolioUrls}
                      newPortfolioUrl={newPortfolioUrl}
                      setNewPortfolioUrl={setNewPortfolioUrl}
                      certifications={certifications}
                      setCertifications={setCertifications}
                      newCertification={newCertification}
                      setNewCertification={setNewCertification}
                      isProcessingCV={isProcessingCV}
                      setIsProcessingCV={setIsProcessingCV}
                      cvExtractedData={cvExtractedData}
                      setCvExtractedData={setCvExtractedData}
                      showAIResults={showAIResults}
                      setShowAIResults={setShowAIResults}
                      aiProcessingComplete={aiProcessingComplete}
                      setAiProcessingComplete={setAiProcessingComplete}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              {error && (
                <div className="my-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="my-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}
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
                    disabled={isLoading || !formData.acceptedTerms}
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
