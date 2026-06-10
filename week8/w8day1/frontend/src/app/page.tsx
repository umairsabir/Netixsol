"use client";

import React from "react";
import { useResumes, useCreateResume, useDeleteResume, useDuplicateResume } from "@/hooks/useResume";
import { ResumeCard } from "@/components/dashboard/ResumeCard";
import { Button } from "@/components/ui/button";
import { Plus, Rocket, Layout, Sparkles, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: resumes = [], isLoading } = useResumes();
  const createResume = useCreateResume();
  const deleteResume = useDeleteResume();
  const duplicateResume = useDuplicateResume();

  const handleCreate = async () => {
    const newResume = await createResume.mutateAsync({ name: "Untitled Resume", template: "empty" });
    router.push(`/resume/${newResume.id}`);
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero / Header Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Build your future
            </div>
            <h1 className="text-5xl font-black tracking-tight text-foreground">
              Your Professional <span className="text-primary italic">Identity</span>, Redefined.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Create a stunning, industry-leading resume in minutes. Use our premium templates
              designed by recruitment experts to land your dream role.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Button
              size="lg"
              onClick={handleCreate}
              disabled={createResume.isPending}
              className="h-16 px-8 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 gap-3"
            >
              <Plus className="h-6 w-6" />
              Create New Resume
            </Button>
          </div>
        </section>

        {/* Dashboard Content */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Recent Documents</h2>
              <span className="bg-muted px-2.5 py-0.5 rounded-full text-xs font-bold text-muted-foreground">
                {resumes.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="font-bold text-xs">View All</Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[280px] rounded-2xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : resumes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onDelete={(id) => {
                    deleteResume.mutate(id);
                  }}
                  onDuplicate={(id) => {
                    duplicateResume.mutate(id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 glass-card rounded-3xl border-dashed border-2">
              <div className="p-6 rounded-full bg-primary/5">
                <Rocket className="h-12 w-12 text-primary/50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">No resumes found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Start your career journey by creating your first professional resume.
                </p>
              </div>
              <Button variant="outline" size="lg" onClick={handleCreate} className="px-10 rounded-xl font-bold">
                Get Started
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t mt-20 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
        <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
          <Layout className="h-6 w-6 text-primary" />
          RESUME<span className="text-primary italic">BUILDER</span>
        </div>
        <p className="text-sm font-medium">© 2026 Resume Builder. All Rights Reserved.</p>
        <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
