import { createContext, useContext } from "react";

export const SUPPORTED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const UploadContext = createContext(null);

export const useUploads = () => {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUploads must be used within an UploadProvider");
  return ctx;
};

export default UploadContext;
