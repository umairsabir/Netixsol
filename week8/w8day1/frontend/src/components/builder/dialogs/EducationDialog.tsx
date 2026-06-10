"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { EducationItemSchema, EducationItem } from "@/lib/resume-schema"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface EducationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: EducationItem) => void
  initialData?: EducationItem | null
}

export const EducationDialog: React.FC<EducationDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EducationItem>({
    resolver: zodResolver(EducationItemSchema),
    defaultValues: initialData || {
      id: crypto.randomUUID(),
      institution: "",
      studyType: "",
      area: "",
      startDate: "",
      endDate: "",
      score: "",
      summary: "",
      visible: true,
    },
  })

  useEffect(() => {
    if (open) {
      reset(initialData || {
        id: crypto.randomUUID(),
        institution: "",
        studyType: "",
        area: "",
        startDate: "",
        endDate: "",
        score: "",
        summary: "",
        visible: true,
      })
    }
  }, [open, initialData, reset])

  const onSubmit = (data: EducationItem) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Education" : "Add Education"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="institution">Institution / University</Label>
            <Input id="institution" {...register("institution")} placeholder="e.g. State University" />
            {errors.institution && <p className="text-xs text-destructive">{errors.institution.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studyType">Degree / Study Type</Label>
              <Input id="studyType" {...register("studyType")} placeholder="e.g. Bachelor of Science" />
              {errors.studyType && <p className="text-xs text-destructive">{errors.studyType.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Field of Study / Area</Label>
              <Input id="area" {...register("area")} placeholder="e.g. Computer Science" />
              {errors.area && <p className="text-xs text-destructive">{errors.area.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" {...register("startDate")} placeholder="e.g. Sep 2018" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (or Expected)</Label>
              <Input id="endDate" {...register("endDate")} placeholder="e.g. May 2022" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">GPA / Score</Label>
            <Input id="score" {...register("score")} placeholder="e.g. 3.8/4.0" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary / Accomplishments</Label>
            <Textarea 
                id="summary" 
                {...register("summary")} 
                placeholder="Mention any honors, relevant coursework, or thesis..."
                className="min-h-[100px]"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
