import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({
    bucket = 'vehicle-images',
    folder = 'models',
    currentUrl,
    onUploadComplete,
    onClear
}) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleUpload = async (e) => {
        try {
            setUploading(true);
            setError('');

            const file = e.target.files[0];
            if (!file) {
                setUploading(false);
                return;
            }

            // check file type
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed.');
                setUploading(false);
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

            if (data?.publicUrl) {
                onUploadComplete(data.publicUrl);
            }
        } catch (err) {
            console.error('Error uploading image:', err);
            setError('Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="border-2 border-dashed border-[#2A2A35] rounded-xl p-4 bg-[#1A1A24] text-center relative overflow-hidden group">
            {currentUrl ? (
                <div className="relative aspect-video w-full flex items-center justify-center bg-black/5 rounded-lg overflow-hidden">
                    <img src={currentUrl} alt="Uploaded" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                    >
                        <X size={16} />
                    </button>
                    {/* fallback file input if they want to replace without clearing */}
                    <input
                        title="Upload Replacement"
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-6">
                    {uploading ? (
                        <Loader2 className="animate-spin text-[#FAF8F5]/40 mb-2" size={32} />
                    ) : (
                        <ImageIcon className="text-gray-300 mb-2" size={32} />
                    )}
                    <span className="text-sm text-[#FAF8F5]/50 font-medium">
                        {uploading ? 'Uploading...' : 'Click to upload image'}
                    </span>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
