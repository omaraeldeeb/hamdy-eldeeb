import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Process the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Read the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;

    // Define the directory and create it if it doesn't exist
    const publicDir = path.join(process.cwd(), "public");
    const uploadsDir = path.join(publicDir, folder);

    try {
      await writeFile(path.join(uploadsDir, fileName), buffer);
    } catch (error) {
      console.error("Error saving file:", error);
      // If directory doesn't exist, create it and retry
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(path.join(uploadsDir, fileName), buffer);
    }

    // Return the URL to the uploaded file
    const fileUrl = `/${folder}/${fileName}`;

    return NextResponse.json({
      url: fileUrl,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Error in upload route:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// Increase limit for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
