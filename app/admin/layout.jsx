import { LogoutButton } from "@/components/Logout";
import Link from "next/link";

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard of CampusDesk",
  keywords: ["Admin Dashboard", "Student Payment System"],
};

export default function AdminDashboardLayout({ children }) {
  return (
    <section className="min-h-screen bg-muted">
      <div>
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold tracking-tight">
              <Link href={`/admin/dashboard`}>Admin Dashboard</Link>
            </h1>
            <LogoutButton />
          </div>
        </header>

        {children}
      </div>
    </section>
  );
}
