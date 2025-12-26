<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreMarriageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'husband_id' => ['required', 'exists:persons,id', 'different:wife_id'],
            'wife_id' => ['required', 'exists:persons,id'],
            'marriage_date' => ['nullable', 'date'],
            'divorce_date' => ['nullable', 'date', 'after:marriage_date'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'husband_id.required' => 'Suami wajib dipilih',
            'husband_id.exists' => 'Data suami tidak valid',
            'husband_id.different' => 'Suami dan istri tidak boleh sama',
            'wife_id.required' => 'Istri wajib dipilih',
            'wife_id.exists' => 'Data istri tidak valid',
            'divorce_date.after' => 'Tanggal cerai harus setelah tanggal nikah',
        ];
    }
}
