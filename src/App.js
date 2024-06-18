import React, { useState, useRef } from 'react';
import axios from 'axios';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './App.css';

function App() {
  const [pdf, setPdf] = useState(null);
  const [watermark, setWatermark] = useState(null);
  const [ttf, setTtf] = useState(null);
  const containerRef = useRef(null);
  const [box, setBox] = useState({ width: 100, height: 100, x: 0, y: 0 });

  const handlePdfChange = (e) => setPdf(e.target.files[0]);
  const handleWatermarkChange = (e) => setWatermark(e.target.files[0]);
  const handleTtfChange = (e) => setTtf(e.target.files[0]);

  const handleBoxResize = (e, { size }) => setBox((box) => ({ ...box, ...size }));
  const handleBoxDrag = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    setBox((box) => ({
      ...box,
      x: e.clientX - rect.left - box.width / 2,
      y: e.clientY - rect.top - box.height / 2,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('pdf', pdf);
    formData.append('watermark', watermark);
    formData.append('ttf', ttf);
    formData.append('x', box.x);
    formData.append('y', box.y);
    formData.append('width', box.width);
    formData.append('height', box.height);

    try {
      const response = await axios.post('/api/watermark', formData, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `watermarked_${pdf.name}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="App">
      <h1>Upload PDF to Add Watermarks</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="application/pdf" onChange={handlePdfChange} required />
        <input type="file" accept="image/*" onChange={handleWatermarkChange} required />
        <input type="file" accept=".ttf" onChange={handleTtfChange} />
        <div
          ref={containerRef}
          onClick={handleBoxDrag}
          className="box-container"
          style={{ position: 'relative', border: '1px solid black', height: '400px', margin: '20px 0' }}
        >
          <ResizableBox
            width={box.width}
            height={box.height}
            onResize={handleBoxResize}
            className="box"
            resizeHandles={['se']}
            style={{
              position: 'absolute',
              left: box.x,
              top: box.y,
              border: '2px solid blue',
              cursor: 'move',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default App;
