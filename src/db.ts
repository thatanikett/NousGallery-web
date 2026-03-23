import Dexie, { Table } from "dexie";

export interface Photo {
  id: string;
  fileName: string;
  blob: Blob;
  width: number;
  height: number;
  importedAt: Date;
  folderId: string;
  tags: string[];
  category:
    | "selfie"
    | "group_photo"
    | "landscape"
    | "document"
    | "food"
    | "screenshot"
    | "other";
  description: string;
  isTagged: boolean;
}

export interface Folder {
  id: string;
  name: string;
  handle: FileSystemDirectoryHandle;
  lastSyncedAt: Date;
}

export interface Album {
  id: string;
  name: string;
  photoIds: string[];
  createdAt: Date;
  isSmartAlbum: boolean;
}

class NousGalleryDB extends Dexie {
  photos!: Table<Photo>;
  folders!: Table<Folder>;
  albums!: Table<Album>;

  constructor() {
    super("NousGallery");

    this.version(1).stores({
      photos: "id, fileName, importedAt, folderId, isTagged, category, *tags",
      folders: "id, name, lastSyncedAt",
      albums: "id, name, createdAt, isSmartAlbum",
    });
  }
}

export const db = new NousGalleryDB();

// Helper functions
export const getPhotosByFolder = (folderId: string) => {
  return db.photos.where("folderId").equals(folderId).toArray();
};

export const getUntaggedPhotos = () => {
  return db.photos.where("isTagged").equals(false as any).toArray();
};

export const getSmartAlbums = () => {
  return db.albums.where("isSmartAlbum").equals(true as any).toArray();
};

export const getUserAlbums = () => {
  return db.albums.where("isSmartAlbum").equals(false as any).toArray();
};

export const getPhotosByAlbum = (albumId: string) => {
  return db.albums.get(albumId).then((album) => {
    if (!album) return [];
    return db.photos.where("id").anyOf(album.photoIds).toArray();
  });
};

export const getPhotosByCategory = (category: Photo["category"]) => {
  return db.photos.where("category").equals(category).toArray();
};

export const searchPhotos = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return db.photos
    .filter((photo) => {
      const tagsString = (photo.tags || []).join(" ");
      const description = photo.description || "";
      const searchableText =
        `${photo.fileName} ${tagsString} ${description}`.toLowerCase();
      return searchableText.includes(lowerQuery);
    })
    .toArray();
};
