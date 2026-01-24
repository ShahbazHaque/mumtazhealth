import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Upload, User, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProfilePhotoUploadProps {
  currentAvatarUrl?: string | null;
  username?: string;
  onAvatarUpdate: (url: string) => void;
}

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoey&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya&backgroundColor=c5e1a5",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasmine&backgroundColor=ffe0b2",
];

export function ProfilePhotoUpload({ currentAvatarUrl, username, onAvatarUpdate }: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (currentAvatarUrl?.includes("avatars/")) {
        const oldPath = currentAvatarUrl.split("avatars/")[1];
        await supabase.storage.from("avatars").remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      await updateProfileAvatar(publicUrl);
      onAvatarUpdate(publicUrl);
      toast({ title: "Avatar uploaded successfully!" });
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const selectPresetAvatar = async (avatarUrl: string) => {
    try {
      await updateProfileAvatar(avatarUrl);
      onAvatarUpdate(avatarUrl);
      toast({ title: "Avatar updated successfully!" });
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Update failed';
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const updateProfileAvatar = async (url: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("user_id", user.id);

    if (error) throw error;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 2MB",
          variant: "destructive",
        });
        return;
      }
      uploadAvatar(file);
    }
  };

  const getInitials = () => {
    if (!username) return "U";
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center gap-3 cursor-pointer group">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-primary/20 group-hover:border-accent transition-colors">
              <AvatarImage src={currentAvatarUrl || undefined} alt={username || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="h-6 w-6 text-accent" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground group-hover:text-accent transition-colors">
            Change Photo
          </p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Choose Your Avatar
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Upload custom photo */}
          <div className="space-y-2">
            <Label>Upload Your Photo</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
            <p className="text-xs text-muted-foreground">Max size: 2MB</p>
          </div>

          {/* Preset avatars */}
          <div className="space-y-2">
            <Label>Or Choose a Preset Avatar</Label>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AVATARS.map((avatarUrl, index) => (
                <button
                  key={index}
                  onClick={() => selectPresetAvatar(avatarUrl)}
                  className="relative aspect-square rounded-full overflow-hidden border-2 border-border hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  <img src={avatarUrl} alt={`Preset avatar ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
