"use client";

import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your identity, email, and authentication methods.</p>
      </div>

      <div className="flex justify-start">
        {/* The UserProfile component from Clerk provides a fully featured settings dashboard out-of-the-box */}
        <UserProfile 
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full max-w-4xl",
              card: "shadow-sm border border-border/50 rounded-2xl bg-card",
              navbar: "hidden md:block",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              profileSectionTitleText: "text-foreground font-semibold",
              profileSectionPrimaryButton: "text-primary hover:bg-primary/10",
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
            }
          }}
        />
      </div>
    </div>
  );
}
