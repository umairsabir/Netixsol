"use client"

import React from "react"
import { ResumeData } from "@/lib/resume-schema"
import { RichTextEditor } from "../../editors/RichTextEditor"

interface SummaryEditorProps {
  data: string | undefined
  onChange: (value: string) => void
}

export const SummaryEditor: React.FC<SummaryEditorProps> = ({
  data = "",
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Professional Summary
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Write a short, impactful summary of your career and skills.
        </p>
        
        <RichTextEditor 
            content={data} 
            onChange={onChange} 
            placeholder="e.g. Accomplished Software Engineer with 5+ years of experience..."
        />
      </div>
    </div>
  )
}
