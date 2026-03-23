import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { initSDK, getAccelerationMode } from "./runanywhere";
import { db } from "./db";
import { Onboarding } from "./components/Onboarding";
import { Gallery } from "./components/Gallery";

export function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);

  // Check if a folder has already been linked
  const folderExists = useLiveQuery(async () => {
    const folder = await db.folders.toCollection().first();
    return !!folder;
  }, []);

  useEffect(() => {
    initSDK()
      .then(() => setSdkReady(true))
      .catch((err) =>
        setSdkError(err instanceof Error ? err.message : String(err)),
      );
  }, []);

  if (sdkError) {
    return (
      <div className="app-loading">
        <h2>SDK Error</h2>
        <p className="error-text">{sdkError}</p>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <h2>Initializing NousGallery...</h2>
        <p>Setting up local AI components</p>
      </div>
    );
  }

  const accel = getAccelerationMode();

  return (
    <div className="app">
      <header className="app-header">
        <h1>NousGallery</h1>
        {accel && (
          <span className="badge">
            {accel === "webgpu" ? "Local GPU" : "Local CPU"}
          </span>
        )}
      </header>

      <main className="tab-content">
        {folderExists === false && <Onboarding />}
        {folderExists === true && (
          <Gallery
            onPhotoClick={(photo) => console.log("Photo clicked:", photo)}
          />
        )}
      </main>
    </div>
  );
}
