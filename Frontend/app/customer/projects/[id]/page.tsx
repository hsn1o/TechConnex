"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  DollarSign,
  Users,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Download,
  Edit,
  MoreHorizontal,
  Eye,
  Send,
} from "lucide-react";
import { CustomerLayout } from "@/components/customer-layout";
import React from "react";

export default function ProjectDetailsPage({ params }: { params: any }) {
  const { id } = React.use(params) as { id: string };
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:4000/api/projects/view/${id}`
        );
        const data = await res.json();
        setProject(data.project);
      } catch (err: any) {
        setError(err.message || "Failed to fetch project.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }
  if (error || !project) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-600">
            {error || "Project not found."}
          </div>
        </div>
      </CustomerLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "on_hold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "pending":
        return "Pending";
      case "on_hold":
        return "On Hold";
      default:
        return status;
    }
  };

  const getMilestoneStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {project.title}
              </h1>
              <Badge className={getStatusColor(project.status)}>
                {getStatusText(project.status)}
              </Badge>
              {project.priority === "high" && (
                <Badge variant="destructive">High Priority</Badge>
              )}
              {project.isFeatured && (
                <Badge className="bg-purple-100 text-purple-800">
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {project.viewCount} views
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {project.bidCount} bids
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Project
            </Button>
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Provider
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="text-2xl font-bold">
                    {project.currency}{" "}
                    {typeof project.budgetMin === "number"
                      ? project.budgetMin.toLocaleString()
                      : "-"}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Spent</p>
                  <p className="text-2xl font-bold">
                    {project.currency}{" "}
                    {typeof project.spent === "number"
                      ? project.spent.toLocaleString()
                      : "-"}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Progress</p>
                  <p className="text-2xl font-bold">{project.progress}%</p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center">
                  <div
                    className="w-8 h-8 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"
                    style={{ animationDuration: "2s" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Days Left</p>
                  <p className="text-2xl font-bold">
                    {Math.ceil(
                      (new Date(project.endDate).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {project.status === "in_progress" && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Overall Progress</h3>
                <span className="text-sm text-gray-500">
                  {project.progress}% Complete
                </span>
              </div>
              <Progress value={project.progress} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Assigned Provider */}
        {project.provider && (
          <Card>
            <CardHeader>
              <CardTitle>Assigned Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={project.provider.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {project.provider.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{project.provider.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{project.provider.rating}</span>
                      </div>
                      <span>•</span>
                      <span>
                        {/* {project.assignedProvider.completedJobs} jobs completed */}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="bids">Bids</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Category</h4>
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <p className="text-gray-600">{project.location}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Timeline</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.startDate).toLocaleDateString()} -{" "}
                      {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(project.skills) &&
                        project.skills.map((skill: any) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {Array.isArray(project.requirements) &&
                      project.requirements.map((req: any, index: any) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Array.isArray(project.deliverables) &&
                    project.deliverables.map((deliverable: any, index: any) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
                <CardDescription>
                  Track progress through key project milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Array.isArray(project.milestones) &&
                    project.milestones.map((milestone: any, index: any) => (
                      <div key={milestone.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {getMilestoneStatusIcon(milestone.status)}
                          {index < project.milestones.length - 1 && (
                            <div className="w-px h-16 bg-gray-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{milestone.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getStatusColor(milestone.status)}
                              >
                                {getStatusText(milestone.status)}
                              </Badge>
                              <span className="text-sm font-medium">
                                {typeof milestone.amount === "number"
                                  ? milestone.amount.toLocaleString()
                                  : "-"}{" "}
                                {project.currency}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-2">
                            {milestone.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Due:{" "}
                              {new Date(milestone.dueDate).toLocaleDateString()}
                            </div>
                            {milestone.completedAt && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Completed:{" "}
                                {new Date(
                                  milestone.completedAt
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          {milestone.status === "in_progress" &&
                            milestone.progress && (
                              <div className="mt-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progress</span>
                                  <span>{milestone.progress}%</span>
                                </div>
                                <Progress
                                  value={milestone.progress}
                                  className="h-2"
                                />
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bids Tab */}
          <TabsContent value="bids" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Received Bids ({project.bids?.length ?? 0})
                </CardTitle>
                <CardDescription>
                  Review and manage bids from providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Array.isArray(project.bids) &&
                    project.bids.map((bid: any) => (
                      <div key={bid.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage
                                src={bid.provider.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {bid.provider.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">
                                {bid.provider.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span>{bid.provider.rating}</span>
                                </div>
                                <span>•</span>
                                <span>{bid.provider.completedJobs} jobs</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {project.currency}{" "}
                              {typeof bid.amount === "number"
                                ? bid.amount.toLocaleString()
                                : "-"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {bid.timeline}
                            </div>
                            <Badge
                              className={
                                bid.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : bid.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {bid.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{bid.proposal}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Submitted:{" "}
                            {new Date(bid.submittedAt).toLocaleDateString()}
                          </span>
                          {bid.status === "pending" && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                Message
                              </Button>
                              <Button size="sm" variant="outline">
                                Reject
                              </Button>
                              <Button size="sm">Accept</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Files</CardTitle>
                <CardDescription>
                  Documents and files related to this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(project.files) &&
                    project.files.map((file: any) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {file.size} • Uploaded{" "}
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Messages</CardTitle>
                <CardDescription>
                  Communication with your assigned provider
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Array.isArray(project.messages) &&
                    project.messages.map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender === "You" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {message.sender.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`flex-1 max-w-xs ${
                            message.sender === "You" ? "text-right" : ""
                          }`}
                        >
                          <div
                            className={`p-3 rounded-lg ${
                              message.sender === "You"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100"
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            {message.attachments &&
                              Array.isArray(message.attachments) &&
                              message.attachments.map(
                                (attachment: any, index: any) => (
                                  <div
                                    key={index}
                                    className="text-xs opacity-75"
                                  >
                                    📎 {attachment}
                                  </div>
                                )
                              )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
                <Separator className="my-4" />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
}
