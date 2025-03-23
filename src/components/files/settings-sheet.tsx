"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ViewMode = "list" | "grid" | "card";

interface SettingsSheetProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filesPerPage: number;
  setFilesPerPage: (count: number) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export function SettingsSheet({
  viewMode,
  setViewMode,
  filesPerPage,
  setFilesPerPage,
  isDarkMode,
  setIsDarkMode,
}: SettingsSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilesPerPage, setTempFilesPerPage] = useState(filesPerPage);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setTempFilesPerPage(filesPerPage);
  }, [filesPerPage]);

  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme, setIsDarkMode]);

  const handleFilesPerPageChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setTempFilesPerPage(num);
      setFilesPerPage(num);
    }
  };

  const handleThemeChange = (isDark: boolean) => {
    setIsDarkMode(isDark);
    setTheme(isDark ? "dark" : "light");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" title="설정">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex items-center justify-between mb-6">
          <SheetTitle className="text-xl font-semibold">설정</SheetTitle>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>보기 모드</Label>
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="보기 모드 선택" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem value="list">리스트</SelectItem>
                <SelectItem value="grid">아이콘</SelectItem>
                <SelectItem value="card">카드</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center gap-2">
              <span className={isDarkMode ? "text-gray-500" : ""}>라이트</span>
              <Switch
                checked={isDarkMode}
                onCheckedChange={handleThemeChange}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className={!isDarkMode ? "text-gray-500" : ""}>다크</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filesPerPage">페이지당 파일 수</Label>
            <Input
              id="filesPerPage"
              type="number"
              min="1"
              value={tempFilesPerPage}
              onChange={(e) => handleFilesPerPageChange(e.target.value)}
              className="bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 