"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AwardItemSchema, AwardItem } from "@/lib/resume-schema"
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

interface AwardsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: AwardItem) => void
  initialData?: AwardItem | null
}

export const AwardsDialog: React.FC<AwardsDialogProps> = ({
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
  } = useForm<AwardItem>({
    resolver: zodResolver(AwardItemSchema),
    defaultValues: initialData || {
      id: crypto.randomUUID(),
      name: "",
      awarder: "",
      date: "",
      summary: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset(initialData || {
        id: crypto.randomUUID(),
        name: "",
        awarder: "",
        date: "",
        summary: "",
      })
    }
  }, [open, initialData, reset])

  const onSubmit = (data: AwardItem) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Award" : "Add Award"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Award Title</Label>
              <Input id="name" {...register("name")} placeholder="e.g. Employee of the Month" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="awarder">Awarder / Organization</Label>
              <Input id="awarder" {...register("awarder")} placeholder="e.g. Acme Corp" />
              {errors.awarder && <p className="text-xs text-destructive">{errors.awarder.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date Received</Label>
            <Input id="date" {...register("date")} placeholder="e.g. Dec 2022" />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Description</Label>
            <Textarea 
                id="summary" 
                {...register("summary")} 
                placeholder="Describe why you were given this award..."
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
