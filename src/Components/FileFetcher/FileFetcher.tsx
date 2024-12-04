import { useState, useEffect } from "react";
import { FileData, Folder, Pages } from "../../types/osf";
import { useFirebaseAuth } from "../../hooks/useFirebaseAuth";
import { processMatFile } from "./processMatFile.js";

const osfToken = import.meta.env.VITE_OSF_ACCESS_TOKEN;

const FileFetcher = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const { user, error: authError } = useFirebaseAuth();

  const fetchFileData = async () => {
    try {
      const response = await fetch(
        "https://api.osf.io/v2/nodes/xnr9f/files/osfstorage/",
        {
          headers: {
            Authorization: `Bearer ${osfToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const fileDataPromises = data.data.map(async (file: Folder) => {
        const fileArray: string[] = [];
        let fileUrl = file.relationships.files.links.related.href;

        while (fileUrl) {
          const fileDetail: Pages = await fetchFileDetails(fileUrl);
          fileUrl = fileDetail.links.next;
          fileDetail.data.forEach(id => fileArray.push(id.attributes.name));
        }
        
        return { id: fileArray };
      });

      const allFileDetails = await Promise.all(fileDataPromises);
      setFiles(allFileDetails);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileDetails = async (url: string): Promise<Pages> => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${osfToken}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(
        `Error fetching file details: ${response.status} - ${response.statusText}`
      );
    }
    
    return response.json();
  };

  const handleDropdownChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedFile(selectedValue);
    console.log("Selected File:", selectedValue);
    
    try {
      const response = await fetch(
        `https://api.osf.io/v2/files/${selectedValue}/download/`,
        {
          headers: {
            Authorization: `Bearer ${osfToken}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const result = await processMatFile(arrayBuffer);
      console.log('Processed MAT file:', result);
    } catch (error) {
      console.error('Error processing file:', error);
      setError((error as Error).message);
    }
  };

  useEffect(() => {
    fetchFileData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error || authError) return <div>Error: {error || authError}</div>;

  return (
    <div>
      <h1>File Data</h1>
      <label htmlFor="fileDropdown">Choose a file:</label>
      <select
        id="fileDropdown"
        value={selectedFile || ""}
        onChange={handleDropdownChange}
      >
        <option value="" disabled>
          Select a file
        </option>
        {files.flatMap((fileData, fileIndex) =>
          fileData.id.map((fileName, index) => (
            <option key={`${fileIndex}-${index}`} value={fileName}>
              {fileName}
            </option>
          ))
        )}
      </select>
      {selectedFile && <p>You selected: {selectedFile}</p>}
    </div>
  );
};

export default FileFetcher;
