import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Trash2, GripVertical, Plus, Image } from "lucide-react";

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
  const [newPose, setNewPose] = useState({
    pose_name: "",
    cue_text: "",
    modification_text: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      // Upload image to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${contentId}-pose-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('pose-images')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pose-images')
        .getPublicUrl(fileName);

      // Calculate next step number
      const nextStep = poseImages.length + 1;

      // Insert pose image record
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

  const handleDeletePoseImage = async (poseId: string, imageUrl: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this pose image?');
    if (!confirmed) return;

    try {
      // Delete from database
      const { error: deleteError } = await supabase
        .from('content_pose_images')
        .delete()
        .eq('id', poseId);

      if (deleteError) throw deleteError;

      // Try to delete from storage (extract file name from URL)
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

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          Pose Images for: {contentTitle}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload step-by-step pose images. These will be displayed to all users.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Pose Images */}
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading pose images...</div>
        ) : poseImages.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Current Poses ({poseImages.length})</h4>
            <div className="grid gap-4">
              {poseImages.map((pose, index) => (
                <div key={pose.id} className="flex gap-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <img
                    src={pose.image_url}
                    alt={pose.pose_name || `Step ${pose.step_number}`}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium bg-primary/10 px-2 py-0.5 rounded">
                        Step {pose.step_number}
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
            Add New Pose Image
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
