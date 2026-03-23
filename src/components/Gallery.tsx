import { useEffect, useState } from "react";
import { usePhotos } from "../hooks/usePhotos";
import { Photo } from "../db";

interface PhotoGridItemProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
}

const PhotoGridItem = ({ photo, onClick }: PhotoGridItemProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    // Basic performance: blobs can be large, use object URLs
    const url = URL.createObjectURL(photo.blob);
    setObjectUrl(url);

    // CRITICAL: Cleanup to avoid memory leaks
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [photo.blob]);

  if (!objectUrl) {
    return <div className="gallery-placeholder" />;
  }

  return (
    <div className="gallery-item" onClick={() => onClick(photo)}>
      <img src={objectUrl} alt={photo.fileName} loading="lazy" />
      {photo.category !== "other" && (
        <span className="gallery-item-category">{photo.category}</span>
      )}
    </div>
  );
};

interface GalleryProps {
  onPhotoClick: (photo: Photo) => void;
}

export const Gallery = ({ onPhotoClick }: GalleryProps) => {
  const { photos, photoCount } = usePhotos();

  if (!photos) {
    return (
      <div className="gallery-container">
        <div className="gallery-empty">
          <div className="spinner" />
          <p>Loading your gallery...</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="gallery-container">
        <div className="gallery-empty">
          <h3>No photos yet</h3>
          <p>Import your memories to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>All Photos</h2>
        <span className="gallery-count">{photoCount} photos</span>
      </div>
      <div className="gallery-grid">
        {photos.map((photo) => (
          <PhotoGridItem key={photo.id} photo={photo} onClick={onPhotoClick} />
        ))}
      </div>
    </div>
  );
};
