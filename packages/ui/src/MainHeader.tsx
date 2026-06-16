"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Props {
  label: string;
}

export const MainHeader = ({ label }: Props) => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-[14px] font-medium text-muted-foreground hover:text-maroon-600 transition-colors duration-fast rounded-sm"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
};
