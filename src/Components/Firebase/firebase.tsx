import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../config/firebase";

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    const fileRef = ref(storage, `Opn_thestruct/${file.name}`);

    try {
      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(fileRef, file);
      console.log("File uploaded successfully:", snapshot);

      // Get the download URL of the uploaded file
      const url = await getDownloadURL(snapshot.ref);
      setDownloadUrl(url);
    } catch (error) {
      setError("Error uploading file: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Upload File to Firebase Storage</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {downloadUrl && (
        <div>
          <p>File uploaded successfully!</p>
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            View File
          </a>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FileUpload;
