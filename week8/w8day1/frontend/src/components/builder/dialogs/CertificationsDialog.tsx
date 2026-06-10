"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CertificationItemSchema, CertificationItem } from "@/lib/resume-schema"
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

interface CertificationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: CertificationItem) => void
  initialData?: CertificationItem | null
}

export const CertificationsDialog: React.FC<CertificationsDialogProps> = ({
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
  } = useForm<CertificationItem>({
    resolver: zodResolver(CertificationItemSchema),
    defaultValues: initialData || {
      id: crypto.randomUUID(),
      name: "",
      issuer: "",
      date: "",
      url: "",
      summary: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset(initialData || {
        id: crypto.randomUUID(),
        name: "",
        issuer: "",
        date: "",
        url: "",
        summary: "",
      })
    }
  }, [open, initialData, reset])

  const onSubmit = (data: CertificationItem) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Certification" : "Add Certification"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Certificate Name</Label>
              <Input id="name" {...register("name")} placeholder="e.g. AWS Certified Solutions Architect" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer</Label>
              <Input id="issuer" {...register("issuer")} placeholder="e.g. Amazon Web Services" />
              {errors.issuer && <p className="text-xs text-destructive">{errors.issuer.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date Earned</Label>
              <Input id="date" {...register("date")} placeholder="e.g. March 2023" />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Certificate URL</Label>
              <Input id="url" {...register("url")} placeholder="e.g. https://..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Additional Details</Label>
            <Textarea 
                id="summary" 
                {...register("summary")} 
                placeholder="Briefly describe the significance or key skills verified..."
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
