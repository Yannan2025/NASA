import React, { useEffect, useState } from 'react';
import './App.css';

interface ApodItem {
  date: string;
  title: string;
  url: string;
  media_type: string;
}

const NASA_API_KEY = 'DEMO_KEY'; // Replace with your NASA API key

function getDateNDaysAgo(n: number) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split('T')[0];
}

export default function App() {
  const [items, setItems] = useState<ApodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(getDateNDaysAgo(8));
  const [endDate, setEndDate] = useState(getDateNDaysAgo(0));
  const [error, setError] = useState('');

  async function fetchApodsCustom(s: string, e: string) {
    setLoading(true);
    setError('');
    try {
      const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&start_date=${s}&end_date=${e}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      } else if (data.code && data.msg) {
        setError(data.msg);
        setItems([]);
      } else {
        setItems([]);
      }
    } catch (err: any) {
      setError('Failed to fetch data.');
      setItems([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchApodsCustom(startDate, endDate);
    // eslint-disable-next-line
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Validate range (max 9 days)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) {
      setError('End date must be after start date.');
      return;
    }
    if (diff > 8) {
      setError('Please select a range of 9 days or fewer.');
      return;
    }
    fetchApodsCustom(startDate, endDate);
  }

  return (
    <div className="nasa-app">
      <header>
        <h1>NASA Space Explorer</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </label>
          <button type="submit">Get Space Images</button>
        </form>
      </header>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading">Loading NASA images...</div>
      ) : (
        <div className="gallery">
          {items
            .filter(item => item.media_type === 'image')
            .slice(0, 9)
            .map(item => (
              <div className="gallery-item" key={item.date}>
                <img src={item.url} alt={item.title} />
                <div className="gallery-info">
                  <h3>{item.title}</h3>
                  <p>{item.date}</p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}