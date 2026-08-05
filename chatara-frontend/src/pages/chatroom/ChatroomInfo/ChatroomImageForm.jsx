import { useRef } from "react";
import { useUploadThing } from "../../../../utils/uploadthing";
import { useAuth } from "../../../hooks/useAuth";
import { useChatroom } from "../../../hooks/useChatroom";

export default function ChatroomImageForm() {
    const { accessToken } = useAuth();
    const { chatroom, setChatroom } = useChatroom()
    const hiddenFileInputRef = useRef(null);

    const { startUpload, isUploading } = useUploadThing("chatroomImageUploader", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "x-chatroom-id": chatroom?.id,
        },
        onClientUploadComplete: (res) => {
            if (res && res.length > 0) {
                const newRoomUrl = res[0].ufsUrl || res[0].url;

                if (setChatroom) {
                    setChatroom(prev => ({ ...prev, chatroom_img_url: newRoomUrl }));
                }
                alert("Chatroom logo updated successfully!");
            }
        },
        onUploadError: (error) => {
            alert(`Logo update failed: ${error.message}`);
        },
    });

    const handleFileSelectionChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await startUpload([file]);
    };

    return (
        <div style={{ textAlign: 'start' }}>
            <p
                disabled={isUploading}
                onClick={() => hiddenFileInputRef.current?.click()}
                style={{
                    cursor: isUploading ? "not-allowed" : "pointer"
                }}
            >
                {isUploading ? "Uploading image..." : "Change Image"}
            </p>

            <input
                type="file"
                ref={hiddenFileInputRef}
                onChange={handleFileSelectionChange}
                accept="image/*"
                style={{ display: "none" }}
            />
        </div>
    );
}
