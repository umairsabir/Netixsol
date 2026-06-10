"use client"

import React from "react"
import { ResumeData } from "@/lib/resume-schema"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Palette, Type, Layout as LayoutIcon, FileText } from "lucide-react"

interface ThemeEditorProps {
  data: ResumeData | undefined
  onChange: (data: ResumeData) => void
}

const FONTS = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Merriweather", value: "Merriweather, serif" },
  { name: "Courier Prime", value: "'Courier Prime', monospace" },
]

export const ThemeEditor: React.FC<ThemeEditorProps> = ({
  data,
  onChange,
}) => {
  if (!data) return null;

  const metadata = data.metadata || {} as any;
  const { design, typography, page, layout } = metadata;

  const updateMetadata = (updates: any) => {
    onChange({
      ...data,
      metadata: {
        ...metadata,
        ...updates
      }
    })
  }

  const updateDesign = (updates: any) => {
    updateMetadata({ design: { ...design, ...updates } })
  }

  const updateTypography = (updates: any) => {
    updateMetadata({ typography: { ...typography, ...updates } })
  }

  const updatePage = (updates: any) => {
    updateMetadata({ page: { ...page, ...updates } })
  }

  const updateLayout = (updates: any) => {
    updateMetadata({ layout: { ...layout, ...updates } })
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Colors & Main Design */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
            <Palette className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Colors & Theme</h3>
        </div>
        
        <div className="space-y-3">
          <Label>Primary Color</Label>
          <div className="flex items-center gap-4">
            <div 
                className="h-10 w-10 rounded-xl border-2 shadow-sm relative overflow-hidden"
                style={{ backgroundColor: design?.primaryColor || "#000000" }}
            >
                <input 
                    type="color" 
                    value={design?.primaryColor || "#000000"} 
                    onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
            </div>
            <Input 
                value={design?.primaryColor || "#000000"} 
                onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                className="font-mono uppercase h-10"
                maxLength={7}
            />
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-6 pt-6 border-t font-sans">
        <div className="flex items-center gap-2 mb-2">
            <Type className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Typography</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Heading Font</Label>
            <Select 
                onValueChange={(val) => updateTypography({ headingFont: val })}
                value={typography?.headingFont}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map(f => (
                    <SelectItem key={f.name} value={f.value} style={{ fontFamily: f.value }}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Body Font</Label>
            <Select 
                onValueChange={(val) => updateTypography({ bodyFont: val })}
                value={typography?.bodyFont}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map(f => (
                    <SelectItem key={f.name} value={f.value} style={{ fontFamily: f.value }}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
                <Label>Font Size</Label>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded italic">{typography?.fontSize}px</span>
            </div>
            <Slider 
                min={8} 
                max={16} 
                step={0.5} 
                value={[typography?.fontSize || 10]} 
                onValueChange={([val]) => updateTypography({ fontSize: val })}
            />
          </div>
        </div>
      </section>

      {/* Layout & Margins */}
      <section className="space-y-6 pt-6 border-t">
        <div className="flex items-center gap-2 mb-2">
            <LayoutIcon className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Page Layout</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Page Margins</Label>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded italic">{page?.margin}mm</span>
            </div>
            <Slider 
                min={0} 
                max={40} 
                step={1} 
                value={[page?.margin || 20]} 
                onValueChange={([val]) => updatePage({ margin: val })}
            />
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
                <Label>Sidebar Width</Label>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded italic">{layout?.sidebarWidth || 35}%</span>
            </div>
            <Slider 
                min={15} 
                max={50} 
                step={1} 
                value={[layout?.sidebarWidth || 35]} 
                onValueChange={([val]) => updateLayout({ sidebarWidth: val })}
            />
          </div>
        </div>
      </section>

      {/* Section Visibility */}
      <section className="space-y-4 pt-6 border-t">
        <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Section Visibility</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          {Object.entries(data.sections || {}).map(([key, section]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox 
                id={`visibility-${key}`} 
                checked={(section as any).visible !== false}
                onCheckedChange={(checked) => {
                    onChange({
                        ...data,
                        sections: {
                            ...data.sections,
                            [key]: { ...(section as any), visible: !!checked }
                        } as any
                    })
                }}
              />
              <Label htmlFor={`visibility-${key}`} className="text-xs capitalize">{key}</Label>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
