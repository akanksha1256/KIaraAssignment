"use client";

import { ArrowLeft as ArrowLeftIcon } from "lucide-react";
import { Button } from "@repo/ui";

interface BackButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export const BackButton = ({ onClick, children }: BackButtonProps) => (
  <Button
    variant="ghost"
    onClick={onClick}
    className="px-2.5 py-1 text-[13.5px] -ml-2.5 mb-8"
  >
    <ArrowLeftIcon className="h-3.5 w-3.5" />
    {children}
  </Button>
);
