<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // About Page - Header
            [
                'key' => 'about.title',
                'value' => 'Bani Abdul Manan',
                'type' => 'text',
            ],
            [
                'key' => 'about.subtitle',
                'value' => 'Keluarga besar dengan lebih dari 500 anggota dari 5 generasi, bersatu dalam keimanan dan silaturahmi.',
                'type' => 'text',
            ],

            // About Page - Biography
            [
                'key' => 'about.biography_title',
                'value' => 'Kakek Buyut: Abdul Manan',
                'type' => 'text',
            ],
            [
                'key' => 'about.biography_content',
                'value' => '<p>Abdul Manan adalah tokoh pendiri keluarga besar yang kini telah berkembang menjadi lebih dari 500 anggota dalam 5 generasi. Beliau memiliki 11 anak dari dua istri, yang masing-masing menjadi cabang utama silsilah keluarga.</p><p>Ajaran dan nilai-nilai yang ditanamkan oleh beliau terus dipegang teguh oleh keturunannya hingga saat ini, menjadikan Bani Abdul Manan sebagai keluarga besar yang tetap rukun dan harmonis.</p>',
                'type' => 'html',
            ],

            // About Page - Values
            [
                'key' => 'about.values',
                'value' => json_encode([
                    [
                        'icon' => 'mosque',
                        'title' => 'Keimanan',
                        'description' => 'Menjaga tradisi keagamaan dan ibadah bersama sebagai pondasi keluarga.',
                    ],
                    [
                        'icon' => 'handshake',
                        'title' => 'Silaturahmi',
                        'description' => 'Menjaga hubungan dan komunikasi antar keluarga lintas generasi.',
                    ],
                    [
                        'icon' => 'school',
                        'title' => 'Pendidikan',
                        'description' => 'Mendorong generasi muda untuk terus belajar dan berkembang.',
                    ],
                    [
                        'icon' => 'favorite',
                        'title' => 'Kepedulian',
                        'description' => 'Saling membantu dalam suka dan duka, gotong royong keluarga.',
                    ],
                ]),
                'type' => 'json',
            ],

            // Home Page - Hero
            [
                'key' => 'home.hero_badge',
                'value' => 'Portal Keluarga Resmi',
                'type' => 'text',
            ],
            [
                'key' => 'home.hero_title',
                'value' => 'Selamat Datang di Keluarga Digital Bani Abdul Manan',
                'type' => 'text',
            ],
            [
                'key' => 'home.hero_subtitle',
                'value' => 'Menghubungkan generasi, melestarikan sejarah, dan merayakan masa depan bersama. Akses warisan keluarga Anda hari ini.',
                'type' => 'text',
            ],

            // Home Page - Features
            [
                'key' => 'home.features_title',
                'value' => 'Mengapa Bergabung dengan Portal?',
                'type' => 'text',
            ],
            [
                'key' => 'home.features_subtitle',
                'value' => 'Rumah digital kami memungkinkan setiap anggota keluarga tetap terhubung, terinformasi, dan terlibat dalam pelestarian silsilah.',
                'type' => 'text',
            ],
            [
                'key' => 'home.features',
                'value' => json_encode([
                    [
                        'icon' => 'account_tree',
                        'title' => 'Silsilah Interaktif',
                        'description' => 'Jelajahi silsilah lengkap Bani Abdul Manan, telusuri leluhur, dan temukan koneksi Anda ke akar keluarga.',
                    ],
                    [
                        'icon' => 'calendar_month',
                        'title' => 'Kalender Acara',
                        'description' => 'Ikuti update acara keluarga mendatang, reuni, halal bihalal, dan kegiatan keagamaan penting.',
                    ],
                    [
                        'icon' => 'history_edu',
                        'title' => 'Arsip Digital',
                        'description' => 'Akses repositori bersama foto historis, dokumen scan, dan kenangan berharga dari masa lalu.',
                    ],
                ]),
                'type' => 'json',
            ],

            // Home Page - Legacy
            [
                'key' => 'home.legacy_title',
                'value' => 'Legasi Abdul Manan',
                'type' => 'text',
            ],
            [
                'key' => 'home.legacy_content',
                'value' => '<p>Kisah kami bermula dari nilai-nilai yang ditanamkan oleh leluhur kami, Abdul Manan. Visi tentang persatuan, keimanan, dan kemajuan yang telah membimbing keluarga kami selama puluhan tahun.</p><p>Dari awal yang sederhana hingga jaringan luas profesional, cendekiawan, dan pemimpin masyarakat, keluarga Bani Abdul Manan terus menghormati masa lalu sambil merangkul masa depan.</p>',
                'type' => 'html',
            ],
            [
                'key' => 'home.legacy_quote',
                'value' => 'Keluarga adalah kompas yang membimbing kita.',
                'type' => 'text',
            ],

            // Home Page - CTA
            [
                'key' => 'home.cta_title',
                'value' => 'Bergabung dengan Portal Keluarga',
                'type' => 'text',
            ],
            [
                'key' => 'home.cta_subtitle',
                'value' => 'Akses silsilah lengkap, daftar acara, dan tetap terhubung dengan keluarga besar.',
                'type' => 'text',
            ],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}

