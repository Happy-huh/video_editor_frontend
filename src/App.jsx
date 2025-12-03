import React, { useState, useEffect, useRef } from 'react';
import { EditorProvider } from './store/EditorContext';
import { EditorCanvas } from './components/canvas/EditorCanvas';
import { Timeline } from './components/timeline/Timeline';
import { Sidebar } from './components/panels/Sidebar';
import { ExportModal } from './components/export/ExportModal';
import { AudioController } from './components/audio/AudioController';
import { Download } from 'lucide-react';
import './index.css';
import './App.css';

function AppContent() {
  const [timelineHeight, setTimelineHeight] = useState(300);
  const isResizing = useRef(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      const newHeight = window.innerHeight - e.clientY;
      setTimelineHeight(Math.max(150, Math.min(newHeight, window.innerHeight - 100)));
    };
    const handleMouseUp = () => isResizing.current = false;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, []);

  return (
    <div className="app-container" style={{display:'flex', width:'100vw', height:'100vh', overflow:'hidden', background:'#101010', color:'white'}}>
      <Sidebar />
      <div className="workspace" style={{flex:1, display:'flex', flexDirection:'column', height:'100%'}}>
        <div className="header" style={{height:60, borderBottom:'1px solid #333', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px'}}>
            <div style={{fontWeight:'bold'}}>Onera<span style={{color:'#7d55ff'}}>AI</span> Editor</div>
            <button onClick={() => setShowExport(true)} style={{background:'white', color:'black', padding:'8px 16px', borderRadius:6, border:'none', fontWeight:'bold', cursor:'pointer', display:'flex', gap:8, alignItems:'center'}}>
                <Download size={16}/> Export
            </button>
        </div>

        <div style={{flex:1, overflow:'hidden', position:'relative'}}>
             <EditorCanvas />
             <AudioController />
        </div>
        
        <div className="resizer-y"
             onMouseDown={(e) => { e.preventDefault(); isResizing.current = true; }}
             style={{height:6, background:'#222', cursor:'row-resize', width:'100%', zIndex:50}}
        ></div>

        <Timeline height={timelineHeight} />
      </div>
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
    </div>
  );
}

export default function App() {
  return (
    <EditorProvider>
      <AppContent />
    </EditorProvider>
  );
}
