import { useState, useCallback } from "react";
import { db } from "../db";

interface UseFolderPickerReturn {
  folderName: string | null;
  isImporting: boolean;
  importProgress: number;
  errorMessage: string | null;
  pickFolder: () => Promise<void>;
  reconnectToFolder: () => Promise<void>;
  importImages: (
    folderHandle: FileSystemDirectoryHandle,
    folderName: string,
  ) => Promise<void>;
}

export const useFolderPicker = (): UseFolderPickerReturn => {
  const [folderName, setFolderName] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateProgress = useCallback((progress: number) => {
    setImportProgress(progress);
  }, []);

  const importImages = useCallback(
    async (folderHandle: FileSystemDirectoryHandle, name: string) => {
      setIsImporting(true);
      setErrorMessage(null);
      setImportProgress(0);

      try {
        // Store folder handle
        const folderId = crypto.randomUUID();
        await db.folders.add({
          id: folderId,
          name,
          handle: folderHandle,
          lastSyncedAt: new Date(),
        });

        // Find all image files recursively
        const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
        const imageFiles: FileSystemFileHandle[] = [];

        async function scanDirectory(dirHandle: FileSystemDirectoryHandle) {
          for await (const entry of dirHandle.values()) {
            if (entry.kind === "directory") {
              await scanDirectory(entry as FileSystemDirectoryHandle);
            } else if (entry.kind === "file") {
              const fileName = entry.name.toLowerCase();
              if (imageExtensions.some((ext) => fileName.endsWith(`.${ext}`))) {
                imageFiles.push(entry as FileSystemFileHandle);
              }
            }
          }
        }

        await scanDirectory(folderHandle);

        if (imageFiles.length === 0) {
          setErrorMessage("No image files found in the selected folder.");
          setIsImporting(false);
          return;
        }

        // Import images with progress tracking
        let importedCount = 0;
        const totalImages = imageFiles.length;

        for (const fileHandle of imageFiles) {
          try {
            const file = await fileHandle.getFile();
            const imageBitmap = await createImageBitmap(file);

            // Convert blob to ImageBitmap to get dimensions
            const blob = new Blob([await file.arrayBuffer()], {
              type: file.type,
            });

            // Store in database
            const photoId = crypto.randomUUID();
            await db.photos.add({
              id: photoId,
              fileName: file.name,
              blob,
              width: imageBitmap.width,
              height: imageBitmap.height,
              importedAt: new Date(),
              folderId,
              tags: [],
              category: "other",
              description: "",
              isTagged: false,
            });

            importedCount++;
            updateProgress((importedCount / totalImages) * 100);

            // Clean up
            imageBitmap.close();
          } catch (error) {
            console.error(`Error importing ${fileHandle.name}:`, error);
            // Continue with next file
          }
        }

        setFolderName(name);
        setIsImporting(false);
        updateProgress(100);
      } catch (error) {
        setErrorMessage("Failed to import images. Please try again.");
        console.error("Error importing images:", error);
        setIsImporting(false);
      }
    },
    [updateProgress],
  );

  const pickFolder = useCallback(async () => {
    try {
      // Check if we already have a folder
      const existingFolder = await db.folders.limit(1).first();
      if (existingFolder) {
        setFolderName(existingFolder.name);
        return;
      }

      // Try to pick a folder
      const folderHandle = await window.showDirectoryPicker();
      setFolderName(folderHandle.name);
      await importImages(folderHandle, folderHandle.name);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setErrorMessage("Failed to pick folder. Please try again.");
        console.error("Error picking folder:", error);
      }
    }
  }, [importImages]);

  const reconnectToFolder = useCallback(async () => {
    try {
      const existingFolder = await db.folders.limit(1).first();
      if (existingFolder) {
        // Request permission to access the folder
        await existingFolder.handle.requestPermission({ mode: "read" });
        setFolderName(existingFolder.name);
      }
    } catch (error) {
      setErrorMessage(
        "Failed to reconnect to folder. Please pick a new folder.",
      );
      console.error("Error reconnecting to folder:", error);
    }
  }, []);

  return {
    folderName,
    isImporting,
    importProgress,
    errorMessage,
    pickFolder,
    reconnectToFolder,
    importImages,
  };
};
