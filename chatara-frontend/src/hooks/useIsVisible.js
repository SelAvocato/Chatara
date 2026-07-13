import { useState, useEffect } from 'react'

export function useIsVisible(ref) {
    const [isIntersecting, setIsIntersecting] = useState(false)

    useEffect(() => {
        if (!ref.current) return
        const observer = new IntersectionObserver(
            ([entry]) => setIsIntersecting(entry.isIntersecting),
            { threshold: 0.1 }
        )
        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [ref])

    return isIntersecting
}