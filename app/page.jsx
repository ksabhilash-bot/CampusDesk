"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const btnRef = useRef(null);
  const cardsRef = useRef([]);
  const footerRef = useRef(null);
  const lineRef = useRef(null);

  // ── Hover animation per card ──────────────────────────────────
  const handleMouseEnter = (index) => {
    const card = cardsRef.current[index];
    const icon = card.querySelector(".card-icon");
    const title = card.querySelector(".card-title");
    const border = card.querySelector(".card-border");

    gsap.to(card, {
      y: -6,
      boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
      duration: 0.35,
      ease: "power2.out",
    });
    gsap.to(icon, {
      rotate: 15,
      scale: 1.2,
      duration: 0.35,
      ease: "back.out(1.7)",
    });
    gsap.to(title, {
      x: 4,
      duration: 0.3,
      ease: "power2.out",
    });
    gsap.to(border, {
      scaleX: 1,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const handleMouseLeave = (index) => {
    const card = cardsRef.current[index];
    const icon = card.querySelector(".card-icon");
    const title = card.querySelector(".card-title");
    const border = card.querySelector(".card-border");

    gsap.to(card, {
      y: 0,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      duration: 0.4,
      ease: "power2.inOut",
    });
    gsap.to(icon, {
      rotate: 0,
      scale: 1,
      duration: 0.35,
      ease: "power2.inOut",
    });
    gsap.to(title, {
      x: 0,
      duration: 0.3,
      ease: "power2.inOut",
    });
    gsap.to(border, {
      scaleX: 0,
      duration: 0.35,
      ease: "power3.in",
    });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(
        [
          logoRef.current,
          titleRef.current,
          subtitleRef.current,
          btnRef.current,
        ],
        { autoAlpha: 0, y: 30 },
      );
      gsap.set(cardsRef.current, { autoAlpha: 0, y: 40 });
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(footerRef.current, { autoAlpha: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(logoRef.current, { autoAlpha: 1, y: 0, duration: 0.9 })
        .to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5")
        .to(lineRef.current, { scaleX: 1, duration: 0.6 }, "-=0.3")
        .to(subtitleRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.3")
        .to(btnRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.2");

      cardsRef.current.forEach((card, i) => {
        gsap.to(card, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          delay: i * 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 85%" },
        });
      });

      gsap.to(footerRef.current, {
        autoAlpha: 1,
        duration: 0.6,
        scrollTrigger: { trigger: footerRef.current, start: "top 95%" },
      });
    });

    return () => ctx.revert();
  }, []);

  const cards = [
    {
      title: "Our Mission",
      icon: "🎯",
      body: "To provide quality software to colleges for the management of students, courses, and payments. User-friendly, efficient, and secure — helping colleges operate effectively.",
    },
    {
      title: "Our Vision",
      icon: "🔭",
      body: "To be the leading provider of college management software in the region, continuously updated to meet the evolving needs of institutions and students alike.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-5">
      <main className="mx-auto max-w-5xl px-6 py-20 bg-zinc-100 rounded-lg my-auto drop-shadow-2xl drop-shadow-zinc-800">
        {/* ── Header ───────────────────────────────────────────── */}
        <header className="flex flex-col items-center text-center gap-6">
          <div ref={logoRef}>
            <Image
              src="/campus.png"
              alt="campusDesk"
              width={300}
              height={300}
              priority
              className="dark:invert"
            />
          </div>

          <h1
            ref={titleRef}
            className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            CampusDesk
          </h1>

          <div
            ref={lineRef}
            className="h-px w-24 bg-zinc-900 dark:bg-zinc-100"
          />

          <p
            ref={subtitleRef}
            className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400"
          >
            College Management and administration system.
          </p>

          <Link
            ref={btnRef}
            href="/login"
            className="rounded-full px-8 text-amber-50 p-2 bg-zinc-950 hover:text-zinc-950 hover:font-bold hover:bg-zinc-300 transition-colors duration-200"
          >
            Student Login
          </Link>
        </header>

        {/* ── Mission & Vision ─────────────────────────────────── */}
        <section className="mt-20 grid gap-8 md:grid-cols-2">
          {cards.map((item, i) => (
            <div
              key={item.title}
              ref={(el) => (cardsRef.current[i] = el)}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={() => handleMouseLeave(i)}
              className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm cursor-default overflow-hidden"
            >
              {/* animated bottom border */}
              <div
                className="card-border absolute bottom-0 left-0 h-[3px] w-full bg-zinc-900 dark:bg-zinc-100 origin-left"
                style={{ transform: "scaleX(0)" }}
              />

              {/* icon */}
              <span className="card-icon inline-block text-3xl mb-4 select-none">
                {item.icon}
              </span>

              {/* title */}
              <h2 className="card-title text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                {item.title}
              </h2>

              {/* body */}
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm sm:text-base">
                {item.body}
              </p>
            </div>
          ))}
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer
          ref={footerRef}
          className="mt-24 text-center text-sm text-zinc-500 dark:text-zinc-500"
        >
          © {new Date().getFullYear()} CampusDesk. All rights reserved. |
          Developed by{" Abhilash k S "}
        </footer>
      </main>
    </div>
  );
}
