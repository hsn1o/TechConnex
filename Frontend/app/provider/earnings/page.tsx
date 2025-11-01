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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  CreditCard,
  Wallet,
  PieChart,
  BarChart3,
} from "lucide-react";
import { ProviderLayout } from "@/components/provider-layout";

export default function ProviderEarningsPage() {
  const [timeFilter, setTimeFilter] = useState("this-month");
  const [earningsData, setEarningsData] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState("");
  const handleWithdraw = async () => {
    if (!selectedBank) {
      alert("Please select a bank account");
      return;
    }

    if (withdrawAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > earningsData.availableBalance) {
      alert("Amount exceeds available balance");
      return;
    }

    setIsWithdrawing(true);
    setWithdrawMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/withdraw`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: withdrawAmount,
            bank: selectedBank,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Withdrawal failed");

      setWithdrawMessage(
        `✅ Withdrawal requested successfully! Payout ID: ${data.payoutId}`
      );
      // Optionally refresh earnings data
    } catch (err: any) {
      console.error(err);
      setWithdrawMessage(`❌ ${err.message}`);
    } finally {
      setIsWithdrawing(false);
    }
  };

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("⚠️ No token found");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/provider/earnings`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setEarningsData(data.earningsData);
        setRecentPayments(data.recentPayments);
      } catch (err) {
        console.error("❌ Failed to fetch earnings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <ProviderLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading earnings...</p>
        </div>
      </ProviderLayout>
    );
  }

  if (!earningsData) {
    return (
      <ProviderLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No earnings data found.</p>
        </div>
      </ProviderLayout>
    );
  }
  const hasStripeAccount = !!earningsData.stripeAccountId;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "released":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "released":
        return "Paid";
      case "pending":
        return "Pending";
      case "in_progress":
        return "Processing";
      default:
        return status;
    }
  };

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
            <p className="text-gray-600">
              Track your income and payment history
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    RM{earningsData.totalEarnings.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    RM{earningsData.thisMonth.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">
                      +{earningsData.monthlyGrowth}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Payments
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    RM{earningsData.pendingPayments.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Available Balance
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    RM{earningsData.availableBalance.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Monthly Earnings Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Monthly Earnings Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* {monthlyEarnings.map((month, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            <span className="font-medium">{month.month}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">{month.projects} projects</span>
                            <span className="font-semibold">RM{month.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))} */}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Payments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                    <CardDescription>
                      Your latest payment transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPayments.slice(0, 4).map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage
                                src={payment.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {payment.client.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{payment.project}</p>
                              <p className="text-sm text-gray-600">
                                {payment.client}
                              </p>
                              <p className="text-xs text-gray-500">
                                {payment.milestone}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              RM{payment.amount.toLocaleString()}
                            </p>
                            <Badge className={getStatusColor(payment.status)}>
                              {getStatusText(payment.status)}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {payment.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Average Project Value
                      </span>
                      <span className="font-semibold">
                        RM{earningsData.averageProjectValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Projects This Month
                      </span>
                      <span className="font-semibold">6</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Success Rate
                      </span>
                      <span className="font-semibold">98%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Repeat Clients
                      </span>
                      <span className="font-semibold">67%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Clients */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Clients</CardTitle>
                    <CardDescription>
                      Clients with highest total payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* {topClients.map((client, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={client.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{client.name}</p>
                            <p className="text-sm text-gray-500">{client.projects} projects</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">RM{client.totalPaid.toLocaleString()}</p>
                          </div>
                        </div>
                      ))} */}
                    </div>
                  </CardContent>
                </Card>

                {/* Withdraw Balance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Available Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div>
                        <p className="text-3xl font-bold text-green-600">
                          RM{earningsData.availableBalance.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Ready to withdraw
                        </p>
                      </div>
                      <Button className="w-full">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Withdraw Funds
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Payment History */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  Complete history of all your payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage
                            src={payment.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {payment.client.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{payment.project}</p>
                          <p className="text-sm text-gray-600">
                            {payment.client}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.milestone} • {payment.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold">
                            RM{payment.amount.toLocaleString()}
                          </p>
                          <Badge className={getStatusColor(payment.status)}>
                            {getStatusText(payment.status)}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Earnings by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm">Web Development</span>
                      </div>
                      <span className="font-semibold">RM45,200 (53%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm">Mobile Development</span>
                      </div>
                      <span className="font-semibold">RM25,800 (30%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <span className="text-sm">Cloud Services</span>
                      </div>
                      <span className="font-semibold">RM14,000 (17%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Project Completion Rate
                      </span>
                      <span className="font-semibold">98%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        On-time Delivery
                      </span>
                      <span className="font-semibold">94%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Client Satisfaction
                      </span>
                      <span className="font-semibold">4.9/5.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Response Time
                      </span>
                      <span className="font-semibold">2.3 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Withdraw */}
          <TabsContent value="withdraw">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Withdraw Funds</CardTitle>
                  <CardDescription>
                    Transfer your earnings to your bank account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">
                          Available Balance
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          RM{earningsData.availableBalance.toLocaleString()}
                        </p>
                      </div>
                      <Wallet className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bank Account
                      </label>

                      {hasStripeAccount ? (
                        <Select
                          value={selectedBank || ""}
                          onValueChange={setSelectedBank}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select bank account" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maybank">
                              Maybank - ****1234
                            </SelectItem>
                            <SelectItem value="cimb">
                              CIMB Bank - ****5678
                            </SelectItem>
                            <SelectItem value="public">
                              Public Bank - ****9012
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                          ⚠️ You need to connect your Stripe account before
                          withdrawing funds.
                        </div>
                      )}

                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) =>
                          setWithdrawAmount(Number(e.target.value))
                        }
                        className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                        placeholder="0.00"
                        max={earningsData.availableBalance}
                        disabled={!hasStripeAccount}
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Withdrawal Information
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Processing time: 1-3 business days</li>
                        <li>• No withdrawal fees for amounts above RM100</li>
                        <li>• Minimum withdrawal amount: RM50</li>
                      </ul>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleWithdraw}
                      disabled={isWithdrawing || !hasStripeAccount}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {isWithdrawing ? "Processing..." : "Request Withdrawal"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProviderLayout>
  );
}
