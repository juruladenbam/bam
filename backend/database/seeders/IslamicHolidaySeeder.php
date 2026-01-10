<?php

namespace Database\Seeders;

use App\Models\IslamicHoliday;
use Illuminate\Database\Seeder;

class IslamicHolidaySeeder extends Seeder
{
    public function run(): void
    {
        $holidays = [
            [
                'name' => 'Tahun Baru Hijriyah',
                'name_arabic' => 'رأس السنة الهجرية',
                'hijri_month' => 1,
                'hijri_day' => 1,
                'duration_days' => 1,
                'description' => 'Awal tahun baru dalam kalender Hijriyah (1 Muharram)',
            ],
            [
                'name' => 'Hari Asyura',
                'name_arabic' => 'يوم عاشوراء',
                'hijri_month' => 1,
                'hijri_day' => 10,
                'duration_days' => 1,
                'description' => 'Hari ke-10 Muharram, dianjurkan berpuasa',
            ],
            [
                'name' => 'Maulid Nabi Muhammad',
                'name_arabic' => 'المولد النبوي',
                'hijri_month' => 3,
                'hijri_day' => 12,
                'duration_days' => 1,
                'description' => 'Peringatan kelahiran Nabi Muhammad SAW (12 Rabiul Awal)',
            ],
            [
                'name' => 'Isra Mi\'raj',
                'name_arabic' => 'الإسراء والمعراج',
                'hijri_month' => 7,
                'hijri_day' => 27,
                'duration_days' => 1,
                'description' => 'Peringatan perjalanan Nabi Muhammad SAW dari Masjidil Haram ke Masjidil Aqsa dan naik ke Sidratul Muntaha (27 Rajab)',
            ],
            [
                'name' => 'Nisfu Sya\'ban',
                'name_arabic' => 'ليلة النصف من شعبان',
                'hijri_month' => 8,
                'hijri_day' => 15,
                'duration_days' => 1,
                'description' => 'Malam pertengahan bulan Sya\'ban (15 Sya\'ban)',
            ],
            [
                'name' => 'Awal Ramadhan',
                'name_arabic' => 'بداية رمضان',
                'hijri_month' => 9,
                'hijri_day' => 1,
                'duration_days' => 1,
                'description' => 'Hari pertama bulan Ramadhan, awal puasa',
            ],
            [
                'name' => 'Nuzulul Quran',
                'name_arabic' => 'نزول القرآن',
                'hijri_month' => 9,
                'hijri_day' => 17,
                'duration_days' => 1,
                'description' => 'Peringatan turunnya Al-Quran (17 Ramadhan)',
            ],
            [
                'name' => 'Idul Fitri',
                'name_arabic' => 'عيد الفطر',
                'hijri_month' => 10,
                'hijri_day' => 1,
                'duration_days' => 2,
                'description' => 'Hari Raya Idul Fitri setelah sebulan berpuasa (1-2 Syawal)',
            ],
            [
                'name' => 'Hari Arafah',
                'name_arabic' => 'يوم عرفة',
                'hijri_month' => 12,
                'hijri_day' => 9,
                'duration_days' => 1,
                'description' => 'Hari wukuf di Arafah bagi jamaah haji (9 Dzulhijjah)',
            ],
            [
                'name' => 'Idul Adha',
                'name_arabic' => 'عيد الأضحى',
                'hijri_month' => 12,
                'hijri_day' => 10,
                'duration_days' => 4,
                'description' => 'Hari Raya Qurban (10-13 Dzulhijjah)',
            ],
        ];

        foreach ($holidays as $holiday) {
            IslamicHoliday::updateOrCreate(
                ['name' => $holiday['name']],
                $holiday
            );
        }
    }
}
