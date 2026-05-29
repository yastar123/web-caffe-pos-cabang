import { useState, useRef } from "react";
import { useUploadImage } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadFieldProps {
  name: string;
  defaultValue?: string | null;
  label?: string;
  folder?: string;
}

export function ImageUploadField({ name, defaultValue, label = "Gambar", folder = "pos-kafe" }: ImageUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(defaultValue ?? undefined);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadImage();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      try {
        const result = await uploadImage.mutateAsync({ data: { url: dataUrl, folder } });
        setPreviewUrl(result.url);
      } catch {
        toast({ title: "Gagal mengupload gambar", variant: "destructive" });
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <input type="hidden" name={name} value={previewUrl ?? ""} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {previewUrl ? (
        <div className="relative w-full h-36 rounded-lg overflow-hidden border bg-muted group">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => setPreviewUrl(undefined)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full h-7 text-xs bg-black/60 hover:bg-black/80 text-white border-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-3 h-3 mr-1.5" />
              {uploading ? "Mengupload..." : "Ganti Gambar"}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-full h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer",
            uploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Mengupload...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span className="text-xs font-medium">Klik untuk upload gambar dari laptop</span>
              <span className="text-[10px] text-muted-foreground/70">JPG, PNG, WEBP hingga 10MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
