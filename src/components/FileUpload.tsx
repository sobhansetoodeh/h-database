import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  files: Array<{ id: string; name: string; data: string; type: string }>;
  onFilesChange: (files: Array<{ id: string; name: string; data: string; type: string }>) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = '*/*',
  multiple = false,
  maxSize = 5,
  files,
  onFilesChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    for (const file of selectedFiles) {
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: 'خطا',
          description: `حجم فایل ${file.name} بیش از ${maxSize} مگابایت است`,
          variant: 'destructive',
        });
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile = {
          id: crypto.randomUUID(),
          name: file.name,
          data: event.target?.result as string,
          type: file.type,
        };
        
        onFilesChange(multiple ? [...files, newFile] : [newFile]);
      };
      reader.readAsDataURL(file);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const isImage = (type: string) => type.startsWith('image/');

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        انتخاب فایل
      </Button>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {isImage(file.type) ? (
                <img src={file.data} alt={file.name} className="w-12 h-12 object-cover rounded" />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-background rounded">
                  {getFileIcon(file.type)}
                </div>
              )}
              <span className="flex-1 text-sm truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(file.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
