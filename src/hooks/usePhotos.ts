import { useLiveQuery } from "dexie-react-hooks";
import { db, Photo } from "../db";

export const usePhotos = () => {
  // Get all photos, ordered by most recently imported
  const photos = useLiveQuery(() =>
    db.photos.orderBy("importedAt").reverse().toArray(),
  );

  // Total count of photos
  const photoCount = useLiveQuery(() => db.photos.count());

  // Count of photos already processed by VLM
  const taggedCount = useLiveQuery(() =>
    db.photos
      .where("isTagged")
      .equals(1 as any)
      .count(),
  );

  const getPhotoById = async (id: string) => {
    return db.photos.get(id);
  };

  const updatePhoto = async (id: string, updates: Partial<Photo>) => {
    return db.photos.update(id, updates);
  };

  const deletePhoto = async (id: string) => {
    return db.photos.delete(id);
  };

  return {
    photos,
    photoCount,
    taggedCount,
    getPhotoById,
    updatePhoto,
    deletePhoto,
  };
};
