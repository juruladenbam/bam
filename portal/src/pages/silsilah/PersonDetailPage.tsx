import { useParams, useNavigate } from 'react-router-dom'
import { usePerson, type Person } from '../../features/silsilah'

export function PersonDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data, isLoading, error } = usePerson(Number(id))

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="material-symbols-outlined animate-spin text-[#ec1325] text-4xl">
                    progress_activity
                </span>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="text-center py-12 text-red-600">
                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                <p>Gagal memuat data</p>
            </div>
        )
    }

    const { person, family, relationship } = data

    return (
        <div className="min-h-screen bg-[#f8f6f6]">
            {/* Header */}
            <div className="bg-white border-b border-[#e6dbdc] py-6 px-4">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[#896165] hover:text-[#181112] mb-4"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Kembali
                    </button>

                    {/* Profile Header */}
                    <div className="flex items-start gap-6">
                        <div
                            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl
                ${person.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}
              `}
                        >
                            <span className="material-symbols-outlined text-5xl">
                                {person.gender === 'male' ? 'man' : 'woman'}
                            </span>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-[#181112]">{person.full_name}</h1>
                            {person.nickname && (
                                <p className="text-[#896165]">{person.nickname}</p>
                            )}

                            {/* Relationship Badge */}
                            {relationship && relationship.relationship !== 'unknown' && (
                                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#ec1325]/10 text-[#ec1325] rounded-full text-sm font-medium">
                                    <span className="material-symbols-outlined text-sm">diversity_1</span>
                                    {relationship.label_javanese || relationship.label}
                                </div>
                            )}

                            {/* Meta info */}
                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-[#896165]">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">account_tree</span>
                                    Gen {person.generation}
                                </span>
                                {person.branch && (
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">home</span>
                                        {person.branch.name}
                                    </span>
                                )}
                                {!person.is_alive && (
                                    <span className="flex items-center gap-1 text-gray-400">
                                        <span className="material-symbols-outlined text-sm">deceased</span>
                                        Almarhum/ah
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
                {/* Family Section */}
                {(family.parents.length > 0 || family.spouses.length > 0 || family.children.length > 0) && (
                    <section className="bg-white rounded-xl border border-[#e6dbdc] p-6">
                        <h2 className="text-lg font-bold text-[#181112] mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#ec1325]">family_restroom</span>
                            Keluarga
                        </h2>

                        {/* Parents */}
                        {family.parents.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-[#896165] mb-2">Orang Tua</h3>
                                <div className="flex flex-wrap gap-2">
                                    {family.parents.map((p: Person) => (
                                        <button
                                            key={p.id}
                                            onClick={() => navigate(`/silsilah/person/${p.id}`)}
                                            className="flex items-center gap-2 px-3 py-2 bg-[#f8f6f6] rounded-lg hover:bg-[#e6dbdc] transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">
                                                {p.gender === 'male' ? 'man' : 'woman'}
                                            </span>
                                            {p.full_name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Spouses */}
                        {family.spouses.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-[#896165] mb-2">Pasangan</h3>
                                <div className="flex flex-wrap gap-2">
                                    {family.spouses.map((s: Person) => (
                                        <button
                                            key={s.id}
                                            onClick={() => navigate(`/silsilah/person/${s.id}`)}
                                            className="flex items-center gap-2 px-3 py-2 bg-[#f8f6f6] rounded-lg hover:bg-[#e6dbdc] transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm text-[#ec1325]">favorite</span>
                                            {s.full_name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Children */}
                        {family.children.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-[#896165] mb-2">
                                    Anak ({family.children.length})
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {family.children.map((c: Person) => (
                                        <button
                                            key={c.id}
                                            onClick={() => navigate(`/silsilah/person/${c.id}`)}
                                            className="flex items-center gap-2 px-3 py-2 bg-[#f8f6f6] rounded-lg hover:bg-[#e6dbdc] transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">
                                                {c.gender === 'male' ? 'boy' : 'girl'}
                                            </span>
                                            {c.full_name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Relationship Path */}
                {relationship && relationship.path && (
                    <section className="bg-white rounded-xl border border-[#e6dbdc] p-6">
                        <h2 className="text-lg font-bold text-[#181112] mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#ec1325]">route</span>
                            Jalur Hubungan
                        </h2>
                        <p className="text-[#896165]">{relationship.path.description}</p>
                        <p className="text-sm text-[#896165] mt-2">
                            Via: <span className="font-medium text-[#181112]">{relationship.lca_name}</span>
                        </p>
                    </section>
                )}

                {/* Bio */}
                {person.bio && (
                    <section className="bg-white rounded-xl border border-[#e6dbdc] p-6">
                        <h2 className="text-lg font-bold text-[#181112] mb-4">Biografi</h2>
                        <p className="text-[#896165]">{person.bio}</p>
                    </section>
                )}
            </div>
        </div>
    )
}
