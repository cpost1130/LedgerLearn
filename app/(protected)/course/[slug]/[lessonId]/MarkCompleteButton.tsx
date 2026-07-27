"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MarkCompleteButtonProps {
  studentId: number;
  lessonId: number;
  isCompleted: boolean;
  nextUrl: string;
}

export function MarkCompleteButton({
  studentId,
  lessonId,
  isCompleted,
  nextUrl,
}: MarkCompleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkComplete() {
    setLoading(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, lessonId }),
      });

      if (res.ok) {
        router.push(nextUrl);
        router.refresh();
      } else {
        console.error("Failed to mark complete");
      }
    } catch (err) {
      console.error("Error marking complete:", err);
    } finally {
      setLoading(false);
    }
  }

  if (isCompleted) {
    return (
      <button
        onClick={() => router.push(nextUrl)}
        className="rounded-lg bg-teal px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-deep-blue cursor-pointer"
      >
        Continue →
      </button>
    );
  }

  return (
    <button
      onClick={handleMarkComplete}
      disabled={loading}
      className="rounded-lg bg-teal px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-deep-blue disabled:cursor-wait disabled:opacity-70 cursor-pointer"
    >
      {loading ? "Saving..." : "Mark Complete & Continue →"}
    </button>
  );
}
