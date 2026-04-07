"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SemesterFeePage() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [form, setForm] = useState({
    courseCode: "",
    semester: "",
    totalFees: "",
  });

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/semesterFees", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) setFees(data.data);
      else throw new Error(data.message || "Failed to fetch fees");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to fetch fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.courseCode || !form.semester || !form.totalFees) {
      toast.error("All fields are required");
      return;
    }

    try {
      const res = await fetch("/api/admin/semesterFees", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to add fee");

      toast.success(data.message || "Fee added successfully");
      setForm({ courseCode: "", semester: "", totalFees: "" });
      fetchFees();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to add fee");
    }
  };

  const handleUpdate = async (fee) => {
    const newFees = prompt("Enter new total fees", fee.totalFees);
    if (!newFees || isNaN(Number(newFees)) || Number(newFees) <= 0) {
      if (newFees !== null) toast.error("Please enter a valid fee amount");
      return;
    }

    try {
      const res = await fetch("/api/admin/semesterFees", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: fee.courseCode,
          semester: fee.semester,
          totalFees: newFees,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update fee");

      toast.success(data.message || "Fee updated successfully");
      fetchFees();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update fee");
    }
  };

  const handleDelete = async (fee) => {
    setDeletingId(`${fee.courseCode}-${fee.semester}`);

    try {
      const res = await fetch("/api/admin/semesterFees", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: fee.courseCode,
          semester: fee.semester,
        }),
      });

      const data = await res.json();
      if (!res.ok) toast.error(data.message || "Failed to delete fee");

      toast.success(data.message || "Fee record deleted successfully");
      fetchFees();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to delete fee");
    } finally {
      setDeletingId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const getFeeId = (fee) => `${fee.courseCode}-${fee.semester}`;

  return (
    <div className="flex flex-col mx-2 py-6 space-y-6 px-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Semester Fee Management
        </h1>
        <p className="text-muted-foreground">
          Manage course semester fees and payment structures
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Fee Structure</CardTitle>
          <CardDescription>
            Enter course details and associated semester fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="md:col-span-1 space-y-1.5">
              <Label htmlFor="courseCode">Course Code</Label>
              <Input
                id="courseCode"
                name="courseCode"
                value={form.courseCode}
                onChange={handleChange}
                placeholder="e.g. BCA, MCA"
                required
              />
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                name="semester"
                type="number"
                min="1"
                value={form.semester}
                onChange={handleChange}
                placeholder="1-8"
                required
              />
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <Label htmlFor="totalFees">Total Fees (₹)</Label>
              <Input
                id="totalFees"
                name="totalFees"
                type="number"
                min="0"
                value={form.totalFees}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add Fee Structure"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>
            View and manage all semester fee structures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px] text-center">
                    Course Code
                  </TableHead>
                  <TableHead className="text-center">Semester</TableHead>
                  <TableHead className="text-center">Total Fees (₹)</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}>
                          <div className="flex items-center justify-between p-4">
                            <Skeleton className="h-6 w-[100px]" />
                            <Skeleton className="h-6 w-[80px]" />
                            <Skeleton className="h-6 w-[100px]" />
                            <div className="flex gap-2">
                              <Skeleton className="h-8 w-[70px]" />
                              <Skeleton className="h-8 w-[70px]" />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : fees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          No fee records found. Add a new fee structure to get
                          started.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  fees.map((fee) => (
                    <TableRow key={getFeeId(fee)}>
                      <TableCell className="font-medium text-center">
                        {fee.courseCode}
                      </TableCell>
                      <TableCell className="text-center">
                        {fee.semester}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        ₹
                        {Number(fee.totalFees).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdate(fee)}
                            disabled={deletingId === getFeeId(fee)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog
                            open={
                              isDeleteDialogOpen && deletingId === getFeeId(fee)
                            }
                            onOpenChange={(open) => {
                              if (!open) setDeletingId(null);
                              setIsDeleteDialogOpen(open);
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deletingId === getFeeId(fee)}
                                onClick={() => {
                                  setDeletingId(getFeeId(fee));
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                {deletingId === getFeeId(fee)
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the fee record for{" "}
                                  <span className="font-medium">
                                    {fee.courseCode} Semester {fee.semester}
                                  </span>
                                  .
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => setDeletingId(null)}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(fee)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
