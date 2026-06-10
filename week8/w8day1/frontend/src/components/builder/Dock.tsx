"use client";

import React from "react";
import { 
  Minus, 
  Plus, 
  RotateCcw, 
  RotateCw, 
  Search, 
  Undo, 
  Redo,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DockProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

export const Dock: React.FC<DockProps> = ({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  className,
}) => {
  return (
    <div className={cn(
      "fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 glass rounded-full shadow-2xl transition-all hover:scale-105 z-50",
      className
    )}>
      {/* Undo/Redo Group */}
      <div className="flex items-center gap-1 px-1">
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={onUndo} disabled={!canUndo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={onRedo} disabled={!canRedo}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-4 w-px bg-border mx-1" />

      {/* Zoom Group */}
      <div className="flex items-center gap-1 px-1">
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={onZoomOut}>
          <Minus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-medium" onClick={onResetZoom}>
          100%
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={onZoomIn}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-4 w-px bg-border mx-1" />

      {/* View Options Group */}
      <div className="flex items-center gap-1 px-1">
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
