import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ActionMenu } from '../../components/ActionMenu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '../../features/content/api/contentApi';
import { useBranches, useSearchPersons } from '../../features/admin/hooks/useAdmin';

export function EventDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const eventId = Number(id);
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceFilter, setAttendanceFilter] = useState<string>('all');

    // Edit modal states
    const [editingReg, setEditingReg] = useState<any | null>(null);
    const [editPerson, setEditPerson] = useState<any | null>(null);
    const [personSearchQuery, setPersonSearchQuery] = useState('');
    const [editBranchId, setEditBranchId] = useState<number | null>(null);
    const [editEmail, setEditEmail] = useState('');
    const [editWhatsapp, setEditWhatsapp] = useState('');
    const [editAttendance, setEditAttendance] = useState<'hadir' | 'tidak_hadir' | ''>('');

    // Fetch Event details
    const { data: eventResponse, isLoading: isEventLoading } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => contentApi.getEvent(eventId),
        enabled: !!eventId,
    });

    // Fetch RSVP registrations
    const { data: registrationsResponse, isLoading: isRegLoading } = useQuery({
        queryKey: ['event-registrations', eventId],
        queryFn: () => contentApi.getEventRegistrations(eventId),
        enabled: !!eventId,
    });

    // Fetch Branches (Qobilah)
    const { data: branchesResponse } = useBranches();
    const branches = branchesResponse?.data || [];

    // Search Person hook inside modal
    const { data: searchResults } = useSearchPersons(personSearchQuery, !!editingReg);
    const suggestedPersons = searchResults?.data?.data || [];

    // Mutation to update RSVP
    const updateRsvpMutation = useMutation({
        mutationFn: ({ regId, payload }: { regId: number; payload: any }) =>
            contentApi.updateEventRegistration(eventId, regId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] });
            setEditingReg(null);
        },
    });

    const handleEditClick = (r: any) => {
        setEditingReg(r);
        setEditPerson(r.person || null);
        setEditBranchId(r.person_id ? r.person?.branch_id : (r.branch_id || null));
        setEditEmail(r.email || '');
        setEditWhatsapp(r.whatsapp || '');
        setEditAttendance(r.attendance || '');
        setPersonSearchQuery('');
    };

    if (isEventLoading || isRegLoading) {
        return <div className="p-8 text-center text-gray-500">Memuat detail acara & data RSVP...</div>;
    }

    const event = eventResponse; // Since it directly returns the event object in contentApi
    const registrations = (registrationsResponse as any) || [];

    // Calculate stats
    const totalReg = registrations.length;
    const hadirCount = registrations.filter((r: any) => r.attendance === 'hadir').length;
    const tidakHadirCount = registrations.filter((r: any) => r.attendance === 'tidak_hadir').length;
    const belumRsvpCount = registrations.filter((r: any) => !r.attendance).length;

    // Filter registrations
    const filteredRegistrations = registrations.filter((r: any) => {
        const name = r.name || r.person?.full_name || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (r.person?.nickname && r.person.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
        
        let matchesAttendance = true;
        if (attendanceFilter === 'hadir') {
            matchesAttendance = r.attendance === 'hadir';
        } else if (attendanceFilter === 'tidak_hadir') {
            matchesAttendance = r.attendance === 'tidak_hadir';
        } else if (attendanceFilter === 'belum_rsvp') {
            matchesAttendance = !r.attendance;
        }

        return matchesSearch && matchesAttendance;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate('/events')}
                        className="text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1 text-sm font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Kembali ke Daftar Acara
                    </button>
                    <h1 className="text-2xl font-bold text-[#181112]">{event?.name}</h1>
                    <p className="text-gray-500 text-sm">
                        {event?.location_name || 'Lokasi belum diset'} · {event?.year}
                    </p>
                </div>
                <Link
                    to={`/events/${eventId}/edit`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                    Edit Detail Acara
                </Link>
            </div>

            {/* Stats Summary Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-[#e6dbdc] shadow-sm flex flex-col justify-between">
                    <p className="text-sm text-gray-500 font-semibold">Total Target Peserta</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalReg}</p>
                </div>

                <div className="bg-green-50 p-5 rounded-xl border border-green-200 shadow-sm flex flex-col justify-between">
                    <p className="text-sm text-green-700 font-semibold">Mengikuti (Hadir)</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">{hadirCount}</p>
                </div>

                <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm flex flex-col justify-between">
                    <p className="text-sm text-red-700 font-semibold">Tidak Ikut</p>
                    <p className="text-3xl font-bold text-red-900 mt-2">{tidakHadirCount}</p>
                </div>

                <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between">
                    <p className="text-sm text-amber-700 font-semibold">Belum RSVP</p>
                    <p className="text-3xl font-bold text-amber-900 mt-2">{belumRsvpCount}</p>
                </div>
            </div>

            {/* Filter controls */}
            <div className="bg-white border border-[#e6dbdc] rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-800">Daftar Kehadiran & RSVP</h3>
                
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Cari nama peserta..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-red-500/50"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">search</span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setAttendanceFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                attendanceFilter === 'all'
                                    ? 'bg-[#ec1325] text-white border-transparent'
                                    : 'bg-white border-[#e6dbdc] text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Semua ({totalReg})
                        </button>
                        <button
                            onClick={() => setAttendanceFilter('hadir')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                attendanceFilter === 'hadir'
                                    ? 'bg-green-600 text-white border-transparent'
                                    : 'bg-white border-[#e6dbdc] text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Hadir ({hadirCount})
                        </button>
                        <button
                            onClick={() => setAttendanceFilter('tidak_hadir')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                attendanceFilter === 'tidak_hadir'
                                    ? 'bg-red-600 text-white border-transparent'
                                    : 'bg-white border-[#e6dbdc] text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Tidak Ikut ({tidakHadirCount})
                        </button>
                        <button
                            onClick={() => setAttendanceFilter('belum_rsvp')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                attendanceFilter === 'belum_rsvp'
                                    ? 'bg-amber-500 text-white border-transparent'
                                    : 'bg-white border-[#e6dbdc] text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Belum RSVP ({belumRsvpCount})
                        </button>
                    </div>
                </div>

                {/* Table list */}
                <div className="border border-[#e6dbdc] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#fcf8f8] text-[#181112] font-semibold border-b border-[#e6dbdc]">
                                <tr>
                                    <th className="px-6 py-4">Nama</th>
                                    <th className="px-6 py-4">Qobilah</th>
                                    <th className="px-6 py-4">Status Awal (Transport)</th>
                                    <th className="px-6 py-4">Kontak</th>
                                    <th className="px-6 py-4">Kehadiran</th>
                                    <th className="px-6 py-4 sticky right-0 bg-[#fcf8f8] md:static md:bg-transparent border-l border-[#e6dbdc] md:border-l-0 z-10 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e6dbdc]">
                                {filteredRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada peserta yang cocok dengan filter pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRegistrations.map((r: any) => {
                                        const transportStatus = r.custom_data?.transport_status ?? '-';
                                        const name = r.name || r.person?.full_name || '';
                                        return (
                                            <tr key={r.id} className="bg-white hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    {r.person_id ? (
                                                        <Link
                                                            to={`/persons/${r.person_id}/edit`}
                                                            className="font-semibold text-red-655 hover:text-red-750 hover:underline inline-block whitespace-nowrap"
                                                        >
                                                            {name}
                                                        </Link>
                                                    ) : (
                                                        <p className="font-semibold text-gray-900 whitespace-nowrap">{name}</p>
                                                    )}
                                                    {r.person?.nickname && (
                                                        <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">Alias: {r.person.nickname}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                                    {r.person?.branch?.name || branches.find((b: any) => b.id === r.branch_id)?.name || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 font-medium capitalize">
                                                    {transportStatus}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs text-gray-600">{r.email || '-'}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{r.whatsapp || '-'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {r.attendance === 'hadir' && (
                                                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200 whitespace-nowrap">
                                                            Ikut (Hadir)
                                                        </span>
                                                    )}
                                                    {r.attendance === 'tidak_hadir' && (
                                                        <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200 whitespace-nowrap">
                                                            Tidak Ikut
                                                        </span>
                                                    )}
                                                    {!r.attendance && (
                                                        <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs font-semibold rounded-full border border-gray-200 whitespace-nowrap">
                                                            Belum RSVP
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 sticky right-0 bg-inherit md:static md:bg-transparent border-l border-[#e6dbdc] md:border-l-0 z-10 text-right">
                                                    <ActionMenu>
                                                        <button
                                                            onClick={() => handleEditClick(r)}
                                                            className="text-gray-500 hover:text-[#ec1325] transition-colors p-1.5 hover:bg-gray-100 rounded-lg flex items-center gap-2 md:justify-center w-full"
                                                            title="Edit RSVP"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px] align-middle">edit</span>
                                                            <span className="md:hidden text-sm font-medium">Edit RSVP</span>
                                                        </button>
                                                    </ActionMenu>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit RSVP Modal */}
            {editingReg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
                    <div className="bg-white rounded-2xl border border-[#e6dbdc] shadow-xl max-w-lg w-full overflow-hidden animate-scale-up">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150">
                            <div>
                                <h3 className="font-bold text-[#181112] text-lg">Edit RSVP Peserta</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Pendaftar Awal: {editingReg.name || '-'}</p>
                            </div>
                            <button
                                onClick={() => setEditingReg(null)}
                                className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[22px]">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            updateRsvpMutation.mutate({
                                regId: editingReg.id,
                                payload: {
                                    person_id: editPerson ? editPerson.id : null,
                                    branch_id: editBranchId,
                                    email: editEmail,
                                    whatsapp: editWhatsapp,
                                    attendance: editAttendance || null,
                                }
                            });
                        }} className="p-6 space-y-5">
                            {/* Person Link Search */}
                            <div className="space-y-1.5 relative">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Hubungkan ke Silsilah Person
                                </label>
                                {editPerson ? (
                                    <div className="flex items-center justify-between p-3 bg-red-50/30 border border-[#ec1325]/30 rounded-xl">
                                        <div className="min-w-0 pr-2">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {editPerson.full_name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Gen {editPerson.generation || '-'} · Qobilah: {branches.find((b: any) => b.id === editBranchId)?.name || '-'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditPerson(null);
                                                setEditBranchId(null);
                                            }}
                                            className="px-2.5 py-1.5 bg-white border border-red-200 text-xs font-bold text-red-650 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                                        >
                                            Lepas
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Cari nama anggota silsilah..."
                                            value={personSearchQuery}
                                            onChange={(e) => setPersonSearchQuery(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ec1325]/10 focus:border-[#ec1325] transition-all"
                                        />
                                        {personSearchQuery.length >= 2 && suggestedPersons.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                                                {suggestedPersons.map((p: any) => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setEditPerson(p);
                                                            setEditBranchId(p.branch_id);
                                                            setPersonSearchQuery('');
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50/50 transition-colors flex items-center justify-between"
                                                    >
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{p.full_name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                Gen {p.generation || '-'} · Qobilah: {branches.find((b: any) => b.id === p.branch_id)?.name || '-'}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs text-[#ec1325] font-bold">Pilih</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {personSearchQuery.length >= 2 && suggestedPersons.length === 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-500 text-center">
                                                Tidak ada hasil ditemukan.
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Qobilah Select */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Qobilah (Cabang Silsilah)
                                </label>
                                {editPerson ? (
                                    <input
                                        type="text"
                                        value={branches.find((b: any) => b.id === editBranchId)?.name || '-'}
                                        disabled
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 font-medium cursor-not-allowed"
                                    />
                                ) : (
                                    <select
                                        value={editBranchId || ''}
                                        onChange={(e) => setEditBranchId(Number(e.target.value) || null)}
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ec1325]/10 focus:border-[#ec1325] transition-all font-medium"
                                    >
                                        <option value="">-- Pilih Qobilah --</option>
                                        {branches.map((b: any) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    placeholder="contoh@domain.com"
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ec1325]/10 focus:border-[#ec1325] transition-all"
                                />
                            </div>

                            {/* WhatsApp */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Nomor WhatsApp
                                </label>
                                <input
                                    type="text"
                                    value={editWhatsapp}
                                    onChange={(e) => setEditWhatsapp(e.target.value)}
                                    placeholder="628123456789"
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ec1325]/10 focus:border-[#ec1325] transition-all"
                                />
                                <p className="text-[10px] text-gray-400">Harus diawali 62 dan berisi angka saja.</p>
                            </div>

                            {/* Attendance Status */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Status Kehadiran
                                </label>
                                <select
                                    value={editAttendance}
                                    onChange={(e) => setEditAttendance(e.target.value as any)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ec1325]/10 focus:border-[#ec1325] transition-all font-medium"
                                >
                                    <option value="">Belum RSVP (Pending)</option>
                                    <option value="hadir">Ikut (Hadir)</option>
                                    <option value="tidak_hadir">Tidak Ikut</option>
                                </select>
                            </div>

                            {/* Modal Footer / Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
                                <button
                                    type="button"
                                    onClick={() => setEditingReg(null)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateRsvpMutation.isPending}
                                    className="px-4 py-2 text-sm font-bold text-white bg-[#ec1325] hover:bg-[#c91020] rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {updateRsvpMutation.isPending ? 'Menyimpan...' : 'Simpan RSVP'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
