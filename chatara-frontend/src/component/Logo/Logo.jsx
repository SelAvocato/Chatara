import defaultLogo from '/icons/pfp.svg'

export default function Logo({ size, src }) {
    return (
        <img src={src || defaultLogo} alt="Image Logo" style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover' }} />
    )
}