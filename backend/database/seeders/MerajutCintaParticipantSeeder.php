<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventSchedule;
use App\Models\EventRegistration;
use App\Models\Person;
use Illuminate\Support\Str;

class MerajutCintaParticipantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create or Find the Event
        $event = Event::updateOrCreate(
            ['slug' => 'merajut-cinta-2026'],
            [
                'name' => 'Merajut Cinta — Keluarga Besar BAM',
                'type' => 'youth_camp',
                'year' => 2026,
                'start_date' => '2026-07-03 11:00:00',
                'end_date' => '2026-07-04 17:00:00',
                'description' => '<p><strong>Merajut Cinta</strong> adalah kegiatan rutin yang dirancang khusus agar generasi-generasi muda Bani Abdul Manan (BAM) &ndash; khususnya generasi ketiga (3G) ke bawah &ndash; dapat lebih mengenal mbah-mbah generasi pertama sekaligus saling mempererat keakraban satu sama lain.</p><p>Dengan mengusung kesan santai, menyenangkan, dan penuh kegembiraan layaknya liburan keluarga, format acara dikemas secara fleksibel tanpa aturan yang saklek. Kegiatan biasanya diisi dengan outbound seru, malam keakraban, serta berlibur ke tempat pariwisata menarik.</p><p>Rentang peserta acara ini ditujukan bagi adik-adik usia SMP hingga sebelum menikah, meskipun para anggota 3G yang sudah berkeluarga pun tetap dipersilakan untuk bergabung dan memeriahkan suasana bersama.</p>',
                'location_name' => 'Vila Keeta, Pacet, Mojokerto',
                'location_maps_url' => 'https://maps.app.goo.gl/6TpWtNr4BHXv6sXp9',
                'is_active' => true,
                'meta_data' => [
                    [
                        'id' => '1',
                        'icon' => 'home',
                        'type' => 'info',
                        'label' => 'Akomodasi',
                        'value' => 'Vila Keeta Pacet',
                        'description' => 'Fasilitas villa lengkap dengan kolam renang dan outbound area.'
                    ],
                    [
                        'id' => '2',
                        'icon' => 'apparel',
                        'type' => 'info',
                        'label' => 'Dresscode',
                        'value' => 'Kaos Anggota BAM',
                        'description' => 'Pembagian kaos dilakukan saat berkumpul di Miji.'
                    ]
                ]
            ]
        );

        // 2. Create schedules if empty
        if ($event->schedules()->count() === 0) {
            EventSchedule::create([
                'event_id' => $event->id,
                'day_sequence' => 1,
                'title' => 'Kumpul di Miji (Pembagian Kaos & Ceremony Pemberangkatan)',
                'time_start' => '11:00:00',
                'time_end' => '13:00:00',
                'description' => 'Titik kumpul keberangkatan bersama'
            ]);

            EventSchedule::create([
                'event_id' => $event->id,
                'day_sequence' => 1,
                'title' => 'Makrab (Silsilah & Tradisi BAM)',
                'time_start' => '19:00:00',
                'time_end' => '22:00:00',
                'description' => 'Malam keakraban, pemaparan silsilah Bani Abdul Manan'
            ]);

            EventSchedule::create([
                'event_id' => $event->id,
                'day_sequence' => 2,
                'title' => 'Fun Game / Outbound',
                'time_start' => '07:00:00',
                'time_end' => '11:00:00',
                'description' => 'Kegiatan outdoor seru bersama keluarga'
            ]);
        }

        // 3. Raw list of 55 participants
        $participants = [
            ['name' => 'Azil', 'transport' => 'motor'],
            ['name' => 'Nopal', 'transport' => 'mobil'],
            ['name' => 'Hikam', 'transport' => 'sopir'],
            ['name' => 'Oby', 'transport' => 'mobil'],
            ['name' => 'Alex', 'transport' => 'dw'],
            ['name' => 'Sadra', 'transport' => 'mobil'],
            ['name' => 'Humam', 'transport' => 'dw'],
            ['name' => 'Mamat', 'transport' => 'dw'],
            ['name' => 'Fayyadh', 'transport' => 'mobil'],
            ['name' => 'Rikza', 'transport' => 'mobil'],
            ['name' => 'Avis', 'transport' => 'mobil'],
            ['name' => 'Fathir', 'transport' => 'dw'],
            ['name' => 'Riski', 'transport' => 'dw'],
            ['name' => 'Ashfa', 'transport' => 'mobil'],
            ['name' => 'Rifki', 'transport' => 'mobil'],
            ['name' => 'Ubay', 'transport' => 'mobil'],
            ['name' => 'Mahes', 'transport' => 'mobil'],
            ['name' => 'Kayla', 'transport' => 'mobil'],
            ['name' => 'Nada', 'transport' => '-'],
            ['name' => 'Robet', 'transport' => 'mobil'],
            ['name' => 'Fateh', 'transport' => 'mobil'],
            ['name' => 'Syahrul', 'transport' => 'mobil'],
            ['name' => 'Ubed', 'transport' => 'mobil'],
            ['name' => 'Thoriq', 'transport' => 'dw'],
            ['name' => 'Faruqi', 'transport' => 'dw'],
            ['name' => 'Femi', 'transport' => 'mobil'],
            ['name' => 'Ochi', 'transport' => 'mobil'],
            ['name' => 'Mas Nehru', 'transport' => '-'],
            ['name' => 'Panjalu', 'transport' => 'dw'],
            ['name' => 'Marsha', 'transport' => 'dw'],
            ['name' => 'Zahir', 'transport' => 'mobil'],
            ['name' => 'Kevin', 'transport' => 'mobil'],
            ['name' => 'Zamira', 'transport' => 'dw'],
            ['name' => 'Zaul', 'transport' => '-'],
            ['name' => 'Odi', 'transport' => 'dw'],
            ['name' => 'Anas', 'transport' => 'sopir'],
            ['name' => 'Zahra', 'transport' => 'mobil'],
            ['name' => 'Ilham', 'transport' => 'mobil'],
            ['name' => 'Sida', 'transport' => 'mobil'],
            ['name' => 'Azza', 'transport' => 'mobil'],
            ['name' => 'Ridho', 'transport' => 'mobil'],
            ['name' => 'Faza', 'transport' => 'mobil'],
            ['name' => 'Amik', 'transport' => '-'],
            ['name' => 'Izzat', 'transport' => 'dw'],
            ['name' => 'Mila', 'transport' => '-'],
            ['name' => 'Zidan', 'transport' => 'dw'],
            ['name' => 'Yakik', 'transport' => 'dw'],
            ['name' => 'Muhyi', 'transport' => 'dw'],
            ['name' => 'Salwa', 'transport' => '-'],
            ['name' => 'Salsa', 'transport' => 'dw'],
            ['name' => 'Ara', 'transport' => '-'],
            ['name' => 'Nilna', 'transport' => '-'],
            ['name' => 'Aisy', 'transport' => '-'],
            ['name' => 'mas muis', 'transport' => 'dw'],
            ['name' => 'Aldi', 'transport' => 'mobil'],
        ];

        // 4. Prepopulate registrations
        EventRegistration::where('event_id', $event->id)->delete();

        foreach ($participants as $p) {
            // Create registration
            EventRegistration::create([
                'event_id' => $event->id,
                'name' => $p['name'],
                'person_id' => null,
                'attendance' => null, // not RSVP-ed yet
                'status' => 'pending',
                'custom_data' => [
                    'transport_status' => $p['transport']
                ]
            ]);
        }
    }
}
