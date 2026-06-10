"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SkillItemSchema, SkillItem } from "@/lib/resume-schema"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SkillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: SkillItem) => void
  initialData?: SkillItem | null
}

const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

export const SkillDialog: React.FC<SkillDialogProps> = ({
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
  } = useForm<SkillItem>({
    resolver: zodResolver(SkillItemSchema),
    defaultValues: initialData || {
      id: crypto.randomUUID(),
      name: "",
      level: "Intermediate",
      keywords: [],
      visible: true,
    },
  })

  const currentLevel = watch("level")

  useEffect(() => {
    if (open) {
      reset(initialData || {
        id: crypto.randomUUID(),
        name: "",
        level: "Intermediate",
        keywords: [],
        visible: true,
      })
    }
  }, [open, initialData, reset])

  const onSubmit = (data: SkillItem) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Skill" : "Add Skill"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Skill Name</Label>
            <Input id="name" {...register("name")} placeholder="e.g. React" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Proficiency Level</Label>
            <Select 
                onValueChange={(val) => setValue("level", val as any)} 
                defaultValue={currentLevel}
                value={currentLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords / Categories (Comma separated)</Label>
            <Input 
                id="keywords" 
                placeholder="e.g. Frontend, UI, Web" 
                onChange={(e) => {
                    const val = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                    setValue("keywords", val);
                }}
                defaultValue={initialData?.keywords?.join(', ')}
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
