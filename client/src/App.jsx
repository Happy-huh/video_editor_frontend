import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Type, Video, Music, Scissors, 
  Wand2, Download, ChevronLeft, Layers, 
  Settings, Plus, Image as ImageIcon, Sparkles,
  MonitorPlay, Mic, Subtitles, Trash2, X,
  UploadCloud, Move, ChevronRight, AlignLeft,
  Youtube, Instagram, Facebook, Twitter, Heart, ThumbsUp, Bell,
  Sticker, Clock, QrCode, Film, Zap, Aperture, Triangle, Star, Hexagon,
  Ghost, Loader2, Lock, Unlock, Eye, EyeOff, Volume2, VolumeX, Magnet, Split,
  LayoutTemplate, Gamepad2, Tv, User, Check, MessageCircle, Share2, Battery,
  Smartphone, Monitor, Menu, Cpu, Terminal, FileVideo, AlertTriangle,
  ShoppingBag, Tag, Percent, ArrowRight
} from 'lucide-react';

// --- STYLES & ANIMATIONS ---
const styles = `
  :root {
    --bg-dark: #101010;
    --bg-panel: #181818;
    --bg-panel-light: #252525;
    --border: #333333;
    --accent: #7d55ff;
    --accent-hover: #6644d1;
    --text-main: #ffffff;
    --text-muted: #a0a0a0;
    --timeline-bg: #0f0f0f;
    --playhead: #ff4d4d;
    
    /* CLAYMORPHISM VARS */
    --clay-shadow: 
      6px 6px 12px rgba(0, 0, 0, 0.4), 
      -4px -4px 10px rgba(255, 255, 255, 0.1), 
      inset 2px 2px 5px rgba(255, 255, 255, 0.3), 
      inset -2px -2px 5px rgba(0, 0, 0, 0.2);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  
  body { background: var(--bg-dark); color: var(--text-main); height: 100vh; overflow: hidden; }
  input, select, button { font-family: inherit; }

  .app-container { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

  /* SIDEBAR */
  .sidebar { width: 70px; background: var(--bg-panel); border-right: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; padding-top: 16px; z-index: 20; }
  .nav-item { width: 50px; height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: 0.2s; font-size: 10px; gap: 4px; color: var(--text-muted); }
  .nav-item:hover { background: var(--bg-panel-light); color: var(--text-main); }
  .nav-item.active { background: rgba(125, 85, 255, 0.1); color: var(--accent); }

  /* DRAWER */
  .drawer { width: 340px; background: var(--bg-panel); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 20px; overflow-y: auto; position: relative; z-index: 10; transition: transform 0.3s ease; }
  .tool-group { margin-bottom: 30px; }
  .tool-group h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #eee; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #333; padding-bottom: 8px; }
  
  .tool-btn { width: 100%; padding: 12px; background: var(--bg-panel-light); border: 1px solid var(--border); border-radius: 8px; color: white; text-align: left; margin-bottom: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
  .tool-btn:hover { border-color: var(--accent); background: #2a2a2a; }

  /* CLAY PREVIEW CARDS */
  .clay-preview-btn {
    width: 100%; padding: 15px; margin-bottom: 10px;
    background: linear-gradient(145deg, #2a2a2a, #222);
    border: none; border-radius: 16px;
    box-shadow: 5px 5px 10px #151515, -5px -5px 10px #353535;
    color: white; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; gap: 12px; transition: transform 0.1s;
  }
  .clay-preview-btn:active { box-shadow: inset 5px 5px 10px #151515, inset -5px -5px 10px #353535; transform: scale(0.98); }
  .clay-icon-box { width: 32px; height: 32px; background: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: inset 1px 1px 3px rgba(255,255,255,0.3); }

  .asset-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .asset-card { background: #222; border-radius: 8px; overflow: hidden; cursor: pointer; border: 1px solid transparent; position: relative; aspect-ratio: 16/9; }
  .asset-card:hover { border-color: var(--accent); }
  .asset-card img, .asset-card video { width: 100%; height: 100%; object-fit: cover; }
  .asset-label { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; font-size: 10px; padding: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .prop-row { display: flex; gap: 10px; margin-bottom: 12px; align-items: center; }
  .prop-input { flex: 1; background: #111; border: 1px solid var(--border); color: white; padding: 8px; border-radius: 4px; font-size: 12px; }
  
  /* ANIMATIONS */
  @keyframes slideInLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes lowerThirdBar { 0% { width: 0; } 100% { width: 100%; } }
  @keyframes textReveal { 0% { clip-path: inset(0 100% 0 0); } 100% { clip-path: inset(0 0 0 0); } }
  @keyframes health-drain { 0% { width: 100%; } 50% { width: 60%; } 100% { width: 30%; } }

  /* MOTION CLASSES */
  .motion-enter-slide-left { animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .motion-lower-third-bar { animation: lowerThirdBar 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .motion-text-reveal { animation: textReveal 0.8s 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; clip-path: inset(0 100% 0 0); }
  .motion-health-anim { animation: health-drain 5s linear infinite alternate; }

  /* WORKSPACE & CANVAS */
  .workspace { flex: 1; display: flex; flex-direction: column; position: relative; height: 100%; }
  .header { height: 60px; background: var(--bg-dark); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; }
  .export-btn { background: var(--text-main); color: black; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
  .canvas-area { flex: 1; background: #000; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .media-element { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
  
  /* OVERLAYS */
  .overlay-vhs { background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 2px, 3px 100%; pointer-events: none; mix-blend-mode: overlay; }
  
  /* RESIZE HANDLES */
  .resize-handle { width: 14px; height: 14px; background: #fff; border: 2px solid var(--accent); position: absolute; border-radius: 50%; z-index: 50; box-shadow: 0 2px 4px rgba(0,0,0,0.5); }
  .resize-handle:hover { transform: scale(1.3); background: var(--accent); }
  .resize-sw { bottom: -7px; left: -7px; cursor: sw-resize; }
  .resize-se { bottom: -7px; right: -7px; cursor: se-resize; }
  .resize-nw { top: -7px; left: -7px; cursor: nw-resize; }
  .resize-ne { top: -7px; right: -7px; cursor: ne-resize; }
  
  .selected-layer-border { box-shadow: 0 0 0 2px var(--accent); }

  /* TIMELINE */
  .timeline-container { background: var(--timeline-bg); display: flex; flex-direction: column; }
  .timeline-toolbar { height: 40px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 16px; background: #151515; border-top: 1px solid var(--border); }
  .resizer-y { height: 8px; background: #1a1a1a; cursor: row-resize; width: 100%; border-top: 1px solid var(--border); transition: background 0.2s; z-index: 100; display: flex; justify-content: center; align-items: center; }
  .resizer-y:hover { background: var(--accent); }
  .resizer-handle-icon { width: 40px; height: 4px; background: #444; border-radius: 2px; }
  .resizer-y:hover .resizer-handle-icon { background: white; }

  .track-header { width: 160px; border-right: 1px solid var(--border); background: #151515; display: flex; flex-direction: column; padding: 8px; justify-content: center; position: sticky; left: 0; z-index: 20; }
  .track-controls { display: flex; gap: 6px; margin-top: 4px; }
  .track-btn { background: transparent; border: none; color: #666; cursor: pointer; padding: 2px; transition: color 0.2s; }
  .track-btn:hover, .track-btn.active { color: var(--text-main); }
  .track-btn.magnet-active { color: var(--accent); text-shadow: 0 0 8px rgba(125, 85, 255, 0.4); }
  .active-accent { color: var(--accent); text-shadow: 0 0 8px rgba(125, 85, 255, 0.4); }
  .track-btn.magnet-inactive { color: #555; }
  
  .clip-item { cursor: grab; position: absolute; height: 100%; border-radius: 4px; display: flex; align-items: center; padding: 0 8px; font-size: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
  .clip-item.selected { border-color: var(--accent); z-index: 10; }
  .clip-handle { width: 10px; height: 100%; position: absolute; top: 0; cursor: col-resize; background: transparent; z-index: 20; }
  .clip-handle:hover { background: rgba(255,255,255,0.3); }
  .clip-handle.left { left: 0; }
  .clip-handle.right { right: 0; }
  
  .btn-primary { background: var(--accent); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(125, 85, 255, 0.3); }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  .modal-content { background: var(--bg-panel); width: 500px; padding: 0; border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; }
  .modal-header { padding: 16px 24px; font-size: 18px; font-weight: bold; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #1a1a1a; }
  .modal-body { padding: 24px; }
`;

// --- UTILS & HELPERS ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const getClayStyle = (bg = '#333', color = '#fff', radius = '16px') => ({
    background: bg, color: color, borderRadius: radius,
    boxShadow: 'var(--clay-shadow)',
    borderTop: '1px solid rgba(255,255,255,0.2)', borderLeft: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(5px)',
});

// --- CONTEXT ---
const EditorContext = createContext();

const EditorProvider = ({ children }) => {
  const [projectStatus, setProjectStatus] = useState('idle');
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [canvasSettings, setCanvasSettings] = useState({ width: 1920, height: 1080, bgColor: '#000000' });
  const [trackSettings, setTrackSettings] = useState({
    media: { height: 80, locked: false, muted: false, solo: false },
    audio: { height: 40, locked: false, muted: false, solo: false },
    text: { height: 40, locked: false, muted: false, solo: false },
    subtitle: { height: 40, locked: false, muted: false, solo: false },
  });
  const [magnetic, setMagnetic] = useState(true);
  const [ripple, setRipple] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null); 
  
  const animationRef = useRef(null);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    const updateLoop = () => {
      if (isPlaying) {
        const now = Date.now();
        const dt = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;
        setCurrentTime(t => { if (t >= duration) { setIsPlaying(false); return duration; } return t + dt; });
        animationRef.current = requestAnimationFrame(updateLoop);
      }
    };
    if (isPlaying) { lastTimeRef.current = Date.now(); animationRef.current = requestAnimationFrame(updateLoop); }
    else { cancelAnimationFrame(animationRef.current); }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, duration]);

  const handleUpload = async (file, typeOverride = null) => {
    const url = URL.createObjectURL(file);
    const type = typeOverride || (file.type.startsWith('image/') ? 'image' : 'video');
    const newAsset = { id: generateId(), src: url, type, name: file.name };
    setMediaAssets(prev => [newAsset, ...prev]);
    if (typeOverride === 'element-image') {
        addLayer('element', 'Image', { subtype: 'image', src: url, style: { width: '200px', height: '200px', left: '50%', top: '50%' } });
    } else { setVideoUrl(url); addToTimeline(newAsset); }
  };

  const addToTimeline = (asset) => {
    const mediaLayers = layers.filter(l => l.type === 'media');
    const startTime = magnetic ? (mediaLayers.length > 0 ? Math.max(...mediaLayers.map(l => l.end)) : 0) : currentTime;
    const newLayer = { id: generateId(), type: 'media', subtype: asset.type, src: asset.src, content: asset.name, start: startTime, end: startTime + 5, trimStart: 0, style: { width: '100%', height: '100%', objectFit: 'contain' } };
    setLayers(prev => [...prev, newLayer]);
    if (newLayer.end > duration) setDuration(newLayer.end);
  };

  const addLayer = (type, content, extra = {}) => {
    const newLayer = {
      id: generateId(), type, content, start: currentTime,
      end: currentTime + 5 > duration ? duration + 5 : currentTime + 5,
      trimStart: 0,
      style: { left: '50%', top: '50%', fontSize: 24, color: '#ffffff', fontFamily: 'Arial', padding: '0px' },
      ...extra
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    if (newLayer.end > duration) setDuration(newLayer.end);
  };

  const updateLayer = (id, updates) => {
    setLayers(prev => {
      const updatedLayers = prev.map(l => l.id === id ? { ...l, ...updates } : l);
      const maxEnd = Math.max(...updatedLayers.map(l => l.end), 0);
      if (maxEnd !== duration) setDuration(maxEnd);
      return updatedLayers;
    });
  };

  const deleteLayer = (id) => {
    const layer = layers.find(l => l.id === id); if (!layer) return;
    const layerDur = layer.end - layer.start;
    let newLayers = layers.filter(l => l.id !== id);
    if (ripple) newLayers = newLayers.map(l => (l.type === layer.type && l.start >= layer.end) ? { ...l, start: l.start - layerDur, end: l.end - layerDur } : l);
    setLayers(newLayers); setSelectedLayerId(null);
  };

  const splitLayer = () => {
    if (!selectedLayerId) return;
    const layer = layers.find(l => l.id === selectedLayerId);
    if (!layer) return;
    if (currentTime <= layer.start || currentTime >= layer.end) return;
    const splitPoint = currentTime;
    const firstHalfDuration = splitPoint - layer.start;
    const updatedFirst = { ...layer, end: splitPoint };
    const newTrimStart = (layer.trimStart || 0) + firstHalfDuration;
    const secondHalf = { ...layer, id: generateId(), start: splitPoint, end: layer.end, trimStart: newTrimStart };
    setLayers(prev => prev.map(l => l.id === layer.id ? updatedFirst : l).concat(secondHalf));
    setSelectedLayerId(secondHalf.id);
  };

  const toggleTrackLock = (type) => setTrackSettings(p => ({...p, [type]: { ...p[type], locked: !p[type].locked }}));
  const toggleTrackMute = (type) => setTrackSettings(p => ({...p, [type]: { ...p[type], muted: !p[type].muted }}));
  const toggleTrackSolo = (type) => setTrackSettings(p => ({...p, [type]: { ...p[type], solo: !p[type].solo }}));
  const setTrackHeight = (type, h) => setTrackSettings(p => ({...p, [type]: { ...p[type], height: h }}));
  const updateCanvasSettings = (s) => setCanvasSettings(p => ({ ...p, ...s }));
  const updateClipDuration = (id, actualDuration) => { setLayers(prev => { const layer = prev.find(l => l.id === id); if (layer && layer.subtype === 'video' && layer.end - layer.start === 5) { const newEnd = layer.start + actualDuration; setDuration(d => Math.max(d, newEnd)); return prev.map(l => l.id === id ? { ...l, end: newEnd } : l); } return prev; }); };

  return (
    <EditorContext.Provider value={{
      projectStatus, layers, setLayers, selectedLayerId, setSelectedLayerId, mediaAssets,
      addLayer, updateLayer, deleteLayer, addToTimeline, splitLayer, trackSettings, toggleTrackLock, 
      toggleTrackMute, toggleTrackSolo, setTrackHeight, magnetic, setMagnetic, ripple, setRipple,
      currentTime, setCurrentTime, isPlaying, setIsPlaying, duration, setDuration, handleUpload,
      canvasSettings, updateCanvasSettings, videoUrl, updateClipDuration
    }}>
      {children}
    </EditorContext.Provider>
  );
};

const useEditor = () => useContext(EditorContext);

// --- COMPONENTS ---

const ExportModal = ({ isOpen, onClose }) => {
  const { layers } = useEditor();
  const [status, setStatus] = useState('idle'); // idle, queued, pending, completed, failed
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setStatus('idle');
      setJobId(null);
      setResult(null);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval;
    if (jobId && (status === 'queued' || status === 'pending')) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/jobs/${jobId}`);
          const data = await res.json();

          if (data.status === 'completed') {
            setStatus('completed');
            setResult(data.result);
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setStatus('failed');
            setError(data.error);
            clearInterval(interval);
          } else {
            setStatus('pending');
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, status]);

  const startExport = async () => {
    try {
      setStatus('queued');
      setError(null);
      const res = await fetch('http://localhost:3000/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layers }),
      });
      const data = await res.json();
      if (data.jobId) {
        setJobId(data.jobId);
      } else {
        setStatus('failed');
        setError('Failed to start job');
      }
    } catch (err) {
      setStatus('failed');
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span>Export Video</span>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="modal-body">
          {status === 'idle' && (
            <div style={{textAlign:'center', padding:20}}>
              <p style={{marginBottom: 20, color: '#ccc'}}>Ready to render your masterpiece?</p>
              <button className="btn-primary" onClick={startExport} style={{width:'100%', justifyContent:'center'}}>
                Start Rendering
              </button>
            </div>
          )}

          {(status === 'queued' || status === 'pending') && (
            <div style={{textAlign:'center', padding:40, display:'flex', flexDirection:'column', alignItems:'center', gap:15}}>
              <Loader2 className="animate-spin" size={48} color="var(--accent)"/>
              <div>
                <div style={{fontWeight:'bold', fontSize:18}}>Rendering...</div>
                <div style={{color:'#888', fontSize:14}}>This may take a few moments</div>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div style={{textAlign:'center', padding:20}}>
              <div style={{width:60, height:60, background:'#22c55e', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
                <Check size={32} color="white"/>
              </div>
              <h3 style={{marginBottom:10}}>Render Complete!</h3>
              <p style={{marginBottom:20, color:'#aaa'}}>Your video is ready to download.</p>

              {result?.videoUrl && (
                <div style={{background:'#111', padding:10, borderRadius:8, marginBottom:20, wordBreak:'break-all', fontSize:12, fontFamily:'monospace', color:'#aaa'}}>
                  {result.videoUrl}
                </div>
              )}

              <button className="btn-primary" style={{background:'#22c55e'}} onClick={() => window.open(result?.videoUrl || '#', '_blank')}>
                <Download size={18}/> Download Video
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div style={{textAlign:'center', padding:20}}>
              <div style={{width:60, height:60, background:'#ef4444', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
                <X size={32} color="white"/>
              </div>
              <h3 style={{marginBottom:10, color:'#ef4444'}}>Render Failed</h3>
              <p style={{color:'#aaa', marginBottom:20}}>{error || 'An unexpected error occurred.'}</p>
              <button className="btn-primary" onClick={startExport} style={{background:'#333'}}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const GenModal = ({ isOpen, onClose }) => (!isOpen ? null : <div className="modal-overlay"><div className="modal-content"><div style={{padding:40}}>AI Gen Logic... <button onClick={onClose}>Close</button></div></div></div>);

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [activeModal, setActiveModal] = useState(null);
  const { handleUpload, layers, selectedLayerId, updateLayer, addLayer, deleteLayer, mediaAssets, addToTimeline, canvasSettings, updateCanvasSettings } = useEditor();
  const selectedLayer = layers.find(l => l.id === selectedLayerId);
  const handleTabClick = (id) => setActiveTab(activeTab === id ? null : id);

  const renderTemplates = () => (
    <div>
      {/* RESTORED CLASSIC TEMPLATES */}
      <div className="tool-group">
        <h3>Classic Motion</h3>
        <button className="tool-btn" title="Classic Clean News lower third" onClick={() => addLayer('element', 'Clean News', { subtype: 'motion-lower-third', style: { width: '400px', height: '100px', left: '50%', top: '50%' }, primaryText: 'Breaking News', secondaryText: 'Live from the Studio' })}><LayoutTemplate size={16}/> Clean News</button>
        <button className="tool-btn" title="Neon style lower third for gamers" onClick={() => addLayer('element', 'Neon Gamer', { subtype: 'motion-lower-third-neon', style: { width: '400px', height: '100px', left: '50%', top: '50%' }, primaryText: 'StreamerName', secondaryText: '@social_handle' })}><Gamepad2 size={16}/> Neon Gamer</button>
        <button className="tool-btn" title="Minimal corporate lower third" onClick={() => addLayer('element', 'Minimal Corp', { subtype: 'motion-lower-third-corp', style: { width: '400px', height: '80px', left: '50%', top: '50%' }, primaryText: 'John Doe', secondaryText: 'CEO & Founder' })}><User size={16}/> Minimal Corp</button>
        <button className="tool-btn" title="Animated tweet overlay" onClick={() => addLayer('element', 'Tweet', { subtype: 'motion-tweet', style: { width: '400px', height: '150px', left: '50%', top: '50%' }, primaryText: 'User Name', secondaryText: 'Just launched my new video! #viral' })}><Twitter size={16}/> Tweet Overlay</button>
        <button className="tool-btn" title="Animated health bar" onClick={() => addLayer('element', 'Health Bar', { subtype: 'motion-health-bar', style: { width: '400px', height: '40px', left: '50%', top: '50%' } })}><Battery size={16}/> Dynamic Health</button>
      </div>

      {/* NEW CLAY TEMPLATES (5 Categories) */}
      
      {/* Category 1: Social Promos */}
      <div className="tool-group">
        <h3>Social Promos</h3>
        <button className="clay-preview-btn" title="3D Clay Youtube Subscribe Pill" onClick={() => addLayer('element', 'Sub Pill', { subtype: 'clay-pill', icon: 'Youtube', text: 'Subscribe', color: '#ff0000', style: { ...getClayStyle('#ff2222', '#fff', '40px'), width: '250px', height: '70px', left: '50%', top: '50%' } })}>
          <div className="clay-icon-box" style={{background:'#d00'}}><Youtube size={16} color="white"/></div> Subscribe Pill
        </button>
        <button className="clay-preview-btn" title="3D Clay Instagram Handle" onClick={() => addLayer('element', 'Insta Bubble', { subtype: 'clay-bubble', icon: 'Instagram', text: '@MyChannel', color: '#E1306C', style: { ...getClayStyle('#E1306C', '#fff', '20px'), width: '220px', height: '60px', left: '50%', top: '50%' } })}>
          <div className="clay-icon-box" style={{background:'#C13584'}}><Instagram size={16} color="white"/></div> Insta Handle
        </button>
        <button className="clay-preview-btn" title="3D Clay Tweet Card" onClick={() => addLayer('element', 'Tweet Card', { subtype: 'clay-card', icon: 'Twitter', text: 'Just dropped a new video!', color: '#1DA1F2', style: { ...getClayStyle('#fff', '#333', '24px'), width: '400px', height: '150px', left: '50%', top: '50%' } })}>
          <div className="clay-icon-box" style={{background:'#1DA1F2'}}><Twitter size={16} color="white"/></div> Tweet Float
        </button>
      </div>

      {/* Category 2: Lower Thirds */}
      <div className="tool-group">
        <h3>Lower Thirds</h3>
        <button className="clay-preview-btn" title="3D Clay News Blob" onClick={() => addLayer('element', 'News Blob', { subtype: 'clay-blob', text: 'BREAKING NEWS', subtext: 'Live coverage', style: { ...getClayStyle('#0055ff', '#fff', '30px'), width: '500px', height: '100px', left: '50%', top: '50%' } })}>
          <div className="clay-icon-box" style={{background:'#0044cc'}}><Tv size={16} color="white"/></div> News Blob
        </button>
        <button className="clay-preview-btn" title="3D Clay Name Tag" onClick={() => addLayer('element', 'Name Tag', { subtype: 'clay-pill-split', text: 'JOHN DOE', subtext: 'CEO & Founder', style: { ...getClayStyle('#222', '#fff', '50px'), width: '350px', height: '80px', left: '50%', top: '50%' } })}>
          <div className="clay-icon-box"><User size={16} color="white"/></div> Minimal Tag
        </button>
      </div>

      {/* Category 3: Gaming HUD */}
      <div className="tool-group">
        <h3>Gaming HUD</h3>
        <button className="clay-preview-btn" title="3D Clay Health Bar" onClick={() => addLayer('element', 'Health Bar', { subtype: 'clay-bar', val: 75, color: '#00ff00', style: { ...getClayStyle('#333', '#fff', '10px'), width: '300px', height: '40px', left: '50%', top: '50%' } })}>
          <div className="clay-icon-box" style={{background:'#00aa00'}}><Battery size={16} color="white"/></div> Puffy Health
        </button>
        <button className="clay-preview-btn" title="3D Clay Score Bubble" onClick={() => addLayer('element', 'Score Bubble', { subtype: 'clay-circle-text', text: '1,240', style: { ...getClayStyle('#ffaa00', '#fff', '50%'), width: '100px', height: '100px', left: '50%', top: '50%' } })}>
          <div className="clay-icon-box" style={{background:'#cc8800'}}><Star size={16} color="white"/></div> Score Pop
        </button>
        <button className="clay-preview-btn" title="3D Clay Facecam Border" onClick={() => addLayer('element', 'Cam Border', { subtype: 'clay-frame', style: { ...getClayStyle('transparent', '#fff', '30px'), border: '8px solid #7d55ff', width: '300px', height: '200px', left: '50%', top: '50%' } })}>
          <div className="clay-icon-box"><Video size={16} color="white"/></div> Cam Border
        </button>
      </div>

      {/* Category 4: Notifications */}
      <div className="tool-group">
        <h3>Notifications</h3>
        <button className="clay-preview-btn" title="3D Clay Success Toast" onClick={() => addLayer('element', 'Success Toast', { subtype: 'clay-toast', icon: 'Check', text: 'Download Complete', color: '#4ade80', style: { ...getClayStyle('#4ade80', '#004400', '20px'), width: '300px', height: '60px', left: '50%', top: '50%' } })}>
          <div className="clay-icon-box" style={{background:'#22c55e'}}><Check size={16} color="white"/></div> Success Pop
        </button>
        <button className="clay-preview-btn" title="3D Clay Message Bubble" onClick={() => addLayer('element', 'Message Pop', { subtype: 'clay-toast', icon: 'Message', text: 'New Comment', color: '#fff', style: { ...getClayStyle('#fff', '#333', '20px'), width: '300px', height: '70px', left: '50%', top: '50%' } })}>
          <div className="clay-icon-box" style={{background:'#ccc'}}><MessageCircle size={16} color="white"/></div> Msg Bubble
        </button>
      </div>

      {/* Category 5: Shopping */}
      <div className="tool-group">
        <h3>Shopping / Promo</h3>
        <button className="clay-preview-btn" title="3D Clay Sale Tag" onClick={() => addLayer('element', 'Sale Tag', { subtype: 'clay-tag', text: '50% OFF', style: { ...getClayStyle('#ff4d4d', '#fff', '10px'), width: '150px', height: '60px', left: '50%', top: '50%' } })}>
          <div className="clay-icon-box" style={{background:'#cc0000'}}><Percent size={16} color="white"/></div> Sale Tag
        </button>
        <button className="clay-preview-btn" title="3D Clay Buy Button" onClick={() => addLayer('element', 'Buy Button', { subtype: 'clay-button', text: 'SHOP NOW', style: { ...getClayStyle('#7d55ff', '#fff', '50px'), width: '200px', height: '60px', left: '50%', top: '50%' } })}>
          <div className="clay-icon-box"><ShoppingBag size={16} color="white"/></div> Shop Button
        </button>
      </div>
    </div>
  );

  const renderElements = () => (
    <div>
      {/* RESTORED UTILITIES */}
      <div className="tool-group">
        <h3>Widgets & Utilities</h3>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            <button className="tool-btn" title="Real-time stopwatch overlay" style={{justifyContent:'center', flexDirection:'column', gap:4}} onClick={() => addLayer('element', 'Stopwatch', { subtype: 'widget-stopwatch', style: { fontSize: '40px', fontWeight:'bold', color: 'white', left: '50%', top: '50%', background:'rgba(0,0,0,0.5)', padding:'5px 10px', borderRadius:8 } })}><Clock size={20}/> Stopwatch</button>
            <button className="tool-btn" title="Editable QR Code" style={{justifyContent:'center', flexDirection:'column', gap:4}} onClick={() => addLayer('element', 'QR Code', { subtype: 'widget-qr', src: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Onera', style: { width: '150px', height: '150px', left: '50%', top: '50%' } })}><QrCode size={20}/> QR Code</button>
            <button className="tool-btn" title="Retro VHS noise effect" style={{justifyContent:'center', flexDirection:'column', gap:4}} onClick={() => addLayer('element', 'VHS', { subtype: 'overlay-vhs', style: { width:'100%', height:'100%', left:'50%', top:'50%' } })}><Film size={20}/> VHS Overlay</button>
        </div>
      </div>

       <div className="tool-group">
        <h3>Social Icons</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8}}>
           {[
               { icon: Youtube, name: 'Youtube', color: '#FF0000' }, 
               { icon: Instagram, name: 'Instagram', color: '#E1306C' }, 
               { icon: Facebook, name: 'Facebook', color: '#1877F2' }, 
               { icon: Twitter, name: 'Twitter', color: '#1DA1F2' }
           ].map(item => (<button key={item.name} className="tool-btn" title={`Add ${item.name} Icon`} style={{justifyContent:'center', padding:8}} onClick={() => addLayer('element', item.name, { subtype: 'icon', iconName: item.name, style: { color: item.color, width: '60px', height: '60px', left: '50%', top: '50%' } })}><item.icon size={20} color={item.color} /></button>))}
        </div>
      </div>

      {/* CLAY ELEMENTS (5 Categories) */}
      {/* Category 1: 3D Shapes */}
      <div className="tool-group">
        <h3>Shapes</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10}}>
           <button className="clay-preview-btn" title="3D Clay Sphere" style={{flexDirection:'column'}} onClick={() => addLayer('element', 'Clay Sphere', { subtype: 'clay-shape', shape: 'circle', style: { ...getClayStyle('linear-gradient(135deg, #a5b4fc, #6366f1)', 'transparent', '50%'), width: '150px', height: '150px', left: '50%', top: '50%' } })}>
             <div style={{width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg, #a5b4fc, #6366f1)', boxShadow:'2px 2px 5px rgba(0,0,0,0.2)'}}></div> Sphere
           </button>
           <button className="clay-preview-btn" title="3D Clay Cube" style={{flexDirection:'column'}} onClick={() => addLayer('element', 'Clay Cube', { subtype: 'clay-shape', shape: 'rect', style: { ...getClayStyle('linear-gradient(135deg, #fca5a5, #ef4444)', 'transparent', '25px'), width: '150px', height: '150px', left: '50%', top: '50%' } })}>
             <div style={{width:30, height:30, borderRadius:'8px', background:'linear-gradient(135deg, #fca5a5, #ef4444)', boxShadow:'2px 2px 5px rgba(0,0,0,0.2)'}}></div> Cube
           </button>
           <button className="clay-preview-btn" title="3D Clay Pill" style={{flexDirection:'column'}} onClick={() => addLayer('element', 'Clay Pill', { subtype: 'clay-shape', shape: 'rect', style: { ...getClayStyle('linear-gradient(135deg, #86efac, #22c55e)', 'transparent', '100px'), width: '200px', height: '80px', left: '50%', top: '50%' } })}>
             <div style={{width:40, height:15, borderRadius:'20px', background:'linear-gradient(135deg, #86efac, #22c55e)', boxShadow:'2px 2px 5px rgba(0,0,0,0.2)'}}></div> Pill
           </button>
        </div>
      </div>

      {/* Category 2: Containers */}
      <div className="tool-group">
        <h3>Containers & Frames</h3>
        <button className="clay-preview-btn" title="Frosted Glass Card" onClick={() => addLayer('element', 'Glass Card', { subtype: 'clay-glass', style: { ...getClayStyle('rgba(255,255,255,0.1)', '#fff', '24px'), width: '400px', height: '250px', left: '50%', top: '50%', border:'1px solid rgba(255,255,255,0.5)' } })}>
           <LayoutTemplate size={16}/> Frosted Glass
        </button>
        <button className="clay-preview-btn" title="3D Phone Mockup" onClick={() => addLayer('element', 'Phone Frame', { subtype: 'clay-frame-phone', style: { ...getClayStyle('#111', '#fff', '40px'), width: '300px', height: '600px', left: '50%', top: '50%', border:'8px solid #333' } })}>
           <Smartphone size={16}/> Phone Mockup
        </button>
      </div>

      {/* Category 3: Clay Emojis */}
      <div className="tool-group">
        <h3>Clay Emojis</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8}}>
           <button className="clay-preview-btn" title="Fire Emoji" style={{justifyContent:'center'}} onClick={() => addLayer('element', 'Fire', { subtype: 'clay-emoji', content: '🔥', style: { ...getClayStyle('#ffaa55', '#fff', '50%'), width: '100px', height: '100px', fontSize:'50px', display:'flex', alignItems:'center', justifyContent:'center', left: '50%', top: '50%' } })}>🔥</button>
           <button className="clay-preview-btn" title="Heart Emoji" style={{justifyContent:'center'}} onClick={() => addLayer('element', 'Heart', { subtype: 'clay-emoji', content: '❤️', style: { ...getClayStyle('#ffb3b3', '#fff', '50%'), width: '100px', height: '100px', fontSize:'50px', display:'flex', alignItems:'center', justifyContent:'center', left: '50%', top: '50%' } })}>❤️</button>
           <button className="clay-preview-btn" title="100 Emoji" style={{justifyContent:'center'}} onClick={() => addLayer('element', '100', { subtype: 'clay-emoji', content: '💯', style: { ...getClayStyle('#ffffcc', '#fff', '50%'), width: '100px', height: '100px', fontSize:'40px', display:'flex', alignItems:'center', justifyContent:'center', left: '50%', top: '50%' } })}>💯</button>
        </div>
      </div>

      {/* Category 4: Progress UI */}
      <div className="tool-group">
        <h3>Progress & Loading</h3>
        <button className="clay-preview-btn" title="3D Loading Spinner" onClick={() => addLayer('element', 'Load Spinner', { subtype: 'clay-spinner', style: { ...getClayStyle('#222', '#7d55ff', '50%'), width: '80px', height: '80px', left: '50%', top: '50%' } })}>
           <Loader2 size={16}/> Spinner
        </button>
        <button className="clay-preview-btn" title="3D Progress Bar" onClick={() => addLayer('element', 'Progress Bar', { subtype: 'clay-bar', val: 50, color: '#7d55ff', style: { ...getClayStyle('#222', '#fff', '20px'), width: '400px', height: '30px', left: '50%', top: '50%' } })}>
           <ArrowRight size={16}/> Loading Bar
        </button>
      </div>

      {/* Category 5: Floating Icons */}
      <div className="tool-group">
        <h3>Floating Icons</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8}}>
           <button className="clay-preview-btn" title="Floating Music Icon" style={{justifyContent:'center'}} onClick={() => addLayer('element', 'Music', { subtype: 'clay-icon-float', icon: 'Music', style: { ...getClayStyle('#d946ef', '#fff', '20px'), width: '80px', height: '80px', left: '50%', top: '50%' } })}><Music/></button>
           <button className="clay-preview-btn" title="Floating Zap Icon" style={{justifyContent:'center'}} onClick={() => addLayer('element', 'Zap', { subtype: 'clay-icon-float', icon: 'Zap', style: { ...getClayStyle('#eab308', '#fff', '20px'), width: '80px', height: '80px', left: '50%', top: '50%' } })}><Zap/></button>
           <button className="clay-preview-btn" title="Floating Bell Icon" style={{justifyContent:'center'}} onClick={() => addLayer('element', 'Bell', { subtype: 'clay-icon-float', icon: 'Bell', style: { ...getClayStyle('#ef4444', '#fff', '20px'), width: '80px', height: '80px', left: '50%', top: '50%' } })}><Bell/></button>
        </div>
      </div>
    </div>
  );

  const renderText = () => (<div><h3>Add Text</h3><button className="tool-btn" onClick={() => addLayer('text', 'Headline Text', { style: { fontSize: 40, fontWeight: 'bold', color: 'white', left: '50%', top: '50%' } })}><Type size={16}/> <h1>Headline</h1></button><button className="tool-btn" onClick={() => addLayer('text', 'Paragraph Text', { style: { fontSize: 20, color: 'white', left: '50%', top: '50%' } })}><AlignLeft size={16}/> <p>Paragraph</p></button>{selectedLayer?.type === 'text' && (<div className="tool-group" style={{marginTop: 20, borderTop: '1px solid #333', paddingTop: 16}}><h3>Edit Text</h3><input className="prop-input" value={selectedLayer.content} onChange={e => updateLayer(selectedLayer.id, { content: e.target.value })} style={{marginBottom: 10, width: '100%'}} /><div className="prop-row"><span style={{fontSize:11, width:40}}>Color</span><input type="color" className="prop-input" style={{height:30, padding:0}} value={selectedLayer.style.color || '#ffffff'} onChange={e => updateLayer(selectedLayer.id, { style: { ...selectedLayer.style, color: e.target.value } })} /></div></div>)}</div>);
  const renderMedia = () => (<div><div className="tool-group"><h3>Upload Media</h3><label className="tool-btn" style={{justifyContent: 'center', height: '80px', border: '1px dashed #555', flexDirection: 'column', cursor: 'pointer'}}><UploadCloud size={24} color="var(--accent)"/><span style={{fontSize: '12px'}}>Click to Upload</span><input type="file" accept="video/*,image/*" style={{display: 'none'}} onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])} /></label></div><div className="tool-group"><h3>Project Assets</h3><div className="asset-grid">{mediaAssets.map(asset => (<div key={asset.id} className="asset-card" onClick={() => addToTimeline(asset)}>{asset.type === 'video' ? <video src={asset.src} /> : <img src={asset.src} alt={asset.name} />}<div className="asset-label">{asset.name}</div></div>))}</div></div></div>);
  const renderSettings = () => (<div><h3>Settings</h3><div className="tool-group"><div className="prop-row"><span style={{fontSize:12, width:60}}>Size</span><select className="prop-input" onChange={(e) => { const v=e.target.value; const s = v==='9:16'?{w:1080,h:1920}:v==='1:1'?{w:1080,h:1080}:{w:1920,h:1080}; updateCanvasSettings({width:s.w, height:s.h}); }}><option value="16:9">YouTube (16:9)</option><option value="9:16">Story (9:16)</option><option value="1:1">Square (1:1)</option></select></div><div className="prop-row"><span style={{fontSize:12, width:60}}>Bg Color</span><input type="color" className="prop-input" style={{height:30, padding:0}} value={canvasSettings.bgColor} onChange={(e) => updateCanvasSettings({ bgColor: e.target.value })} /></div></div></div>);
  const renderSubtitles = () => (<div><div className="tool-group"><h3>Auto Subtitles</h3><button className="btn-primary" onClick={() => addLayer('subtitle', 'Auto Subtitles...', { end: 3 })}><Sparkles size={16}/> Auto Transcribe</button></div></div>);
  const renderAudio = () => (<div><h3>Audio</h3><label className="tool-btn" style={{cursor:'pointer'}}><Music size={16}/> Upload Audio File<input type="file" accept="audio/*" style={{display:'none'}} onChange={(e) => {if(e.target.files[0]) addLayer('audio', e.target.files[0].name, { file: e.target.files[0] });}}/></label></div>);

  const tabs = { settings: renderSettings, media: renderMedia, templates: renderTemplates, subtitles: renderSubtitles, text: renderText, audio: renderAudio, elements: renderElements };
  const navItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'media', icon: ImageIcon, label: 'Media' },
    { id: 'templates', icon: LayoutTemplate, label: 'Templates' }, 
    { id: 'subtitles', icon: Subtitles, label: 'Subtitles' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'elements', icon: Layers, label: 'Elements' },
    { id: 'audio', icon: Music, label: 'Audio' },
  ];
  
  return (
    <>
      <div className="sidebar">
        {navItems.map(item => (<div key={item.id} onClick={() => handleTabClick(item.id)} className={`nav-item ${activeTab===item.id?'active':''}`}><item.icon size={20}/><span>{item.label}</span></div>))}
      </div>
      {activeTab && (
        <div className="drawer">
          {tabs[activeTab] ? tabs[activeTab]() : <div style={{color:'#888'}}>Tool not implemented</div>}
          
          {/* SMART EDITING SECTION FOR ANY SELECTED LAYER */}
          {selectedLayer && (
            <div style={{marginTop: 'auto', borderTop: '1px solid #333', paddingTop: 20}}>
               <div className="prop-row"><span style={{fontSize:12, color:'#888'}}>Edit: {selectedLayer.subtype || selectedLayer.content}</span></div>
               
               {/* 1. Primary/Secondary Text Inputs (Used by Classic Motion + Clay Blob/Split) */}
               {(selectedLayer.primaryText !== undefined || selectedLayer.text !== undefined) && (
                 <div className="tool-group">
                   <div style={{fontSize:12, marginBottom:4}}>Main Text</div>
                   <input className="prop-input" 
                     value={selectedLayer.primaryText !== undefined ? selectedLayer.primaryText : selectedLayer.text} 
                     onChange={(e) => updateLayer(selectedLayer.id, selectedLayer.primaryText !== undefined ? { primaryText: e.target.value } : { text: e.target.value })} 
                     style={{width:'100%', marginBottom:8}} 
                   />
                 </div>
               )}

               {/* 2. Subtext/Secondary Inputs */}
               {(selectedLayer.secondaryText !== undefined || selectedLayer.subtext !== undefined) && (
                 <div className="tool-group">
                   <div style={{fontSize:12, marginBottom:4}}>Secondary Text</div>
                   <input className="prop-input" 
                     value={selectedLayer.secondaryText !== undefined ? selectedLayer.secondaryText : selectedLayer.subtext} 
                     onChange={(e) => updateLayer(selectedLayer.id, selectedLayer.secondaryText !== undefined ? { secondaryText: e.target.value } : { subtext: e.target.value })} 
                     style={{width:'100%'}} 
                   />
                 </div>
               )}

               {/* 3. Content Input (Used by Tweets, Emojis, Simple Text) */}
               {selectedLayer.content !== undefined && !selectedLayer.subtype?.includes('motion') && selectedLayer.type !== 'media' && (
                 <div className="tool-group">
                   <div style={{fontSize:12, marginBottom:4}}>Content</div>
                   <textarea className="prop-input" 
                     value={selectedLayer.content} 
                     onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value })} 
                     style={{width:'100%', height:60}} 
                   />
                 </div>
               )}

               <button className="tool-btn" style={{color: '#ff4d4d', borderColor: '#ff4d4d'}} onClick={() => deleteLayer(selectedLayer.id)}><Trash2 size={16}/> Delete</button>
            </div>
          )}
        </div>
      )}
      <GenModal isOpen={activeModal === 'image'} onClose={() => setActiveModal(null)} title="Generate Image" placeholder="Describe image..." onGenerate={(p)=>{}}/>
    </>
  );
};

const Canvas = () => {
  const { layers, currentTime, isPlaying, updateLayer, setSelectedLayerId, selectedLayerId, trackSettings, updateClipDuration, canvasSettings } = useEditor();
  const [draggingId, setDraggingId] = useState(null);
  const [resizing, setResizing] = useState(null); 
  const containerRef = useRef(null);

  const handleMouseDown = (e, layer) => { if(trackSettings[layer.type === 'text' ? 'text' : 'subtitle']?.locked) return; e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id); };
  const handleResizeStart = (e, layer) => {
    e.stopPropagation();
    const startW = parseInt(layer.style.width || 100);
    const startH = parseInt(layer.style.height || 100);
    const startFs = parseInt(layer.style.fontSize || 24);
    setResizing({ id: layer.id, startX: e.clientX, startY: e.clientY, startW, startH, startFs, isText: layer.type === 'text' || layer.isEmoji });
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (resizing) {
        const dx = e.clientX - resizing.startX;
        const layer = layers.find(l => l.id === resizing.id);
        if (resizing.isText) {
             const newFs = Math.max(10, resizing.startFs + (dx / 2));
             updateLayer(resizing.id, { style: { ...layer.style, fontSize: newFs }});
        } else {
             const newW = Math.max(20, resizing.startW + dx);
             const ratio = resizing.startH / resizing.startW;
             const newH = newW * (isNaN(ratio) ? 1 : ratio);
             updateLayer(resizing.id, { style: { ...layer.style, width: `${newW}px`, height: `${newH}px` }});
        }
    } else if (draggingId) {
        const layer = layers.find(l => l.id === draggingId);
        updateLayer(draggingId, { style: { ...layer.style, left: `${((e.clientX - rect.left) / rect.width) * 100}%`, top: `${((e.clientY - rect.top) / rect.height) * 100}%` } });
    }
  };

  const handleMouseUp = () => { setDraggingId(null); setResizing(null); };
  const isTrackVisible = (type) => { const s = trackSettings[type]; if (Object.values(trackSettings).some(t => t.solo)) return s.solo; return true; };
  const activeMedia = layers.filter(l => l.type === 'media' && currentTime >= l.start && currentTime < l.end);
  const iconMap = { 'Youtube': Youtube, 'Instagram': Instagram, 'Facebook': Facebook, 'Twitter': Twitter, 'Check': Check, 'Message': MessageCircle, 'Star': Star, 'Music': Music, 'Zap': Zap, 'Bell': Bell, 'ShoppingBag': ShoppingBag };
  const formatStopwatch = (ms) => { const totalSeconds = Math.floor(ms); const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0'); const secs = (totalSeconds % 60).toString().padStart(2, '0'); const millis = Math.floor((ms % 1) * 100).toString().padStart(2, '0'); return `${mins}:${secs}.${millis}`; };

  return (
    <div className="canvas-area" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onClick={() => setSelectedLayerId(null)}>
      <div ref={containerRef} style={{ position: 'relative', height: canvasSettings.height > canvasSettings.width ? '90%' : 'auto', width: canvasSettings.height > canvasSettings.width ? 'auto' : '90%', aspectRatio: `${canvasSettings.width} / ${canvasSettings.height}`, boxShadow: '0 0 50px rgba(0,0,0,0.5)', background: canvasSettings.bgColor, overflow: 'hidden' }}>
        
        {isTrackVisible('media') && activeMedia.map(media => (media.subtype === 'video' ? <VideoPlayer key={media.id} src={media.src} isPlaying={isPlaying} currentTime={currentTime} startTime={media.start} trimStart={media.trimStart} muted={trackSettings.media.muted} onDurationLoad={(dur) => updateClipDuration(media.id, dur)} /> : <img key={media.id} src={media.src} className="media-element" alt="content" />))}

        {layers.filter(l => l.type !== 'media' && l.type !== 'audio' && currentTime >= l.start && currentTime <= l.end && isTrackVisible(l.type === 'text' ? 'text' : 'subtitle')).map(layer => {
          const isSelected = selectedLayerId === layer.id;
          const IconComp = layer.iconName ? iconMap[layer.iconName] : (layer.icon ? iconMap[layer.icon] : null);

          // --- CLASSIC RENDERERS (RESTORED) ---
          if (layer.subtype === 'motion-lower-third') return <div key={layer.id} onMouseDown={(e)=>{e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id);}} style={{position:'absolute', ...layer.style, transform:'translate(-50%, -50%)', cursor:'move', border: isSelected ? '1px dashed var(--accent)' : 'none'}}><div className="motion-lower-third-bar" style={{height:'100%', background:'rgba(0,0,0,0.8)', borderLeft:'4px solid var(--accent)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 20px', overflow:'hidden'}}><div className="motion-text-reveal" style={{fontSize:'24px', fontWeight:'bold', color:'white', whiteSpace:'nowrap'}}>{layer.primaryText}</div><div className="motion-text-reveal" style={{fontSize:'16px', color:'var(--accent)', animationDelay:'0.5s', whiteSpace:'nowrap'}}>{layer.secondaryText}</div></div></div>;
          if (layer.subtype === 'motion-lower-third-corp') return <div key={layer.id} onMouseDown={(e)=>{e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id);}} style={{position:'absolute', ...layer.style, transform:'translate(-50%, -50%)', cursor:'move', border: isSelected ? '1px dashed var(--accent)' : 'none'}}><div className="motion-enter-slide-left" style={{height:'100%', background:'white', display:'flex', alignItems:'center', padding:'0 20px', borderBottom:'4px solid var(--accent)', color:'black'}}><div style={{fontWeight:'bold', fontSize:'24px', marginRight:'10px'}}>{layer.primaryText}</div><div style={{width:1, height:20, background:'#ccc', marginRight:'10px'}}></div><div style={{color:'#666'}}>{layer.secondaryText}</div></div></div>;
          if (layer.subtype === 'motion-lower-third-neon') return <div key={layer.id} onMouseDown={(e)=>{e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id);}} style={{position:'absolute', ...layer.style, transform:'translate(-50%, -50%)', cursor:'move', border: isSelected ? '1px dashed var(--accent)' : 'none'}}><div className="motion-enter-slide-left" style={{height:'100%', background:'linear-gradient(90deg, #7d55ff 0%, #000 100%)', display:'flex', alignItems:'center', padding:'0 20px', clipPath:'polygon(0 0, 90% 0, 100% 100%, 0 100%)'}}><Gamepad2 size={32} color="white" style={{marginRight:10}}/><div><div style={{fontSize:'24px', fontWeight:'900', color:'white', textTransform:'uppercase', fontStyle:'italic', whiteSpace:'nowrap'}}>{layer.primaryText}</div><div style={{fontSize:'12px', color:'white', opacity:0.8, whiteSpace:'nowrap'}}>{layer.secondaryText}</div></div></div></div>;
          if (layer.subtype === 'motion-tweet') return <div key={layer.id} onMouseDown={(e)=>{e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id);}} style={{position:'absolute', ...layer.style, transform:'translate(-50%, -50%)', cursor:'move', border: isSelected ? '1px dashed var(--accent)' : 'none', background:'white', color:'black', padding:20, borderRadius:12, fontFamily:'sans-serif'}}><div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}><div style={{width:40, height:40, background:'#1DA1F2', borderRadius:'50%'}}></div><div><div style={{fontWeight:'bold'}}>{layer.primaryText}</div><div style={{color:'#666', fontSize:12}}>@username</div></div><Twitter fill="#1DA1F2" color="#1DA1F2" style={{marginLeft:'auto'}}/></div><div style={{fontSize:16}}>{layer.secondaryText}</div></div>;
          if (layer.subtype === 'motion-health-bar') return <div key={layer.id} onMouseDown={(e)=>{e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id);}} style={{position:'absolute', ...layer.style, transform:'translate(-50%, -50%)', cursor:'move', border: isSelected ? '2px solid var(--accent)' : '2px solid #444', background:'#222', padding:4, borderRadius:4}}><div className="motion-health-anim" style={{height:'100%', background:'linear-gradient(90deg, #ff4d4d, #ff9e4d)', borderRadius:2}}></div></div>;
          
          if (layer.subtype === 'overlay-vhs') return <div key={layer.id} className="overlay-vhs" style={{position:'absolute', inset:0, zIndex:10}}/>;

          return (
            <div key={layer.id} onMouseDown={(e) => handleMouseDown(e, layer)} className={isSelected ? 'selected-layer-border' : ''} style={{ position: 'absolute', left: layer.style.left, top: layer.style.top, transform: 'translate(-50%, -50%)', cursor: 'move', userSelect: 'none', ...layer.style, border: 'none' /* Override border for clay */ }}>
              
              {/* CLAY TEMPLATE RENDERERS */}
              {layer.subtype === 'clay-pill' && ( <div style={{display:'flex', alignItems:'center', gap:15, padding:'0 20px', height:'100%', width:'100%'}}> {IconComp && <IconComp size={32} color={layer.style.color === '#fff' ? layer.iconColor || 'red' : 'white'} />} <span style={{fontWeight:'bold', fontSize:'1.2em'}}>{layer.text}</span> </div> )}
              {layer.subtype === 'clay-bubble' && ( <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, height:'100%', width:'100%'}}> {IconComp && <IconComp size={24}/>} <span>{layer.text}</span> </div> )}
              {layer.subtype === 'clay-card' && ( <div style={{padding:20, display:'flex', flexDirection:'column', gap:10, height:'100%'}}> <div style={{display:'flex', alignItems:'center', gap:10, opacity:0.8}}>{IconComp && <IconComp size={20}/>} <span style={{fontSize:'0.8em'}}>Social Update</span></div> <div style={{fontSize:'1.1em', fontWeight:'600'}}>{layer.text}</div> </div> )}
              {layer.subtype === 'clay-blob' && ( <div style={{display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', height:'100%', width:'100%'}}> <div style={{fontWeight:'900', fontSize:'1.5em', letterSpacing:'1px'}}>{layer.text}</div> <div style={{fontSize:'0.9em', opacity:0.9}}>{layer.subtext}</div> </div> )}
              {layer.subtype === 'clay-pill-split' && ( <div style={{display:'flex', height:'100%', width:'100%', overflow:'hidden', borderRadius: layer.style.borderRadius}}> <div style={{width:'30%', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center'}}><User size={24}/></div> <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center', paddingLeft:15}}> <div style={{fontWeight:'bold'}}>{layer.text}</div> <div style={{fontSize:'0.8em', opacity:0.7}}>{layer.subtext}</div> </div> </div> )}
              
              {/* RESTORED WIDGETS */}
              {layer.subtype === 'clay-bar' && ( <div style={{width:'100%', height:'100%', padding:4, boxSizing:'border-box'}}> <div style={{width: `${layer.val}%`, height:'100%', background: layer.color || 'white', borderRadius: layer.style.borderRadius, boxShadow:'inset 2px 2px 5px rgba(255,255,255,0.4), inset -2px -2px 5px rgba(0,0,0,0.2)'}}></div> </div> )}
              {layer.subtype === 'clay-circle-text' && ( <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', width:'100%', fontWeight:'bold', fontSize:'1.5em'}}>{layer.text}</div> )}
              {layer.subtype === 'clay-toast' && ( <div style={{display:'flex', alignItems:'center', gap:15, padding:'0 20px', height:'100%'}}> <div style={{background:'rgba(255,255,255,0.2)', padding:5, borderRadius:'50%'}}>{IconComp && <IconComp size={16}/>}</div> <span style={{fontWeight:'600'}}>{layer.text}</span> </div> )}
              {layer.subtype === 'clay-tag' && <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontWeight:'900'}}>{layer.text}</div>}
              {layer.subtype === 'clay-button' && <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontWeight:'bold', letterSpacing:'1px', textTransform:'uppercase'}}>{layer.text}</div>}
              {layer.subtype === 'clay-glass' && <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}></div>}
              {layer.subtype === 'clay-frame-phone' && <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}><div style={{width:'90%', height:'95%', background:'black', borderRadius:20}}></div></div>}

              {layer.subtype === 'widget-stopwatch' && (<div style={{fontFamily:'monospace', display:'flex', alignItems:'center', justifyContent:'center', height:'100%', width:'100%'}}>{formatStopwatch(currentTime - layer.start)}</div>)}
              {layer.subtype === 'widget-qr' && <img src={layer.src} alt="qr" style={{width:'100%', height:'100%'}} />}
              {layer.subtype === 'icon' && IconComp && <IconComp style={{width:'100%', height:'100%', color: layer.style.color}} />}

              {/* CLAY ELEMENT RENDERERS */}
              {layer.subtype === 'clay-shape' && <div style={{width:'100%', height:'100%'}}></div>}
              {layer.subtype === 'clay-emoji' && <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>{layer.content}</div>}
              {layer.subtype === 'clay-spinner' && <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}><Loader2 className="animate-spin" size={40} color={layer.style.color}/></div>}
              {layer.subtype === 'clay-icon-float' && IconComp && <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}><IconComp size={40} color={layer.style.color === '#fff' ? 'white' : 'white'}/></div>}

              {/* Standard Fallbacks */}
              {layer.type === 'text' && layer.content}
              {layer.subtype === 'image' && <img src={layer.src} alt="el" style={{width:'100%', height:'100%', objectFit:'contain', borderRadius: layer.style.borderRadius}} />}
              
              {/* RESIZE HANDLE */}
              {isSelected && !trackSettings.text?.locked && <div className="resize-handle resize-se" onMouseDown={(e) => handleResizeStart(e, layer)} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VideoPlayer = ({ src, isPlaying, currentTime, startTime, trimStart, onDurationLoad, muted }) => {
  const vidRef = useRef(null);
  useEffect(() => {
    if (!vidRef.current) return;
    const targetTime = (currentTime - startTime) + (trimStart || 0);
    if (Math.abs(vidRef.current.currentTime - targetTime) > 0.2) vidRef.current.currentTime = targetTime;
    vidRef.current.muted = muted ? true : false;
    if (isPlaying && vidRef.current.paused) vidRef.current.play().catch(() => {}); else if (!isPlaying && !vidRef.current.paused) vidRef.current.pause();
  }, [currentTime, isPlaying, startTime, trimStart, muted]);
  return <video ref={vidRef} src={src} className="media-element" playsInline onLoadedMetadata={(e) => onDurationLoad(e.target.duration)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />;
};

const Timeline = ({ height }) => {
  const { layers, duration, currentTime, setCurrentTime, isPlaying, setIsPlaying, updateLayer, selectedLayerId, setSelectedLayerId, trackSettings, toggleTrackLock, toggleTrackMute, toggleTrackSolo, setTrackHeight, magnetic, setMagnetic, ripple, setRipple, splitLayer } = useEditor();
  const [zoom, setZoom] = useState(30);
  const [interaction, setInteraction] = useState(null);
  const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const getSnapTime = (time, selfId) => { if (!magnetic) return time; const snapPoints = [0, currentTime, duration]; layers.forEach(l => { if (l.id !== selfId) { snapPoints.push(l.start, l.end); } }); const closest = snapPoints.reduce((prev, curr) => Math.abs(curr - time) < Math.abs(prev - time) ? curr : prev); return Math.abs(closest - time) < (10/zoom) ? closest : time; };
  const handleMouseDown = (e, id, type, edge) => { e.stopPropagation(); const layer = layers.find(l => l.id === id); if (trackSettings[layer.type === 'media' ? 'media' : 'text']?.locked) return; setInteraction({ type, id, edge, startX: e.clientX, initialStart: layer.start, initialEnd: layer.end }); setSelectedLayerId(id); };
  const handleMouseMove = (e) => { if (!interaction) return; const delta = (e.clientX - interaction.startX) / zoom; if (interaction.type === 'move') { let newStart = Math.max(0, interaction.initialStart + delta); newStart = getSnapTime(newStart, interaction.id); updateLayer(interaction.id, { start: newStart, end: newStart + (interaction.initialEnd - interaction.initialStart) }); } else if (interaction.type === 'resize') { if (interaction.edge === 'left') { let newStart = Math.min(interaction.initialEnd - 0.5, Math.max(0, interaction.initialStart + delta)); newStart = getSnapTime(newStart, interaction.id); updateLayer(interaction.id, { start: newStart, trimStart: (layers.find(l => l.id === interaction.id).trimStart || 0) + (newStart - interaction.initialStart) }); } else { let newEnd = Math.max(interaction.initialStart + 0.5, interaction.initialEnd + delta); newEnd = getSnapTime(newEnd, interaction.id); updateLayer(interaction.id, { end: newEnd }); } } };
  const renderTrackHeader = (type, title, icon) => { const s = trackSettings[type]; return ( <div className="track-header" style={{height: s.height}}> <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, color:'#aaa'}}><span style={{display:'flex', gap:4}}>{icon} {title}</span><div className="track-controls"><button className={`track-btn ${s.locked?'active-red':''}`} onClick={()=>toggleTrackLock(type)}>{s.locked?<Lock size={10}/>:<Unlock size={10}/>}</button><button className={`track-btn ${s.muted?'active-red':''}`} onClick={()=>toggleTrackMute(type)}>{s.muted?<VolumeX size={10}/>:<Volume2 size={10}/>}</button><button className={`track-btn ${s.solo?'active-accent':''}`} onClick={()=>toggleTrackSolo(type)}><Eye size={10}/></button></div></div> <div style={{display:'flex', marginTop:4, gap:2}}><div style={{height:4, width:12, background:'#333', cursor:'pointer'}} onClick={()=>setTrackHeight(type, Math.max(40, s.height-20))}>-</div><div style={{height:4, width:12, background:'#333', cursor:'pointer'}} onClick={()=>setTrackHeight(type, Math.min(120, s.height+20))}>+</div></div> </div> ); };
  const renderTrackItems = (type, items) => ( <div style={{flex: 1, height: trackSettings[type].height, position: 'relative', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #222'}}> {items.map(item => ( <div key={item.id} onMouseDown={(e) => handleMouseDown(e, item.id, 'move')} style={{position: 'absolute', height: '100%', top: 0, background: selectedLayerId === item.id ? '#444' : (type === 'media' ? '#2d3a4f' : '#4f2d4b'), border: selectedLayerId === item.id ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)', left: `${item.start * zoom}px`, width: `${Math.max(2, (item.end - item.start) * zoom)}px`, zIndex: selectedLayerId === item.id ? 10 : 1, opacity: trackSettings[type].locked ? 0.6 : 1}} className="clip-item"> {!trackSettings[type].locked && <div className="clip-handle left" onMouseDown={(e) => handleMouseDown(e, item.id, 'resize', 'left')} />} <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents:'none', color:'white'}}>{item.content || item.subtype}</span> {!trackSettings[type].locked && <div className="clip-handle right" onMouseDown={(e) => handleMouseDown(e, item.id, 'resize', 'right')} />} </div> ))} </div> );

  return (
    <div className="timeline-container" style={{ height }} onMouseMove={handleMouseMove} onMouseUp={() => setInteraction(null)} onMouseLeave={() => setInteraction(null)}>
      <div className="timeline-toolbar"><button title="Play/Pause" onClick={() => setIsPlaying(!isPlaying)} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}>{isPlaying ? <Pause size={18}/> : <Play size={18}/>}</button><span style={{fontSize:12, fontFamily:'monospace', color:'#aaa', minWidth:80}}>{formatTime(currentTime)}</span><div style={{width:1, height:20, background:'#333', margin:'0 8px'}}></div><button onClick={splitLayer} title="Split Clip (Splits selected layer at playhead)" className="track-btn hover:text-white" style={{color: selectedLayerId ? 'white' : '#444'}}><Split size={16} /></button><button onClick={() => setMagnetic(!magnetic)} title="Magnet Mode (Snap clips to playhead/others)" className={`track-btn ${magnetic ? 'magnet-active' : 'magnet-inactive'}`}><Magnet size={16} /></button><button onClick={() => setRipple(!ripple)} title="Ripple Mode (Close gaps on delete)" className={`track-btn ${ripple?'active-accent':''}`}><AlignLeft size={16} /></button><div style={{flex:1}}></div><input title="Zoom Timeline" type="range" min="10" max="100" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{width:100, accentColor:'var(--accent)'}}/></div>
      <div style={{flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'}}><div style={{display: 'flex', minWidth: '100%'}}><div style={{width: 160, flexShrink: 0, background: '#111', zIndex:30}}><div style={{height:25, borderBottom:'1px solid #333'}}></div>{renderTrackHeader('media', 'Media', <Video size={10}/>)}{renderTrackHeader('audio', 'Audio', <Music size={10}/>)}{renderTrackHeader('text', 'Text', <Type size={10}/>)}{renderTrackHeader('subtitle', 'Subtitles', <Subtitles size={10}/>)}</div><div style={{flex: 1, position: 'relative', minWidth: `${Math.max(duration * zoom, 800)}px`}}><div onClick={(e) => {const rect = e.currentTarget.getBoundingClientRect(); setCurrentTime(Math.max(0, (e.clientX - rect.left) / zoom));}} style={{height: '25px', borderBottom: '1px solid var(--border)', position: 'relative', cursor: 'pointer', background:'#111'}}>{Array.from({ length: Math.ceil(duration || 60) }).map((_, i) => (<div key={i} style={{position: 'absolute', left: `${i * zoom}px`, fontSize: '9px', color: '#555', top: '6px', userSelect:'none', pointerEvents:'none'}}>{i % 5 === 0 ? formatTime(i) : '|'}</div>))}</div><div style={{position: 'absolute', top: 0, bottom: 0, left: `${currentTime * zoom}px`, width: '1px', background: 'var(--playhead)', zIndex: 50, pointerEvents: 'none'}}><div style={{width: 11, height: 11, background: 'var(--playhead)', position: 'absolute', top: 0, left: -5, transform: 'rotate(45deg)'}}></div></div>{renderTrackItems('media', layers.filter(l => l.type === 'media'))}{renderTrackItems('audio', layers.filter(l => l.type === 'audio'))}{renderTrackItems('text', layers.filter(l => l.type === 'text' || l.type === 'element'))}{renderTrackItems('subtitle', layers.filter(l => l.type === 'subtitle'))}</div></div></div>
    </div>
  );
};

export default function OneraAIVideoEditor() {
  const [timelineHeight, setTimelineHeight] = useState(300);
  const isResizing = useRef(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => { if (!isResizing.current) return; const newHeight = window.innerHeight - e.clientY; setTimelineHeight(Math.max(150, Math.min(newHeight, window.innerHeight - 100))); };
    const handleMouseUp = () => isResizing.current = false;
    window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, []);

  return (
    <EditorProvider>
      <div className="app-container">
        <style>{styles}</style>
        <Sidebar />
        <div className="workspace">
          <div className="header"><div style={{display: 'flex', alignItems:'center', gap:'10px'}}><div style={{fontWeight: 'bold', fontSize:'18px'}}>Onera<span style={{color: 'var(--accent)'}}> AI</span></div></div><button title="Export Video" className="export-btn" onClick={() => setShowExport(true)}><Download size={16} /> Export</button></div>
          <Canvas />
          <div className="resizer-y" onMouseDown={(e) => { e.preventDefault(); isResizing.current = true; }}><div className="resizer-handle-icon"></div></div>
          <Timeline height={timelineHeight} />
        </div>
        <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
      </div>
    </EditorProvider>
  );
}