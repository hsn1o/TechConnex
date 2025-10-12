"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Lock, Eye, EyeOff, Phone, MapPin, Globe, FileText, Upload, X, Plus, Award, Building2, Calendar, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { RegistrationFormData , Certification } from "../page";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

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

interface ProviderRegistrationProps {
  currentStep: number;
  formData: RegistrationFormData;
  handleInputChange: (key: keyof RegistrationFormData, value: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  emailStatus: "idle" | "checking" | "available" | "used";
  fieldErrors: { email?: string };
  emailRef: React.RefObject<HTMLInputElement>;
  kycFile: File | null;
  setKycFile: (file: File | null) => void;
  kycDocType: "" | "PASSPORT" | "IC" | "COMPANY_REGISTRATION";
  setKycDocType: (type: "" | "PASSPORT" | "IC" | "COMPANY_REGISTRATION") => void;
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  selectedSkills: string[];
  setSelectedSkills: React.Dispatch<React.SetStateAction<string[]>>;
  selectedLanguages: string[];
  setSelectedLanguages: React.Dispatch<React.SetStateAction<string[]>>;
  customSkill: string;
  setCustomSkill: React.Dispatch<React.SetStateAction<string>>;
  customLanguage: string;
  setCustomLanguage: React.Dispatch<React.SetStateAction<string>>;
  portfolioUrls: string[];
  setPortfolioUrls: React.Dispatch<React.SetStateAction<string[]>>;
  newPortfolioUrl: string;
  setNewPortfolioUrl: React.Dispatch<React.SetStateAction<string>>;
  certifications: Certification[];
  setCertifications: React.Dispatch<React.SetStateAction<Certification[]>>;
  newCertification: Certification;
  setNewCertification: React.Dispatch<React.SetStateAction<Certification>>;
  isProcessingCV: boolean;
  setIsProcessingCV: React.Dispatch<React.SetStateAction<boolean>>;
  cvExtractedData: any;
  setCvExtractedData: React.Dispatch<React.SetStateAction<any>>;
  showAIResults: boolean;
  setShowAIResults: React.Dispatch<React.SetStateAction<boolean>>;
  aiProcessingComplete: boolean;
  setAiProcessingComplete: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProviderRegistration: React.FC<ProviderRegistrationProps> = ({
  currentStep,
  formData,
  handleInputChange,
  showPassword,
  setShowPassword,
  emailStatus,
  fieldErrors,
  emailRef,
  kycFile,
  setKycFile,
  kycDocType,
  setKycDocType,
  resumeFile,
  setResumeFile,
  selectedSkills,
  setSelectedSkills,
  selectedLanguages,
  setSelectedLanguages,
  customSkill,
  setCustomSkill,
  customLanguage,
  setCustomLanguage,
  portfolioUrls,
  setPortfolioUrls,
  newPortfolioUrl,
  setNewPortfolioUrl,
  certifications,
  setCertifications,
  newCertification,
  setNewCertification,
  isProcessingCV,
  setIsProcessingCV,
  cvExtractedData,
  setCvExtractedData,
  showAIResults,
  setShowAIResults,
  aiProcessingComplete,
  setAiProcessingComplete,
}) => {
  const isStrongPassword = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|;:'",.<>/?`~]).{8,}$/.test(pwd);

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

      setCvExtractedData(result.data);
      setShowAIResults(true);
      setAiProcessingComplete(true);
    } catch (err) {
      console.error("Resume upload failed:", err);
      alert("Resume analysis failed.");
    } finally {
      setIsProcessingCV(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]
    );
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills((prev) => [...prev, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleAddCustomLanguage = () => {
    if (customLanguage.trim() && !selectedLanguages.includes(customLanguage.trim())) {
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

  const handleAddPortfolioUrl = () => {
    if (newPortfolioUrl.trim() && !portfolioUrls.includes(newPortfolioUrl.trim())) {
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

  const applyAIExtractedData = () => {
    if (!cvExtractedData) return;

    // Update form fields individually
    if (cvExtractedData.bio) {
      handleInputChange("bio", cvExtractedData.bio);
    }
    if (cvExtractedData.yearsExperience) {
      handleInputChange("yearsExperience", cvExtractedData.yearsExperience);
    }
    if (cvExtractedData.suggestedHourlyRate) {
      handleInputChange("hourlyRate", cvExtractedData.suggestedHourlyRate);
    }

    // Update skills
    if (cvExtractedData.skills && cvExtractedData.skills.length > 0) {
      setSelectedSkills((prev) => {
        const newSkills = cvExtractedData.skills.filter(
          (skill: string) => !prev.includes(skill)
        );
        return [...prev, ...newSkills];
      });
    }

    // Update languages
    if (cvExtractedData.languages && cvExtractedData.languages.length > 0) {
      setSelectedLanguages((prev) => {
        const newLanguages = cvExtractedData.languages.filter(
          (lang: string) => !prev.includes(lang)
        );
        return [...prev, ...newLanguages];
      });
    }

    // Update certifications
    if (cvExtractedData.certifications && cvExtractedData.certifications.length > 0) {
      setCertifications((prev) => [...prev, ...cvExtractedData.certifications]);
    }

    setShowAIResults(false);
  };

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
            <h2 className="text-2xl font-bold text-gray-900">Account Setup</h2>
            <p className="text-gray-600">Let's start with your basic information</p>
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

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  ref={emailRef}
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

              <p className="text-xs text-gray-500">
                We'll use this email <strong>now</strong> when you click <em>Next</em> to check availability.
              </p>

              {emailStatus === "checking" && (
                <p className="text-xs text-gray-500">Checking email…</p>
              )}
              {fieldErrors.email && (
                <p className="text-xs text-red-600">{fieldErrors.email}</p>
              )}
              {emailStatus === "available" && !fieldErrors.email && formData.email && (
                <p className="text-xs text-green-600">Email is available.</p>
              )}
            </div>

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
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

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
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
              </div>

              {!isStrongPassword(formData.password) && formData.password.length > 0 && (
                <p className="text-xs text-red-600">
                  Use at least 8 characters with uppercase, lowercase, number, and symbol.
                </p>
              )}
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match.</p>
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
              Upload your CV to get AI-powered assistance filling out your profile
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
                        <p className="text-sm text-gray-500">Click to change file</p>
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
                        <p className="text-sm text-gray-500 mb-4">PDF files only, max 5MB</p>
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

                {cvExtractedData.skills && cvExtractedData.skills.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-blue-800">
                      Skills Found ({cvExtractedData.skills.length}):
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {cvExtractedData.skills.map((skill: string, index: number) => (
                        <Badge key={index} className="bg-blue-600 text-white">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {cvExtractedData.languages && cvExtractedData.languages.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-blue-800">
                      Languages ({cvExtractedData.languages.length}):
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {cvExtractedData.languages.map((lang: string, index: number) => (
                        <Badge key={index} className="bg-green-600 text-white">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cvExtractedData.yearsExperience && (
                    <div>
                      <Label className="text-sm font-medium text-blue-800">Experience:</Label>
                      <p className="text-sm text-blue-700">{cvExtractedData.yearsExperience}</p>
                    </div>
                  )}
                  {cvExtractedData.suggestedHourlyRate && (
                    <div>
                      <Label className="text-sm font-medium text-blue-800">Suggested Rate:</Label>
                      <p className="text-sm text-blue-700">
                        RM {cvExtractedData.suggestedHourlyRate}/hour
                      </p>
                    </div>
                  )}
                </div>

                {cvExtractedData.certifications && cvExtractedData.certifications.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-blue-800">
                      Certifications Found:
                    </Label>
                    <div className="space-y-2 mt-2">
                      {cvExtractedData.certifications.map((cert: any, index: number) => (
                        <div
                          key={index}
                          className="text-sm text-blue-700 bg-white/50 p-2 rounded border"
                        >
                          <span className="font-medium">{cert.name}</span> - {cert.issuer}
                          {cert.issuedDate && (
                            <span className="text-blue-600"> ({cert.issuedDate})</span>
                          )}
                        </div>
                      ))}
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
            <h2 className="text-2xl font-bold text-gray-900">Profile & CV Upload</h2>
            <p className="text-gray-600">
              Tell clients about yourself and upload your resume for AI assistance
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
              <p className="text-xs text-gray-500">{formData.bio.length}/500 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (State) *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Select
                  value={formData.location}
                  onValueChange={(value) => handleInputChange("location", value)}
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
                  onChange={(e) => handleInputChange("website", e.target.value)}
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
                  onChange={(e) => handleInputChange("profileVideoUrl", e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">
                Optional: Add a video introduction to stand out
              </p>
            </div>
          </div>

          {/* KYC Section */}
          <div className="space-y-4 mt-8 p-4 border rounded-lg bg-white/50">
            <h3 className="text-lg font-semibold text-gray-900">KYC Verification (Provider)</h3>
            <p className="text-sm text-gray-600">
              Upload a valid <strong>Passport</strong> or <strong>IC</strong> image for
              verification.
            </p>

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
                  Selected: <span className="font-medium">{kycFile.name}</span>
                </p>
              )}
            </div>

            {kycDocType === "" && (
              <p className="text-xs text-amber-600">
                Please choose <strong>Passport</strong> or <strong>IC</strong>.
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
            <h2 className="text-2xl font-bold text-gray-900">Skills & Experience</h2>
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
                    e.key === "Enter" && (e.preventDefault(), handleAddCustomSkill())
                  }
                />
                <Button type="button" onClick={handleAddCustomSkill} variant="outline">
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
                <Label className="text-sm font-medium">Popular Skills (click to add)</Label>
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
                    e.key === "Enter" && (e.preventDefault(), handleAddCustomLanguage())
                  }
                />
                <Button type="button" onClick={handleAddCustomLanguage} variant="outline">
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
                <Label className="text-sm font-medium">Common Languages (click to add)</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white/50">
                  {commonLanguages
                    .filter((language) => !selectedLanguages.includes(language))
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
                  onChange={(e) => handleInputChange("yearsExperience", e.target.value)}
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
                  onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
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
            <h2 className="text-2xl font-bold text-gray-900">Portfolio & Links</h2>
            <p className="text-gray-600">Showcase your work and professional profiles</p>
          </div>

          <div className="space-y-6">
            {/* Portfolio URLs */}
            <div className="space-y-4">
              <Label>Portfolio URLs</Label>
              <p className="text-sm text-gray-600">
                Add links to your GitHub, LinkedIn, or other professional profiles
              </p>

              <div className="flex gap-2">
                <Input
                  value={newPortfolioUrl}
                  onChange={(e) => setNewPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  type="url"
                />
                <Button type="button" onClick={handleAddPortfolioUrl} variant="outline">
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
            <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
            <p className="text-gray-600">
              Add your professional certifications (optional but recommended)
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Why add certifications?</p>
                  <p className="text-sm text-blue-700">
                    Certifications help build trust with clients and showcase your expertise in
                    specific technologies.
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
                      setNewCertification((prev: any) => ({
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
                      setNewCertification((prev: any) => ({
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
                      setNewCertification((prev: any) => ({
                        ...prev,
                        issuedDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certSerial">Serial Number (optional*)</Label>
                    <Input
                      id="certSerial"
                      placeholder="e.g. ABC-123-XYZ"
                      className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      value={newCertification.serialNumber || ""}
                      onChange={(e) =>
                        setNewCertification((prev: any) => ({
                          ...prev,
                          serialNumber: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certLink">Verification Link (optional*)</Label>
                    <Input
                      id="certLink"
                      type="url"
                      placeholder="https://verify.issuer.com/cert/ABC-123"
                      className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      value={newCertification.sourceUrl || ""}
                      onChange={(e) =>
                        setNewCertification((prev: any) => ({
                          ...prev,
                          sourceUrl: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-gray-500">
                      *At least one of Serial Number or Verification Link is required.
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
                    <div key={index} className="p-4 border rounded-lg bg-white/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Award className="w-5 h-5 text-blue-600 mr-2" />
                            <h4 className="font-medium text-gray-900">{cert.name}</h4>
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
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Review & Submit</h2>

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
      return <div>Provider step {currentStep} content</div>;
  }
};

export default ProviderRegistration;