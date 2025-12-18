import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, Trash2, GripVertical, Plus, Image, Eye, Images, Crown, User } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PoseImageSequence } from "./PoseImageSequence";

interface PoseImage {
  id: string;
  image_url: string;
  step_number: number;
  pose_name: string | null;
  cue_text: string | null;
  modification_text: string | null;
}

interface AdminPoseImageUploaderProps {
  contentId: string;
  contentTitle: string;
}

export const AdminPoseImageUploader = ({ contentId, contentTitle }: AdminPoseImageUploaderProps) => {
  const [poseImages, setPoseImages] = useState<PoseImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAsPremium, setPreviewAsPremium] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [newPose, setNewPose] = useState({
    pose_name: "",
    cue_text: "",
    modification_text: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPoseImages();
  }, [contentId]);

  const loadPoseImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('content_pose_images')
      .select('*')
      .eq('content_id', contentId)
      .order('step_number', { ascending: true });

    if (error) {
      console.error('Error loading pose images:', error);
      toast.error('Failed to load pose images');
      setLoading(false);
      return;
    }

    setPoseImages(data || []);
    setLoading(false);
  };

  const handleUploadPoseImage = async () => {
    if (!selectedFile) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${contentId}-pose-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('pose-images')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pose-images')
        .getPublicUrl(fileName);

      const nextStep = poseImages.length + 1;

      const { error: insertError } = await supabase
        .from('content_pose_images')
        .insert({
          content_id: contentId,
          image_url: publicUrl,
          step_number: nextStep,
          pose_name: newPose.pose_name || null,
          cue_text: newPose.cue_text || null,
          modification_text: newPose.modification_text || null,
        });

      if (insertError) throw insertError;

      toast.success('Pose image uploaded successfully');
      setSelectedFile(null);
      setNewPose({ pose_name: "", cue_text: "", modification_text: "" });
      loadPoseImages();
    } catch (error) {
      console.error('Error uploading pose image:', error);
      toast.error('Failed to upload pose image');
    } finally {
      setUploading(false);
    }
  };

  const handleBulkUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setBulkUploading(true);
    const sortedFiles = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));
    let startStep = poseImages.length + 1;
    let successCount = 0;

    try {
      for (const file of sortedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${contentId}-pose-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('pose-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading file:', file.name, uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('pose-images')
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase
          .from('content_pose_images')
          .insert({
            content_id: contentId,
            image_url: publicUrl,
            step_number: startStep,
            pose_name: null,
            cue_text: null,
            modification_text: null,
          });

        if (!insertError) {
          startStep++;
          successCount++;
        }
      }

      toast.success(`${successCount} of ${sortedFiles.length} images uploaded successfully`);
      loadPoseImages();
    } catch (error) {
      console.error('Error in bulk upload:', error);
      toast.error('Bulk upload failed');
    } finally {
      setBulkUploading(false);
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePoseImage = async (poseId: string, imageUrl: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this pose image?');
    if (!confirmed) return;

    try {
      const { error: deleteError } = await supabase
        .from('content_pose_images')
        .delete()
        .eq('id', poseId);

      if (deleteError) throw deleteError;

      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('pose-images')
          .remove([fileName]);
      }

      toast.success('Pose image deleted');
      loadPoseImages();
    } catch (error) {
      console.error('Error deleting pose image:', error);
      toast.error('Failed to delete pose image');
    }
  };

  const handleUpdatePoseImage = async (pose: PoseImage, updates: Partial<PoseImage>) => {
    try {
      const { error } = await supabase
        .from('content_pose_images')
        .update(updates)
        .eq('id', pose.id);

      if (error) throw error;

      toast.success('Pose updated');
      loadPoseImages();
    } catch (error) {
      console.error('Error updating pose:', error);
      toast.error('Failed to update pose');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...poseImages];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);

    setPoseImages(newOrder);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    try {
      // Update step numbers in database
      const updates = poseImages.map((pose, index) => ({
        id: pose.id,
        step_number: index + 1,
      }));

      for (const update of updates) {
        await supabase
          .from('content_pose_images')
          .update({ step_number: update.step_number })
          .eq('id', update.id);
      }

      toast.success('Pose order updated');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
      loadPoseImages(); // Reload to revert
    }

    setDraggedIndex(null);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Pose Images for: {contentTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Upload step-by-step pose images. Drag to reorder.
            </p>
          </div>
          
          {/* Preview Button */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={poseImages.length === 0}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between pr-8">
                  <span>User Preview: {contentTitle}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm">
                      <User className={`h-4 w-4 ${!previewAsPremium ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={!previewAsPremium ? 'font-medium' : 'text-muted-foreground'}>Basic</span>
                    </div>
                    <Switch
                      checked={previewAsPremium}
                      onCheckedChange={setPreviewAsPremium}
                    />
                    <div className="flex items-center gap-1.5 text-sm">
                      <Crown className={`h-4 w-4 ${previewAsPremium ? 'text-amber-500' : 'text-muted-foreground'}`} />
                      <span className={previewAsPremium ? 'font-medium text-amber-600' : 'text-muted-foreground'}>Premium</span>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <PoseImageSequence
                  contentId={contentId}
                  videoUrl={null}
                  isPremiumUser={previewAsPremium}
                  isPremiumContent={true}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bulk Upload Section */}
        <div className="p-4 border-2 border-dashed rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
          <div className="text-center">
            <Images className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Bulk Upload</p>
            <p className="text-xs text-muted-foreground mb-3">
              Select multiple images at once. They'll be ordered by filename.
            </p>
            <input
              ref={bulkFileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleBulkUpload(e.target.files)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => bulkFileInputRef.current?.click()}
              disabled={bulkUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {bulkUploading ? 'Uploading...' : 'Select Multiple Images'}
            </Button>
          </div>
        </div>

        {/* Existing Pose Images */}
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading pose images...</div>
        ) : poseImages.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Current Poses ({poseImages.length}) - Drag to reorder</h4>
            <div className="grid gap-4">
              {poseImages.map((pose, index) => (
                <div
                  key={pose.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex gap-4 p-4 border rounded-lg bg-muted/30 cursor-grab active:cursor-grabbing transition-all ${
                    draggedIndex === index ? 'opacity-50 scale-[0.98]' : ''
                  }`}
                >
                  <div className="flex items-center text-muted-foreground hover:text-primary">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <img
                    src={pose.image_url}
                    alt={pose.pose_name || `Step ${pose.step_number}`}
                    className="w-24 h-24 object-cover rounded-md"
                    draggable={false}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium bg-primary/10 px-2 py-0.5 rounded">
                        Step {index + 1}
                      </span>
                      <Input
                        placeholder="Pose name"
                        defaultValue={pose.pose_name || ''}
                        className="flex-1 h-8"
                        onBlur={(e) => {
                          if (e.target.value !== pose.pose_name) {
                            handleUpdatePoseImage(pose, { pose_name: e.target.value });
                          }
                        }}
                      />
                    </div>
                    <Input
                      placeholder="Beginner cue (e.g., Keep knees soft, breathe deeply)"
                      defaultValue={pose.cue_text || ''}
                      className="h-8 text-sm"
                      onBlur={(e) => {
                        if (e.target.value !== pose.cue_text) {
                          handleUpdatePoseImage(pose, { cue_text: e.target.value });
                        }
                      }}
                    />
                    <Input
                      placeholder="Modification for limited mobility"
                      defaultValue={pose.modification_text || ''}
                      className="h-8 text-sm"
                      onBlur={(e) => {
                        if (e.target.value !== pose.modification_text) {
                          handleUpdatePoseImage(pose, { modification_text: e.target.value });
                        }
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeletePoseImage(pose.id, pose.image_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
            <Image className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No pose images uploaded yet</p>
          </div>
        )}

        {/* Add New Pose Image */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Single Pose Image (with details)
          </h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pose-image">Image File</Label>
              <Input
                id="pose-image"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                disabled={uploading}
              />
            </div>
            <div>
              <Label htmlFor="pose-name">Pose Name</Label>
              <Input
                id="pose-name"
                placeholder="e.g., Mountain Pose, Seated Twist"
                value={newPose.pose_name}
                onChange={(e) => setNewPose(prev => ({ ...prev, pose_name: e.target.value }))}
                disabled={uploading}
              />
            </div>
            <div>
              <Label htmlFor="cue-text">Beginner Cue</Label>
              <Textarea
                id="cue-text"
                placeholder="1-2 simple cues for beginners (e.g., Keep your spine tall, breathe into your belly)"
                value={newPose.cue_text}
                onChange={(e) => setNewPose(prev => ({ ...prev, cue_text: e.target.value }))}
                disabled={uploading}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="modification-text">Modification for Limited Mobility</Label>
              <Textarea
                id="modification-text"
                placeholder="How to modify for those with limited mobility (e.g., Use a chair for support, Place a pillow under knees)"
                value={newPose.modification_text}
                onChange={(e) => setNewPose(prev => ({ ...prev, modification_text: e.target.value }))}
                disabled={uploading}
                rows={2}
              />
            </div>
            <Button
              onClick={handleUploadPoseImage}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Pose Image'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
