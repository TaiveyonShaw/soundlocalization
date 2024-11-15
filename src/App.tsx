import { useState, useEffect } from "react";

interface OSFData {
  id: string;

  name: string;
}

const OSFDataFetcher = () => {
  const [data, setData] = useState<OSFData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const osfToken = import.meta.env.VITE_ACCESS_TOKEN;

  const fetchOSFData = async () => {
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

      setData(data);
    } catch (error) {
      // Type assertion to ensure error is a string

      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOSFData();
  });

  if (loading) return <div>Loading...</div>;

  if (error) return <div>Error fetching OSF data: {error}</div>;

  return (
    <div>
      <h1>OSF Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>{" "}
    </div>
  );
};

export default OSFDataFetcher;
