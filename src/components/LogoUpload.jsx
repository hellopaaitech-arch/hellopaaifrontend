import { useState, useRef } from 'react';
import { api } from '../lib/api';

export function LogoUpload({ value, onChange, folder = 'users' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const fileInputRef = useRef(null);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const { data } = await api.post('/upload/profile-image', formData);

      const fileUrl = data.fileUrl;
      setPreview(fileUrl);
      onChange?.(fileUrl);
    } catch (err) {
      console.error('Logo upload error:', err);
      alert(err?.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="logo-upload">
      {preview && (
        <div className="logo-preview">
          <img src={preview} alt="Logo preview" style={{ maxWidth: 100, maxHeight: 100, objectFit: 'contain' }} />
          <button
            type="button"
            className="btn sm ghost"
            onClick={() => {
              setPreview(null);
              onChange?.(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          >
            Remove
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="btn sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : preview ? 'Change Logo' : 'Upload Logo'}
      </button>
    </div>
  );
}
