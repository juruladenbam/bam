import { useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import type { Person } from '../types'

interface ShareModalProps {
    person: Person
    isOpen: boolean
    onClose: () => void
}

export function ShareModal({ person, isOpen, onClose }: ShareModalProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (copySuccess) {
            const timer = setTimeout(() => setCopySuccess(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [copySuccess])

    if (!isOpen) return null

    const finalShareUrl = `${window.location.origin}/silsilah/person/${person.id}`

    const handleCopyLink = () => {
        navigator.clipboard.writeText(finalShareUrl)
        setCopySuccess(true)
    }

    const handleSocialShare = async (platform: 'whatsapp' | 'facebook' | 'twitter' | 'native') => {
        const text = `Lihat profil keluarga ${person.full_name} di Portal Bani Abdul Manan.`
        const url = finalShareUrl

        let shareLink = ''
        switch (platform) {
            case 'whatsapp':
                shareLink = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
                break
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
                break
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
                break
            case 'native':
                if (navigator.share) {
                    try {
                        await navigator.share({ title: 'Silsilah Keluarga', text, url })
                        return
                    } catch (e: any) {
                        if (e.name === 'AbortError') return
                        console.log('Native share failed', e)
                    }
                }
                handleCopyLink()
                return
        }

        if (shareLink) window.open(shareLink, '_blank')
    }

    const handleInstagramStory = async () => {
        if (!cardRef.current) return
        setIsGenerating(true)

        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#fff0f0',
                logging: false,
                width: 1080,
                height: 1920
            })

            const imageBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))

            if (!imageBlob) throw new Error("Failed to generate image")

            if (navigator.canShare && navigator.canShare({ files: [new File([imageBlob], 'story.png', { type: 'image/png' })] })) {
                await navigator.share({
                    files: [new File([imageBlob], 'story.png', { type: 'image/png' })],
                    title: 'Bani Abdul Manan Share',
                })
            } else {
                const link = document.createElement('a')
                link.download = `silsilah-${person.id}.png`
                link.href = canvas.toDataURL('image/png')
                link.click()
                alert('Gambar silsilah telah didownload. Silakan bagi ke Instagram Story Anda.')
            }

        } catch (e) {
            console.error(e)
            alert('Gagal membuat gambar sharing. Pastikan foto profil dapat diakses.')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="bg-white rounded-3xl w-full max-w-[400px] overflow-hidden relative z-10 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-300 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-[#181112]">Bagikan Profil</h3>
                    <button
                        onClick={onClose}
                        className="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Social Grid */}
                    <div className="grid grid-cols-4 gap-4">
                        <button
                            onClick={() => handleSocialShare('whatsapp')}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="size-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                                <i className="fa-brands fa-whatsapp text-2xl"></i>
                            </div>
                            <span className="text-[11px] font-medium text-gray-500">WhatsApp</span>
                        </button>

                        <button
                            onClick={handleInstagramStory}
                            disabled={isGenerating}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-sm">
                                <span className="material-symbols-outlined text-[24px]">{isGenerating ? 'hourglass_top' : 'add_a_photo'}</span>
                            </div>
                            <span className="text-[11px] font-medium text-gray-500">Story</span>
                        </button>

                        <button
                            onClick={() => handleSocialShare('facebook')}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="size-12 rounded-2xl bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] group-hover:scale-110 transition-transform">
                                <i className="fa-brands fa-facebook-f text-xl"></i>
                            </div>
                            <span className="text-[11px] font-medium text-gray-500">Facebook</span>
                        </button>

                        <button
                            onClick={() => handleSocialShare('native')}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="size-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[24px]">more_horiz</span>
                            </div>
                            <span className="text-[11px] font-medium text-gray-500">Lainnya</span>
                        </button>
                    </div>

                    {/* Copy Link Section */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Salin Tautan</label>
                        <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex-1 px-3 overflow-hidden">
                                <p className="text-sm text-gray-500 truncate font-medium">{finalShareUrl}</p>
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                                    ${copySuccess ? 'bg-green-500 text-white' : 'bg-[#ec1325] text-white hover:bg-red-700 shadow-md active:scale-95'}
                                `}
                            >
                                {copySuccess ? (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                        Tersalin
                                    </>
                                ) : (
                                    'Salin'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Text */}
                <div className="p-5 bg-gray-50/50 border-t border-gray-100">
                    <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                        Bagikan tautan ini ke keluarga lainnya agar silsilah <br /> tetap terjaga dan terhubung.
                    </p>
                </div>
            </div>

            {/* Hidden Card for Generation (Strict Inline Styles for html2canvas compatibility) */}
            <div className="absolute left-[-9999px] top-0" style={{ pointerEvents: 'none' }}>
                <div
                    ref={cardRef}
                    style={{
                        width: '1080px',
                        height: '1920px',
                        backgroundColor: '#fff0f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        padding: '64px'
                    }}
                >
                    {/* Decorative Background Elements */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '600px',
                            background: 'linear-gradient(to bottom, rgba(236,19,37,0.12), rgba(255,255,255,0))'
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '800px',
                            height: '800px',
                            borderRadius: '400px',
                            backgroundColor: 'rgba(239, 68, 68, 0.05)',
                            filter: 'blur(80px)',
                            transform: 'translate(200px, 200px)'
                        }}
                    />

                    {/* Logo Area */}
                    <div style={{ position: 'absolute', top: '100px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h1 style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#ec1325', margin: 0 }}>Bani Abdul Manan</h1>
                        <p style={{ fontSize: '24px', fontWeight: '500', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#896165', marginTop: '12px', margin: 0 }}>Silsilah Keluarga</p>
                    </div>

                    {/* Main Card Content */}
                    <div
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '80px',
                            width: '840px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '80px 40px',
                            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.1)',
                            border: '1px solid #fee2e2',
                            position: 'relative',
                            zIndex: 10
                        }}
                    >
                        {/* Avatar Wrapper */}
                        <div
                            style={{
                                width: '320px',
                                height: '320px',
                                borderRadius: '160px',
                                overflow: 'hidden',
                                marginBottom: '48px',
                                border: '16px solid #f8f6f6',
                                backgroundColor: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
                            }}
                        >
                            {person.photo_url ? (
                                <img
                                    src={`${person.photo_url}${person.photo_url.includes('?') ? '&' : '?'}t=${new Date().getTime()}`}
                                    alt={person.full_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '120px',
                                        fontWeight: 'bold',
                                        backgroundColor: person.gender === 'male' ? '#dbeafe' : '#fce7f3',
                                        color: person.gender === 'male' ? '#2563eb' : '#ec4899'
                                    }}
                                >
                                    {person.full_name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Text Content */}
                        <h2 style={{ fontSize: '72px', fontWeight: '800', color: '#181112', marginBottom: '24px', textAlign: 'center', lineHeight: 1.1 }}>
                            {person.full_name}
                        </h2>

                        <div style={{ backgroundColor: '#fff0f0', border: '1px solid #fee2e2', padding: '12px 32px', borderRadius: '100px', marginBottom: '64px' }}>
                            <p style={{ fontSize: '32px', fontWeight: '700', color: '#ec1325', margin: 0 }}>Generasi ke-{person.generation}</p>
                        </div>

                        <div style={{ width: '80%', height: '2px', backgroundColor: '#f3f4f6', marginBottom: '64px' }} />

                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '28px', fontWeight: '500', color: '#896165', marginBottom: '12px', margin: 0 }}>Lihat detail silsilah lengkap di</p>
                            <p style={{ fontSize: '42px', fontWeight: '900', color: '#181112', margin: 0 }}>portal.bamseribuputu.my.id</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
