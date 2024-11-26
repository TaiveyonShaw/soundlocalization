import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

const osfToken = import.meta.env.VITE_OSF_ACCESS_TOKEN;
const userPassword = import.meta.env.VITE_FIREBASE_USER_PASSWORD;

interface FileData {
  id: string;
  fileDetail: {
    data: {
      id: string;
      attributes: {
        name: string;
      };
    }[];
  };
}

interface Folder {
  relationships: {
    files: {
      links: {
        related: {
          href: string;
        };
      };
    };
  };
  attributes: {
    name: string;
  };
  links: {
    download: string;
  };
}

interface Pages {
  data: {
    id: string;
    attributes: {
      name: string;
    };
  }[];
  links: {
    self: string;
    first: string;
    last: string;
    prev: string;
    next: string;
  };
}

// Log in with email and password
const email = "taiveyonshaw@gmail.com";
const password = userPassword;
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in successfully, you can access userCredential
    console.log("User logged in:", userCredential.user);
  })
  .catch((error) => {
    console.error("Error logging in:", error);
  });

const FileFetcher = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null); // State for the selected file

  const fetchFileData = async () => {
    try {
      const response = await fetch(
        `https://api.osf.io/v2/nodes/xnr9f/files/osfstorage/`,
        {
          method: "GET",
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
        let fileUrl = file.relationships.files.links.related.href;
        const fileArray: string[] = [];

        while (fileUrl != null) {
          const fileDetailResponse = await fetch(fileUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${osfToken}`,
              "Content-Type": "application/json",
            },
          });
          if (!fileDetailResponse.ok) {
            throw new Error(
              `Error fetching file details: ${fileDetailResponse.status} - ${fileDetailResponse.statusText}`
            );
          }
          const fileDetail: Pages = await fileDetailResponse.json();
          fileUrl = fileDetail.links.next;
          fileDetail.data.map((id) => {
            fileArray.push(id.attributes.name);
          });
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

  useEffect(() => {
    fetchFileData();
  }, []);

  // Handle selection change
  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedFile(event.target.value); // Store the selected file
    console.log("Selected File:", event.target.value);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching file data: {error}</div>;

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
        {/* Populate the dropdown with file names */}
        {files.flatMap((fileData) =>
          fileData.id.map((fileName, index) => (
            <option key={index} value={fileName}>
              {fileName}
            </option>
          ))
        )}
      </select>
      <div>
        {/* Display the selected file */}
        {selectedFile && <p>You selected: {selectedFile}</p>}
      </div>
    </div>
  );
};

export default FileFetcher;
