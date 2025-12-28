import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { usePerson, useCreatePerson, useUpdatePerson, useBranches } from '../../features/admin/hooks/useAdmin'
import type { CreatePersonData, Branch } from '../../types'

interface ValidationErrors {
    [key: string]: string[]
}

export function PersonFormPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEdit = !!id

    const { data: personData, isLoading: isLoadingPerson } = usePerson(Number(id))
    const { data: branchesData } = useBranches()
    const createPerson = useCreatePerson()
    const updatePerson = useUpdatePerson()

    const branches: Branch[] = branchesData?.data || []
    const person = personData?.data?.person

    const [formData, setFormData] = useState<Partial<CreatePersonData>>({
        full_name: '',
        nickname: '',
        gender: undefined,
        branch_id: undefined,
        birth_date: '',
        death_date: '',
        is_alive: true,
        generation: undefined,
        birth_order: undefined,
    })
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [generalError, setGeneralError] = useState('')

    // Populate form when editing
    useEffect(() => {
        if (person) {
            setFormData({
                full_name: person.full_name,
                nickname: person.nickname || '',
                gender: person.gender,
                branch_id: person.branch_id,
                birth_date: person.birth_date || '',
                death_date: person.death_date || '',
                is_alive: person.is_alive,
                generation: person.generation,
                birth_order: person.birth_order,
            })
        }
    }, [person])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value ? Number(value) : undefined) : value,
        }))
    }

    const handleAliveChange = (isAlive: boolean) => {
        setFormData(prev => ({
            ...prev,
            is_alive: isAlive,
            death_date: isAlive ? '' : prev.death_date,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})
        setGeneralError('')

        const data: CreatePersonData = {
            full_name: formData.full_name!,
            nickname: formData.nickname || undefined,
            gender: formData.gender!,
            branch_id: formData.branch_id!,
            birth_date: formData.birth_date || undefined,
            death_date: formData.death_date || undefined,
            is_alive: formData.is_alive,
            generation: formData.generation || undefined, // Don't send 0 or empty
            birth_order: formData.birth_order || undefined,
        }

        try {
            if (isEdit) {
                await updatePerson.mutateAsync({ id: Number(id), data })
            } else {
                await createPerson.mutateAsync(data)
            }
            navigate('/persons')
        } catch (error: unknown) {
            console.error('Error saving person:', error)
            const err = error as { errors?: ValidationErrors; message?: string }
            if (err.errors) {
                setErrors(err.errors)
            } else if (err.message) {
                setGeneralError(err.message)
            } else {
                setGeneralError('Gagal menyimpan data. Silakan coba lagi.')
            }
        }
    }

    const isPending = createPerson.isPending || updatePerson.isPending

    if (isEdit && isLoadingPerson) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="material-symbols-outlined animate-spin text-4xl text-[#ec1325]">progress_activity</span>
            </div>
        )
    }

    return (
        <div className="max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/persons" className="p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[#896165]">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-[#181112]">
                        {isEdit ? 'Edit Anggota' : 'Tambah Anggota Baru'}
                    </h1>
                    <p className="text-sm text-[#896165]">
                        {isEdit ? 'Perbarui data anggota keluarga' : 'Masukkan data anggota keluarga baru'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e6dbdc] p-6 space-y-6">
                {/* Error Banner */}
                {(generalError || Object.keys(errors).length > 0) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-500">error</span>
                            <div>
                                <p className="font-medium text-red-700">
                                    {generalError || 'Terdapat kesalahan validasi:'}
                                </p>
                                {Object.keys(errors).length > 0 && (
                                    <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                                        {Object.entries(errors).map(([field, messages]) => (
                                            <li key={field}>{messages[0]}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Basic Info */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-[#181112] border-b border-[#e6dbdc] pb-2">Informasi Dasar</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Nama Lengkap *</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="Masukkan nama lengkap"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Nama Panggilan</label>
                            <input
                                type="text"
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="Nama panggilan (opsional)"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Jenis Kelamin *</label>
                            <select
                                name="gender"
                                value={formData.gender || ''}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50"
                            >
                                <option value="">Pilih jenis kelamin</option>
                                <option value="male">Laki-laki</option>
                                <option value="female">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Qobilah *</label>
                            <select
                                name="branch_id"
                                value={formData.branch_id || ''}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50"
                            >
                                <option value="">Pilih qobilah</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Tanggal Lahir</label>
                            <input
                                type="date"
                                name="birth_date"
                                value={formData.birth_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Generasi</label>
                            <input
                                type="number"
                                name="generation"
                                value={formData.generation || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="Nomor generasi"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Urutan Lahir</label>
                            <input
                                type="number"
                                name="birth_order"
                                value={formData.birth_order || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="Anak ke-"
                            />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-[#181112] border-b border-[#e6dbdc] pb-2">Status</h2>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="is_alive"
                                checked={formData.is_alive === true}
                                onChange={() => handleAliveChange(true)}
                                className="accent-[#ec1325]"
                            />
                            <span className="text-sm text-[#181112]">Masih Hidup</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="is_alive"
                                checked={formData.is_alive === false}
                                onChange={() => handleAliveChange(false)}
                                className="accent-[#ec1325]"
                            />
                            <span className="text-sm text-[#181112]">Almarhum/Almarhumah</span>
                        </label>
                    </div>

                    {!formData.is_alive && (
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Tanggal Wafat</label>
                            <input
                                type="date"
                                name="death_date"
                                value={formData.death_date}
                                onChange={handleChange}
                                className="w-full md:w-1/2 px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e6dbdc]">
                    <Link
                        to="/persons"
                        className="px-4 py-2 border border-[#e6dbdc] rounded-lg text-[#181112] font-medium hover:bg-[#f8f6f6] transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isPending && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                        {isEdit ? 'Simpan Perubahan' : 'Tambah Anggota'}
                    </button>
                </div>
            </form>
        </div>
    )
}
