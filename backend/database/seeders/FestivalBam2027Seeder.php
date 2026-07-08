<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventSchedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class FestivalBam2027Seeder extends Seeder
{
    public function run(): void
    {
        $event = Event::create([
            'slug' => 'festival-bam-2027',
            'name' => 'Festival BAM 2027',
            'type' => 'festival',
            'year' => 2027,
            'start_date' => Carbon::parse('2027-01-29'),
            'end_date' => Carbon::parse('2027-01-31'),
            'description' => '<p class="editor-paragraph"><span style="white-space: pre-wrap;">Festival BAM 2027 adalah puncak perayaan spiritual tahunan keluarga besar Bani Abdul Manan. Diselenggarakan selama tiga hari berturut-turut — 29, 30, 31 Januari 2027 — berpusat di Musholla Al-Athos Miji gg.5 Kota Mojokerto. Festival ini menjadi gerbang persiapan batin seluruh anggota keluarga sebelum memasuki bulan suci Ramadhan, sekaligus majelis ilmu, doa, dan silaturahmi lintas generasi untuk mengenang jasa para leluhur.</span></p><p class="editor-paragraph"><span style="white-space: pre-wrap;">Rangkaian acara mencakup: BAM Cilik (anak-anak mengenal silsilah dengan cara menyenangkan), Sarasehan Lintas Generasi (diskusi sesepuh), Olahraga & Jalan Sehat, Malam Tahlil & Maulid Diba\' dengan puncak </span><i><em class="editor-text-italic" style="white-space: pre-wrap;">Mahallul Qiyam</em></i><span style="white-space: pre-wrap;"> — momen penuh haru saat anak-anak didoakan menjadi penerus yang sholeh dan sholehah.</span></p>',
            'location_name' => 'Musholla Al-Athos, Miji gg.5, Kota Mojokerto',
            'location_maps_url' => 'https://maps.app.goo.gl/RfDfVam593WnTQcCA',
            'is_active' => true,
            'is_juruladen_active' => true,
            'budget_total' => null,
            'budget_status' => 'draft',
        ]);

        $schedules = [
            // ── HARI 1: Jumat, 29 Jan 2027 ──
            [1, 'Tawasul dan Tahlil Qubro', '18:00', '19:00', null],
            [1, 'Manaqib', '19:00', '20:00', null],

            // ── HARI 2: Sabtu, 30 Jan 2027 ──
            [2, 'Asmaul Husna', '06:00', '06:30', null],
            [2, 'Wirridul Lathif', '06:30', '06:45', null],
            [2, 'Sholat Dhuha dan Waqiah', '06:45', '07:00', null],
            [2, 'Ziarah Makam', '08:00', '12:00', 'Suratan dan Miji baru'],
            [2, 'BAM Cilik', '15:00', '16:00', null],
            [2, 'Rottibul Haddad', '18:00', '19:00', null],
            [2, 'Qosidah Burdah', '19:00', '20:00', null],
            [2, 'Diskusi', '21:00', null, null],

            // ── HARI 3: Ahad, 31 Jan 2027 ──
            [3, 'Khotmil Quran', '06:00', '09:00', null],
            [3, 'Doa Birrulwalidain dan Qosidah Romadhon', '09:00', '10:00', null],
            [3, 'Pengajian Umum', '10:00', '11:00', 'bersama kiyai ...'],
            [3, "Maulid Diba'", '13:00', '15:00', null],
        ];

        foreach ($schedules as [$day, $title, $start, $end, $desc]) {
            EventSchedule::create([
                'event_id' => $event->id,
                'day_sequence' => $day,
                'title' => $title,
                'time_start' => $start,
                'time_end' => $end,
                'description' => $desc,
            ]);
        }

        $this->command->info('✅ Festival BAM 2027: ' . count($schedules) . ' rundown items');
    }
}
