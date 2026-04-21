import React, { useRef, useEffect, useState } from 'react';
import { Pencil, Eraser, Undo, Redo, Trash2, Download } from 'lucide-react';

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(5);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctxRef.current = ctx;
    
    saveState();
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = getCoordinates(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    
    if (tool === 'eraser') {
      ctxRef.current.strokeStyle = '#ffffff';
    } else {
      ctxRef.current.strokeStyle = color;
    }
    
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveState();
  };

  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      offsetX: (clientX - rect.left) * scaleX,
      offsetY: (clientY - rect.top) * scaleY
    };
  };

  const clearCanvas = () => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveState();
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const img = new Image();
      img.onload = () => {
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctxRef.current.drawImage(img, 0, 0);
      };
      img.src = history[newIndex];
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const img = new Image();
      img.onload = () => {
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctxRef.current.drawImage(img, 0, 0);
      };
      img.src = history[newIndex];
    }
  };

  const download = () => {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 p-4 flex gap-4 flex-wrap">
        <ToolButton icon={Pencil} active={tool === 'pencil'} onClick={() => setTool('pencil')} />
        <ToolButton icon={Eraser} active={tool === 'eraser'} onClick={() => setTool('eraser')} />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer"
        />
        <input
          type="range"
          min="1"
          max="20"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-32"
        />
        <ToolButton icon={Undo} onClick={undo} />
        <ToolButton icon={Redo} onClick={redo} />
        <ToolButton icon={Trash2} onClick={clearCanvas} />
        <ToolButton icon={Download} onClick={download} />
      </div>
      
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="flex-1 bg-white cursor-crosshair"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

const ToolButton = ({ icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded transition ${active ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
  >
    <Icon className="w-5 h-5" />
  </button>
);

export default Whiteboard;