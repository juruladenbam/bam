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
        const text = `Lihat profil keluarga ${person.full_name} di Portal Bani Abdurrahman.`
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
                        if (e.name === 'AbortError') {
                            return // User cancelled - do nothing and don't fallback
                        }
                        console.log('Native share failed', e)
                        // Fallback to copy link if it fails for other reasons
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
            // Generate Image
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: null,
                logging: true,
            })

            const imageBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))

            if (!imageBlob) throw new Error("Failed to generate image")

            if (navigator.canShare && navigator.canShare({ files: [new File([imageBlob], 'story.png', { type: 'image/png' })] })) {
                await navigator.share({
                    files: [new File([imageBlob], 'story.png', { type: 'image/png' })],
                    title: 'Bani Abdurrahman Share',
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

            {/* Hidden Card for Generation (Inline Styles for html2canvas compatibility) */}
            <div className="absolute left-[-9999px] top-0">
                <div
                    ref={cardRef}
                    className="w-[1080px] h-[1920px] p-16 flex flex-col items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: '#fff0f0', display: 'flex' }}
                >
                    {/* Decorative Background Elements */}
                    <div
                        className="absolute top-0 left-0 w-full h-[600px]"
                        style={{ background: 'linear-gradient(to bottom, rgba(236,19,37,0.12), rgba(255,255,255,0))' }}
                    />
                    <div
                        className="absolute bottom-0 right-0 size-[800px] rounded-full translate-x-1/2 translate-y-1/2"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', filter: 'blur(80px)' }}
                    />

                    {/* Logo */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center">
                        <h1 className="text-4xl font-bold tracking-[0.2em] uppercase" style={{ color: '#ec1325', margin: 0 }}>Bani Abdurrahman</h1>
                        <p className="text-xl font-medium tracking-[0.1em] text-[#896165] mt-2 uppercase">Silsilah Keluarga</p>
                    </div>

                    {/* Profile Card */}
                    <div
                        className="relative p-16 rounded-[80px] flex flex-col items-center w-[840px] text-center"
                        style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #fee2e2',
                            boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.15)'
                        }}
                    >
                        {/* Avatar */}
                        <div
                            className="size-[320px] rounded-full overflow-hidden mb-12 shadow-2xl shrink-0 mx-auto"
                            style={{
                                border: '16px solid #f8f6f6',
                                backgroundColor: '#f3f4f6'
                            }}
                        >
                            {person.photo_url ? (
                                <img
                                    src={`${person.photo_url}${person.photo_url.includes('?') ? '&' : '?'}t=${new Date().getTime()}`}
                                    alt={person.full_name}
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-[120px] font-bold"
                                    style={{
                                        backgroundColor: person.gender === 'male' ? '#dbeafe' : '#fce7f3',
                                        color: person.gender === 'male' ? '#2563eb' : '#ec4899'
                                    }}
                                >
                                    {person.full_name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <h2 className="text-7xl font-bold mb-4 leading-tight" style={{ color: '#181112' }}>{person.full_name}</h2>
                        <div
                            className="px-8 py-2 rounded-full inline-block mb-12"
                            style={{ backgroundColor: '#fff0f0', border: '1px solid #fee2e2' }}
                        >
                            <p className="text-3xl font-bold" style={{ color: '#ec1325' }}>Generasi ke-{person.generation}</p>
                        </div>

                        <div className="w-full h-[2px] mb-12" style={{ backgroundColor: '#f3f4f6' }} />

                        <div className="space-y-4">
                            <p className="text-3xl font-medium" style={{ color: '#896165' }}>Kunjungi portal kami untuk detail lengkap</p>
                            <p className="text-4xl font-black" style={{ color: '#181112' }}>portal.bamseribuputu.my.id</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
