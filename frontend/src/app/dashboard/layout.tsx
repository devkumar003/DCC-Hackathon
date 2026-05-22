"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  BarChart3, 
  Settings,
  BrainCircuit
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "New Interview", href: "/dashboard/new", icon: PlusCircle },
    { name: "History", href: "/dashboard/history", icon: History },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-card border-r border-border/50 flex flex-col backdrop-blur-xl"
      >
        <div className="p-6 flex items-center gap-2 border-b border-border/50">
          <BrainCircuit className="w-8 h-8 text-primary" />
          <span className="font-bold text-lg tracking-tight">InterviewGenie</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50 flex items-center gap-3">
          <UserButton />
          <span className="text-sm font-medium text-muted-foreground">My Account</span>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-6xl mx-auto h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
