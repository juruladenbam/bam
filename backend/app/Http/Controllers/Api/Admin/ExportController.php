<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\StatisticsService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function __construct(
        protected StatisticsService $statisticsService
    ) {
    }

    /**
     * Export persons to CSV
     */
    public function persons(Request $request): StreamedResponse
    {
        $filters = $request->only(['branch_id', 'generation', 'gender', 'search']);
        
        if ($request->has('is_alive')) {
            $filters['is_alive'] = $request->boolean('is_alive');
        }

        $persons = $this->statisticsService->getFilteredPersons($filters);

        $filename = 'silsilah_anggota_' . date('Y-m-d_H-i') . '.csv';

        return new StreamedResponse(function () use ($persons) {
            $handle = fopen('php://output', 'w');

            // Add BOM for Excel UTF-8 support
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header
            fputcsv($handle, [
                'ID',
                'NIB',
                'Nama Lengkap',
                'Nama Panggilan',
                'Gender',
                'Generasi',
                'Qobilah',
                'Tempat Lahir',
                'Tanggal Lahir',
                'Status',
                'Tanggal Wafat',
                'Pekerjaan',
                'Alamat',
                'Telepon'
            ]);

            foreach ($persons as $p) {
                fputcsv($handle, [
                    $p->id,
                    $p->nib,
                    $p->full_name,
                    $p->nickname,
                    $p->gender === 'male' ? 'Laki-laki' : 'Perempuan',
                    $p->generation,
                    $p->qobilah_name ?: '-',
                    $p->birth_place,
                    $p->birth_date ? $p->birth_date->format('Y-m-d') : '',
                    $p->is_alive ? 'Hidup' : 'Wafat',
                    $p->death_date ? $p->death_date->format('Y-m-d') : '',
                    $p->occupation,
                    $p->address,
                    $p->phone
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Export marriages to CSV
     */
    public function marriages(Request $request): StreamedResponse
    {
        $filters = [];
        if ($request->has('is_active')) {
            $filters['is_active'] = $request->boolean('is_active');
        }
        if ($request->has('is_internal')) {
            $filters['is_internal'] = $request->boolean('is_internal');
        }
        if ($request->has('is_complete')) {
            $filters['is_complete'] = $request->boolean('is_complete');
        }
        if ($request->has('branch_id')) {
            $filters['branch_id'] = (int) $request->branch_id;
        }

        $marriages = $this->statisticsService->getFilteredMarriages($filters);

        $filename = 'silsilah_pernikahan_' . date('Y-m-d_H-i') . '.csv';

        return new StreamedResponse(function () use ($marriages) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header
            fputcsv($handle, [
                'ID',
                'Suami',
                'Qobilah Suami',
                'Istri',
                'Qobilah Istri',
                'Tanggal Nikah',
                'Status Aktif',
                'Tipe Pernikahan'
            ]);

            foreach ($marriages as $m) {
                fputcsv($handle, [
                    $m->id,
                    $m->husband?->full_name ?: '-',
                    $m->husband?->branch?->name ?: 'Luar',
                    $m->wife?->full_name ?: '-',
                    $m->wife?->branch?->name ?: 'Luar',
                    $m->marriage_date,
                    $m->is_active ? 'Aktif' : 'Tidak Aktif',
                    $m->is_internal ? 'Internal (Kerabat)' : 'Eksternal'
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Get full tree data for print
     */
    public function tree()
    {
        $persons = \App\Models\Person::with('branch')->orderBy('generation')->get();
        $marriages = \App\Models\Marriage::with(['husband:id,full_name,gender', 'wife:id,full_name,gender'])->get();
        $parentChild = \App\Models\ParentChild::orderBy('birth_order')->get();
        $branches = \App\Models\Branch::orderBy('order')->get();

        return response()->json([
            'success' => true,
            'message' => 'Data silsilah lengkap berhasil dimuat',
            'data' => [
                'persons' => $persons,
                'marriages' => $marriages,
                'parent_child' => $parentChild,
                'branches' => $branches,
            ]
        ]);
    }
}
