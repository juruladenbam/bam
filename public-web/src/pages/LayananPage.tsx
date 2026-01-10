import { ServiceCard } from '@/components/ui/ServiceCard'
import SEO from '@/components/SEO'

export default function LayananPage() {
    return (
        <div>
            <SEO
                title="Layanan Digital"
                description="Akses berbagai layanan digital keluarga besar Bani Abdul Manan: Majmu' Bacaan dan BAM Store."
                url="/layanan"
            />

            <section className="bg-[#f8f6f6] py-16 px-4 sm:px-10">
                <div className="max-w-[1200px] mx-auto text-center">
                    <h1 className="text-[#181112] text-3xl md:text-5xl font-bold mb-4">Layanan Digital</h1>
                    <p className="text-[#896165] max-w-2xl mx-auto">
                        Inisiatif digital untuk memfasilitasi kebutuhan spiritual dan sosial keluarga besar Bani Abdul Manan.
                    </p>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-10 bg-white">
                <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ServiceCard
                        href="https://majmu.bamseribuputu.my.id"
                        title="Majmu' Bacaan"
                        description="Akses digital untuk kumpulan bacaan amalan, wirid, dan doa-doa yang diwariskan oleh para mbah-mbah. Memudahkan anggota keluarga untuk mengamalkan tradisi leluhur di mana saja."
                        icon="auto_stories"
                        color="amber"
                        variant="full"
                    />

                    <ServiceCard
                        href="https://store.bamseribuputu.my.id"
                        title="BAM Store"
                        description="Platform merchandise resmi keluarga besar. Temukan berbagai produk atribut keluarga seperti batik, kaos, dan aksesoris lainnya untuk mempererat identitas keluarga."
                        icon="storefront"
                        color="pink"
                        variant="full"
                    />
                </div>
            </section>
        </div>
    )
}
