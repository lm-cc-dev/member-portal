'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Send, EyeOff, Users, Paperclip, X, FileText } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (data: {
    commentText: string;
    isAnonymous?: boolean;
    steercoOnly?: boolean;
    files?: File[];
  }) => Promise<void>;
  placeholder?: string;
  showAnonymousOption?: boolean;
  showSteercoOption?: boolean;
  isSteerCoMember?: boolean;
}

export function CommentForm({
  onSubmit,
  placeholder = 'Add a comment...',
  showAnonymousOption = false,
  showSteercoOption = false,
  isSteerCoMember = false,
}: CommentFormProps) {
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [steercoOnly, setSteercoOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        commentText: commentText.trim(),
        isAnonymous: showAnonymousOption ? isAnonymous : undefined,
        steercoOnly: showSteercoOption && isSteerCoMember ? steercoOnly : undefined,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
      });
      // Reset form
      setCommentText('');
      setIsAnonymous(false);
      setSteercoOnly(false);
      setSelectedFiles([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card size="sm">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
            maxLength={10000}
          />

          {/* Selected files preview */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md text-sm"
                >
                  <FileText className="size-3" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="hover:text-destructive"
                    disabled={isSubmitting}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {showAnonymousOption && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(!!checked)}
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor="anonymous"
                    className="text-sm flex items-center gap-1 cursor-pointer"
                  >
                    <EyeOff className="size-3" />
                    Post anonymously
                  </Label>
                </div>
              )}

              {showSteercoOption && isSteerCoMember && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="steerco-only"
                    checked={steercoOnly}
                    onCheckedChange={(checked) => setSteercoOnly(!!checked)}
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor="steerco-only"
                    className="text-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Users className="size-3" />
                    SteerCo only
                  </Label>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={isSubmitting}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif"
              />

              {/* Attach file button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <Paperclip className="size-4 mr-2" />
                Attach
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={!commentText.trim() || isSubmitting}
              >
                <Send className="size-4 mr-2" />
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>

          {commentText.length > 9000 && (
            <p className="text-xs text-muted-foreground">
              {10000 - commentText.length} characters remaining
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
