import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useCreateSubmission } from '../hooks/useSubmissions'
import { PersonPicker } from '../../../components/ui/PersonPicker'
import type { CreateSubmissionData } from '../api/submissionApi'
import type { Person } from '../../silsilah/types'

interface SubmissionFormProps {
    onSuccess?: () => void
    onCancel?: () => void
}

const typeOptions = [
    { value: 'birth', label: 'Lapor Kelahiran', icon: 'child_care', description: 'Laporkan kelahiran anggota baru keluarga' },
    { value: 'marriage', label: 'Lapor Pernikahan', icon: 'favorite', description: 'Laporkan pernikahan anggota keluarga' },
    { value: 'death', label: 'Lapor Kematian', icon: 'deceased', description: 'Laporkan kematian anggota keluarga' },
    { value: 'correction', label: 'Koreksi Data', icon: 'edit_note', description: 'Ajukan koreksi data yang sudah ada' },
]

export function SubmissionForm({ onSuccess, onCancel }: SubmissionFormProps) {
    const location = useLocation()
    const preselectedPerson = location.state?.preselectedPerson as Person | undefined

    const [step, setStep] = useState<'type' | 'form'>('type')
    const [selectedType, setSelectedType] = useState<CreateSubmissionData['type'] | null>(null)
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [error, setError] = useState<string | null>(null)

    // For Person Picker state
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null) // For correction/death
    const [selectedFather, setSelectedFather] = useState<Person | null>(null) // For birth
    const [selectedMother, setSelectedMother] = useState<Person | null>(null) // For birth

    // For Marriage
    const [husbandMode, setHusbandMode] = useState<'picker' | 'manual'>('picker')
    const [wifeMode, setWifeMode] = useState<'picker' | 'manual'>('picker')
    const [selectedHusband, setSelectedHusband] = useState<Person | null>(null)
    const [selectedWife, setSelectedWife] = useState<Person | null>(null)

    const createMutation = useCreateSubmission()

    const handleTypeSelect = (type: CreateSubmissionData['type']) => {
        setSelectedType(type)
        setFormData({})
        setSelectedPerson(null)
        setSelectedFather(null)
        setSelectedMother(null)
        setSelectedHusband(null)
        setSelectedWife(null)
        setHusbandMode('picker')
        setWifeMode('picker')

        // Pre-fill logic based on preselectedPerson (from "Lapor Data" button)
        if (preselectedPerson) {
            if (type === 'birth') {
                if (preselectedPerson.gender === 'male') {
                    setSelectedFather(preselectedPerson)
                } else if (preselectedPerson.gender === 'female') {
                    setSelectedMother(preselectedPerson)
                }
            } else if (type === 'marriage') {
                if (preselectedPerson.gender === 'male') {
                    setSelectedHusband(preselectedPerson)
                } else if (preselectedPerson.gender === 'female') {
                    setSelectedWife(preselectedPerson)
                }
            } else if (type === 'death' || type === 'correction') {
                setSelectedPerson(preselectedPerson)
                if (type === 'correction') {
                    handleInputChange('person_name', preselectedPerson.full_name)
                } else {
                    handleInputChange('full_name', preselectedPerson.full_name)
                }
            }
        }

        setStep('form')
    }


    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedType) return

        setError(null)

        // Prepare payload
        const payload = { ...formData }

        // Add person_id if provided via picker
        if (selectedPerson) {
            payload.person_id = selectedPerson.id
            // For correction/death, also send user-friendly name just in case
            if (!payload.full_name) payload.full_name = selectedPerson.full_name
            if (!payload.person_name) payload.person_name = selectedPerson.full_name
        }

        // Add parents for birth
        if (selectedType === 'birth') {
            if (selectedFather) payload.father_id = selectedFather.id
            if (selectedMother) payload.mother_id = selectedMother.id
        }

        // Add spouses for marriage
        if (selectedType === 'marriage') {
            if (husbandMode === 'picker' && selectedHusband) {
                payload.husband_id = selectedHusband.id
                payload.husband_name = selectedHusband.full_name
            }
            if (wifeMode === 'picker' && selectedWife) {
                payload.wife_id = selectedWife.id
                payload.wife_name = selectedWife.full_name
            }
        }

        try {
            await createMutation.mutateAsync({
                type: selectedType,
                data: payload,
            })
            onSuccess?.()
        } catch (err: any) {
            setError(err.message || 'Gagal mengirim submission')
        }
    }

    const renderFormFields = () => {
        switch (selectedType) {
            case 'birth':
                return (
                    <>
                        <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm text-blue-800">
                            Silakan isi data bayi. Anda dapat memilih orang tua dari database jika sudah ada.
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Lengkap Bayi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.full_name || ''}
                                onChange={(e) => handleInputChange('full_name', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Jenis Kelamin <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.gender || ''}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                                    required
                                >
                                    <option value="">Pilih...</option>
                                    <option value="male">Laki-laki</option>
                                    <option value="female">Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Lahir <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.birth_date || ''}
                                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Parent Pickers */}
                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-900">Data Orang Tua (Opsional)</h4>
                            <PersonPicker
                                label="Cari Ayah (Jika ada di database)"
                                value={selectedFather}
                                onChange={setSelectedFather}
                                placeholder="Ketik nama ayah..."
                                gender="male"
                            />
                            <PersonPicker
                                label="Cari Ibu (Jika ada di database)"
                                value={selectedMother}
                                onChange={setSelectedMother}
                                placeholder="Ketik nama ibu..."
                                gender="female"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tempat Lahir
                                </label>
                                <input
                                    type="text"
                                    value={formData.birth_place || ''}
                                    onChange={(e) => handleInputChange('birth_place', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Anak ke- (Urutan)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.birth_order || ''}
                                    onChange={(e) => handleInputChange('birth_order', e.target.value ? parseInt(e.target.value) : '')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                                    placeholder="1, 2, 3..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Catatan Tambahan
                            </label>
                            <textarea
                                value={formData.notes || ''}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                rows={3}
                                placeholder="Informasi lain..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                            />
                        </div>
                    </>
                )

            case 'marriage':
                return (
                    <>
                        {/* Husband Section */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-gray-700">
                                    Data Suami <span className="text-red-500">*</span>
                                </label>
                                <div className="flex text-xs bg-gray-100 rounded-lg p-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHusbandMode('picker')
                                            handleInputChange('husband_name', '')
                                        }}
                                        className={`px-3 py-1 rounded-md transition-all ${husbandMode === 'picker' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500'}`}
                                    >
                                        Pilih Data
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHusbandMode('manual')
                                            setSelectedHusband(null)
                                        }}
                                        className={`px-3 py-1 rounded-md transition-all ${husbandMode === 'manual' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500'}`}
                                    >
                                        Input Nama
                                    </button>
                                </div>
                            </div>

                            {husbandMode === 'picker' ? (
                                <PersonPicker
                                    value={selectedHusband}
                                    onChange={setSelectedHusband}
                                    required
                                    placeholder="Cari nama suami..."
                                    gender="male"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={formData.husband_name || ''}
                                    onChange={(e) => handleInputChange('husband_name', e.target.value)}
                                    placeholder="Masukkan nama lengkap suami..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                                    required
                                />
                            )}
                        </div>

                        {/* Wife Section */}
                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-gray-700">
                                    Data Istri <span className="text-red-500">*</span>
                                </label>
                                <div className="flex text-xs bg-gray-100 rounded-lg p-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setWifeMode('picker')
                                            handleInputChange('wife_name', '')
                                        }}
                                        className={`px-3 py-1 rounded-md transition-all ${wifeMode === 'picker' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500'}`}
                                    >
                                        Pilih Data
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setWifeMode('manual')
                                            setSelectedWife(null)
                                        }}
                                        className={`px-3 py-1 rounded-md transition-all ${wifeMode === 'manual' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500'}`}
                                    >
                                        Input Nama
                                    </button>
                                </div>
                            </div>

                            {wifeMode === 'picker' ? (
                                <PersonPicker
                                    value={selectedWife}
                                    onChange={setSelectedWife}
                                    required
                                    placeholder="Cari nama istri..."
                                    gender="female"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={formData.wife_name || ''}
                                    onChange={(e) => handleInputChange('wife_name', e.target.value)}
                                    placeholder="Masukkan nama lengkap istri..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                                    required
                                />
                            )}
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal Nikah
                            </label>
                            <input
                                type="date"
                                value={formData.marriage_date || ''}
                                onChange={(e) => handleInputChange('marriage_date', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Catatan Tambahan
                            </label>
                            <textarea
                                value={formData.notes || ''}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                rows={3}
                                placeholder="Informasi tambahan seperti tempat nikah, wali, dll..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                            />
                        </div>
                    </>
                )

            case 'death':
                return (
                    <>
                        <PersonPicker
                            label="Cari Anggota (Almarhum/ah)"
                            value={selectedPerson}
                            onChange={(person) => {
                                setSelectedPerson(person)
                                if (person) handleInputChange('full_name', person.full_name)
                            }}
                            required
                            placeholder="Ketik nama anggota yang meninggal..."
                        />

                        {!selectedPerson && (
                            <div className="text-sm text-gray-500 italic mt-1 mb-4">
                                * Silakan cari nama anggota yang sudah terdaftar di sistem.
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal Wafat <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.death_date || ''}
                                onChange={(e) => handleInputChange('death_date', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tempat Dimakamkan
                            </label>
                            <input
                                type="text"
                                value={formData.burial_place || ''}
                                onChange={(e) => handleInputChange('burial_place', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Catatan Tambahan
                            </label>
                            <textarea
                                value={formData.notes || ''}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                rows={3}
                                placeholder="Informasi tambahan..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                            />
                        </div>
                    </>
                )

            case 'correction':
                return (
                    <>
                        <PersonPicker
                            label="Pilih Anggota yang datanya salah"
                            value={selectedPerson}
                            onChange={(person) => {
                                setSelectedPerson(person)
                                if (person) handleInputChange('person_name', person.full_name)
                            }}
                            required
                        />

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Field yang Salah <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.field_select || ''}
                                onChange={(e) => {
                                    handleInputChange('field_select', e.target.value)
                                    if (e.target.value !== 'other') {
                                        handleInputChange('field', e.target.value)
                                    } else {
                                        handleInputChange('field', '')
                                    }
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none mb-2"
                                required
                            >
                                <option value="">Pilih data yang ingin dikoreksi...</option>
                                <option value="Nama Lengkap">Nama Lengkap</option>
                                <option value="Jenis Kelamin">Jenis Kelamin</option>
                                <option value="Tanggal Lahir">Tanggal Lahir</option>
                                <option value="Tempat Lahir">Tempat Lahir</option>
                                <option value="Urutan Kelahiran">Urutan Kelahiran</option>
                                <option value="Tanggal Wafat">Tanggal Wafat (jika sudah wafat)</option>
                                <option value="Qobilah">Qobilah</option>
                                <option value="Ayah/Ibu">Data Ayah / Ibu</option>
                                <option value="Pasangan">Data Pasangan</option>
                                <option value="other">Lainnya...</option>
                            </select>

                            {formData.field_select === 'other' && (
                                <input
                                    type="text"
                                    value={formData.field || ''}
                                    onChange={(e) => handleInputChange('field', e.target.value)}
                                    placeholder="Sebutkan data yang salah..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none animate-in fade-in slide-in-from-top-1"
                                    required
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data Seharusnya (Yang Benar) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.correct_value || ''}
                                onChange={(e) => handleInputChange('correct_value', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Penjelasan
                            </label>
                            <textarea
                                value={formData.notes || ''}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                rows={3}
                                placeholder="Jelaskan detail koreksi..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                            />
                        </div>
                    </>
                )

            default:
                return null
        }
    }

    if (step === 'type') {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Jenis Laporan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {typeOptions.map((type) => (
                        <button
                            key={type.value}
                            onClick={() => handleTypeSelect(type.value as CreateSubmissionData['type'])}
                            className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#ec1325] hover:shadow-md transition-all text-left group"
                        >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${type.value === 'birth' ? 'bg-blue-100 text-blue-600' :
                                type.value === 'marriage' ? 'bg-pink-100 text-pink-600' :
                                    type.value === 'death' ? 'bg-gray-100 text-gray-600' :
                                        'bg-amber-100 text-amber-600'
                                }`}>
                                <span className="material-symbols-outlined text-2xl">{type.icon}</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-[#ec1325] transition-colors">
                                    {type.label}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="mt-4 text-gray-500 hover:text-gray-700"
                    >
                        Batal
                    </button>
                )}
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => setStep('type')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                    {typeOptions.find((t) => t.value === selectedType)?.label}
                </h3>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {renderFormFields()}

            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={createMutation.isPending ||
                        ((selectedType === 'death' || selectedType === 'correction') && !selectedPerson) ||
                        (selectedType === 'marriage' && (
                            (husbandMode === 'picker' && !selectedHusband) ||
                            (husbandMode === 'manual' && !formData.husband_name) ||
                            (wifeMode === 'picker' && !selectedWife) ||
                            (wifeMode === 'manual' && !formData.wife_name)
                        ))
                    }
                    className="px-6 py-2 bg-[#ec1325] text-white rounded-lg hover:bg-[#c91020] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {createMutation.isPending && (
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    )}
                    Kirim Laporan
                </button>
            </div>
        </form>
    )
}

export default SubmissionForm
