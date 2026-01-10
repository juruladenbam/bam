<?php

namespace Database\Seeders;

use App\Models\NewsPost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        
        NewsPost::updateOrCreate(
            ['slug' => 'majmu-bacaan-amalan-mbah-mbah-kini-tersedia-online'],
            [
                'author_id' => $admin?->id,
                'title' => "Majmu' Bacaan Amalan Mbah-mbah Kini Tersedia Online",
                'description' => "Kabar gembira! Kumpulan bacaan amalan dan doa-doa dari para mbah-mbah kini dapat diakses secara digital.",
                'content' => "<p>Keluarga besar Bani Abdul Manan kini memiliki akses lebih mudah terhadap warisan spiritual leluhur. Dengan diluncurkannya aplikasi web <strong>Majmu' Bacaan</strong>, anggota keluarga dapat mengakses kumpulan amalan, wirid, tahlil, dan doa-doa penting di mana saja dan kapan saja.</p><p>Aplikasi ini dirancang untuk memudahkan kita menjaga rutinitas amalan harian, baik saat berada di rumah maupun dalam perjalanan. Fitur-fitur yang tersedia mencakup teks Arab yang jelas, terjemahan, serta panduan tata cara amalan.</p><p>Silakan akses melalui: <a href='https://majmu.bamseribuputu.my.id' target='_blank'>majmu.bamseribuputu.my.id</a></p>",
                'category' => 'umum',
                'is_public' => true,
                'is_headline' => false,
                'published_at' => now(),
            ]
        );

        NewsPost::updateOrCreate(
            ['slug' => 'bam-store-merchandise-resmi-keluarga-hadir'],
            [
                'author_id' => $admin?->id,
                'title' => 'BAM Store - Merchandise Resmi Keluarga Hadir!',
                'description' => 'Dapatkan merchandise dan produk resmi keluarga besar Bani Abdul Manan.',
                'content' => "<p>Tunjukkan kebanggaan Anda sebagai bagian dari keluarga besar Bani Abdul Manan dengan koleksi merchandise resmi dari <strong>BAM Store</strong>. Kami menyediakan berbagai produk berkualitas seperti kaos, batik, topi, dan aksesoris lainnya dengan desain eksklusif keluarga.</p><p>Setiap pembelian di BAM Store tidak hanya memberikan Anda produk berkualitas, tetapi juga turut mendukung kas kegiatan keluarga. Mari dukung kemandirian ekonomi keluarga kita.</p><p>Kunjungi toko online kami di: <a href='https://store.bamseribuputu.my.id' target='_blank'>store.bamseribuputu.my.id</a></p>",
                'category' => 'umum',
                'is_public' => true,
                'is_headline' => false,
                'published_at' => now(),
            ]
        );
    }
}
