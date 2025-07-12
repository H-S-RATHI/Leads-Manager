"use client"
import { useState, useEffect } from "react"
import { DesktopSidebar } from "./desktop-sidebar"
import { Header } from "./header"
import { MobileBottomNav } from "./mobile-bottom-nav";
import { ChevronRight } from "lucide-react";

export function DashboardShell({ user, children }: { user: any; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [hideSidebar, setHideSidebar] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isSuperAdmin = user.role === "super_admin";
  const isAdminOrSalesRep = ["admin", "sales_rep"].includes(user.role);

  useEffect(() => {
    setMounted(true)
    if (isAdminOrSalesRep) {
      const checkMobile = () => {
        setHideSidebar(window.matchMedia("(max-width: 768px)").matches)
      }
      checkMobile()
      window.addEventListener("resize", checkMobile)
      return () => window.removeEventListener("resize", checkMobile)
    }
  }, [isAdminOrSalesRep])

  // Only render sidebar after mount, so we know the screen size
  const shouldShowSidebar =
    !isAdminOrSalesRep ||
    (mounted && !hideSidebar) ||
    isSuperAdmin

  return (
    <div className="min-h-screen bg-gray-50">
      {isSuperAdmin && collapsed && (
        <button
          className="fixed top-4 left-4 z-50 p-2 rounded bg-gray-900 text-white shadow-lg lg:hidden"
          onClick={() => setCollapsed(false)}
          aria-label="Open sidebar"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
      {shouldShowSidebar && (
        <div
          className={
            isSuperAdmin
              ? collapsed
                ? "hidden lg:fixed lg:inset-y-0 lg:flex lg:w-16 lg:flex-col"
                : "fixed inset-y-0 flex w-64 flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:flex"
              : collapsed
                ? "fixed inset-y-0 flex w-16 flex-col"
                : "fixed inset-y-0 flex w-64 flex-col"
          }
        >
          <DesktopSidebar user={user} collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>
      )}
      <div className={collapsed ? "lg:pl-16" : "lg:pl-64"}>
        <Header user={user} />
        <main className="px-4 py-6 sm:px-6 lg:px-8 pb-20 lg:pb-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      {["admin", "sales_rep"].includes(user.role) && (
        <MobileBottomNav user={user} />
      )}
    </div>
  )
} 