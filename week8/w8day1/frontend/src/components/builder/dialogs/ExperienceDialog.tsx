"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ExperienceItemSchema, ExperienceItem } from "@/lib/resume-schema"
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
import { Checkbox } from "@/components/ui/checkbox"

interface ExperienceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: ExperienceItem) => void
  initialData?: ExperienceItem | null
}

export const ExperienceDialog: React.FC<ExperienceDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExperienceItem>({
    resolver: zodResolver(ExperienceItemSchema),
    defaultValues: initialData || {
      id: crypto.randomUUID(),
      name: "",
      position: "",
      startDate: "",
      endDate: "",
      isWorkingHere: false,
      location: "",
      summary: "",
      highlights: [],
    },
  })

  const isWorkingHere = watch("isWorkingHere")

  useEffect(() => {
    if (open) {
      reset(initialData || {
        id: crypto.randomUUID(),
        name: "",
        position: "",
        startDate: "",
        endDate: "",
        isWorkingHere: false,
        location: "",
        summary: "",
        highlights: [],
      })
    }
  }, [open, initialData, reset])

  const onSubmit = (data: ExperienceItem) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Experience" : "Add Experience"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company / Organization</Label>
              <Input id="name" {...register("name")} placeholder="e.g. Google" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input id="position" {...register("position")} placeholder="e.g. Senior Frontend Developer" />
              {errors.position && <p className="text-xs text-destructive">{errors.position.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" {...register("startDate")} placeholder="e.g. Jan 2022" />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className={isWorkingHere ? "opacity-50" : ""}>End Date</Label>
              <Input 
                id="endDate" 
                {...register("endDate")} 
                placeholder="e.g. Present" 
                disabled={isWorkingHere}
              />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
                id="isWorkingHere" 
                checked={isWorkingHere} 
                onCheckedChange={(checked) => setValue("isWorkingHere", !!checked)} 
            />
            <Label htmlFor="isWorkingHere">I currently work here</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} placeholder="e.g. Mountain View, CA" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary / Description</Label>
            <Textarea 
                id="summary" 
                {...register("summary")} 
                placeholder="Briefly describe your role and key achievements..."
                className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="highlights">Highlights (Bullet points, one per line)</Label>
            <Textarea 
                id="highlights" 
                placeholder="- Led a team of 5 developers&#10;- Improved performance by 30%"
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
