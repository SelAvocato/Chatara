import defaultLogo from '/icons/pfp.svg'

export default function Avatar({ src }) {
    return (
        <img src={src || defaultLogo} alt="Avatar Image" style={{ width: `100%`, height: `100%`, borderRadius: '50%', objectFit: 'cover' }} />
    )
}