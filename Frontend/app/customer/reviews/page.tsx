"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Star, Search, Filter, Plus, Calendar, MessageSquare } from "lucide-react"
import { CustomerLayout } from "@/components/customer-layout"

export default function CustomerReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false)

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      provider: {
        name: "Ahmad Tech Solutions",
        avatar: "/placeholder.svg?height=40&width=40",
        id: "provider-1",
      },
      project: {
        title: "E-commerce Mobile App Development",
        id: "project-1",
      },
      rating: 5,
      title: "Exceptional work and great communication",
      comment:
        "Ahmad delivered outstanding work on our mobile app project. His technical expertise and attention to detail exceeded our expectations. The project was completed on time and within budget. Communication was excellent throughout the entire process.",
      date: "2024-01-15",
      status: "published",
      helpful: 8,
      response: {
        comment: "Thank you for the wonderful review! It was a pleasure working with you on this project.",
        date: "2024-01-16",
      },
    },
    {
      id: 2,
      provider: {
        name: "Web Solutions Pro",
        avatar: "/placeholder.svg?height=40&width=40",
        id: "provider-2",
      },
      project: {
        title: "Company Website Redesign",
        id: "project-2",
      },
      rating: 4,
      title: "Good work with minor delays",
      comment:
        "The team did a good job on our website redesign. The final result looks professional and modern. There were some minor delays in delivery, but the quality of work made up for it. Would recommend for web development projects.",
      date: "2024-01-10",
      status: "published",
      helpful: 5,
      response: null,
    },
    {
      id: 3,
      provider: {
        name: "Digital Marketing Experts",
        avatar: "/placeholder.svg?height=40&width=40",
        id: "provider-3",
      },
      project: {
        title: "SEO Optimization Campaign",
        id: "project-3",
      },
      rating: 5,
      title: "Outstanding SEO results",
      comment:
        "Fantastic results from the SEO campaign. Our website traffic increased by 150% within 3 months. The team was professional, knowledgeable, and provided detailed reports throughout the project.",
      date: "2024-01-05",
      status: "published",
      helpful: 12,
      response: {
        comment: "We're thrilled to hear about the great results! Thank you for trusting us with your SEO needs.",
        date: "2024-01-06",
      },
    },
    {
      id: 4,
      provider: {
        name: "Cloud Solutions Inc",
        avatar: "/placeholder.svg?height=40&width=40",
        id: "provider-4",
      },
      project: {
        title: "AWS Infrastructure Setup",
        id: "project-4",
      },
      rating: 0,
      title: "",
      comment: "",
      date: "2024-01-20",
      status: "pending",
      helpful: 0,
      response: null,
    },
  ]

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.project.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || review.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case "highest":
        return b.rating - a.rating
      case "lowest":
        return a.rating - b.rating
      default:
        return 0
    }
  })

  const stats = {
    totalReviews: reviews.filter((r) => r.status === "published").length,
    averageRating:
      reviews.filter((r) => r.status === "published").reduce((acc, r) => acc + r.rating, 0) /
      reviews.filter((r) => r.status === "published").length,
    pendingReviews: reviews.filter((r) => r.status === "pending").length,
    helpfulVotes: reviews.reduce((acc, r) => acc + r.helpful, 0),
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    )
  }

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reviews & Feedback</h1>
            <p className="text-gray-600">Manage your reviews and feedback for completed projects</p>
          </div>
          <Dialog open={isWriteReviewOpen} onOpenChange={setIsWriteReviewOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogDescription>
                  Share your experience with the provider and help other customers make informed decisions.
                </DialogDescription>
              </DialogHeader>
              <WriteReviewForm onClose={() => setIsWriteReviewOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Reviews</p>
                  <p className="text-2xl font-bold">{stats.totalReviews}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Reviews</p>
                  <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Helpful Votes</p>
                  <p className="text-2xl font-bold">{stats.helpfulVotes}</p>
                </div>
                <div className="text-2xl">👍</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search reviews by provider or project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Rating</SelectItem>
                  <SelectItem value="lowest">Lowest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                {review.status === "pending" ? (
                  <PendingReviewCard review={review} />
                ) : (
                  <PublishedReviewCard review={review} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedReviews.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You haven't written any reviews yet."}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Button onClick={() => setIsWriteReviewOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Write Your First Review
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </CustomerLayout>
  )
}

function PublishedReviewCard({ review }: { review: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={review.provider.avatar || "/placeholder.svg"} />
            <AvatarFallback>{review.provider.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{review.provider.name}</h3>
            <p className="text-sm text-gray-500">{review.project.title}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">{review.title}</h4>
        <p className="text-gray-600">{review.comment}</p>
      </div>

      {review.response && (
        <div className="bg-gray-50 rounded-lg p-4 ml-8">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={review.provider.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">{review.provider.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{review.provider.name}</span>
            <span className="text-xs text-gray-500">{new Date(review.response.date).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-gray-600">{review.response.comment}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <button className="hover:text-gray-700">👍 Helpful ({review.helpful})</button>
          <Badge className="bg-green-100 text-green-800">Published</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="outline" size="sm">
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

function PendingReviewCard({ review }: { review: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={review.provider.avatar || "/placeholder.svg"} />
            <AvatarFallback>{review.provider.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{review.provider.name}</h3>
            <p className="text-sm text-gray-500">{review.project.title}</p>
          </div>
        </div>
        <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800 mb-3">
          This project is completed and ready for your review. Share your experience to help other customers.
        </p>
        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
          Write Review
        </Button>
      </div>
    </div>
  )
}

function WriteReviewForm({ onClose }: { onClose: () => void }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [selectedProject, setSelectedProject] = useState("")

  const completedProjects = [
    { id: "1", title: "E-commerce Mobile App Development", provider: "Ahmad Tech Solutions" },
    { id: "2", title: "Company Website Redesign", provider: "Web Solutions Pro" },
    { id: "3", title: "SEO Optimization Campaign", provider: "Digital Marketing Experts" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle review submission
    console.log({ rating, title, comment, selectedProject })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="project">Select Project</Label>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a completed project" />
          </SelectTrigger>
          <SelectContent>
            {completedProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title} - {project.provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Rating</Label>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 cursor-pointer ${
                  star <= rating ? "text-yellow-400 fill-current" : "text-gray-300 hover:text-yellow-400"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">{rating > 0 && `${rating} star${rating > 1 ? "s" : ""}`}</span>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Review Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience in a few words"
        />
      </div>

      <div>
        <Label htmlFor="comment">Your Review</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your detailed experience working with this provider..."
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!rating || !title || !comment || !selectedProject}>
          Submit Review
        </Button>
      </div>
    </form>
  )
}
