"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Lightbulb,
  Zap,
  Clock,
  Shield,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { CustomerLayout } from "@/components/customer-layout";
import { createProject } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { buildTimelineData } from "@/lib/timeline-utils";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budgetMin: "",
    budgetMax: "",
    timelineAmount: "",
    timelineUnit: "" as "day" | "week" | "month" | "",
    skills: [] as string[],
    ndaSigned: false,
    priority: "medium",
    requirements: "",
    deliverables: "",
  });

  const [newSkill, setNewSkill] = useState("");

  const [aiSuggestions, setAiSuggestions] = useState({
    techStack: [] as string[],
    estimatedDuration: "",
    suggestedBudget: "",
    milestones: [] as string[],
  });

  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  const [errors, setErrors] = useState<{
    title?: string;
    category?: string;
    description?: string;
    budgetMin?: string;
    budgetMax?: string;
    timelineAmount?: string;
    timelineUnit?: string;
  }>({});

  // categories the user can pick from
  const [categories, setCategories] = useState([
    { value: "WEB_DEVELOPMENT", label: "Web Development" },
    { value: "MOBILE_APP_DEVELOPMENT", label: "Mobile App Development" },
    { value: "CLOUD_SERVICES", label: "Cloud Services" },
    { value: "IOT_SOLUTIONS", label: "IoT Solutions" },
    { value: "DATA_ANALYTICS", label: "Data Analytics" },
    { value: "CYBERSECURITY", label: "Cybersecurity" },
    { value: "UI_UX_DESIGN", label: "UI/UX Design" },
    { value: "DEVOPS", label: "DevOps" },
    { value: "AI_ML_SOLUTIONS", label: "AI/ML Solutions" },
    { value: "SYSTEM_INTEGRATION", label: "System Integration" },
  ]);

  // temporary text field for custom category
  const [newCategory, setNewCategory] = useState("");

  const skillOptions = [
    "React",
    "Next.js",
    "Vue.js",
    "Angular",
    "React Native",
    "Flutter",
    "iOS",
    "Android",
    "Node.js",
    "Python",
    "Java",
    "PHP",
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "UI/UX Design",
    "Figma",
    "Adobe XD",
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleAddCustomSkill = () => {
    const cleaned = newSkill.trim();

    // block empty, block duplicates (case-insensitive)
    if (!cleaned) return;

    const alreadyExists = formData.skills.some(
      (s) => s.toLowerCase() === cleaned.toLowerCase()
    );

    if (!alreadyExists) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, cleaned],
      }));
    }

    setNewSkill("");
  };

  const handleAddCustomCategory = () => {
    const cleaned = newCategory.trim();
    if (!cleaned) return;

    // We'll store custom category using the raw text as both value and label.
    // Why? Because backend already falls back to using the provided string
    // if it doesn't match a known map. :contentReference[oaicite:2]{index=2}
    const newOption = {
      value: cleaned,
      label: cleaned,
    };

    // Check if it already exists (case-insensitive compare on label)
    const exists = categories.some(
      (c) => c.label.toLowerCase() === cleaned.toLowerCase()
    );
    if (!exists) {
      setCategories((prev) => [...prev, newOption]);
    }

    // Also set this as the active form category
    setFormData((prev) => ({
      ...prev,
      category: newOption.value,
    }));

    // Clear the input
    setNewCategory("");
  };

  const generateAiSuggestions = () => {
    // Simulate AI suggestions based on form data
    setAiSuggestions({
      techStack: ["React", "Node.js", "MongoDB", "AWS"],
      estimatedDuration: "8-12 weeks",
      suggestedBudget: "RM 12,000 - RM 18,000",
      milestones: [
        "Project Planning & Design",
        "Frontend Development",
        "Backend Development",
        "Testing & Deployment",
      ],
    });
    setShowAiSuggestions(true);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Required text fields
    if (!formData.title.trim()) {
      newErrors.title = "Project title is required.";
    }
    if (!formData.category.trim()) {
      newErrors.category = "Please select a category.";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Project description is required.";
    }

    // Budget checks
    const minVal = Number(formData.budgetMin);
    const maxVal = Number(formData.budgetMax);

    if (!formData.budgetMin) {
      newErrors.budgetMin = "Minimum budget is required.";
    } else if (isNaN(minVal) || minVal <= 0) {
      newErrors.budgetMin = "Minimum budget must be a positive number.";
    }

    if (!formData.budgetMax) {
      newErrors.budgetMax = "Maximum budget is required.";
    } else if (isNaN(maxVal) || maxVal <= 0) {
      newErrors.budgetMax = "Maximum budget must be a positive number.";
    }

    // Relationship rule: min < max
    if (!newErrors.budgetMin && !newErrors.budgetMax) {
      if (minVal >= maxVal) {
        newErrors.budgetMax =
          "Maximum budget must be greater than minimum budget.";
      }
    }

    // Timeline check
    const timelineAmountNum = Number(formData.timelineAmount);
    if (!formData.timelineAmount) {
      newErrors.timelineAmount = "Timeline amount is required.";
    } else if (isNaN(timelineAmountNum) || timelineAmountNum <= 0) {
      newErrors.timelineAmount = "Timeline amount must be greater than 0.";
    }

    if (!formData.timelineUnit) {
      newErrors.timelineUnit = "Timeline unit is required.";
    }

    setErrors(newErrors);

    // valid if no keys in newErrors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const toLines = (s: string) =>
      s
        .split(/\r?\n/)
        .map((x) => x.trim())
        .filter(Boolean);

    // Run client validation
    const isValid = validateForm();
    if (!isValid) {
      toast({
        title: "Please fix the form",
        description: "Some fields need your attention.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Build timeline data from amount and unit
      const { timeline, timelineInDays } = buildTimelineData(
        Number(formData.timelineAmount),
        formData.timelineUnit
      );

      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        budgetMin: Number(formData.budgetMin),
        budgetMax: Number(formData.budgetMax),
        timeline,
        timelineInDays,
        priority: formData.priority,
        skills: formData.skills,
        ndaSigned: formData.ndaSigned,
        requirements: toLines(formData.requirements),
        deliverables: toLines(formData.deliverables),
      };

      const response = await createProject(projectData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Service request created successfully!",
        });
        router.push("/customer/projects");
      } else {
        throw new Error(response.message || "Failed to create service request");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create service request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/customer/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Project
            </h1>
            <p className="text-gray-600">
              Tell us about your ICT project and we'll find the perfect match
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Provide clear information about your project requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., E-commerce Mobile App Development"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={
                      errors.title
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {errors.title && (
                    <p className="text-xs text-red-600">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="category">Category</Label>

                  {/* 1) Pick an existing category */}
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger
                      className={
                        errors.category
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select project category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span>or create your own</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* 2) Add a new custom category */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. POS Integration for Retail"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomCategory();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddCustomCategory}
                    >
                      Add
                    </Button>
                  </div>

                  {errors.category && (
                    <p className="text-xs text-red-600">{errors.category}</p>
                  )}

                  <p className="text-xs text-gray-500">
                    Choose a category OR type a new one. This helps us match you
                    with the right providers.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project in detail..."
                    className={`min-h-[120px] ${
                      errors.description
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                  />
                  {errors.description && (
                    <p className="text-xs text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Minimum Budget (RM)</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      placeholder="5000"
                      value={formData.budgetMin}
                      onChange={(e) =>
                        handleInputChange("budgetMin", e.target.value)
                      }
                      className={
                        errors.budgetMin
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {errors.budgetMin && (
                      <p className="text-xs text-red-600">{errors.budgetMin}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Maximum Budget (RM)</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      placeholder="15000"
                      value={formData.budgetMax}
                      onChange={(e) =>
                        handleInputChange("budgetMax", e.target.value)
                      }
                      className={
                        errors.budgetMax
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {errors.budgetMax && (
                      <p className="text-xs text-red-600">{errors.budgetMax}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Project Timeline *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="timelineAmount"
                      type="number"
                      placeholder="e.g. 2"
                      min="1"
                      value={formData.timelineAmount}
                      onChange={(e) =>
                        handleInputChange("timelineAmount", e.target.value)
                      }
                      className={
                        errors.timelineAmount
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    <Select
                      value={formData.timelineUnit}
                      onValueChange={(value: "day" | "week" | "month") =>
                        handleInputChange("timelineUnit", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.timelineUnit
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day(s)</SelectItem>
                        <SelectItem value="week">Week(s)</SelectItem>
                        <SelectItem value="month">Month(s)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.timelineAmount && (
                    <p className="text-xs text-red-600">
                      {errors.timelineAmount}
                    </p>
                  )}
                  {errors.timelineUnit && (
                    <p className="text-xs text-red-600">
                      {errors.timelineUnit}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Required Skills</Label>

                  {/* Selected skills preview */}
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="default"
                          className="cursor-pointer"
                          onClick={() => handleSkillToggle(skill)}
                          title="Click to remove"
                        >
                          {skill} ✕
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Preset skills to click/toggle */}
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => (
                      <Badge
                        key={skill}
                        variant={
                          formData.skills.includes(skill)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => handleSkillToggle(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Add custom skill */}
                  <div className="flex items-center gap-2">
                    <Input
                      value={newSkill}
                      placeholder="Add a required skill (e.g. Laravel, PenTesting, POS integration)"
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddCustomSkill}
                    >
                      Add
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Click a badge to select / unselect. You can also type your
                    own skill and press Enter.
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Additional Options</h3>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Project Priority</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("priority", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          Low - Flexible timeline
                        </SelectItem>
                        <SelectItem value="medium">
                          Medium - Standard timeline
                        </SelectItem>
                        <SelectItem value="high">
                          High - Urgent delivery
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nda"
                      checked={formData.ndaSigned}
                      onCheckedChange={(checked) =>
                        handleInputChange("ndaSigned", checked)
                      }
                    />
                    <Label htmlFor="nda" className="text-sm">
                      This project requires an NDA (Non-Disclosure Agreement)
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">
                      Requirements (one per line)
                    </Label>
                    <Textarea
                      id="requirements"
                      placeholder={
                        "Cross-platform app\nUser auth\nPayment integration"
                      }
                      value={formData.requirements}
                      onChange={(e) =>
                        handleInputChange("requirements", e.target.value)
                      }
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliverables">
                      Deliverables (one per line)
                    </Label>
                    <Textarea
                      id="deliverables"
                      placeholder={
                        "Source code\nAdmin panel\nAPI docs\nDeployment guide"
                      }
                      value={formData.deliverables}
                      onChange={(e) =>
                        handleInputChange("deliverables", e.target.value)
                      }
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            {showAiSuggestions && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-blue-900">
                      AI Project Insights
                    </CardTitle>
                  </div>
                  <CardDescription className="text-blue-700">
                    Based on your project description, here are our AI-powered
                    recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Recommended Tech Stack
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {aiSuggestions.techStack.map((tech) => (
                          <Badge
                            key={tech}
                            className="bg-blue-100 text-blue-800"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Estimated Duration
                      </h4>
                      <p className="text-blue-800">
                        {aiSuggestions.estimatedDuration}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Suggested Budget Range
                    </h4>
                    <p className="text-blue-800">
                      {aiSuggestions.suggestedBudget}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Recommended Milestones
                    </h4>
                    <ul className="space-y-1">
                      {aiSuggestions.milestones.map((milestone, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-blue-800"
                        >
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button
                onClick={generateAiSuggestions}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Get AI Suggestions
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                {loading ? "Creating..." : "Find ICT Professionals"}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Project Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold text-sm">Escrow Payment</h4>
                    <p className="text-xs text-gray-600">
                      Your payment is held securely until milestones are
                      completed
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold text-sm">
                      Verified Professionals
                    </h4>
                    <p className="text-xs text-gray-600">
                      All providers undergo KYC and skill verification
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold text-sm">
                      Dispute Resolution
                    </h4>
                    <p className="text-xs text-gray-600">
                      24/7 support and mediation services
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  What Happens Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">AI Matching</h4>
                    <p className="text-xs text-gray-600">
                      Our AI finds the best professionals for your project
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Review Proposals</h4>
                    <p className="text-xs text-gray-600">
                      Compare profiles, portfolios, and proposals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Start Project</h4>
                    <p className="text-xs text-gray-600">
                      Choose your provider and begin collaboration
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Tips for Success
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p className="font-medium">
                    Be specific about your requirements
                  </p>
                  <p className="text-gray-600 text-xs">
                    Clear project descriptions get better matches and proposals
                  </p>
                </div>
                <div className="text-sm space-y-2">
                  <p className="font-medium">Set realistic budgets</p>
                  <p className="text-gray-600 text-xs">
                    Quality work requires fair compensation
                  </p>
                </div>
                <div className="text-sm space-y-2">
                  <p className="font-medium">Include examples or references</p>
                  <p className="text-gray-600 text-xs">
                    Visual references help professionals understand your vision
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
