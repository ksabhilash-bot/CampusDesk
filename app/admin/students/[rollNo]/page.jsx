"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Pencil,
  RefreshCw,
  IndianRupee,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rollNo = params?.rollNo;

  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit student dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    isConcession: false,
  });

  // Update fee dialog
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [feeToUpdate, setFeeToUpdate] = useState(null);
  const [feeForm, setFeeForm] = useState({
    amountPaid: "",
    status: "pending",
  });

  // Fetch student data
  const fetchStudentData = async () => {
    if (!rollNo) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/student/${rollNo}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Failed to fetch student details");
      }

      const data = await res.json();

      setStudent(data.student);

      setPayments(data.payments || []);

      setFees(data.fees || []);

      // Initialize edit form
      if (data.student) {
        setEditForm({
          name: data.student.name || "",
          email: data.student.email || "",
          phone: data.student.phone || "",

          isConcession: data.student.isConcession ?? false,
        });
      }

      toast.success("Student data loaded successfully");
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.message || "Failed to load student details");
      router.push("/admin/students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rollNo) {
      fetchStudentData();
    }
  }, [rollNo]);

  // Handle student update
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/student/${rollNo}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (!res.ok) toast.error(data.message || "Failed to update student");

      toast.success("Student details updated successfully");
      setIsEditDialogOpen(false);
      fetchStudentData();
    } catch (err) {
      toast.error(err.message || "Failed to update student details");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle fee status update
  const handleUpdateFee = async () => {
    if (!feeToUpdate) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/student/${rollNo}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semester: feeToUpdate.semester,
          amountPaid: parseFloat(feeForm.amountPaid),
          status: feeForm.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) toast.error(data.message || "Failed to update fee status");

      toast.success(
        `Semester ${feeToUpdate.semester} fee updated successfully`,
      );
      setIsFeeDialogOpen(false);
      setFeeToUpdate(null);
      fetchStudentData();
    } catch (err) {
      toast.error(err.message || "Failed to update fee status");
    } finally {
      setActionLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    const variants = {
      paid: { variant: "default", icon: CheckCircle, label: "Paid" },
      pending: { variant: "secondary", icon: Clock, label: "Pending" },
      partial: { variant: "warning", icon: IndianRupee, label: "Partial" },
      waived: { variant: "outline", icon: XCircle, label: "Waived" },
    };
    return variants[status?.toLowerCase()] || variants.pending;
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-6 px-3">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            Student not found. Redirecting to students list...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Details</h1>
          <p className="text-muted-foreground">
            Comprehensive view of student records and financial status
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/students")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
          <Button onClick={() => fetchStudentData} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl">{student.name}</CardTitle>
            <CardDescription>Roll No: {student.rollNo}</CardDescription>
            <CardDescription className="flex items-center gap-2">
              Concession:
              <Badge variant={student.isConcession ? "success" : "secondary"}>
                {student.isConcession ? "Yes" : "No"}
              </Badge>
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditForm({
                name: student.name,
                email: student.email,
                phone: student.phone,
              });
              setIsEditDialogOpen(true);
            }}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit Details
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Email</span>
              <p className="font-medium">{student.email}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Phone</span>
              <p className="font-medium">{student.phone}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Course</span>
              <p className="font-medium">{student.courseCode}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Session</span>
              <p className="font-medium">
                {student.sessionStartYear} - {student.sessionEndYear}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Fees and Payments */}
      <Tabs defaultValue="fees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fees" className="gap-2">
            <IndianRupee className="h-4 w-4" />
            Fee Structure
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payment History
          </TabsTrigger>
        </TabsList>

        {/* Fee Structure Tab */}
        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Semester Fee Status</CardTitle>
              <CardDescription>
                Track payment status for each semester
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-25 text-center">
                        Semester
                      </TableHead>
                      <TableHead className="text-right">Total Fees</TableHead>
                      <TableHead className="text-right">Amount Paid</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <AlertCircle className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              No fee records found for this student
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      fees.map((fee) => {
                        const statusConfig = getStatusBadge(fee.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                          <TableRow key={fee.semester}>
                            <TableCell className="font-medium text-center">
                              {fee.semester}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(fee.SemesterFees)}
                            </TableCell>
                            <TableCell className="text-right">
                              {fee.amountPaid > 0
                                ? formatCurrency(fee.amountPaid)
                                : "-"}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={statusConfig.variant}
                                className="gap-1"
                              >
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFeeToUpdate(fee);
                                  setFeeForm({
                                    amountPaid:
                                      fee.amountPaid?.toString() || "0",
                                    status: fee.status || "pending",
                                  });
                                  setIsFeeDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>
                Complete history of all payments made by the student
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>RazorpayOrder ID</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <CreditCard className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              No payment records found
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => {
                        const statusConfig = getStatusBadge(payment.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                          <TableRow key={payment._id}>
                            <TableCell>
                              {payment.updatedAt
                                ? format(
                                    new Date(payment.updatedAt),
                                    "dd MMM yyyy",
                                  )
                                : "-"}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {payment.razorpayOrderId || "N/A"}
                            </TableCell>
                            <TableCell className="text-center">
                              {payment.semester || "-"}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={statusConfig.variant}
                                className="gap-1"
                              >
                                <StatusIcon className="h-3 w-3" />
                                {payment.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
            <DialogDescription>
              Update the student's personal information. Click save when done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStudent} className="grid gap-4 py-4">
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="isConcession" className="text-right">
                Concession
              </Label>

              <Select
                value={editForm.isConcession ? "yes" : "no"}
                onValueChange={(value) =>
                  setEditForm({
                    ...editForm,
                    isConcession: value === "yes",
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select concession status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleUpdateStudent}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Fee Dialog */}
      <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>
              Update Semester {feeToUpdate?.semester} Fee
            </DialogTitle>
            <DialogDescription>
              Modify payment status and amount for this semester
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amountPaid" className="text-right">
                Amount Paid
              </Label>
              <Input
                id="amountPaid"
                type="number"
                min="0"
                value={feeForm.amountPaid}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, amountPaid: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={feeForm.status}
                onValueChange={(value) =>
                  setFeeForm({ ...feeForm, status: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial Payment</SelectItem>
                  <SelectItem value="waived">Waived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-1">Current Balance:</p>
              <p>
                {feeToUpdate?.SemesterFees
                  ? formatCurrency(
                      feeToUpdate.SemesterFees -
                        parseFloat(feeForm.amountPaid || 0),
                    )
                  : "N/A"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdateFee}
              disabled={actionLoading}
              className="w-full"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Fee Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Required Lucide React icons
const ArrowLeft = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const CreditCard = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);
