import { useState, useRef, useEffect, memo } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';

interface ImageUploaderProps {
    settingKey?: string;
    folder?: string;
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    aspectRatio?: string;
}

const ImageUploader = memo(function ImageUploader({
    settingKey,
    folder,
    value,
    onChange,
    label = 'Gambar',
    aspectRatio = 'aspect-video'
}: ImageUploaderProps) {
    const [preview, setPreview] = useState<string>(value || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync preview with value prop when data is loaded
    useEffect(() => {
        if (value) {
            setPreview(value);
        }
    }, [value]);

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('image', file);

            if (settingKey) {
                formData.append('key', settingKey);
                return api.post('/settings/image/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }) as Promise<{ data: { url: string } }>;
            } else {
                if (folder) formData.append('folder', folder);
                return api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }) as Promise<{ data: { url: string } }>;
            }
        },
        onSuccess: (data) => {
            const url = data.data.url;
            setPreview(url);
            onChange(url);
        },
        onError: () => {
            alert('Gagal upload gambar');
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Show preview immediately
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target?.result as string);
            reader.readAsDataURL(file);

            // Upload
            uploadMutation.mutate(file);
        }
    };

    const handleRemove = () => {
        setPreview('');
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-[#181112] mb-1.5">{label}</label>
            <div className={`relative ${aspectRatio} bg-[#f8f6f6] rounded-xl border-2 border-dashed border-[#e6dbdc] overflow-hidden group`}>
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 bg-white text-[#181112] rounded-lg text-sm font-medium hover:bg-gray-100"
                            >
                                <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
                                Ganti
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="px-3 py-1.5 bg-[#ec1325] text-white rounded-lg text-sm font-medium hover:bg-[#c91020]"
                            >
                                <span className="material-symbols-outlined text-[16px] mr-1">delete</span>
                                Hapus
                            </button>
                        </div>
                        {uploadMutation.isPending && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                            </div>
                        )}
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadMutation.isPending}
                        className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#896165] hover:text-[#ec1325] hover:border-[#ec1325] transition-colors"
                    >
                        {uploadMutation.isPending ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#ec1325] border-t-transparent"></div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                                <span className="text-sm">Klik untuk upload gambar</span>
                            </>
                        )}
                    </button>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            <p className="text-xs text-[#896165] mt-1">Format: JPG, PNG, WebP. Maks 5MB</p>
        </div>
    );
});

export default ImageUploader;
