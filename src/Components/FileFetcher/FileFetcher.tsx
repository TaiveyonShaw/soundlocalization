import { useState, useEffect } from "react";

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
}

const osfToken = import.meta.env.VITE_OSF_ACCESS_TOKEN;

const FileFetcher = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFileData = async () => {
    try {
      const endpoint = "nodes/xnr9f/files/osfstorage/";
      const response = await fetch(`https://api.osf.io/v2/${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${osfToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      const fileDataPromises = data.data.map(async (file: Folder) => {
        const fileName = file.attributes.name;
        console.log(fileName);
        const fileUrl = file.relationships.files.links.related.href;
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

        const fileDetail = await fileDetailResponse.json();
        return {
          fileDetail,
        };
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching file data: {error}</div>;

  console.log(files[0].fileDetail.data[0].id);
  return (
    <div>
      <h1>File Data</h1>
      {files.map((file) => (
        <li>{file.fileDetail.data[0].attributes.name}</li>
      ))}
    </div>
  );
};

export default FileFetcher;
