"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen } from "lucide-react";

export function DirectorySelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [path, setPath] = useState(searchParams.get("path") || "/app/photo");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("path", path);
    router.push(`/files?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <div className="flex-1">
        <Input
          placeholder="디렉토리 경로를 입력하세요 (예: /app/photo)"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        />
      </div>
      <Button type="submit">
        <FolderOpen className="mr-2 h-4 w-4" />
        조회
      </Button>
    </form>
  );
} 