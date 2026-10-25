import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  X,
  RefreshCw,
  Eye,
  Download,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
  HardDrive
} from 'lucide-react';
import { uploadFileToServer, deleteUploadedFile } from '../../services/fileUpload';

interface DeviceFileUploadProps {
  label: string;
  fileType: 'image' | 'document';
  accept?: string;
  value?: string;
  fileName?: string;
  fileSize?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  previewHeightClass?: string;
  onChange: (url: string, meta?: { fileName?: string; fileSize?: string; fileType?: string }) => void;
  onClear?: () => void;
}

export const DeviceFileUpload: React.FC<DeviceFileUploadProps> = ({
  label,
  fileType,
  accept,
  value,
  fileName,
  fileSize,
  helperText,
  required = false,
  className = '',
  previewHeightClass = 'h-44',
  onChange,
  onClear
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>(fileName || '');
  const [currentFileSize, setCurrentFileSize] = useState<string>(fileSize || '');
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState<string>(value || '');
  const [imageError, setImageError] = useState(false);

  // Default accept attributes
  const acceptedFormats = accept || (fileType === 'image'
    ? '.jpg,.jpeg,.png,.webp,.gif,.svg,image/jpeg,image/png,image/webp'
    : '.pdf,.doc,.docx,.xls,.xlsx,application/pdf');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    setUploadSuccess(false);
    setImageError(false);

    try {
      const res = await uploadFileToServer(file);
      if (res.success && res.url) {
        setCurrentFileName(res.fileName);
        setCurrentFileSize(res.fileSize);
        setUploadSuccess(true);
        setUrlInput(res.url);
        onChange(res.url, {
          fileName: res.fileName,
          fileSize: res.fileSize,
          fileType: file.name.split('.').pop()?.toUpperCase() || (fileType === 'image' ? 'IMAGE' : 'PDF')
        });
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        setUploadError(res.error || 'Failed to upload file from device');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error occurred while reading the file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      handleRemove();
      return;
    }
    setImageError(false);
    setUploadError(null);
    const inferredName = trimmed.split('/').pop()?.split('?')[0] || (fileType === 'image' ? 'Web Image' : 'Web Document');
    setCurrentFileName(inferredName);
    setCurrentFileSize('External URL');
    onChange(trimmed, {
      fileName: inferredName,
      fileSize: 'External URL',
      fileType: fileType === 'image' ? 'WEB-IMG' : 'WEB-DOC'
    });
  };

  const handleRemove = async () => {
    if (value && value.startsWith('/uploads/')) {
      deleteUploadedFile(value);
    }
    setCurrentFileName('');
    setCurrentFileSize('');
    setUrlInput('');
    setUploadSuccess(false);
    setUploadError(null);
    setImageError(false);
    if (onClear) {
      onClear();
    } else {
      onChange('', { fileName: '', fileSize: '' });
    }
  };

  const openPicker = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const isServerUpload = value && value.startsWith('/uploads/');

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Control Label and Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>

        {/* Dual Mode Switcher Tabs */}
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
          <button
            type="button"
            onClick={() => setInputMode('upload')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition flex items-center gap-1.5 ${
              inputMode === 'upload'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3 h-3" />
            Upload from Device
          </button>
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition flex items-center gap-1.5 ${
              inputMode === 'url'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            Image / File URL
          </button>
        </div>
      </div>

      {/* Mode A: URL input field */}
      {inputMode === 'url' && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-semibold text-[11px]">
              Enter external image or document link:
            </span>
            {value && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                CURRENTLY LINKED
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/... or https://domain.com/file.jpg"
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shrink-0"
            >
              Apply & Preview
            </button>
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Box / Preview Area */}
      {value ? (
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-3">
          {fileType === 'image' ? (
            /* Image Preview */
            <div className="space-y-2">
              <div className={`relative ${previewHeightClass} rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group flex items-center justify-center`}>
                {!imageError ? (
                  <img
                    src={value}
                    alt="Uploaded Asset"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="p-4 text-center text-slate-400 space-y-1">
                    <AlertCircle className="w-8 h-8 mx-auto text-amber-500 opacity-60" />
                    <p className="text-xs font-bold text-slate-600">Image Preview Unavailable</p>
                    <p className="text-[11px] text-slate-400">The provided link may be invalid or restricted.</p>
                  </div>
                )}

                {/* Hover overlay with action buttons */}
                <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white text-slate-800 rounded-lg hover:bg-slate-100 shadow transition"
                    title="View Full Image in New Tab"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={openPicker}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace from Device
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow transition"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status and metadata footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isServerUpload ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isServerUpload ? 'STORED ON SERVER' : 'EXTERNAL URL'}
                  </span>
                  <span className="truncate max-w-[200px] sm:max-w-[300px] font-mono text-[11px] text-slate-700">
                    {currentFileName || value.split('/').pop() || 'Image uploaded'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openPicker}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Upload New
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Document Preview */
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate block">
                      {currentFileName || value.split('/').pop() || 'Attached Document'}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                      isServerUpload ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isServerUpload ? 'SERVER UPLOAD' : 'ONLINE LINK'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    {currentFileSize || 'Document ready'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded flex items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  View/Download
                </a>
                <button
                  type="button"
                  onClick={openPicker}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  title="Remove Document"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty Upload Trigger Button */
        <div
          onClick={openPicker}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 bg-slate-50/60 hover:bg-blue-50/30 transition-all cursor-pointer text-center group"
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              ) : fileType === 'image' ? (
                <ImageIcon className="w-5 h-5" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>

            <div>
              <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700">
                {isUploading
                  ? 'Uploading to Server Storage...'
                  : fileType === 'image'
                  ? 'Click to Select Image from Device'
                  : 'Click to Select Document from Device'}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {helperText || (fileType === 'image'
                  ? 'Supports JPG, PNG, WebP, SVG (Max 25MB) or enter URL above'
                  : 'Supports PDF, Word DOC/DOCX, Excel XLSX (Max 25MB) or enter URL above')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Uploading progress indicator */}
      {isUploading && (
        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-lg font-medium">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Processing and securely storing file on server...</span>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-2 rounded-lg font-medium border border-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Upload Success */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg font-medium border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>File successfully stored on persistent server storage!</span>
        </div>
      )}
    </div>
  );
};
