"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReferenceItemSchema, ReferenceItem } from "@/lib/resume-schema"
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

interface ReferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: ReferenceItem) => void
  initialData?: ReferenceItem | null
}

export const ReferencesDialog: React.FC<ReferencesDialogProps> = ({
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
  } = useForm<ReferenceItem>({
    resolver: zodResolver(ReferenceItemSchema),
    defaultValues: initialData || {
      id: crypto.randomUUID(),
      name: "",
      email: "",
      phone: "",
      summary: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset(initialData || {
        id: crypto.randomUUID(),
        name: "",
        email: "",
        phone: "",
        summary: "",
      })
    }
  }, [open, initialData, reset])

  const onSubmit = (data: ReferenceItem) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Reference" : "Add Reference"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Reference Name</Label>
            <Input id="name" {...register("name")} placeholder="e.g. Jane Doe" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="e.g. jane.doe@example.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} placeholder="e.g. +1 555-0100" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Description / Title</Label>
            <Textarea 
                id="summary" 
                {...register("summary")} 
                placeholder="e.g. Former Manager at Acme Corp"
                className="min-h-[80px]"
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
