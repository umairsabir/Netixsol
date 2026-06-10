"use client";

import React, { use, useRef, useState } from "react";
import { useResume, useUpdateResume } from "@/hooks/useResume";
import { ThreePanelLayout } from "@/components/builder/ThreePanelLayout";
import { Header } from "@/components/builder/Header";
import { Dock } from "@/components/builder/Dock";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ModernTemplate } from "@/components/resume/templates/ModernTemplate";
import { BasicsEditor } from "@/components/builder/editors/BasicsEditor";
import { ExperienceEditor } from "@/components/builder/editors/ExperienceEditor";
import { EducationEditor } from "@/components/builder/editors/EducationEditor";
import { SkillEditor } from "@/components/builder/editors/SkillEditor";
import { ProjectsEditor } from "@/components/builder/editors/ProjectsEditor";
import { LanguagesEditor } from "@/components/builder/editors/LanguagesEditor";
import { CertificationsEditor } from "@/components/builder/editors/CertificationsEditor";
import { AwardsEditor } from "@/components/builder/editors/AwardsEditor";
import { SummaryEditor } from "@/components/builder/editors/SummaryEditor";
import { PictureEditor } from "@/components/builder/editors/PictureEditor";
import { ThemeEditor } from "@/components/builder/editors/ThemeEditor";
import { InterestsEditor } from "@/components/builder/editors/InterestsEditor";
import { PublicationsEditor } from "@/components/builder/editors/PublicationsEditor";
import { VolunteerEditor } from "@/components/builder/editors/VolunteerEditor";
import { ReferencesEditor } from "@/components/builder/editors/ReferencesEditor";
import { CustomSectionsEditor } from "@/components/builder/editors/CustomSectionsEditor";
import { cn } from "@/lib/utils";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { 
  Loader2, 
  Package, 
  Settings, 
  User, 
  Layout as LayoutIcon, 
  GraduationCap, 
  Code, 
  FileJson, 
  Download,
  FileText,
  Briefcase,
  Star,
  Globe,
  Award,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { exportResumeToPdf, exportResumeToJson } from "@/lib/pdf-export";
import { exportResumeToDocx } from "@/lib/docx-export";

// Shared default section structure to avoid hardcoding on every update
const ensureSection = (resume: any, sectionKey: string, defaultName: string) => {
    if (!resume.sections) resume.sections = {};
    if (!resume.sections[sectionKey]) {
        resume.sections[sectionKey] = {
            id: sectionKey,
            name: defaultName,
            visible: true,
            items: []
        };
    }
    return resume.sections[sectionKey];
};
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Placeholders for content until other editors are built
const EditorPlaceholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
    <Package className="h-12 w-12 mb-4" />
    <h3 className="text-lg font-bold">{title} Editor</h3>
    <p className="text-sm">Coming soon in the next phase.</p>
  </div>
);

const defaultBasics = {
  name: "",
  label: "",
  email: "",
  phone: "",
  url: "",
  summary: "",
  location: { address: "", city: "", region: "", postalCode: "", countryCode: "" },
  customFields: []
};

const TABS = [
  { id: "basics", label: "Basics", icon: User },
  { id: "experience", label: "Work", icon: Briefcase },
  { id: "education", label: "Study", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Star },
  { id: "more", label: "More", icon: Plus },
];

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: resume, isLoading, error } = useResume(id);
  const updateResume = useUpdateResume(id);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");
  const zoomRef = useRef<ReactZoomPanPinchRef>(null);

  const activeTabIndex = TABS.findIndex(t => t.id === activeTab);
  const nextTab = TABS[activeTabIndex + 1];
  const prevTab = TABS[activeTabIndex - 1];

  const handleNext = () => {
    if (nextTab) setActiveTab(nextTab.id);
  };

  const handleBack = () => {
    if (prevTab) setActiveTab(prevTab.id);
  };

  const handleExportPdf = async () => {
    if (!resume) return;
    setIsExporting(true);
    try {
      const fullName = resume.basics?.name || "Resume";
      await exportResumeToPdf("resume-render", fullName, resume);
      toast.success("Resume exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDocx = async () => {
    if (!resume) return;
    setIsExporting(true);
    try {
      const fullName = resume.basics?.name || "Resume";
      await exportResumeToDocx(resume, fullName);
      toast.success("Word document exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export Word document. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    if (!resume) return;
    const fullName = resume.basics?.name || "Resume";
    exportResumeToJson(resume, fullName);
    toast.success("JSON data exported successfully!");
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Initializing Builder...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Resume Not Found</h1>
          <p className="text-muted-foreground">The document you are looking for does not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <Header 
        title={resume.basics?.name || "Untitled Resume"} 
        onTitleChange={(title) => {
          updateResume.mutate({ 
            ...resume, 
            basics: { 
              ...defaultBasics,
              ...resume.basics, 
              name: title 
            } 
          } as any);
        }}
        onExportPdf={handleExportPdf}
        onExportDocx={handleExportDocx}
        onExportJson={() => {
            const fullName = resume.basics?.name || "Resume";
            exportResumeToJson(resume, fullName);
        }}
        isExporting={isExporting}
      />

      <ThreePanelLayout
        leftPanel={
          <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black italic tracking-tight uppercase px-1">Content</h2>
              <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">DRAFT</div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="sticky top-0 z-10 mb-6 -mx-1">
                <div className="px-1 py-1 border-b bg-muted/20 glass rounded-2xl overflow-x-auto no-scrollbar">
                  <TabsList className="flex w-max min-w-full justify-start bg-transparent h-auto p-0 gap-1">
                    {TABS.map((tab) => (
                      <TabsTrigger 
                        key={tab.id}
                        value={tab.id} 
                        className="flex-shrink-0 gap-2 py-2.5 px-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm bg-transparent whitespace-nowrap transition-all"
                      >
                        <tab.icon className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              <div className="space-y-4">
                <TabsContent value="basics" className="mt-0 space-y-12">
                   <PictureEditor 
                    picture={resume.picture} 
                    onChange={(picture) => updateResume.mutate({ ...resume, picture })}
                  />
                  <BasicsEditor data={resume.basics || (defaultBasics as any)} onChange={(basics) => updateResume.mutate({ ...resume, basics })} />
                  <SummaryEditor 
                    data={resume.basics?.summary || ""} 
                    onChange={(summary) => updateResume.mutate({ ...resume, basics: { ...defaultBasics, ...resume.basics, summary } } as any)} 
                  />
                </TabsContent>

                <TabsContent value="experience" className="mt-0">
                  <ExperienceEditor 
                    data={resume.sections?.experience || { id: "experience", visible: true, name: "Experience", items: [] }} 
                    onChange={(experience) => updateResume.mutate({ ...resume, sections: { ...resume.sections, experience } } as any)} 
                  />
                </TabsContent>

                <TabsContent value="education" className="mt-0">
                  <EducationEditor 
                    data={resume.sections?.education || { id: "education", visible: true, name: "Education", items: [] }} 
                    onChange={(education) => updateResume.mutate({ ...resume, sections: { ...resume.sections, education } } as any)} 
                  />
                </TabsContent>

                <TabsContent value="skills" className="mt-0">
                  <SkillEditor 
                    data={resume.sections?.skills || { id: "skills", visible: true, name: "Skills", items: [] }} 
                    onChange={(skills) => updateResume.mutate({ ...resume, sections: { ...resume.sections, skills } } as any)} 
                  />
                </TabsContent>

                <TabsContent value="more" className="mt-0 space-y-12 pb-10">
                   <ProjectsEditor 
                     data={resume.sections?.projects || { id: "projects", visible: true, name: "Projects", items: [] }} 
                     onChange={(projects) => updateResume.mutate({ ...resume, sections: { ...resume.sections, projects } } as any)} 
                   />
                   <LanguagesEditor 
                     data={resume.sections?.languages || { id: "languages", visible: true, name: "Languages", items: [] }} 
                     onChange={(languages) => updateResume.mutate({ ...resume, sections: { ...resume.sections, languages } } as any)} 
                   />
                   <CertificationsEditor 
                     data={resume.sections?.certifications || { id: "certifications", visible: true, name: "Certifications", items: [] }} 
                     onChange={(certifications) => updateResume.mutate({ ...resume, sections: { ...resume.sections, certifications } } as any)} 
                   />
                   <AwardsEditor 
                     data={resume.sections?.awards || { id: "awards", visible: true, name: "Awards", items: [] }} 
                     onChange={(awards) => updateResume.mutate({ ...resume, sections: { ...resume.sections, awards } } as any)} 
                   />
                   <InterestsEditor 
                     data={resume.sections?.interests || { id: "interests", visible: true, name: "Interests", items: [] }} 
                     onChange={(interests) => updateResume.mutate({ ...resume, sections: { ...resume.sections, interests } } as any)} 
                   />
                   <PublicationsEditor 
                     data={resume.sections?.publications || { id: "publications", visible: true, name: "Publications", items: [] }} 
                     onChange={(publications) => updateResume.mutate({ ...resume, sections: { ...resume.sections, publications } } as any)} 
                   />
                   <VolunteerEditor 
                     data={resume.sections?.volunteer || { id: "volunteer", visible: true, name: "Volunteer", items: [] }} 
                     onChange={(volunteer) => updateResume.mutate({ ...resume, sections: { ...resume.sections, volunteer } } as any)} 
                   />
                   <ReferencesEditor 
                     data={resume.sections?.references || { id: "references", visible: true, name: "References", items: [] }} 
                     onChange={(references) => updateResume.mutate({ ...resume, sections: { ...resume.sections, references } } as any)} 
                   />
                   <CustomSectionsEditor 
                     data={resume.customSections || []} 
                     onChange={(customSections) => updateResume.mutate({ ...resume, customSections } as any)} 
                   />
                </TabsContent>
              </div>
            </Tabs>

            {/* Navigation Footer */}
            <div className="fixed bottom-4 left-4 right-auto w-[calc(25%-32px)] min-w-[280px] max-w-[420px] z-20 flex items-center justify-between p-2 glass rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 hidden md:flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={!prevTab}
                className="gap-2 rounded-xl h-11 px-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-bold text-xs uppercase tracking-wider">Back</span>
              </Button>

              <div className="flex gap-1">
                {TABS.map((tab) => (
                  <div 
                    key={tab.id}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      activeTab === tab.id ? "w-6 bg-primary" : "w-1.5 bg-primary/20"
                    )}
                  />
                ))}
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={handleNext}
                disabled={!nextTab}
                className="gap-2 rounded-xl h-11 px-6 shadow-lg shadow-primary/20"
              >
                <span className="font-bold text-xs uppercase tracking-wider">{nextTab ? "Next" : "Finish"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        }
        centerPanel={
          <ResumePreview onInit={(ref) => { zoomRef.current = ref; }}>
            <ModernTemplate data={resume} />
          </ResumePreview>
        }
        rightPanel={
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black italic tracking-tight uppercase px-1">Design</h2>
            </div>
            
            <div className="space-y-8">
                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Templates</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="aspect-[3/4] rounded-xl border-2 border-primary bg-card flex items-center justify-center text-[10px] b-shadow-md font-bold">Modern</div>
                        <div className="aspect-[3/4] rounded-xl border border-dashed bg-muted/30 flex items-center justify-center text-[10px] font-bold text-muted-foreground">More soon...</div>
                    </div>
                </div>

            <ThemeEditor 
              data={resume} 
              onChange={(updatedResume) => updateResume.mutate(updatedResume)} 
            />
            </div>

            <div className="pt-6 border-t mt-auto">
                <Button 
                    variant="outline" 
                    className="w-full gap-2 h-12 rounded-xl"
                    onClick={() => {
                        const fullName = resume.basics?.name || "Resume";
                        exportResumeToJson(resume, fullName);
                    }}
                >
                    <FileJson className="h-4 w-4" />
                    Export as JSON
                </Button>
                <p className="mt-2 text-[10px] text-muted-foreground px-1">
                    Download a JSON copy of your data for backup or portability.
                </p>
            </div>
          </div>
        }
      />

      <Dock 
        onZoomIn={() => zoomRef.current?.zoomIn(0.2)} 
        onZoomOut={() => zoomRef.current?.zoomOut(0.2)}
        onResetZoom={() => zoomRef.current?.resetTransform()}
      />
    </div>
  );
}
