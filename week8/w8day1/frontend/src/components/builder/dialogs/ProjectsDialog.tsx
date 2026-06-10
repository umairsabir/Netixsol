"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ProjectItemSchema, ProjectItem } from "@/lib/resume-schema"
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

interface ProjectsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: ProjectItem) => void
  initialData?: ProjectItem | null
}

export const ProjectsDialog: React.FC<ProjectsDialogProps> = ({
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
    formState: { errors },
  } = useForm<ProjectItem>({
    resolver: zodResolver(ProjectItemSchema),
    defaultValues: initialData || {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      url: "",
      highlights: [],
    },
  })

  useEffect(() => {
    if (open) {
      reset(initialData || {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        url: "",
        highlights: [],
      })
    }
  }, [open, initialData, reset])

  const onSubmit = (data: ProjectItem) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Project" : "Add Project"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" {...register("name")} placeholder="e.g. Personal Portfolio" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Project URL</Label>
              <Input id="url" {...register("url")} placeholder="e.g. https://github.com/..." />
              {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" {...register("startDate")} placeholder="e.g. Jan 2023" />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" >End Date</Label>
              <Input 
                id="endDate" 
                {...register("endDate")} 
                placeholder="e.g. Present" 
              />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea 
                id="description" 
                {...register("description")} 
                placeholder="A brief overview of the project..."
                className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="highlights">Highlights (Bullet points, one per line)</Label>
            <Textarea 
                id="highlights" 
                placeholder="- Built with Next.js and Tailwind CSS&#10;- Implemented real-time sync"
                className="min-h-[100px]"
                onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(l => l.trim() !== '');
                    setValue("highlights", lines);
                }}
                defaultValue={initialData?.highlights?.join('\n')}
            />
            <p className="text-[10px] text-muted-foreground">Each new line will be a bullet point.</p>
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
