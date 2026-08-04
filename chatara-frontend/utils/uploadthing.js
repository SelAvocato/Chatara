import { generateUploadButton } from "@uploadthing/react"
const baseUrl = import.meta.env.VITE_API_BASE_URL

export const UploadButton = generateUploadButton({
    url: `${baseUrl}/api/uploadthing`, 
});
