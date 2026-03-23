import { useFolderPicker } from "../hooks/useFolderPicker";

export const Onboarding = () => {
  const { pickFolder, isImporting, importProgress, errorMessage } =
    useFolderPicker();

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <div className="onboarding-logo">🖼️</div>

        <div className="onboarding-hero">
          <h1>NousGallery</h1>
          <p>The first AI photo organizer that never leaves your device.</p>
        </div>

        <div className="onboarding-features">
          <div className="onboarding-feature">
            <span className="feature-icon">🛡️</span>
            <div className="feature-text">
              <strong>100% Private</strong>
              <p>
                Your photos stay on your computer. AI analysis runs locally in
                your browser.
              </p>
            </div>
          </div>
          <div className="onboarding-feature">
            <span className="feature-icon">🔍</span>
            <div className="feature-text">
              <strong>Smart Search</strong>
              <p>
                Find photos by what's in them — like "sunset" or "passport" —
                automatically.
              </p>
            </div>
          </div>
          <div className="onboarding-feature">
            <span className="feature-icon">☁️</span>
            <div className="feature-text">
              <strong>No Cloud Needed</strong>
              <p>Works offline with zero server costs or privacy leaks.</p>
            </div>
          </div>
        </div>

        <div className="onboarding-actions">
          {isImporting ? (
            <div className="import-progress-container">
              <div className="import-progress-text">
                <span>Importing your library...</span>
                <span>{Math.round(importProgress)}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <button className="btn btn-primary btn-lg" onClick={pickFolder}>
                Select Photos Folder
              </button>
              {errorMessage && <p className="error-text">{errorMessage}</p>}
              <p className="text-muted">
                Select a folder containing your images to begin.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
