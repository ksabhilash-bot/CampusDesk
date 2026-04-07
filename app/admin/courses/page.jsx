"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Loader,
  ChevronLeft,
  ChevronRight,
  Trash2,
  BookOpen,
  Calendar,
  GraduationCap,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDashboardStore } from "@/zustandStore/useDashboardStore";

export default function Page() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteCode, setDeleteCode] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user, isAuthenticated, clearSession, setSession } =
    useDashboardStore();

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();
        if (data.dashboard === "adminStyle") {
          setSession({ user: data.user, dashboard: "adminStyle" });
        }
        if (!data.success) {
          clearSession();
          router.push("/login");
        } else {
          setSession({ user: data.user, dashboard: data.dashboard });
        }
      } catch {
        clearSession();
      }
    };
    hydrateSession();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  const [form, setForm] = useState({
    courseCode: "",
    courseName: "",
    totalSemesters: "",
    durationYears: "",
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/course", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setCourses(data.success ? data.courses : []);
    } catch {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const deleteCourse = async () => {
    try {
      const res = await fetch("/api/admin/course", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode: deleteCode }),
      });
      const data = await res.json();
      if (!data.success) return toast.error(data.message);
      toast.success("Course deleted");
      setDeleteCode(null);
      setCurrentIndex(0);
      fetchCourses();
    } catch {
      toast.error("Delete failed");
    }
  };

  const addCourse = async () => {
    try {
      const res = await fetch("/api/admin/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) return toast.error(data.message);
      toast.success("Course added");
      setForm({
        courseCode: "",
        courseName: "",
        totalSemesters: "",
        durationYears: "",
      });
      fetchCourses();
    } catch {
      toast.error("Failed to add course");
    }
  };

  const nextCourse = () => setCurrentIndex((p) => (p + 1) % courses.length);
  const prevCourse = () =>
    setCurrentIndex((p) => (p - 1 + courses.length) % courses.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-stone-400" />
          <p className="text-stone-400 text-sm tracking-wide">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  const current = courses[currentIndex];

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ── Page Header ───────────────────────────────────────── */}
        <div className="flex items-end justify-between border-b border-stone-200 pb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-600 mb-1">
              Admin Panel
            </p>
            <h1 className="text-2xl font-semibold text-stone-800">
              Course Management
            </h1>
          </div>
          <span className="text-sm text-stone-400">
            {courses.length} {courses.length === 1 ? "course" : "courses"} total
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── LEFT: Course Viewer ─────────────────────────────── */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-zinc-800" />
                  <span className="text-sm font-medium text-zinc-800">
                    All Courses
                  </span>
                </div>
              </div>

              <div className="p-6">
                {courses.length === 0 ? (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-stone-300" />
                    </div>
                    <p className="text-stone-500 font-medium text-sm">
                      No courses yet
                    </p>
                    <p className="text-stone-400 text-xs text-center max-w-[200px]">
                      Add your first course using the form on the right.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* ── Desktop Carousel ──────────────────────── */}
                    <div className="hidden md:block space-y-5">
                      {/* Course Code badge + Delete */}
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block text-xs font-medium tracking-widest uppercase text-zinc-950 bg-stone-100 px-3 py-1 rounded-full">
                            {current.courseCode}
                          </span>
                          <h2 className="mt-3 text-xl font-semibold text-stone-800 leading-snug">
                            {current.courseName}
                          </h2>
                        </div>
                        <button
                          onClick={() => setDeleteCode(current.courseCode)}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-stone-100" />

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-stone-50 border border-stone-100 rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-stone-200 flex items-center justify-center">
                              <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                            </div>
                            <span className="text-xs text-zinc-900 uppercase tracking-wide">
                              Semesters
                            </span>
                          </div>
                          <p className="text-3xl font-bold text-stone-800">
                            {current.totalSemesters}
                          </p>
                          <p className="text-xs text-zinc-900 mt-1">
                            total semesters
                          </p>
                        </div>

                        <div className="bg-stone-50 border border-stone-100 rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-stone-200 flex items-center justify-center">
                              <Calendar className="w-3.5 h-3.5 text-stone-500" />
                            </div>
                            <span className="text-xs text-zinc-900 uppercase tracking-wide">
                              Duration
                            </span>
                          </div>
                          <p className="text-3xl font-semibold text-stone-800">
                            {current.durationYears}
                          </p>
                          <p className="text-xs text-zinc-900 mt-1">years</p>
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={prevCourse}
                          disabled={courses.length <= 1}
                          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>

                        {/* Dot indicators */}
                        <div className="flex items-center gap-1.5">
                          {courses.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentIndex(i)}
                              className={`rounded-full transition-all duration-200 ${
                                i === currentIndex
                                  ? "w-5 h-1.5 bg-stone-700"
                                  : "w-1.5 h-1.5 bg-stone-300 hover:bg-stone-400"
                              }`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={nextCourse}
                          disabled={courses.length <= 1}
                          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* ── Mobile List ───────────────────────────── */}
                    <div className="md:hidden space-y-3 max-h-[520px] overflow-y-auto">
                      {courses.map((course) => (
                        <div
                          key={course.courseCode}
                          className="border border-stone-200 rounded-xl p-4 bg-white"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full font-medium">
                                {course.courseCode}
                              </span>
                              <p className="mt-1.5 text-sm font-semibold text-stone-800">
                                {course.courseName}
                              </p>
                            </div>
                            <button
                              onClick={() => setDeleteCode(course.courseCode)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-stone-50 rounded-lg p-3">
                              <p className="text-xs text-stone-400">
                                Semesters
                              </p>
                              <p className="text-lg font-semibold text-stone-700">
                                {course.totalSemesters}
                              </p>
                            </div>
                            <div className="bg-stone-50 rounded-lg p-3">
                              <p className="text-xs text-stone-400">Duration</p>
                              <p className="text-lg font-semibold text-stone-700">
                                {course.durationYears} yrs
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Add Course Form ──────────────────────────── */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden sticky top-6">
              {/* Form Header */}
              <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium text-stone-700">
                  Add New Course
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="courseCode"
                    className="text-xs font-medium text-stone-500 uppercase tracking-wide"
                  >
                    Course Code
                  </Label>
                  <Input
                    id="courseCode"
                    placeholder="e.g. CS101"
                    value={form.courseCode}
                    onChange={(e) =>
                      setForm({ ...form, courseCode: e.target.value })
                    }
                    className="border-stone-200 focus-visible:ring-stone-400 text-stone-800 placeholder:text-stone-300 rounded-xl h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="courseName"
                    className="text-xs font-medium text-stone-500 uppercase tracking-wide"
                  >
                    Course Name
                  </Label>
                  <Input
                    id="courseName"
                    placeholder="e.g. Computer Science"
                    value={form.courseName}
                    onChange={(e) =>
                      setForm({ ...form, courseName: e.target.value })
                    }
                    className="border-stone-200 focus-visible:ring-stone-400 text-stone-800 placeholder:text-stone-300 rounded-xl h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="totalSemesters"
                      className="text-xs font-medium text-stone-500 uppercase tracking-wide"
                    >
                      Semesters
                    </Label>
                    <Input
                      id="totalSemesters"
                      type="number"
                      placeholder="8"
                      value={form.totalSemesters}
                      onChange={(e) =>
                        setForm({ ...form, totalSemesters: e.target.value })
                      }
                      className="border-stone-200 focus-visible:ring-stone-400 text-stone-800 placeholder:text-stone-300 rounded-xl h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="durationYears"
                      className="text-xs font-medium text-stone-500 uppercase tracking-wide"
                    >
                      Years
                    </Label>
                    <Input
                      id="durationYears"
                      type="number"
                      placeholder="4"
                      value={form.durationYears}
                      onChange={(e) =>
                        setForm({ ...form, durationYears: e.target.value })
                      }
                      className="border-stone-200 focus-visible:ring-stone-400 text-stone-800 placeholder:text-stone-300 rounded-xl h-10"
                    />
                  </div>
                </div>

                <button
                  onClick={addCourse}
                  className="w-full mt-2 h-10 bg-emerald-600 hover:bg-stone-900 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Course
                </button>

                <p className="text-xs text-stone-400 text-center pt-1">
                  All fields are required to add a course.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation ────────────────────────────────── */}
      <AlertDialog open={!!deleteCode} onOpenChange={() => setDeleteCode(null)}>
        <AlertDialogContent className="rounded-2xl border-stone-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-stone-800">
              Delete this course?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-stone-500">
              <span className="font-medium text-stone-700">{deleteCode}</span>{" "}
              will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCourse}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
