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
      className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
};
