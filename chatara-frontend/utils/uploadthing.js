import { generateReactHelpers } from "@uploadthing/react"

const baseUrl = import.meta.env.VITE_API_BASE_URL

export const { useUploadThing } = generateReactHelpers({
    url: `${baseUrl}/api/uploadthing`
})
