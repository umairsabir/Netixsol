"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Basics, BasicsSchema } from "@/lib/resume-schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface BasicsEditorProps {
  data: Basics;
  onChange: (data: Basics) => void;
}

export const BasicsEditor: React.FC<BasicsEditorProps> = ({
  data,
  onChange,
}) => {
  const form = useForm<Basics>({
    resolver: zodResolver(BasicsSchema),
    defaultValues: data,
  });

  // Watch for changes and call onChange
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value) onChange(value as Basics);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onChange]);

  // Sync form with external data changes (e.g. undo/redo)
  useEffect(() => {
    form.reset(data);
  }, [data, form.reset]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...form.register("name")} placeholder="John Doe" className="rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Headline / Job Title</Label>
          <Input id="label" {...form.register("label")} placeholder="Senior Software Engineer" className="rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} placeholder="john@example.com" className="rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...form.register("phone")} placeholder="+1 234 567 890" className="rounded-xl" />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Location</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...form.register("location.city")} placeholder="Seattle" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region / State</Label>
            <Input id="region" {...form.register("location.region")} placeholder="WA" className="rounded-xl" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Summary / Bio</Label>
        <textarea
          id="summary"
          {...form.register("summary")}
          className="flex min-h-[120px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Tell us about yourself..."
        />
        <p className="text-[10px] text-muted-foreground italic px-1 font-medium">Markdown supported (via template rendering).</p>
      </div>
    </div>
  );
};
