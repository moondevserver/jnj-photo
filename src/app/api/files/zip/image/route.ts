import { NextRequest, NextResponse } from "next/server";
import AdmZip from "adm-zip";
import mime from "mime-types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const zipPath = searchParams.get("path");
    const entryPath = searchParams.get("entry");

    if (!zipPath || !entryPath) {
      return new NextResponse("Path and entry parameters are required", { status: 400 });
    }

    const zip = new AdmZip(zipPath);
    const entry = zip.getEntry(entryPath);

    if (!entry) {
      return new NextResponse("File not found in ZIP", { status: 404 });
    }

    const buffer = entry.getData();
    const contentType = mime.lookup(entryPath) || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving image from ZIP:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 