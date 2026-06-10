"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LanguageItemSchema, LanguageItem } from "@/lib/resume-schema"
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

interface LanguagesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: LanguageItem) => void
  initialData?: LanguageItem | null
}

const PROFICIENCY_LEVELS = [
  "Native",
  "Fluent",
  "Professional",
  "Intermediate",
  "Beginner"
]

export const LanguagesDialog: React.FC<LanguagesDialogProps> = ({
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
  } = useForm<LanguageItem>({
    resolver: zodResolver(LanguageItemSchema),
    defaultValues: initialData || {
      id: crypto.randomUUID(),
      name: "",
      description: "Fluent",
    },
  })

  const description = watch("description")

  useEffect(() => {
    if (open) {
      reset(initialData || {
        id: crypto.randomUUID(),
        name: "",
        description: "Fluent",
      })
    }
  }, [open, initialData, reset])

  const onSubmit = (data: LanguageItem) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Language" : "Add Language"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Language Name</Label>
            <Input id="name" {...register("name")} placeholder="e.g. English" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Proficiency Level</Label>
            <Select 
                onValueChange={(value) => setValue("description", value)} 
                defaultValue={description}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select proficiency" />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
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
