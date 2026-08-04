import { UploadButton } from '../../../utils/uploadthing';
import { useAuth } from '../../hooks/useAuth';
import style from './ProfilePictureForm.module.css'
export default function ProfilePictureForm({ setIsChangngPfp }) {
    const { setUser, accessToken } = useAuth();
    const { pfpUploadContainerStyle } = style

    return (
        <div className={pfpUploadContainerStyle}>
            <UploadButton
                endpoint='avatarUploader'
                headers={{
                    Authorization: `Bearer ${accessToken}`
                }}

                content={{
                    button({ ready, isUploading }) {
                        if (isUploading) return 'Uploading image...';
                        if (ready) return 'Choose New Photo';
                        return 'Loading...';
                    }
                }}

                appearance={{
                    button: {
                        backgroundColor: '#D9D9D9',
                        color: 'black',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                    },
                    allowedContent: {
                        display: 'none',
                        height: '0px',
                        visibility: 'hidden'
                    }
                }}
                onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                        const newAvatarUrl = res[0].ufsUrl || res[0].url;
                        if (setUser) {
                            setUser(prev => ({ ...prev, pfp_url: newAvatarUrl }));
                        }
                        alert('Profile picture updated successfully!');
                        setIsChangngPfp(false)
                    }
                }}
                onUploadError={(error) => {
                    alert(`Upload failed: ${error.message}`);
                }}
            />

        </div>
    );
}
