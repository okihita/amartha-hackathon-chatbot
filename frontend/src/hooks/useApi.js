import { useState, useEffect } from 'preact/hooks';

export function useApi(url) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(`Failed to fetch ${url}:`, err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, error, refetch: fetchData };
}

export function useMultiApi(urls) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const responses = await Promise.all(urls.map(url => fetch(url)));
      const results = await Promise.all(responses.map(res => res.json()));
      setData(results);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, error, refetch: fetchData };
}
