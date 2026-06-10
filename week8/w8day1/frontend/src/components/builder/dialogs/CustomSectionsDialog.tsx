"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CustomSectionSchema, CustomSection } from "@/lib/resume-schema"
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
import { RichTextEditor } from "@/components/editors/RichTextEditor"

interface CustomSectionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: CustomSection) => void
  initialData?: CustomSection | null
}

export const CustomSectionsDialog: React.FC<CustomSectionsDialogProps> = ({
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
  } = useForm<CustomSection>({
    resolver: zodResolver(CustomSectionSchema),
    defaultValues: initialData || {
      id: crypto.randomUUID(),
      name: "",
      content: "",
      visible: true,
    },
  })

  const content = watch("content")

  useEffect(() => {
    if (open) {
      reset(initialData || {
        id: crypto.randomUUID(),
        name: "",
        content: "",
        visible: true,
      })
    }
  }, [open, initialData, reset])

  const onSubmit = (data: CustomSection) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Custom Section" : "Add Custom Section"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Section Name</Label>
            <Input id="name" {...register("name")} placeholder="e.g. Portfolio, Hobbies, etc." />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <div className="border rounded-md overflow-hidden bg-background">
               <RichTextEditor 
                 content={content} 
                 onChange={(html) => setValue("content", html)} 
                 placeholder="Write your custom section content..."
               />
            </div>
            {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
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
