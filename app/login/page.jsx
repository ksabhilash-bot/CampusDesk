"use client";

import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboardStore } from "@/zustandStore/useDashboardStore";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, dashboard, setSession, clearSession } =
    useDashboardStore();
  const router = useRouter();
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");

  // refs
  const bgRef = useRef(null);
  const cardRef = useRef(null);
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const field1Ref = useRef(null);
  const field2Ref = useRef(null);
  const btnRef = useRef(null);
  const footerRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();
        if (data.dashboard === "adminStyle") {
          setSession({ user: data.user, dashboard: "adminStyle" });
          router.push("/admin/dashboard");
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
    if (isAuthenticated && dashboard) {
      if (dashboard === "studentStyle") router.push("/student/dashboard");
      else if (dashboard === "adminStyle") router.push("/admin/dashboard");
    }
  }, [isAuthenticated, dashboard, router]);

  // ── entrance animation ──────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([cardRef.current], { autoAlpha: 0, y: 50, scale: 0.96 });
      gsap.set([logoRef.current, titleRef.current, descRef.current], {
        autoAlpha: 0,
        y: 20,
      });
      gsap.set([field1Ref.current, field2Ref.current], {
        autoAlpha: 0,
        x: -16,
      });
      gsap.set([btnRef.current, footerRef.current], { autoAlpha: 0, y: 10 });

      // floating orbs
      gsap.to(orb1Ref.current, {
        x: 40,
        y: -30,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(orb2Ref.current, {
        x: -30,
        y: 40,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(cardRef.current, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 })
        .to(logoRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.4")
        .to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.3")
        .to(descRef.current, { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.3")
        .to(field1Ref.current, { autoAlpha: 1, x: 0, duration: 0.45 }, "-=0.2")
        .to(field2Ref.current, { autoAlpha: 1, x: 0, duration: 0.45 }, "-=0.3")
        .to(btnRef.current, { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.2")
        .to(footerRef.current, { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.2");
    });
    return () => ctx.revert();
  }, []);

  // ── input focus glow ────────────────────────────────────────────
  const handleFocus = (ref) => {
    gsap.to(ref.current, { scale: 1.01, duration: 0.2, ease: "power2.out" });
  };
  const handleBlur = (ref) => {
    gsap.to(ref.current, { scale: 1, duration: 0.2, ease: "power2.inOut" });
  };

  // ── button press ────────────────────────────────────────────────
  const handleBtnDown = () =>
    gsap.to(btnRef.current, { scale: 0.97, duration: 0.1 });
  const handleBtnUp = () =>
    gsap.to(btnRef.current, { scale: 1, duration: 0.15, ease: "back.out(2)" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString().trim();

    if (!email) {
      toast.error("Email is required");
      return;
    }
    if (!password) {
      toast.error("Password is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    const loggin = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const logginData = await loggin.json();

    if (logginData.success) {
      toast.success("Login successful!");
      if (logginData.dashboard === "studentStyle") {
        setSession({ user: logginData.student, dashboard: "studentStyle" });
        router.push("/student/dashboard");
      } else if (logginData.dashboard === "adminStyle") {
        setSession({ user: logginData.admin, dashboard: "adminStyle" });
        router.push("/admin/dashboard");
      }
    } else {
      toast.error(logginData.message || "Login failed. Please try again.");
      // shake card on error
      gsap.to(cardRef.current, {
        x: [-8, 8, -6, 6, -3, 3, 0],
        duration: 0.5,
        ease: "power1.inOut",
      });
    }
    setMail("");
    setPassword("");
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div
      ref={bgRef}
      style={{ background: "#0f0f13" }}
      className="relative flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black overflow-hidden p-4"
    >
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 340,
          height: 340,
          background: "rgba(99,60,180,0.22)",
          filter: "blur(80px)",
          top: -80,
          left: -60,
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280,
          height: 280,
          background: "rgba(20,130,100,0.18)",
          filter: "blur(80px)",
          bottom: 20,
          right: -40,
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      {/* ── decorative orbs ───────────────────────────────────── */}
      <div
        ref={orb1Ref}
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-zinc-200 dark:bg-zinc-800 opacity-40 blur-3xl"
      />
      <div
        ref={orb2Ref}
        className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-zinc-300 dark:bg-zinc-700 opacity-30 blur-3xl"
      />

      {/* ── card ─────────────────────────────────────────────── */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-sm rounded-2xl border dark:border-zinc-200 border-zinc-800 dark:bg-white bg-zinc-500 shadow-xl shadow-zinc-200/60 dark:shadow-black/40 overflow-hidden"
      >
        {/* top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-zinc-400 via-zinc-700 to-zinc-400 dark:from-zinc-600 dark:via-zinc-300 dark:to-zinc-600" />

        <div className="px-7 pt-8 pb-7 space-y-6">
          {/* logo mark */}
          <div ref={logoRef} className="flex justify-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-950 dark:bg-zinc-100 flex items-center justify-center shadow-md">
              <span className="text-zinc-50 dark:text-zinc-900 font-bold text-lg tracking-tight">
                CD
              </span>
            </div>
          </div>

          {/* header text */}
          <div className="text-center space-y-1">
            <h1
              ref={titleRef}
              className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight"
            >
              Welcome back
            </h1>
            <p
              ref={descRef}
              className="text-sm text-zinc-500 dark:text-zinc-400"
            >
              Sign in to your CampusDesk account
            </p>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div ref={field1Ref} className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-medium text-zinc-900 uppercase tracking-wider"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                onFocus={() => handleFocus(field1Ref)}
                onBlur={() => handleBlur(field1Ref)}
                placeholder="student@gmail.com"
                className="rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
              />
            </div>

            <div ref={field2Ref} className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-medium text-zinc-900 uppercase tracking-wider"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => handleFocus(field2Ref)}
                onBlur={() => handleBlur(field2Ref)}
                placeholder="••••••••"
                className="rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all "
              />
            </div>

            <div ref={btnRef}>
              <Button
                type="submit"
                disabled={loading}
                onMouseDown={handleBtnDown}
                onMouseUp={handleBtnUp}
                onMouseLeave={handleBtnUp}
                className="w-full rounded-lg bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 hover:bg-white hover:text-zinc-950 dark:hover:bg-zinc-200 font-semibold tracking-wide transition-colors duration-200 h-11"
              >
                {loading ? (
                  <Spinner className="h-4 w-4 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
          </form>

          {/* footer */}
          <div
            ref={footerRef}
            className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800"
          >
            <span className="text-xs text-zinc-800">© CampusDesk</span>
            <Link href="/">
              <button className="text-xs font-medium text-zinc-950 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-150 underline underline-offset-2">
                ← Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
