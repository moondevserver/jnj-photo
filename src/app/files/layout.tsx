import { Metadata } from "next";

export const metadata: Metadata = {
  title: "파일 목록",
  description: "NAS에 저장된 이미지 파일들을 조회합니다.",
};

export default function FilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 