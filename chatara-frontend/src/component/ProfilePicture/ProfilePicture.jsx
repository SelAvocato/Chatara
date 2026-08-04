import defaultPfp from '/icons/pfp.svg'

export default function ProfilePicture({ size, src }) {
    return (
        <img src={src || defaultPfp} alt="Profile Picture" style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover' }} />
    )
}