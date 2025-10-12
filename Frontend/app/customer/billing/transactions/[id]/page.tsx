"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Download,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  DollarSign,
  FileText,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import { CustomerLayout } from "@/components/customer-layout"
import { useToast } from "@/hooks/use-toast"

export default function TransactionDetailPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Mock transaction data
  const transaction = {
    id: "TXN-001",
    type: "payment",
    description: "Payment to Ahmad Tech Solutions",
    project: "E-commerce Mobile App Development",
    amount: 5000,
    currency: "MYR",
    status: "completed",
    date: "2024-01-15T10:30:00",
    method: "Credit Card",
    reference: "REF-2024-001",
    provider: {
      name: "Ahmad Tech Solutions",
      email: "ahmad@techsolutions.my",
      phone: "+60123456789",
      company: "Ahmad Tech Solutions Sdn Bhd",
      address: "Jalan Ampang, Kuala Lumpur",
    },
    customer: {
      name: "Ahmad Rahman",
      email: "ahmad.rahman@email.com",
      phone: "+60123456789",
      company: "Tech Innovations Sdn Bhd",
      address: "Jalan Ampang, Kuala Lumpur",
    },
    milestone: "UI Design & Setup",
    invoice: "INV-001",
    paymentDetails: {
      cardType: "Visa",
      lastFour: "4242",
      fee: 100,
      tax: 0,
      subtotal: 4900,
      total: 5000,
    },
    timeline: [
      {
        status: "initiated",
        timestamp: "2024-01-15T10:30:00",
        description: "Payment initiated",
      },
      {
        status: "processing",
        timestamp: "2024-01-15T10:31:00",
        description: "Payment processing",
      },
      {
        status: "completed",
        timestamp: "2024-01-15T10:32:00",
        description: "Payment completed successfully",
      },
    ],
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "processing":
        return <Clock className="w-4 h-4" />
      case "failed":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const handleDownloadReceipt = () => {
    toast({
      title: "Downloading Receipt",
      description: "Your receipt is being downloaded.",
    })
  }

  const handleDownloadInvoice = () => {
    toast({
      title: "Downloading Invoice",
      description: "Your invoice is being downloaded.",
    })
  }

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
              <p className="text-gray-600">Transaction ID: {transaction.id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownloadReceipt}>
              <Receipt className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
            <Button variant="outline" onClick={handleDownloadInvoice}>
              <FileText className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction Amount</p>
                  <p className="text-3xl font-bold text-gray-900">RM{transaction.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(transaction.date).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${getStatusColor(transaction.status)} text-lg px-4 py-2`}>
                  {getStatusIcon(transaction.status)}
                  <span className="ml-2 capitalize">{transaction.status}</span>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Overview</CardTitle>
                <CardDescription>Complete details of this transaction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Transaction Type</p>
                    <p className="font-medium capitalize">{transaction.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reference Number</p>
                    <p className="font-medium">{transaction.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Project</p>
                    <p className="font-medium">{transaction.project}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Milestone</p>
                    <p className="font-medium">{transaction.milestone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{transaction.method}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Invoice Number</p>
                    <p className="font-medium">{transaction.invoice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Breakdown</CardTitle>
                <CardDescription>Detailed cost breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">RM{transaction.paymentDetails.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-medium">RM{transaction.paymentDetails.fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">RM{transaction.paymentDetails.tax.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between py-2">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-lg font-bold text-blue-600">
                      RM{transaction.paymentDetails.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Details */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Details</CardTitle>
                <CardDescription>Information about the payment method used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium">
                      {transaction.paymentDetails.cardType} •••• {transaction.paymentDetails.lastFour}
                    </p>
                    <p className="text-sm text-gray-500">Credit Card Payment</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Timeline</CardTitle>
                <CardDescription>Step-by-step transaction progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transaction.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            event.status === "completed"
                              ? "bg-green-100"
                              : event.status === "processing"
                                ? "bg-blue-100"
                                : "bg-gray-100"
                          }`}
                        >
                          {event.status === "completed" ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        {index < transaction.timeline.length - 1 && <div className="w-0.5 h-12 bg-gray-200 my-1" />}
                      </div>
                      <div className="flex-1 pb-8">
                        <p className="font-medium capitalize">{event.description}</p>
                        <p className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Information */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Information</CardTitle>
                <CardDescription>Details about the service provider</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.provider.name}</p>
                    <p className="text-sm text-gray-500">Service Provider</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Building className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="text-sm font-medium">{transaction.provider.company}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium">{transaction.provider.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{transaction.provider.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm font-medium">{transaction.provider.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Your billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.customer.name}</p>
                    <p className="text-sm text-gray-500">Customer</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Building className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="text-sm font-medium">{transaction.customer.company}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium">{transaction.customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{transaction.customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm font-medium">{transaction.customer.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handleDownloadReceipt}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handleDownloadInvoice}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
