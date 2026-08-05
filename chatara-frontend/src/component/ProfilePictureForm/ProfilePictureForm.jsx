import { useRef } from "react"
import { useUploadThing } from "../../../utils/uploadthing"
import { useAuth } from "../../hooks/useAuth"
import style from "./ProfilePictureForm.module.css"

export default function ProfilePictureForm() {
    const { setUser, accessToken } = useAuth()
    const { pfpUploadContainerStyle } = style
    const hiddenFileInputRef = useRef(null)

    const { startUpload, isUploading } = useUploadThing("avatarUploader", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        onClientUploadComplete: (res) => {
            if (res && res.length > 0) {
                const newAvatarUrl = res[0].ufsUrl || res[0].url

                if (setUser) {
                    setUser((prev) => ({ ...prev, pfp_url: newAvatarUrl }))
                }
                alert("Profile picture updated successfully!")
            }
        },
        onUploadError: (error) => {
            alert(`Upload failed: ${error.message}`)
        },
    })

    const handleFileSelectionChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        await startUpload([file])
    }

    return (
        <div className={pfpUploadContainerStyle}>
            <p
                onClick={() => !isUploading && hiddenFileInputRef.current?.click()}
                style={{
                    backgroundColor: '#D9D9D9',
                    color: 'black',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    display: 'inline-block',
                    cursor: isUploading ? "not-allowed" : "pointer",
                    opacity: isUploading ? 0.6 : 1
                }}
            >
                {isUploading ? "Uploading image..." : "Choose New Photo"}
            </p>

            <input
                type="file"
                ref={hiddenFileInputRef}
                onChange={handleFileSelectionChange}
                accept="image/*"
                style={{ display: "none" }}
            />
        </div>
    )
}
