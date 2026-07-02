import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { useEvent } from '@/features/events';
import {
    useRsvpParticipants,
    useRsvpBranches,
    useSubmitRsvp
} from '@/features/rsvp';
import { Combobox } from '@/features/rsvp/components/Combobox';
import { ConfirmDialog } from '@/features/rsvp/components/ConfirmDialog';

export default function RsvpPage() {
    const { slug } = useParams<{ slug: string }>();
    const { data: eventResponse, isLoading: eventLoading } = useEvent(slug || '');
    const { data: participantsResponse, isLoading: participantsLoading } = useRsvpParticipants(slug || '');
    const { data: branchesResponse } = useRsvpBranches();
    const submitRsvpMutation = useSubmitRsvp(slug || '');

    // Form states
    const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [attendance, setAttendance] = useState<'hadir' | 'tidak_hadir' | null>(null);

    // UX states
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formSuccess, setFormSuccess] = useState(false);
    const [successSummary, setSuccessSummary] = useState<{
        name: string;
        attendance: string;
        qobilah: string;
    } | null>(null);

    // Confirmation warning states
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');

    const event = eventResponse?.data;
    const participants = participantsResponse?.data || [];
    const branches = branchesResponse?.data || [];

    // Map participants for Combobox
    const comboboxOptions = participants.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.branch_name ? `Qobilah: ${p.branch_name}` : 'Belum memilih Qobilah',
    }));

    // Auto-fill form if a participant is selected
    useEffect(() => {
        if (selectedRegId) {
            const participant = participants.find((p) => p.id === selectedRegId);
            if (participant) {
                // If branch_id is present, autofill it
                if (participant.branch_id) {
                    setBranchId(participant.branch_id);
                }
                // Pre-populate email/wa if they already did RSVP or have it in person
                setEmail(participant.email || '');
                setWhatsapp(participant.whatsapp || '');
                if (participant.attendance) {
                    setAttendance(participant.attendance);
                } else {
                    setAttendance(null);
                }
            }
        } else {
            setBranchId(null);
            setEmail('');
            setWhatsapp('');
            setAttendance(null);
        }
        setErrors({});
    }, [selectedRegId, participants]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!selectedRegId) newErrors.participant = 'Nama peserta wajib dipilih';
        if (!branchId) newErrors.branch = 'Qobilah wajib dipilih';
        if (!email) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Format email tidak valid';
        }
        if (!whatsapp) {
            newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
        } else if (!/^62[0-9]{8,15}$/.test(whatsapp)) {
            newErrors.whatsapp = 'Nomor WhatsApp harus diawali dengan 62 dan hanya angka (contoh: 628123456789)';
        }
        if (!attendance) newErrors.attendance = 'Pilihan kehadiran wajib dipilih';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e?: React.FormEvent, isConfirmed = false) => {
        if (e) e.preventDefault();
        if (!validateForm() || !selectedRegId || !branchId || !attendance) return;

        const participant = participants.find((p) => p.id === selectedRegId);
        if (!participant) return;

        try {
            const payload = {
                registration_id: selectedRegId,
                person_id: participant.person_id,
                branch_id: branchId,
                email,
                whatsapp,
                attendance,
                confirmed: isConfirmed,
            };

            const result = await submitRsvpMutation.mutateAsync(payload);

            if (result.requires_confirmation) {
                // Trigger modal confirmation
                setConfirmMessage(
                    `Kamu sebelumnya terdata akan hadir (status transportasi: ${result.transport_status}). Yakin ingin berubah menjadi Tidak Ikut?`
                );
                setIsConfirmOpen(true);
                return;
            }

            // Success
            const chosenBranch = branches.find((b) => b.id === branchId);
            setSuccessSummary({
                name: participant.name,
                attendance: attendance === 'hadir' ? 'Hadir (Ikut)' : 'Tidak Hadir (Tidak Ikut)',
                qobilah: chosenBranch ? chosenBranch.name : 'Ngaglik',
            });
            setFormSuccess(true);
            setIsConfirmOpen(false);
        } catch (err: any) {
            const errMsg = err.message || 'Terjadi kesalahan saat mengirim RSVP. Silakan coba lagi.';
            setErrors({ server: errMsg });
        }
    };

    const handleResetForm = () => {
        setSelectedRegId(null);
        setBranchId(null);
        setEmail('');
        setWhatsapp('');
        setAttendance(null);
        setErrors({});
        setFormSuccess(false);
        setSuccessSummary(null);
    };

    if (eventLoading || participantsLoading) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-[#87A878] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-[#4A6741] font-medium">Memuat Halaman RSVP...</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 border border-[#D4C5B2] text-center max-w-md shadow-lg">
                    <span className="material-symbols-outlined text-6xl text-[#ec1325]/30">error</span>
                    <h1 className="text-xl font-bold text-[#181112] mt-4">Acara Tidak Ditemukan</h1>
                    <p className="text-gray-500 mt-2">Halaman RSVP ini tidak valid.</p>
                    <Link
                        to="/acara"
                        className="inline-block mt-6 px-6 py-3 bg-[#87A878] text-white rounded-xl font-semibold hover:bg-[#4A6741] transition-all"
                    >
                        Kembali ke Acara
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF8F5] font-sans pb-16">
            <SEO
                title={`RSVP - ${event.name}`}
                description={`Konfirmasi kehadiran Anda pada acara ${event.name}`}
                url={`/acara/${event.slug}/rsvp`}
            />

            {/* Earthy Hero Header Banner */}
            <div className="bg-gradient-to-b from-[#87A878]/30 via-[#87A878]/10 to-transparent pt-12 pb-6 px-4">
                <div className="max-w-2xl mx-auto text-center space-y-3">
                    <span className="inline-block px-3 py-1 bg-[#87A878]/25 text-[#4A6741] text-xs font-bold rounded-full tracking-wider uppercase">
                        Konfirmasi Kehadiran
                    </span>
                    <h1 className="text-3xl font-extrabold text-[#4A6741] md:text-4xl tracking-tight">
                        Merajut Cinta
                    </h1>
                    <p className="text-[#896165] font-medium text-sm md:text-base">
                        Keluarga Besar Bani Abdul Manan (BAM)
                    </p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 mt-4">
                {/* Event info card */}
                <div className="bg-white border border-[#D4C5B2] rounded-2xl p-5 md:p-6 shadow-sm mb-6 flex flex-col gap-4">
                    <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-[#87A878] mt-0.5">location_on</span>
                        <div>
                            <p className="font-semibold text-gray-800 text-sm md:text-base">Lokasi Acara</p>
                            <a
                                href={event.location_maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#4A6741] hover:underline text-xs md:text-sm font-medium"
                            >
                                {event.location_name}
                            </a>
                        </div>
                    </div>

                    <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-[#87A878] mt-0.5">calendar_today</span>
                        <div>
                            <p className="font-semibold text-gray-800 text-sm md:text-base">Tanggal Pelaksanaan</p>
                            <p className="text-gray-600 text-xs md:text-sm">
                                Jumat, 3 Juli — Sabtu, 4 Juli 2026
                            </p>
                        </div>
                    </div>

                    {/* Brief Rundown */}
                    <div className="bg-[#FAF8F5] border border-[#D4C5B2]/40 rounded-xl p-4 mt-2">
                        <p className="text-xs font-bold text-[#4A6741] uppercase tracking-wider mb-2">Rundown Singkat</p>
                        <div className="space-y-2 text-xs md:text-sm text-gray-600">
                            <div className="flex gap-2">
                                <span className="font-semibold text-[#87A878] whitespace-nowrap">Kamis, 3 Juli · 11:00</span>
                                <span>Kumpul di Miji (pembagian kaos & ceremony keberangkatan)</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-semibold text-[#87A878] whitespace-nowrap">Kamis, 3 Juli · 19:00</span>
                                <span>Makrab (silsilah & tradisi BAM)</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-semibold text-[#87A878] whitespace-nowrap">Jumat, 4 Juli · 07:00</span>
                                <span>Fun Game / Outbound</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form or Success Box */}
                {!formSuccess ? (
                    <div className="bg-white border border-[#D4C5B2] rounded-2xl shadow-md p-6 md:p-8">
                        <form onSubmit={(e) => handleFormSubmit(e)} className="space-y-6">
                            {errors.server && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2.5">
                                    <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">error</span>
                                    <span>{errors.server}</span>
                                </div>
                            )}

                            {/* Participant select */}
                            <div>
                                <Combobox
                                    options={comboboxOptions}
                                    value={selectedRegId}
                                    onChange={setSelectedRegId}
                                    label="Pilih Nama Anda"
                                    placeholder="Ketik untuk mencari nama Anda..."
                                />
                                {errors.participant && (
                                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">info</span>
                                        {errors.participant}
                                    </p>
                                )}
                            </div>

                            {/* Qobilah dropdown */}
                            <div>
                                <label className="block text-sm font-semibold text-[#4A6741] mb-1.5">
                                    Pilih Qobilah Anda
                                </label>
                                <div className="relative">
                                    <select
                                        value={branchId || ''}
                                        onChange={(e) => setBranchId(Number(e.target.value) || null)}
                                        className="w-full px-4 py-3 bg-white border border-[#D4C5B2] rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] appearance-none transition-all shadow-sm"
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
                                {errors.branch && (
                                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">info</span>
                                        {errors.branch}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-[#4A6741] mb-1.5">
                                    Alamat Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="contoh@domain.com"
                                    className="w-full px-4 py-3 bg-white border border-[#D4C5B2] rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] transition-all shadow-sm"
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
                                <label className="block text-sm font-semibold text-[#4A6741] mb-1.5">
                                    Nomor WhatsApp (wajib awalan 62)
                                </label>
                                <input
                                    type="text"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="628123456789"
                                    className="w-full px-4 py-3 bg-white border border-[#D4C5B2] rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] transition-all shadow-sm"
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
                                <label className="block text-sm font-semibold text-[#4A6741] mb-3">
                                    Konfirmasi Kehadiran
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setAttendance('hadir')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all font-medium ${
                                            attendance === 'hadir'
                                                ? 'bg-[#87A878]/10 border-[#87A878] text-[#4A6741] ring-2 ring-[#87A878]/20'
                                                : 'border-[#D4C5B2] text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[24px]">check_circle</span>
                                        <span>Ikut Ke Acara</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setAttendance('tidak_hadir')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all font-medium ${
                                            attendance === 'tidak_hadir'
                                                ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100'
                                                : 'border-[#D4C5B2] text-gray-600 hover:bg-gray-50'
                                        }`}
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
                            <button
                                type="submit"
                                disabled={submitRsvpMutation.isPending}
                                className="w-full bg-[#4A6741] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#3d5536] shadow-lg shadow-[#4A6741]/20 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
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
                        </form>
                    </div>
                ) : (
                    // Success View
                    <div className="bg-white border border-[#D4C5B2] rounded-2xl shadow-md p-8 text-center animate-fade-in space-y-6">
                        <div className="w-16 h-16 bg-green-50 text-[#87A878] rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <span className="material-symbols-outlined text-[40px]">check_circle</span>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Terima Kasih!</h2>
                            <p className="text-gray-500 mt-2">RSVP Anda berhasil dikirim ke panitia.</p>
                        </div>

                        {successSummary && (
                            <div className="bg-[#FAF8F5] border border-[#D4C5B2]/40 rounded-xl p-5 text-left max-w-md mx-auto space-y-2 text-sm">
                                <p className="text-gray-500 border-b border-gray-100 pb-2 mb-2 font-semibold">Ringkasan Konfirmasi</p>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Nama:</span>
                                    <span className="font-semibold text-gray-800">{successSummary.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Qobilah:</span>
                                    <span className="font-semibold text-gray-800">{successSummary.qobilah}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status Kehadiran:</span>
                                    <span className="font-semibold text-green-700">{successSummary.attendance}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <button
                                type="button"
                                onClick={handleResetForm}
                                className="px-5 py-3 border border-[#D4C5B2] text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Isi untuk Peserta Lain
                            </button>
                            <Link
                                to={`/acara/${slug}`}
                                className="px-5 py-3 bg-[#4A6741] text-white rounded-xl font-semibold hover:bg-[#3d5536] transition-colors shadow-lg shadow-[#4A6741]/10"
                            >
                                Kembali ke Detail Acara
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm warning Dialog */}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                    handleFormSubmit(undefined, true);
                }}
                message={confirmMessage}
            />
        </div>
    );
}
