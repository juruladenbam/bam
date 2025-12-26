<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StorePersonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:100'],
            'gender' => ['required', 'in:male,female'],
            'birth_date' => ['nullable', 'date'],
            'birth_place' => ['nullable', 'string', 'max:255'],
            'death_date' => ['nullable', 'date', 'after_or_equal:birth_date'],
            'is_alive' => ['boolean'],
            'photo_url' => ['nullable', 'url'],
            'bio' => ['nullable', 'string'],
            'branch_id' => ['required', 'exists:branches,id'],
            'generation' => ['nullable', 'integer', 'min:1'],
            'parent_marriage_id' => ['nullable', 'exists:marriages,id'],
            'birth_order' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Nama lengkap wajib diisi',
            'gender.required' => 'Jenis kelamin wajib diisi',
            'gender.in' => 'Jenis kelamin harus male atau female',
            'branch_id.required' => 'Cabang wajib dipilih',
            'branch_id.exists' => 'Cabang tidak valid',
            'death_date.after_or_equal' => 'Tanggal wafat harus setelah tanggal lahir',
        ];
    }
}
