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
} from "lucide-react";
import Link from "next/link";
import { CustomerLayout } from "@/components/customer-layout";

export default function NewProjectPage() {
  // state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget_min: "",
    budget_max: "",
    timeline: "", // stays string, now manual text
    skills: [] as string[],
    nda_required: false,
    priority: "medium",
    // NEW:
    requirements: "",
    deliverables: "",
  });

  const [aiSuggestions, setAiSuggestions] = useState({
    techStack: [] as string[],
    estimatedDuration: "",
    suggestedBudget: "",
    milestones: [] as string[],
  });

  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const categories = [
    { label: "Web Development", value: "WEB_DEVELOPMENT" },
    { label: "Mobile App Development", value: "MOBILE_APP_DEVELOPMENT" },
    { label: "Cloud Services", value: "CLOUD_SERVICES" },
    { label: "IoT Solutions", value: "IOT_SOLUTIONS" },
    { label: "Data Analytics", value: "DATA_ANALYTICS" },
    { label: "Cybersecurity", value: "CYBERSECURITY" },
    { label: "UI/UX Design", value: "UI_UX_DESIGN" },
    { label: "DevOps", value: "DEVOPS" },
    { label: "AI/ML Solutions", value: "AI_ML_SOLUTIONS" },
    { label: "System Integration", value: "SYSTEM_INTEGRATION" },
  ];

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

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    // Get customerId from localStorage user
    const user =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;
    const customerId = user?.id;

    if (!customerId) {
      setSubmitError(
        "You must be logged in as a customer to create a project."
      );
      setSubmitting(false);
      return;
    }

    // Map form fields to API fields
    const payload = {
      customerId,
      title: formData.title,
      description: formData.description,
      category: formData.category.toUpperCase(), // API expects uppercase enum
      budgetMin: Number(formData.budget_min),
      budgetMax: Number(formData.budget_max),
      timeline: formData.timeline,
      skills: formData.skills,
      priority: formData.priority,
      ndaSigned: !!formData.nda_required,
      requirements: formData.requirements, // or split into an array before send
      deliverables: formData.deliverables,
    };

    try {
      const res = await fetch("http://localhost:4000/api/service-requests/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create service request");
      }
      // Success: redirect
      window.location.href = "/customer/projects";
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create service request");
    } finally {
      setSubmitting(false);
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project in detail. What are you trying to achieve? What features do you need? Who is your target audience?"
                    className="min-h-[120px]"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget_min">Minimum Budget (RM)</Label>
                    <Input
                      id="budget_min"
                      type="number"
                      placeholder="5000"
                      value={formData.budget_min}
                      onChange={(e) =>
                        handleInputChange("budget_min", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget_max">Maximum Budget (RM)</Label>
                    <Input
                      id="budget_max"
                      type="number"
                      placeholder="15000"
                      value={formData.budget_max}
                      onChange={(e) =>
                        handleInputChange("budget_max", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Replace the Select with an Input or Textarea */}
                <div className="space-y-2">
                  <Label htmlFor="timeline">Project Timeline</Label>
                  <Input
                    id="timeline"
                    placeholder="10-12 weeks"
                    value={formData.timeline}
                    onChange={(e) =>
                      handleInputChange("timeline", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-3">
                  <Label>Required Skills</Label>
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
                </div>

                
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Must-haves, constraints, tech stack, compliance…"
                    value={formData.requirements}
                    onChange={(e) =>
                      setFormData({ ...formData, requirements: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliverables">Deliverables</Label>
                  <Textarea
                    id="deliverables"
                    placeholder="What the provider will hand over (e.g., source, docs, designs)"
                    value={formData.deliverables}
                    onChange={(e) =>
                      setFormData({ ...formData, deliverables: e.target.value })
                    }
                  />
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
                      checked={formData.nda_required}
                      onCheckedChange={(checked) =>
                        handleInputChange("nda_required", checked)
                      }
                    />
                    <Label htmlFor="nda" className="text-sm">
                      This project requires an NDA (Non-Disclosure Agreement)
                    </Label>
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

            {submitError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {submitError}
              </div>
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
                disabled={submitting}
              >
                <Zap className="w-4 h-4 mr-2" />
                {submitting ? "Submitting..." : "Find ICT Professionals"}
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
