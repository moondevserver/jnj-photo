import { Metadata } from "next";
import { FilesTable } from "@/components/files/files-table";
import { DirectorySelect } from "@/components/files/directory-select";

export const metadata: Metadata = {
  title: "파일 목록",
  description: "NAS에 저장된 이미지 파일들을 조회합니다.",
};

export default function FilesPage() {
  return (
    <div className="flex flex-col gap-5 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">파일 목록</h2>
        <p className="text-muted-foreground">
          NAS에 저장된 이미지 파일들을 조회하고 관리할 수 있습니다.
        </p>
      </div>
      <DirectorySelect />
      <FilesTable />
    </div>
  );
} 