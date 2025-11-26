import React, { useState, useRef } from 'react';

interface EditableImageProps {
  src: string;
  alt: string;
  onSave: (newImageUrl: string) => Promise<void>;
  shape?: 'circle' | 'rect';
}

const EditableImage: React.FC<EditableImageProps> = ({ src, alt, onSave, shape = 'rect' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadstart = () => setIsUploading(true);
      reader.onloadend = async () => {
        const newImageUrl = reader.result as string;
        try {
          await onSave(newImageUrl);
        } catch (error) {
          console.error("Failed to save image", error);
          alert("Failed to update image.");
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
          alert("Failed to read file.");
          setIsUploading(false);
      }
      reader.readAsDataURL(file);
    }
  };

  const containerClasses = `relative group cursor-pointer ${isUploading ? 'cursor-wait' : 'cursor-pointer'}`;
  const imageClasses = shape === 'circle' 
    ? 'h-24 w-24 rounded-full object-cover'
    : 'h-24 w-40 rounded-lg object-cover';

  return (
    <div className={containerClasses} onClick={handleImageClick}>
      <img src={src} alt={alt} className={imageClasses} />
      <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}>
        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm text-center px-2">
          {isUploading ? 'Uploading...' : 'Change Photo'}
        </span>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default EditableImage;