"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image";
import { formatFileSize, formatDate } from "@/lib/utils";
import Script from "next/script";

declare global {
  interface Window {
    kakao: any;
  }
}

interface FileDetailDialogProps {
  file: {
    name: string;
    path: string;
    size: number;
    type: string;
    createdAt: string;
    updatedAt: string;
    metadata?: {
      takenAt?: string;
      location?: {
        latitude: number;
        longitude: number;
      };
      dimensions?: {
        width: number;
        height: number;
      };
      camera?: {
        make?: string;
        model?: string;
      };
    };
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileDetailDialog({ file, open, onOpenChange }: FileDetailDialogProps) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAddress() {
      if (!file?.metadata?.location?.latitude || !file?.metadata?.location?.longitude) {
        return;
      }

      try {
        const { latitude, longitude } = file.metadata.location;
        const response = await fetch(
          `/api/kakao/address?latitude=${latitude}&longitude=${longitude}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.documents && data.documents.length > 0) {
          const addressData = data.documents[0];
          const roadAddress = addressData.road_address?.address_name;
          const jibunAddress = addressData.address?.address_name;
          
          // 도로명 주소가 있으면 도로명 주소를, 없으면 지번 주소를 사용
          setAddress(roadAddress || jibunAddress || null);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    }

    if (open && file) {
      fetchAddress();
    }
  }, [file, open]);

  if (!file) return null;

  const isImage = file.type.startsWith("image/");
  const googleMapsUrl = file.metadata?.location 
    ? `https://www.google.com/maps?q=${file.metadata.location.latitude},${file.metadata.location.longitude}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle>{file.name}</DialogTitle>
          <DialogDescription>파일 상세 정보</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isImage && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={`/api/files/image?path=${encodeURIComponent(file.path)}`}
                alt={file.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-semibold">파일 크기</span>
              <span className="col-span-2">{formatFileSize(file.size)}</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-semibold">생성일</span>
              <span className="col-span-2">{formatDate(file.createdAt)}</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-semibold">수정일</span>
              <span className="col-span-2">{formatDate(file.updatedAt)}</span>
            </div>
            {file.metadata?.takenAt && (
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold">촬영 시간</span>
                <span className="col-span-2">{file.metadata.takenAt}</span>
              </div>
            )}
            {file.metadata?.dimensions && (
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold">이미지 크기</span>
                <span className="col-span-2">
                  {file.metadata.dimensions.width} × {file.metadata.dimensions.height}
                </span>
              </div>
            )}
            {file.metadata?.camera?.make && (
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold">카메라</span>
                <span className="col-span-2">
                  {file.metadata.camera.make} {file.metadata.camera.model}
                </span>
              </div>
            )}
            {file.metadata?.location && (
              <>
                {address && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold">주소</span>
                    <span className="col-span-2 text-gray-700">{address}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold">GPS 좌표</span>
                  <div className="col-span-2">
                    <div className="font-mono text-sm text-gray-500">
                      {file.metadata?.location?.latitude.toFixed(6)}, {file.metadata?.location?.longitude.toFixed(6)}
                    </div>
                    {googleMapsUrl && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        지도에서 보기
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 