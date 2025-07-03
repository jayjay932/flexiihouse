'use client'

import { CldUploadWidget } from "next-cloudinary";
import Image from 'next/image';
import { FC, useCallback } from "react";
import { TbPhotoPlus } from "react-icons/tb";
import { v4 as uuidv4 } from "uuid";
const PhotoPlusIcon = TbPhotoPlus as unknown as React.FC<{ size?: number; className?: string }>;

declare global {
  var cloudinary: any;
}

interface ImageUploadProps {
  onChange: (urls: string[]) => void;
  value: string[];
}

const ImageUpload: FC<ImageUploadProps> = ({ onChange, value }) => {

  const handleUpload = useCallback((result: any) => {
    const newUrl = result.info.secure_url;
    if (newUrl && !value.includes(newUrl)) {
      onChange([...value, newUrl]);
    }
  }, [onChange, value]);

  const handleRemove = (urlToRemove: string) => {
    onChange(value.filter(url => url !== urlToRemove));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 flex-wrap">
        {value.map((url) => (
          <div
            key={uuidv4()}
            className="relative w-32 h-32 rounded-md overflow-hidden border border-neutral-300"
          >
            <Image
              fill
              alt="Uploaded"
              src={url}
              style={{ objectFit: "cover" }}
              className="rounded-md"
                priority 
            />
            <button
              onClick={() => handleRemove(url)}
              className="absolute top-1 right-1 bg-white rounded-full p-1 text-xs font-bold text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <CldUploadWidget
        onUpload={handleUpload}
        uploadPreset="djfn93j91"
        options={{
          maxFiles: 10,
          multiple: true
        }}
      >
        {({ open }) => (
          <div
            onClick={() => open?.()}
            className="cursor-pointer hover:opacity-70 transition border-dashed border-2 p-10 border-neutral-200 flex flex-col justify-center items-center gap-2 text-neutral-600"
          >
            <PhotoPlusIcon size={40} />
            <div className="text-sm font-medium">
              Upload images ({value.length}/min. 4)
            </div>
          </div>
        )}
      </CldUploadWidget>

      {value.length < 4 && (
        <p className="text-sm text-red-500">
          Veuillez uploader au moins 4 images.
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
