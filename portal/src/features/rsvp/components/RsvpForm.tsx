import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useRsvpParticipants, useSubmitRsvp } from '../hooks/useRsvp'
import { useBranches } from '../../silsilah'
import { Combobox } from './Combobox'
import { PersonSuggestions } from './PersonSuggestions'
import { PersonSearchModal } from './PersonSearchModal'
import { ConfirmDialog } from './ConfirmDialog'
import type { Person } from '../../silsilah/types'
import type { RsvpParticipant } from '../types'

interface RsvpFormProps {
    eventIdOrSlug: string | number;
}

const EMPTY_PARTICIPANTS: RsvpParticipant[] = []

export function RsvpForm({ eventIdOrSlug }: RsvpFormProps) {
    const { data: participants = EMPTY_PARTICIPANTS, isLoading: participantsLoading } = useRsvpParticipants(eventIdOrSlug)
    const { data: branchesData } = useBranches()
    const branches = branchesData?.branches || []
    const submitRsvpMutation = useSubmitRsvp(eventIdOrSlug)

    // Form states
    const [selectedRegId, setSelectedRegId] = useState<number | null>(null)
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
    const [branchId, setBranchId] = useState<number | null>(null)
    const [email, setEmail] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [attendance, setAttendance] = useState<'hadir' | 'tidak_hadir' | null>(null)

    // UI States
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [confirmMessage, setConfirmMessage] = useState('')
    const [formSuccess, setFormSuccess] = useState(false)
    const [successSummary, setSuccessSummary] = useState<{
        name: string;
        personName: string;
        attendance: string;
        qobilah: string;
    } | null>(null)

    // Active participant object
    const activeParticipant = participants.find((p) => p.id === selectedRegId) as RsvpParticipant | undefined
    const isAlreadyRsvped = activeParticipant ? activeParticipant.attendance !== null : false

    // Combobox mapping
    const comboboxOptions = participants.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.attendance ? `Status: ${p.attendance === 'hadir' ? 'Hadir' : 'Tidak Hadir'}` : 'Belum RSVP'
    }))

    // Auto-fill and auto-suggest logic when participant changes
    useEffect(() => {
        if (activeParticipant) {
            setEmail(activeParticipant.email || '')
            setWhatsapp(activeParticipant.whatsapp || '')
            setAttendance(activeParticipant.attendance)

            // If the participant already has a linked person in db
            if (activeParticipant.person_id) {
                // Construct a minimal Person object to display
                const mockPerson: Person = {
                    id: activeParticipant.person_id,
                    full_name: activeParticipant.person_fullname || activeParticipant.name,
                    nickname: activeParticipant.nickname || undefined,
                    gender: 'male', // default or ignored for placeholder representation
                    generation: activeParticipant.person_generation || 3,
                    branch_id: activeParticipant.branch_id || 0,
                    branch: activeParticipant.branch_name ? {
                        id: activeParticipant.branch_id || 0,
                        name: activeParticipant.branch_name,
                        order: 1
                    } : undefined,
                    is_alive: true
                }
                setSelectedPerson(mockPerson)
                setBranchId(activeParticipant.branch_id)
            } else {
                setSelectedPerson(null)
                setBranchId(null)
            }
        } else {
            setSelectedPerson(null)
            setBranchId(null)
            setEmail('')
            setWhatsapp('')
            setAttendance(null)
        }
        setErrors({})
    }, [selectedRegId, participants])

    // Sync branch_id when selectedPerson changes
    useEffect(() => {
        if (selectedPerson) {
            setBranchId(selectedPerson.branch_id)
        }
    }, [selectedPerson])

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (!selectedRegId) newErrors.participant = 'Nama pendaftar wajib dipilih'
        if (!branchId) newErrors.branch = 'Qobilah wajib diisi'
        if (!email) {
            newErrors.email = 'Email wajib diisi'
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Format email tidak valid'
        }
        if (!whatsapp) {
            newErrors.whatsapp = 'Nomor WhatsApp wajib diisi'
        } else if (!/^62[0-9]{8,15}$/.test(whatsapp)) {
            newErrors.whatsapp = 'Nomor WhatsApp harus diawali dengan 62 dan hanya angka (contoh: 628123456789)'
        }
        if (!attendance) newErrors.attendance = 'Pilihan kehadiran wajib dipilih'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleFormSubmit = async (e?: React.FormEvent, isConfirmed = false) => {
        if (e) e.preventDefault()
        if (!validateForm() || !selectedRegId || !branchId || !attendance) return

        try {
            const payload = {
                registration_id: selectedRegId,
                person_id: selectedPerson ? selectedPerson.id : null,
                branch_id: branchId,
                email,
                whatsapp,
                attendance,
                confirmed: isConfirmed,
            }

            const result = await submitRsvpMutation.mutateAsync(payload)

            if (result.requires_confirmation) {
                setConfirmMessage(
                    `Kamu sebelumnya terdata akan hadir (status transportasi: ${result.transport_status}). Yakin ingin berubah menjadi Tidak Ikut?`
                )
                setIsConfirmOpen(true)
                return
            }

            // Success screen details
            const chosenBranch = branches.find((b) => b.id === branchId)
            setSuccessSummary({
                name: activeParticipant?.name || '',
                personName: selectedPerson ? selectedPerson.full_name : 'Tidak Terhubung Silsilah',
                attendance: attendance === 'hadir' ? 'Hadir (Ikut)' : 'Tidak Hadir (Tidak Ikut)',
                qobilah: chosenBranch ? chosenBranch.name : '-'
            })
            setFormSuccess(true)
            setIsConfirmOpen(false)
        } catch (err: any) {
            const errMsg = err.message || 'Terjadi kesalahan saat mengirim RSVP. Silakan coba lagi.'
            setErrors({ server: errMsg })
        }
    }

    const handleResetForm = () => {
        setSelectedRegId(null)
        setSelectedPerson(null)
        setBranchId(null)
        setEmail('')
        setWhatsapp('')
        setAttendance(null)
        setErrors({})
        setFormSuccess(false)
        setSuccessSummary(null)
    }

    if (participantsLoading) {
        return (
            <div className="flex justify-center py-10">
                <span className="material-symbols-outlined animate-spin text-4xl text-[#ec1325]">progress_activity</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {!formSuccess ? (
                <div className="bg-white border border-[#e6dbdc] rounded-2xl p-6 sm:p-8 shadow-sm">
                    <form onSubmit={(e) => handleFormSubmit(e)} className="space-y-6">
                        {errors.server && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2.5">
                                <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">error</span>
                                <span>{errors.server}</span>
                            </div>
                        )}

                        {/* Searchable Combobox Participant */}
                        <div>
                            <Combobox
                                options={comboboxOptions}
                                value={selectedRegId}
                                onChange={setSelectedRegId}
                                label="Pilih Nama Pendaftar"
                                placeholder="Cari nama pendaftaran awal..."
                            />
                            {errors.participant && (
                                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                    {errors.participant}
                                </p>
                            )}
                        </div>

                        {/* Lock Warning Banner if already RSVPed */}
                        {isAlreadyRsvped && (
                            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl flex items-start gap-2.5 shadow-sm">
                                <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">lock</span>
                                <div>
                                    <p className="font-bold">Kehadiran Sudah Dikonfirmasi</p>
                                    <p className="text-xs text-amber-700 mt-1 font-medium leading-relaxed">
                                        Data RSVP nama ini sudah tersimpan dan terkunci. Jika Anda ingin melakukan perubahan atau koreksi data, silakan hubungi Panitia atau Admin.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Connection Section */}
                        {selectedRegId && (
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-[#181112]">
                                    Hubungkan Ke Silsilah
                                </label>
                                
                                {selectedPerson ? (
                                    <div className="flex items-center justify-between p-4 bg-red-50/30 border border-[#ec1325]/30 rounded-xl flex-wrap sm:flex-nowrap gap-3">
                                        <div className="min-w-0 pr-2">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-600 text-[18px]">verified</span>
                                                <p className="text-sm font-bold text-[#181112] truncate">
                                                    {selectedPerson.full_name}
                                                </p>
                                            </div>
                                            <p className="text-xs text-[#896165] mt-1 flex items-center gap-1.5 flex-wrap">
                                                <span>Qobilah: {selectedPerson.branch?.name || branches.find(b => b.id === branchId)?.name || '-'}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                <span>Gen {selectedPerson.generation || '-'}</span>
                                            </p>
                                        </div>
                                        {!isAlreadyRsvped && (
                                            <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSearchModalOpen(true)}
                                                    className="px-2.5 py-1.5 bg-white border border-[#e6dbdc] text-xs font-bold text-[#181112] rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    Ubah
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPerson(null)
                                                        setBranchId(null)
                                                    }}
                                                    className="px-2.5 py-1.5 bg-white border border-red-200 text-xs font-bold text-red-650 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    Lepas
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {isAlreadyRsvped ? (
                                            <p className="text-sm text-gray-500 italic">Tidak terhubung ke data silsilah.</p>
                                        ) : (
                                            <>
                                                <PersonSuggestions
                                                    searchName={activeParticipant?.name || ''}
                                                    selectedPerson={selectedPerson}
                                                    onSelect={setSelectedPerson}
                                                    onOpenSearchModal={() => setIsSearchModalOpen(true)}
                                                />
                                                {errors.person && (
                                                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">info</span>
                                                        {errors.person}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Form Inputs */}
                        {selectedRegId && (
                            <div className="space-y-6 pt-4 border-t border-gray-150 animate-fade-in">
                                {/* Qobilah Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#181112] mb-1.5">
                                        Qobilah (Cabang Silsilah)
                                    </label>
                                    {selectedPerson ? (
                                        <>
                                            <input
                                                type="text"
                                                value={branches.find((b) => b.id === branchId)?.name || '-'}
                                                disabled
                                                className="w-full px-4 py-3 bg-gray-50 border border-[#e6dbdc] rounded-xl text-gray-500 font-medium cursor-not-allowed shadow-sm"
                                            />
                                            <p className="text-[11px] text-gray-400 mt-1">
                                                * Terisi otomatis dari database silsilah orang yang terhubung.
                                            </p>
                                        </>
                                    ) : (
                                        <div className="relative">
                                            <select
                                                value={branchId || ''}
                                                onChange={(e) => setBranchId(Number(e.target.value) || null)}
                                                disabled={isAlreadyRsvped}
                                                className="w-full px-4 py-3 bg-white border border-[#e6dbdc] rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ec1325]/10 focus:border-[#ec1325] appearance-none transition-all shadow-sm font-medium disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                            >
                                                <option value="">-- Pilih Qobilah --</option>
                                                {branches.map((b) => (
                                                    <option key={b.id} value={b.id}>
                                                        {b.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                expand_more
                                            </span>
                                        </div>
                                    )}
                                    {errors.branch && (
                                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">info</span>
                                            {errors.branch}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#181112] mb-1.5">
                                        Alamat Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="contoh@domain.com"
                                        disabled={isAlreadyRsvped}
                                        className="w-full px-4 py-3 bg-white border border-[#e6dbdc] rounded-xl text-[#181112] focus:outline-none focus:ring-2 focus:ring-[#ec1325]/10 focus:border-[#ec1325] transition-all shadow-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">info</span>
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Whatsapp */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#181112] mb-1.5">
                                        Nomor WhatsApp (wajib awalan 62)
                                    </label>
                                    <input
                                        type="text"
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="628123456789"
                                        disabled={isAlreadyRsvped}
                                        className="w-full px-4 py-3 bg-white border border-[#e6dbdc] rounded-xl text-[#181112] focus:outline-none focus:ring-2 focus:ring-[#ec1325]/10 focus:border-[#ec1325] transition-all shadow-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    />
                                    {errors.whatsapp && (
                                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">info</span>
                                            {errors.whatsapp}
                                        </p>
                                    )}
                                </div>

                                {/* Attendance radios */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#181112] mb-3">
                                        Konfirmasi Kehadiran
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => !isAlreadyRsvped && setAttendance('hadir')}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all font-medium ${
                                                attendance === 'hadir'
                                                    ? 'bg-red-50 border-[#ec1325] text-[#ec1325] ring-2 ring-red-100'
                                                    : 'border-[#e6dbdc] text-gray-600 hover:bg-gray-50'
                                            } ${isAlreadyRsvped ? 'opacity-75 cursor-not-allowed' : ''}`}
                                        >
                                            <span className="material-symbols-outlined text-[24px]">check_circle</span>
                                            <span>Ikut Ke Acara</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => !isAlreadyRsvped && setAttendance('tidak_hadir')}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all font-medium ${
                                                attendance === 'tidak_hadir'
                                                    ? 'bg-red-50 border-[#ec1325] text-[#ec1325] ring-2 ring-red-100'
                                                    : 'border-[#e6dbdc] text-gray-600 hover:bg-gray-50'
                                            } ${isAlreadyRsvped ? 'opacity-75 cursor-not-allowed' : ''}`}
                                        >
                                            <span className="material-symbols-outlined text-[24px]">cancel</span>
                                            <span>Tidak Ikut</span>
                                        </button>
                                    </div>
                                    {errors.attendance && (
                                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">info</span>
                                            {errors.attendance}
                                        </p>
                                    )}
                                </div>

                                {/* Submit button */}
                                {!isAlreadyRsvped && (
                                    <button
                                        type="submit"
                                        disabled={submitRsvpMutation.isPending}
                                        className="w-full bg-[#ec1325] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#c91020] shadow-lg shadow-red-500/10 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
                                    >
                                        {submitRsvpMutation.isPending ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Mengirim RSVP...</span>
                                            </>
                                        ) : (
                                            <span>Kirim RSVP</span>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            ) : (
                /* Success View */
                <div className="bg-white border border-[#e6dbdc] rounded-2xl shadow-md p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-red-50 text-[#ec1325] rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <span className="material-symbols-outlined text-[40px]">check_circle</span>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-[#181112]">Terima Kasih!</h2>
                        <p className="text-gray-500 mt-2">RSVP Anda berhasil dikirim dan terhubung dengan data silsilah.</p>
                    </div>

                    {successSummary && (
                        <div className="bg-gray-50 border border-[#e6dbdc] rounded-xl p-5 text-left max-w-md mx-auto space-y-2 text-sm">
                            <p className="text-gray-500 border-b border-gray-150 pb-2 mb-2 font-bold">Ringkasan Konfirmasi</p>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Nama Pendaftar:</span>
                                <span className="font-bold text-[#181112]">{successSummary.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Terhubung Sebagai:</span>
                                <span className="font-bold text-[#181112]">{successSummary.personName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Qobilah:</span>
                                <span className="font-bold text-[#181112]">{successSummary.qobilah}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status Kehadiran:</span>
                                <span className="font-bold text-red-650">{successSummary.attendance}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <button
                            type="button"
                            onClick={handleResetForm}
                            className="px-5 py-3 border border-[#e6dbdc] text-gray-700 bg-white rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm text-sm"
                        >
                            Isi untuk Peserta Lain
                        </button>
                        <Link
                            to={`/events/${eventIdOrSlug}`}
                            className="px-5 py-3 bg-[#ec1325] text-white rounded-xl font-bold hover:bg-[#c91020] transition-colors shadow-lg shadow-red-500/10 text-sm"
                        >
                            Kembali ke Detail Acara
                        </Link>
                    </div>
                </div>
            )}

            {/* Comprehensive Search Modal */}
            <PersonSearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSelect={setSelectedPerson}
                initialQuery={activeParticipant?.name || ''}
            />

            {/* Change Attendance Confirmation */}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                    handleFormSubmit(undefined, true)
                }}
                message={confirmMessage}
            />
        </div>
    )
}
