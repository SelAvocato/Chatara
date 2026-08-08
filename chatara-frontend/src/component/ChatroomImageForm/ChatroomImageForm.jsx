import { useRef } from 'react'
import { useUploadThing } from '../../../utils/uploadthing'
import { useAuth } from '../../hooks/useAuth'
import { useChatroom } from '../../hooks/useChatroom'

export default function ChatroomImageForm({ setNewChatroomImage }) {
    const { accessToken } = useAuth()
    const { chatroom, setChatroom } = useChatroom()
    const hiddenFileInputRef = useRef(null)
    const isCreationMode = Boolean(setNewChatroomImage)
    const uploadHeaders = {
        Authorization: `Bearer ${accessToken}`,
    }

    if (!isCreationMode && chatroom?.id) {
        uploadHeaders['x-chatroom-id'] = chatroom.id
    }

    const { startUpload, isUploading } = useUploadThing('chatroomImageUploader', {
        headers: uploadHeaders,
        onClientUploadComplete: (res) => {
            if (res && res.length > 0) {
                const newRoomUrl = res[0].ufsUrl || res[0].url

                if (isCreationMode) {
                    setNewChatroomImage(newRoomUrl)
                    alert('Image uploaded successfully!')
                } else {
                    if (setChatroom) {
                        setChatroom(prev => ({ ...prev, chatroom_img_url: newRoomUrl }))
                    }
                    alert('Chatroom avatar updated successfully!')
                }
            }
        },
        onUploadError: (error) => {
            alert(`Avatar update failed: ${error.message}`)
        },
    })

    const handleFileSelectionChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!isCreationMode && !chatroom?.id) {
            alert('Error: Active chatroom target context missing.')
            return
        }

        await startUpload([file])
    }

    return (
        <>
            <p
                onClick={() => !isUploading && hiddenFileInputRef.current?.click()}
                style={{
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    opacity: isUploading ? 0.5 : 1
                }}
            >
                {isUploading ? 'Uploading image...' : isCreationMode ? 'Upload Image' : 'Change Image'}
            </p>

            <input
                type='file'
                ref={hiddenFileInputRef}
                onChange={handleFileSelectionChange}
                accept='image/*'
                style={{ display: 'none' }}
            />
        </>
    )
}
