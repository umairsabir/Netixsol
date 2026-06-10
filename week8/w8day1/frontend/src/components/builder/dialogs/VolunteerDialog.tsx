"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { VolunteerItemSchema, VolunteerItem } from "@/lib/resume-schema"
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
import { RichTextEditor } from "@/components/editors/RichTextEditor"

interface VolunteerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: VolunteerItem) => void
  initialData?: VolunteerItem | null
}

export const VolunteerDialog: React.FC<VolunteerDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VolunteerItem>({
    resolver: zodResolver(VolunteerItemSchema),
    defaultValues: initialData || {
      id: crypto.randomUUID(),
      organization: "",
      position: "",
      startDate: "",
      endDate: "",
      summary: "",
      highlights: [],
    },
  })

  const summary = watch("summary")

  useEffect(() => {
    if (open) {
      reset(initialData || {
        id: crypto.randomUUID(),
        organization: "",
        position: "",
        startDate: "",
        endDate: "",
        summary: "",
        highlights: [],
      })
    }
  }, [open, initialData, reset])

  const onSubmit = (data: VolunteerItem) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Volunteer Experience" : "Add Volunteer Experience"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position / Role</Label>
              <Input id="position" {...register("position")} placeholder="e.g. Mentor" />
              {errors.position && <p className="text-xs text-destructive">{errors.position.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input id="organization" {...register("organization")} placeholder="e.g. Code.org" />
              {errors.organization && <p className="text-xs text-destructive">{errors.organization.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" {...register("startDate")} placeholder="e.g. Jan 2021" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" {...register("endDate")} placeholder="e.g. Present" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <div className="border rounded-md overflow-hidden bg-background">
               <RichTextEditor 
                 content={summary} 
                 onChange={(html) => setValue("summary", html)} 
                 placeholder="Describe your volunteer work..."
               />
            </div>
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
