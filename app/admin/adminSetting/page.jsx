"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trash2, ShieldCheck, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    superAdmin: false,
  });

  // Fetch admins on mount
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/createAdmin", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to fetch admins");
      }

      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error("Fetch admins error:", err);
      toast.error(err.message || "Failed to load admins");
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!emailRegex.test(form.email.trim())) {
      toast.error("Invalid email format");
      return false;
    }

    if (!form.password.trim()) {
      toast.error("Password is required");
      return false;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const res = await fetch("/api/admin/createAdmin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password.trim(),
          superAdmin: form.superAdmin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create admin");
      }

      toast.success("Admin created successfully!");
      setForm({ email: "", password: "", superAdmin: false });
      fetchAdmins();
    } catch (err) {
      console.error("Create admin error:", err);
      toast.error(err.message || "Failed to create admin");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.email) return;

    setDeletingEmail(deleteTarget.email);

    try {
      const res = await fetch("/api/admin/createAdmin", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: deleteTarget.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete admin");
      }

      toast.success("Admin deleted successfully");
      fetchAdmins();
    } catch (err) {
      console.error("Delete admin error:", err);
      toast.error(err.message || "Failed to delete admin");
    } finally {
      setDeletingEmail(null);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="container py-6 space-y-6 px-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
        <p className="text-muted-foreground">
          Create and manage administrator accounts with role-based permissions
        </p>
      </div>

      {/* Create Admin Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Admin</CardTitle>
          <CardDescription>
            Add a new administrator account with appropriate permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="md:col-span-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
                disabled={formLoading}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
                disabled={formLoading}
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="superAdmin"
                  name="superAdmin"
                  checked={form.superAdmin}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, superAdmin: checked }))
                  }
                  disabled={formLoading}
                />
                <Label
                  htmlFor="superAdmin"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Super Admin
                </Label>
              </div>
            </div>
            <div className="md:col-span-3 flex items-end">
              <Button
                type="submit"
                className="w-full md:w-auto px-8"
                disabled={formLoading}
              >
                {formLoading ? "Creating..." : "Create Admin"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>Administrator Accounts</CardTitle>
          <CardDescription>
            Manage existing administrator accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Email Address</TableHead>
                  <TableHead className="text-center min-w-[120px]">
                    Role
                  </TableHead>
                  <TableHead className="text-center min-w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-[250px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[100px] mx-auto" />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Skeleton className="h-8 w-[70px]" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <AlertCircle className="h-10 w-10 text-muted-foreground" />
                        <Alert
                          variant="outline"
                          className="max-w-md border-dashed"
                        >
                          <AlertDescription className="text-center">
                            No administrator accounts found. Create your first
                            admin account to get started.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.email}>
                      <TableCell className="font-medium">
                        {admin.email}
                      </TableCell>
                      <TableCell className="text-center">
                        {admin.superAdmin ? (
                          <Badge variant="default" className="gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Super Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <AlertDialog
                          open={
                            isDeleteDialogOpen &&
                            deleteTarget?.email === admin.email
                          }
                          onOpenChange={(open) => {
                            if (!open) setDeleteTarget(null);
                            setIsDeleteDialogOpen(open);
                          }}
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteTarget(admin);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={deletingEmail === admin.email}
                            className="gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            {deletingEmail === admin.email
                              ? "Deleting..."
                              : "Delete"}
                          </Button>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                                  <Trash2 className="h-6 w-6 text-destructive" />
                                </div>
                                Delete Administrator?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="pt-2">
                                Are you sure you want to delete{" "}
                                <span className="font-medium">
                                  {admin.email}
                                </span>
                                ? This action cannot be undone and will
                                permanently remove this administrator's access.
                                {admin.superAdmin && (
                                  <span className="mt-2 text-destructive font-medium flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    This is a Super Admin account. Proceed with
                                    caution.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setDeleteTarget(null)}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive hover:bg-destructive/90"
                                disabled={deletingEmail === admin.email}
                              >
                                {deletingEmail === admin.email
                                  ? "Deleting..."
                                  : "Delete Permanently"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
