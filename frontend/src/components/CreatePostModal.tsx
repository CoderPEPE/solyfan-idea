import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import postService from '../services/postService';
import uploadService from '../services/uploadService';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let mediaUrls: string[] = [];
      let mediaTypes: string[] = [];

      // Upload files if any
      if (selectedFiles.length > 0) {
        setUploadProgress(10);
        const uploadResponse = await uploadService.uploadMultiple(selectedFiles);
        setUploadProgress(60);
        
        mediaUrls = uploadResponse.files.map(file => file.url);
        mediaTypes = uploadResponse.files.map(file => file.mimetype);
        setUploadProgress(80);
      }

      // Create post
      await postService.createPost({
        title,
        content,
        mediaUrls,
        mediaTypes,
        isPublic,
      });

      setUploadProgress(100);
      
      // Reset form
      setTitle('');
      setContent('');
      setIsPublic(false);
      setSelectedFiles([]);
      setUploadProgress(0);
      
      onPostCreated();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop d-flex align-items-center justify-content-center" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      zIndex: 1050 
    }}>
      <div className="modal-content bg-white rounded-3 shadow-lg" style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
        <div className="modal-header d-flex align-items-center justify-content-between p-4 border-bottom">
          <h4 className="fw-700 font-md mb-0">Create New Post</h4>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px' }}
          >
            <i className="feather-x"></i>
          </button>
        </div>

        <div className="modal-body p-4">
          {error && (
            <div className="alert alert-danger font-xsss fw-500 mb-3" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label font-xsss fw-600 text-grey-700">Title</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label font-xsss fw-600 text-grey-700">Content</label>
              <textarea
                className="form-control"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
              />
            </div>

            <div className="mb-3">
              <label className="form-label font-xsss fw-600 text-grey-700">Media Files</label>
              <input
                type="file"
                className="form-control"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              <div className="form-text font-xsss text-grey-500">
                Upload images or videos (max 50MB each)
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mb-3">
                <label className="form-label font-xsss fw-600 text-grey-700">Selected Files</label>
                <div className="d-flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="position-relative">
                      <div className="bg-light rounded p-2 d-flex align-items-center">
                        <i className={`feather-${file.type.startsWith('image/') ? 'image' : 'video'} me-2`}></i>
                        <span className="font-xsss text-truncate" style={{ maxWidth: '120px' }}>
                          {file.name}
                        </span>
                        <button
                          type="button"
                          className="btn-close-small ms-2"
                          onClick={() => removeFile(index)}
                          style={{ background: 'none', border: 'none', color: '#666' }}
                        >
                          <i className="feather-x font-xsss"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <label className="form-check-label font-xsss fw-600 text-grey-700" htmlFor="isPublic">
                  Make this post public
                </label>
                <div className="form-text font-xsss text-grey-500">
                  {isPublic ? 'Everyone can see this post' : 'Only subscribers can see this post'}
                </div>
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-3">
                <div className="progress" style={{ height: '4px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="font-xsss text-grey-500 mt-1">Uploading... {uploadProgress}%</div>
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={loading || !title.trim()}
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;