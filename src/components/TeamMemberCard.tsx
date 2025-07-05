import React, { useRef } from 'react';
import { Upload, UserRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import OptimizedImage from '@/components/ui/optimized-image';
import { toast } from '@/hooks/use-toast';
import { compressImage, isImageFile, exceedsMaxSize } from '@/utils/imageUtils';

interface TeamMemberProps {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string | null;
  initials: string;
  onImageUpload: (memberId: string, imageDataUrl: string) => void;
  allowImageUpload?: boolean; // New prop to control if image upload is allowed
}

const TeamMemberCard: React.FC<TeamMemberProps> = ({
  id,
  name,
  role,
  bio,
  imageUrl,
  initials,
  onImageUpload,
  allowImageUpload = false // Default to false which means not clickable
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!isImageFile(file)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (exceedsMaxSize(file, MAX_FILE_SIZE)) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      // Compress the image before storing
      const compressedImage = await compressImage(file, 800, 0.8);
      onImageUpload(id, compressedImage);
      toast({
        title: "Image uploaded",
        description: "Your profile photo has been updated",
        variant: "default"
      });
    } catch (error) {
      console.error("Error compressing image:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem processing your image",
        variant: "destructive"
      });
    }
  };

  const triggerFileInput = () => {
    if (allowImageUpload) { // Only trigger if uploads are allowed
      fileInputRef.current?.click();
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col items-center text-center">
          <div 
            className={`relative mb-4 ${allowImageUpload ? 'cursor-pointer group' : ''}`}
            onClick={allowImageUpload ? triggerFileInput : undefined}
            role={allowImageUpload ? "button" : undefined}
            aria-label={allowImageUpload ? `Upload photo for ${name}` : undefined}
            tabIndex={allowImageUpload ? 0 : undefined}
            onKeyDown={allowImageUpload ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                triggerFileInput();
              }
            } : undefined}
          >
            {allowImageUpload && (
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
                aria-hidden="true"
              />
            )}
            
            <div className="relative h-32 w-32 border-2 border-border shadow-md rounded-full overflow-hidden">
              {imageUrl ? (
                <OptimizedImage
                  src={imageUrl}
                  alt={`${name} profile`}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  quality="high"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 text-primary text-2xl flex items-center justify-center">
                  {initials}
                </div>
              )}
              {allowImageUpload && (
                <div className="absolute inset-0 bg-black/0 flex items-center justify-center rounded-full transition-all group-hover:bg-black/20">
                </div>
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">{name}</CardTitle>
          <CardDescription className="text-primary font-medium text-lg">{role}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-center">{bio}</p>
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;