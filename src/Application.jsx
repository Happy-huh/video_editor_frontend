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
  Smartphone, Monitor, Menu, Cpu, Terminal, FileVideo, AlertTriangle
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
  .drawer { width: 320px; background: var(--bg-panel); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 20px; overflow-y: auto; position: relative; z-index: 10; transition: transform 0.3s ease; }
  .tool-group { margin-bottom: 24px; }
  .tool-group h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #eee; }
  
  .tool-btn { width: 100%; padding: 12px; background: var(--bg-panel-light); border: 1px solid var(--border); border-radius: 8px; color: white; text-align: left; margin-bottom: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
  .tool-btn:hover { border-color: var(--accent); background: #2a2a2a; }

  .asset-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .asset-card { background: #222; border-radius: 8px; overflow: hidden; cursor: pointer; border: 1px solid transparent; position: relative; aspect-ratio: 16/9; }
  .asset-card:hover { border-color: var(--accent); }
  .asset-card img, .asset-card video { width: 100%; height: 100%; object-fit: cover; }
  .asset-label { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; font-size: 10px; padding: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .prop-row { display: flex; gap: 10px; margin-bottom: 12px; align-items: center; }
  .prop-input { flex: 1; background: #111; border: 1px solid var(--border); color: white; padding: 8px; border-radius: 4px; font-size: 12px; }
  
  /* ANIMATIONS */
  @keyframes slideInLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes popIn { 0% { transform: scale(0); } 80% { transform: scale(1.1); } 100% { transform: scale(1); } }
  @keyframes lowerThirdBar { 0% { width: 0; } 100% { width: 100%; } }
  @keyframes textReveal { 0% { clip-path: inset(0 100% 0 0); } 100% { clip-path: inset(0 0 0 0); } }
  @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); } }
  @keyframes tickerScroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
  @keyframes thumb-up { 0% { transform: rotate(0) scale(1); } 50% { transform: rotate(-20deg) scale(1.2); } 100% { transform: rotate(0) scale(1); } }
  @keyframes health-drain { 0% { width: 100%; } 50% { width: 60%; } 100% { width: 30%; } }
  @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }

  /* MOTION CLASSES */
  .motion-enter-slide-left { animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .motion-enter-pop { animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
  .motion-lower-third-bar { animation: lowerThirdBar 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .motion-text-reveal { animation: textReveal 0.8s 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; clip-path: inset(0 100% 0 0); }
  .motion-ticker-anim { animation: tickerScroll 10s linear infinite; }
  .motion-thumb-anim { animation: thumb-up 0.5s ease forwards; }
  .motion-health-anim { animation: health-drain 5s linear infinite alternate; }
  
  /* WORKSPACE & CANVAS */
  .workspace { flex: 1; display: flex; flex-direction: column; position: relative; height: 100%; }
  .header { height: 60px; background: var(--bg-dark); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; }
  .export-btn { background: var(--text-main); color: black; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
  .canvas-area { flex: 1; background: #000; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .media-element { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
  
  /* OVERLAYS */
  .overlay-vhs { background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 2px, 3px 100%; pointer-events: none; mix-blend-mode: overlay; }
  .overlay-film { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E"); mix-blend-mode: overlay; opacity: 0.3; }

  /* TIMELINE & RESIZER */
  .timeline-container { background: var(--timeline-bg); display: flex; flex-direction: column; }
  .timeline-toolbar { height: 40px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 16px; background: #151515; border-top: 1px solid var(--border); }
  .resizer-y { height: 8px; background: #1a1a1a; cursor: row-resize; width: 100%; border-top: 1px solid var(--border); transition: background 0.2s; z-index: 100; display: flex; justify-content: center; align-items: center; }
  .resizer-y:hover { background: var(--accent); }
  .resizer-handle-icon { width: 40px; height: 4px; background: #444; border-radius: 2px; }
  .resizer-y:hover .resizer-handle-icon { background: white; }

  .track-header { width: 160px; border-right: 1px solid var(--border); background: #151515; display: flex; flex-direction: column; padding: 8px; justify-content: center; position: sticky; left: 0; z-index: 20; }
  .track-controls { display: flex; gap: 6px; margin-top: 4px; }
  .track-btn { background: transparent; border: none; color: #666; cursor: pointer; padding: 2px; }
  .track-btn:hover, .track-btn.active { color: var(--text-main); }
  .track-btn.active-red { color: #ff4d4d; }
  .track-btn.active-accent { color: var(--accent); }
  
  .clip-item { cursor: grab; position: absolute; height: 100%; border-radius: 4px; display: flex; align-items: center; padding: 0 8px; font-size: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
  .clip-item.selected { border-color: var(--accent); z-index: 10; }
  .clip-handle { width: 10px; height: 100%; position: absolute; top: 0; cursor: col-resize; background: transparent; z-index: 20; }
  .clip-handle:hover { background: rgba(255,255,255,0.3); }
  .clip-handle.left { left: 0; }
  .clip-handle.right { right: 0; }
  
  .btn-primary { background: var(--accent); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-primary:disabled { background: #333; color: #666; cursor: not-allowed; }
  
  /* MODAL & EXPORT */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  .modal-content { background: var(--bg-panel); width: 500px; padding: 0; border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; }
  .modal-header { padding: 16px 24px; font-size: 18px; font-weight: bold; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #1a1a1a; }
  .modal-body { padding: 24px; }

  .export-progress-bar { height: 8px; width: 100%; background: #333; border-radius: 4px; overflow: hidden; margin: 20px 0; }
  .export-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #a688ff); width: 0%; transition: width 0.2s ease-out; position: relative; }
  .export-progress-fill::after { content: ''; position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shimmer 1.5s infinite; }

  .export-step { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; opacity: 0.4; transition: opacity 0.3s; }
  .export-step.active { opacity: 1; color: white; font-weight: 500; }
  .export-step.completed { opacity: 0.7; color: var(--accent); }
  .export-step-icon { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #444; display: flex; align-items: center; justify-content: center; font-size: 10px; }
  .export-step.active .export-step-icon { border-color: var(--accent); background: rgba(125, 85, 255, 0.2); color: var(--accent); }
  .export-step.completed .export-step-icon { border-color: var(--accent); background: var(--accent); color: white; }
  
  .log-terminal { background: #111; color: #4ade80; font-family: monospace; font-size: 11px; padding: 10px; border-radius: 4px; height: 80px; overflow-y: auto; margin-top: 16px; border: 1px solid #333; }

  /* --- MOBILE RESPONSIVE --- */
  @media (max-width: 768px) {
    .app-container { flex-direction: column; }
    .sidebar { width: 100%; height: 60px; flex-direction: row; border-right: none; border-top: 1px solid var(--border); order: 3; justify-content: space-around; padding: 0; position: relative; }
    .nav-item { margin: 0; height: 100%; width: auto; padding: 0 10px; flex: 1; }
    .drawer { position: fixed; bottom: 60px; left: 0; width: 100%; height: 60vh; z-index: 100; border-right: none; border-top: 1px solid var(--accent); box-shadow: 0 -5px 20px rgba(0,0,0,0.5); }
    .workspace { order: 1; height: calc(100vh - 60px); flex: 1; }
    .timeline-container { height: 200px !important; }
    .track-header { width: 100px; }
    .timeline-toolbar { padding: 0 8px; gap: 8px; }
    .resizer-y { display: none; }
    .modal-content { width: 90%; }
  }
`;

// --- UTILS ---
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- CLIENT SIDE EXPORT LOGIC (SIMULATED ENGINE) ---
// This logic simulates what ffmpeg.wasm would do.
// In a production app, you would import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
// and replace the timeouts with actual await ffmpeg.run(...) commands.

const generateFFmpegCommand = (layers) => {
    let cmd = ['-i', 'input.mp4'];
    let filterComplex = "";
    
    layers.forEach((layer, i) => {
        // Example: Translate Text Layer to drawtext filter
        if(layer.type === 'text') {
            filterComplex += `drawtext=text='${layer.content}':fontsize=24:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2,`;
        }
        // Example: Translate Trim to trim filter
        if(layer.type === 'media' && layer.subtype === 'video') {
            cmd.push(`-ss ${layer.trimStart} -t ${layer.end - layer.start}`);
        }
    });
    
    if (filterComplex) {
        cmd.push('-vf', filterComplex.slice(0, -1)); // Remove trailing comma
    }
    
    cmd.push('output.mp4');
    return cmd.join(" ");
};

// --- CONTEXT ---
const EditorContext = createContext();

const EditorProvider = ({ children }) => {
  const [projectStatus, setProjectStatus] = useState('idle');
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [mediaAssets, setMediaAssets] = useState([]);
  
  // Canvas Settings
  const [canvasSettings, setCanvasSettings] = useState({
    width: 1920,
    height: 1080,
    bgColor: '#000000'
  });
  
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
  const [videoUrl, setVideoUrl] = useState(null); // Main video file for export
  
  const animationRef = useRef(null);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    const updateLoop = () => {
      if (isPlaying) {
        const now = Date.now();
        const dt = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;
        setCurrentTime(t => {
          if (t >= duration) { setIsPlaying(false); return duration; }
          return t + dt;
        });
        animationRef.current = requestAnimationFrame(updateLoop);
      }
    };
    if (isPlaying) {
      lastTimeRef.current = Date.now();
      animationRef.current = requestAnimationFrame(updateLoop);
    } else {
      cancelAnimationFrame(animationRef.current);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, duration]);

  const handleUpload = async (file, typeOverride = null) => {
    const url = URL.createObjectURL(file);
    const type = typeOverride || (file.type.startsWith('image/') ? 'image' : 'video');
    const newAsset = { id: generateId(), src: url, type, name: file.name };
    setMediaAssets(prev => [newAsset, ...prev]);
    
    if (typeOverride === 'element-image') {
        addLayer('element', 'Image', { subtype: 'image', src: url, style: { width: '200px', height: 'auto', left: '50%', top: '50%' } });
    } else {
        // Main Video
        setVideoUrl(url);
        // Add initial layer
        addToTimeline(newAsset);
    }
  };

  const addToTimeline = (asset) => {
    const mediaLayers = layers.filter(l => l.type === 'media');
    const startTime = magnetic ? (mediaLayers.length > 0 ? Math.max(...mediaLayers.map(l => l.end)) : 0) : currentTime;
    const defaultDuration = 5; 
    const newLayer = {
      id: generateId(), type: 'media', subtype: asset.type, src: asset.src,
      content: asset.name, start: startTime, end: startTime + defaultDuration,
      trimStart: 0, style: { width: '100%', height: '100%', objectFit: 'contain' }
    };
    setLayers(prev => [...prev, newLayer]);
    if (newLayer.end > duration) setDuration(newLayer.end);
  };

  const updateClipDuration = (id, actualDuration) => {
    setLayers(prev => {
      const layer = prev.find(l => l.id === id);
      if (layer && layer.subtype === 'video') {
        if (layer.end - layer.start === 5 && layer.trimStart === 0) {
             const newEnd = layer.start + actualDuration;
             setDuration(d => Math.max(d, newEnd));
             return prev.map(l => l.id === id ? { ...l, end: newEnd } : l);
        }
      }
      return prev;
    });
  };

  const addLayer = (type, content, extra = {}) => {
    const newLayer = {
      id: generateId(), type, content, start: currentTime,
      end: currentTime + 5 > duration ? duration + 5 : currentTime + 5,
      trimStart: 0,
      style: { left: '50%', top: '50%', fontSize: 24, color: '#ffffff', fontFamily: 'Arial', padding: '4px' },
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
    const layer = layers.find(l => l.id === id);
    if (!layer) return;
    const layerDuration = layer.end - layer.start;
    const layerType = layer.type;
    const layerEnd = layer.end;
    let newLayers = layers.filter(l => l.id !== id);
    if (ripple) {
      newLayers = newLayers.map(l => {
        if (l.type === layerType && l.start >= layerEnd) {
          return { ...l, start: l.start - layerDuration, end: l.end - layerDuration };
        }
        return l;
      });
    }
    setLayers(newLayers);
    setSelectedLayerId(null);
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
  const updateCanvasSettings = (settings) => { setCanvasSettings(prev => ({ ...prev, ...settings })); };

  return (
    <EditorContext.Provider value={{
      projectStatus, layers, setLayers, 
      selectedLayerId, setSelectedLayerId, mediaAssets,
      addLayer, updateLayer, deleteLayer, splitLayer, addToTimeline,
      trackSettings, toggleTrackLock, toggleTrackMute, toggleTrackSolo, setTrackHeight,
      magnetic, setMagnetic, ripple, setRipple,
      currentTime, setCurrentTime, isPlaying, setIsPlaying, 
      duration, setDuration, handleUpload, updateClipDuration,
      canvasSettings, updateCanvasSettings, videoUrl
    }}>
      {children}
    </EditorContext.Provider>
  );
};

const useEditor = () => useContext(EditorContext);

// --- COMPONENTS ---

const ExportModal = ({ isOpen, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [log, setLog] = useState([]);
  const { videoUrl, layers } = useEditor();

  // Stages of "Client Side Compilation"
  const stages = [
    { id: 0, label: 'Initializing FFmpeg Core', icon: Cpu },
    { id: 1, label: 'Processing Audio Tracks', icon: Volume2 },
    { id: 2, label: 'Rendering Video Layers', icon: Layers },
    { id: 3, label: 'Encoding Final MP4 Stream', icon: FileVideo }
  ];

  const addLog = (msg) => setLog(prev => [...prev.slice(-4), `> ${msg}`]);

  useEffect(() => {
    if(isOpen) {
      setProgress(0);
      setStage(0);
      setLog(['> Starting Export Job...']);
      
      // Generate the theoretical command to show we are "doing work"
      const cmd = generateFFmpegCommand(layers);
      setTimeout(() => addLog(`Command: ${cmd}`), 500);

      // Simulate complex render process
      const timer = setInterval(() => {
        setProgress(prev => {
          if(prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          
          // Logic to switch stages based on progress
          if (prev < 20) { setStage(0); if(Math.random()>0.8) addLog("Loading WASM binaries..."); }
          else if (prev < 40) { setStage(1); if(Math.random()>0.8) addLog("Mixing audio channels..."); }
          else if (prev < 80) { setStage(2); if(Math.random()>0.8) addLog(`Rendering frame ${Math.floor(Math.random()*1000)}...`); }
          else { setStage(3); if(Math.random()>0.8) addLog("Muxing container..."); }

          // Non-linear progress to look realistic
          const jump = Math.random() * 3;
          return Math.min(prev + jump, 100);
        });
      }, 100); 

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  // Auto Download trigger
  useEffect(() => {
    if (progress === 100 && videoUrl) {
      addLog("Export Complete. Downloading...");
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'edited_project.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 1000);
    }
  }, [progress, videoUrl]);

  if(!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span>Exporting Video</span>
          <button onClick={onClose} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}><X size={20}/></button>
        </div>
        <div className="modal-body">
          
          {/* Progress Circle / Percentage */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
             <span style={{fontSize:14, color:'#aaa', fontWeight:500}}>
               {progress < 100 ? 'Compiling in Browser...' : 'Download Ready'}
             </span>
             <span style={{fontSize:24, fontWeight:'bold', color:'var(--accent)'}}>{Math.floor(progress)}%</span>
          </div>

          {/* Progress Bar */}
          <div className="export-progress-bar">
            <div className="export-progress-fill" style={{width: `${progress}%`}}></div>
          </div>

          {/* Steps Tracker */}
          <div style={{marginTop: 24, background:'#111', padding:16, borderRadius:8, border:'1px solid #333'}}>
            {stages.map((s) => (
              <div key={s.id} className={`export-step ${stage === s.id ? 'active' : ''} ${stage > s.id ? 'completed' : ''}`}>
                 <div className="export-step-icon">
                   {stage > s.id ? <Check size={14}/> : (stage === s.id ? <Loader2 className="animate-spin" size={14}/> : s.id + 1)}
                 </div>
                 <span style={{fontSize:13}}>{s.label}</span>
              </div>
            ))}
          </div>
          
          {/* Terminal Log */}
          <div className="log-terminal">
            {log.map((l, i) => <div key={i}>{l}</div>)}
          </div>

          {progress === 100 && (
            <p style={{fontSize:12, color:'var(--accent)', textAlign:'center', marginTop:16}}>
              Video saved to device.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const GenModal = ({ isOpen, onClose, title, onGenerate, placeholder }) => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  if (!isOpen) return null;
  const handleGen = () => {
    setGenerating(true);
    setTimeout(() => { onGenerate(prompt); setGenerating(false); setPrompt(''); onClose(); }, 2000);
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header"><span>{title}</span><button onClick={onClose} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}><X size={20}/></button></div>
        <div style={{padding: 24}}>
            <textarea className="prop-input" style={{width:'100%', height:'100px', resize:'none', marginBottom:'16px'}} placeholder={placeholder} value={prompt} onChange={e => setPrompt(e.target.value)}/>
            <button className="btn-primary" onClick={handleGen} disabled={!prompt || generating}>{generating ? <><Loader2 className="animate-spin" size={16}/> Generating...</> : <><Wand2 size={16}/> Generate</>}</button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [activeModal, setActiveModal] = useState(null);
  const { 
    handleUpload, layers, selectedLayerId, updateLayer, addLayer, deleteLayer, 
    mediaAssets, addToTimeline, canvasSettings, updateCanvasSettings 
  } = useEditor();
  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  const handleTabClick = (id) => {
    if (activeTab === id) {
        setActiveTab(null); // Toggle Close
    } else {
        setActiveTab(id); // Open
    }
  };

  const handleAIImage = (prompt) => {
    const mockUrl = `https://via.placeholder.com/400x400/7d55ff/ffffff?text=${encodeURIComponent(prompt)}`;
    addLayer('element', 'AI Image', { subtype: 'image', src: mockUrl, style: { width: '300px', height: '300px', left: '50%', top: '50%' } });
  };
  const handleAIAudio = (prompt) => addLayer('audio', `AI SFX: ${prompt}`, { isEffect: true });

  const renderMedia = () => (
    <div>
      <div className="tool-group"><h3>Upload Media</h3><label className="tool-btn" style={{justifyContent: 'center', height: '80px', border: '1px dashed #555', flexDirection: 'column', cursor: 'pointer'}}><UploadCloud size={24} color="var(--accent)"/><span style={{fontSize: '12px'}}>Click to Upload</span><input type="file" accept="video/*,image/*" style={{display: 'none'}} onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])} /></label></div>
      <div className="tool-group"><h3>Project Assets</h3><div className="asset-grid">{mediaAssets.map(asset => (<div key={asset.id} className="asset-card" onClick={() => addToTimeline(asset)}>{asset.type === 'video' ? <video src={asset.src} /> : <img src={asset.src} alt={asset.name} />}<div className="asset-label">{asset.name}</div><div style={{position:'absolute', top:4, right:4, background:'rgba(0,0,0,0.6)', borderRadius:4, padding:2}}><Plus size={12} color="white"/></div></div>))}</div>{mediaAssets.length === 0 && <div style={{fontSize:12, color:'#666', textAlign:'center'}}>No media uploaded yet</div>}</div>
    </div>
  );

  const renderTemplates = () => (
    <div>
      <div className="tool-group">
        <h3>Motion Graphics</h3>
        <div style={{marginBottom: 16}}>
          <div style={{fontSize:12, color:'#888', marginBottom:8}}>Lower Thirds</div>
          <div style={{display:'grid', gap:8}}>
            <button className="tool-btn" onClick={() => addLayer('element', 'Clean News', { subtype: 'motion-lower-third', style: { width: '400px', height: '100px', left: '10%', top: '80%' }, primaryText: 'Breaking News', secondaryText: 'Live from the Studio' })}><LayoutTemplate size={16}/> Clean News</button>
            <button className="tool-btn" onClick={() => addLayer('element', 'Neon Gamer', { subtype: 'motion-lower-third-neon', style: { width: '400px', height: '100px', left: '10%', top: '80%' }, primaryText: 'StreamerName', secondaryText: '@social_handle' })}><Gamepad2 size={16}/> Neon Gamer</button>
            <button className="tool-btn" onClick={() => addLayer('element', 'Minimal Corp', { subtype: 'motion-lower-third-corp', style: { width: '400px', height: '80px', left: '10%', top: '85%' }, primaryText: 'John Doe', secondaryText: 'CEO & Founder' })}><User size={16}/> Minimal Corp</button>
          </div>
        </div>
        <div style={{marginBottom: 16}}>
          <div style={{fontSize:12, color:'#888', marginBottom:8}}>YouTube Bumpers</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            <button className="tool-btn" style={{flexDirection:'column'}} onClick={() => addLayer('element', 'Subscribe', { subtype: 'motion-subscribe', style: { width: '300px', height: '80px', left: '50%', top: '80%' } })}><Youtube color="red"/> Subscribe</button>
            <button className="tool-btn" style={{flexDirection:'column'}} onClick={() => addLayer('element', 'Like & Bell', { subtype: 'motion-like-bell', style: { width: '320px', height: '90px', left: '80%', top: '80%' } })}><Bell color="gold"/> Like & Bell</button>
            <button className="tool-btn" style={{flexDirection:'column'}} onClick={() => addLayer('element', 'End Screen', { subtype: 'motion-end-screen', style: { width: '100%', height: '100%', left: '50%', top: '50%' } })}><LayoutTemplate size={16}/> End Screen</button>
          </div>
        </div>
        <div style={{marginBottom: 16}}>
          <div style={{fontSize:12, color:'#888', marginBottom:8}}>Gaming & Live</div>
          <div style={{display:'grid', gap:8}}>
             <button className="tool-btn" onClick={() => addLayer('element', 'Facecam Border', { subtype: 'motion-overlay-gaming', style: { width: '300px', height: '200px', left: '5%', top: '5%' } })}><User size={16}/> Facecam Border</button>
             <button className="tool-btn" onClick={() => addLayer('element', 'Health Bar', { subtype: 'motion-health-bar', style: { width: '400px', height: '40px', left: '50%', top: '90%' } })}><Battery size={16}/> Dynamic Health</button>
             <button className="tool-btn" onClick={() => addLayer('element', 'Breaking Ticker', { subtype: 'motion-ticker', style: { width: '100%', height: '50px', left: '50%', top: '90%' }, content: 'BREAKING NEWS • LIVE UPDATES • STAY TUNED • ' })}><Tv size={16}/> Scrolling Ticker</button>
          </div>
        </div>
        <div>
          <div style={{fontSize:12, color:'#888', marginBottom:8}}>Social Media</div>
          <div style={{display:'grid', gap:8}}>
             <button className="tool-btn" onClick={() => addLayer('element', 'Tweet', { subtype: 'motion-tweet', style: { width: '400px', height: '150px', left: '50%', top: '50%' }, primaryText: 'User Name', secondaryText: 'Just launched my new video! #viral' })}><Twitter size={16}/> Tweet Overlay</button>
             <button className="tool-btn" onClick={() => addLayer('element', 'Insta Frame', { subtype: 'motion-insta-frame', style: { width: '100%', height: '100%', left: '50%', top: '50%' } })}><Instagram size={16}/> Story Frame</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubtitles = () => (<div><div className="tool-group"><h3>Auto Subtitles</h3><button className="btn-primary" onClick={() => addLayer('subtitle', 'Hello world', { end: 3 })}><Sparkles size={16}/> Auto Transcribe</button></div>{selectedLayer?.type === 'subtitle' && (<div className="tool-group" style={{borderTop: '1px solid #333', paddingTop: 16}}><h3>Subtitle Style</h3><div className="prop-row"><select className="prop-input" value={selectedLayer.style.fontFamily} onChange={e => updateLayer(selectedLayer.id, { style: { ...selectedLayer.style, fontFamily: e.target.value } })}><option value="Arial">Arial</option><option value="Inter">Inter</option></select></div><div className="prop-row"><input type="color" className="prop-input" style={{height:30, padding:0}} value={selectedLayer.style.color} onChange={e => updateLayer(selectedLayer.id, { style: { ...selectedLayer.style, color: e.target.value } })} /><input type="number" className="prop-input" value={selectedLayer.style.fontSize} onChange={e => updateLayer(selectedLayer.id, { style: { ...selectedLayer.style, fontSize: Number(e.target.value) } })} /></div></div>)}</div>);
  const renderText = () => (<div><h3>Add Text</h3><button className="tool-btn" onClick={() => addLayer('text', 'Headline Text', { style: { fontSize: 40, fontWeight: 'bold', color: 'white', left: '50%', top: '50%' } })}><Type size={16}/> <h1>Headline</h1></button><button className="tool-btn" onClick={() => addLayer('text', 'Paragraph Text', { style: { fontSize: 20, color: 'white', left: '50%', top: '50%' } })}><AlignLeft size={16}/> <p>Paragraph</p></button>{selectedLayer?.type === 'text' && (<div className="tool-group" style={{marginTop: 20, borderTop: '1px solid #333', paddingTop: 16}}><h3>Edit Text</h3><input className="prop-input" value={selectedLayer.content} onChange={e => updateLayer(selectedLayer.id, { content: e.target.value })} style={{marginBottom: 10, width: '100%'}} /><div className="prop-row"><span style={{fontSize:11, width:40}}>Color</span><input type="color" className="prop-input" style={{height:30, padding:0}} value={selectedLayer.style.color || '#ffffff'} onChange={e => updateLayer(selectedLayer.id, { style: { ...selectedLayer.style, color: e.target.value } })} /></div><div className="prop-row"><span style={{fontSize:11, width:40}}>Bg</span><input type="color" className="prop-input" style={{height:30, padding:0}} value={selectedLayer.style.backgroundColor || '#000000'} onChange={e => updateLayer(selectedLayer.id, { style: { ...selectedLayer.style, backgroundColor: e.target.value } })} /></div></div>)}</div>);
  const renderAudio = () => (<div><h3>Audio</h3><label className="tool-btn" style={{cursor:'pointer'}}><Music size={16}/> Upload Audio File<input type="file" accept="audio/*" style={{display:'none'}} onChange={(e) => {if(e.target.files[0]) addLayer('audio', e.target.files[0].name, { file: e.target.files[0] });}}/></label><button className="tool-btn" onClick={() => setActiveModal('audio')}><Wand2 size={16} color="var(--accent)"/> Generate AI SFX</button><button className="tool-btn" onClick={() => addLayer('audio', 'Sound Effect: Pop', { isEffect: true })}><Sparkles size={16}/> Standard SFX: Pop</button></div>);
  
  const renderElements = () => (
    <div>
      <h3>Elements</h3>
      <div className="tool-group"><label className="tool-btn" style={{justifyContent: 'center', border: '1px dashed #555', cursor: 'pointer'}}><UploadCloud size={16} color="var(--accent)"/><span style={{fontSize: '12px'}}>Upload Image</span><input type="file" accept="image/*" style={{display: 'none'}} onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0], 'element-image')} /></label><button className="tool-btn" style={{justifyContent: 'center', marginTop: 8}} onClick={() => setActiveModal('image')}><Wand2 size={16} color="var(--accent)"/> Generate with AI</button></div>
      <div className="tool-group"><h3>Shapes</h3><div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}><button className="tool-btn" style={{justifyContent:'center'}} onClick={() => addLayer('element', 'Rectangle', { shape: 'rect', style: { width:'100px', height:'100px', backgroundColor: 'white', left: '50%', top: '50%' } })}><div style={{width:20, height:20, background:'white'}}></div></button><button className="tool-btn" style={{justifyContent:'center'}} onClick={() => addLayer('element', 'Circle', { shape: 'circle', style: { width:'100px', height:'100px', backgroundColor: 'white', borderRadius:'50%', left: '50%', top: '50%' } })}><div style={{width:20, height:20, background:'white', borderRadius:'50%'}}></div></button><button className="tool-btn" style={{justifyContent:'center'}} onClick={() => addLayer('element', 'Triangle', { shape: 'triangle', style: { width:'100px', height:'100px', borderLeft: '50px solid transparent', borderRight: '50px solid transparent', borderBottom: '100px solid white', backgroundColor: 'transparent', left: '50%', top: '50%' } })}><Triangle size={20}/></button><button className="tool-btn" style={{justifyContent:'center'}} onClick={() => addLayer('element', 'Star', { subtype: 'icon', iconName: 'Star', style: { color: '#FFD700', width: '100px', height: '100px', left: '50%', top: '50%' } })}><Star size={20}/></button><button className="tool-btn" style={{justifyContent:'center'}} onClick={() => addLayer('element', 'Hexagon', { subtype: 'icon', iconName: 'Hexagon', style: { color: 'white', width: '100px', height: '100px', left: '50%', top: '50%' } })}><Hexagon size={20}/></button></div></div>
      <div className="tool-group"><h3>Stickers</h3><div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}><button className="tool-btn" style={{justifyContent:'center'}} onClick={() => addLayer('element', '🔥', { isEmoji: true, style: { fontSize: '80px', left:'50%', top:'50%' } })}>🔥 Fire</button><button className="tool-btn" style={{justifyContent:'center'}} onClick={() => addLayer('element', '💯', { isEmoji: true, style: { fontSize: '80px', left:'50%', top:'50%' } })}>💯 100</button><button className="tool-btn" style={{justifyContent:'center'}} onClick={() => addLayer('element', 'WOW', { content: 'WOW!', style: { fontSize: '60px', color:'#FF0000', fontWeight:'900', transform:'rotate(-10deg)', textShadow:'2px 2px 0px white', left:'50%', top:'50%' } })}>WOW!</button><button className="tool-btn" style={{justifyContent:'center'}} onClick={() => addLayer('element', 'SALE', { content: 'SALE', style: { fontSize: '50px', background:'yellow', color:'black', padding:'5px 15px', fontWeight:'bold', left:'50%', top:'50%' } })}>SALE</button></div></div>
      <div className="tool-group"><h3>Widgets</h3><div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}><button className="tool-btn" style={{justifyContent:'center', flexDirection:'column', gap:4}} onClick={() => addLayer('element', 'Stopwatch', { subtype: 'widget-stopwatch', style: { fontSize: '40px', fontWeight:'bold', color: 'white', left: '50%', top: '20%', background:'rgba(0,0,0,0.5)', padding:'5px 10px', borderRadius:8 } })}><Clock size={20}/> Stopwatch</button><button className="tool-btn" style={{justifyContent:'center', flexDirection:'column', gap:4}} onClick={() => addLayer('element', 'QR Code', { subtype: 'widget-qr', src: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VeedClone', style: { width: '150px', height: '150px', left: '50%', top: '50%' } })}><QrCode size={20}/> QR Code</button></div></div>
      <div className="tool-group"><h3>Overlays</h3><div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}><button className="tool-btn" style={{justifyContent:'center', flexDirection:'column', gap:4}} onClick={() => addLayer('element', 'Glitch', { subtype: 'overlay-glitch', style: { width:'100%', height:'100%', left:'50%', top:'50%' } })}><Zap size={20}/> Glitch</button><button className="tool-btn" style={{justifyContent:'center', flexDirection:'column', gap:4}} onClick={() => addLayer('element', 'VHS', { subtype: 'overlay-vhs', style: { width:'100%', height:'100%', left:'50%', top:'50%' } })}><Film size={20}/> VHS</button></div></div>
      <div className="tool-group"><h3>Socials</h3><div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>{[{ icon: Youtube, name: 'YouTube', color: '#FF0000' }, { icon: Instagram, name: 'Instagram', color: '#E1306C' }, { icon: Facebook, name: 'Facebook', color: '#1877F2' }, { icon: Twitter, name: 'Twitter', color: '#1DA1F2' }].map(item => (<button key={item.name} className="tool-btn" style={{justifyContent:'center', padding:8}} onClick={() => addLayer('element', item.name, { subtype: 'icon', iconName: item.name, style: { color: item.color, width: '60px', height: '60px', left: '50%', top: '50%' } })}><item.icon size={20} color={item.color} /></button>))}</div></div>
    </div>
  );

  // --- SETTINGS RENDERER WITH CANVAS CONTROL ---
  const renderSettings = () => {
    const handleSizeChange = (e) => {
      const val = e.target.value;
      let w=1920, h=1080;
      if(val==='9:16') { w=1080; h=1920; }
      if(val==='1:1') { w=1080; h=1080; }
      if(val==='4:5') { w=1080; h=1350; }
      updateCanvasSettings({ width: w, height: h });
    };

    return (
      <div>
        <h3>Settings</h3>
        <div className="tool-group">
           <div className="prop-row">
             <span style={{fontSize:12, width:60}}>Size</span> 
             <select className="prop-input" onChange={handleSizeChange}>
               <option value="16:9">YouTube (16:9)</option>
               <option value="9:16">Story (9:16)</option>
               <option value="1:1">Square (1:1)</option>
               <option value="4:5">Portrait (4:5)</option>
             </select>
           </div>
           <div className="prop-row">
             <span style={{fontSize:12, width:60}}>Bg Color</span> 
             <input 
               type="color" 
               className="prop-input" 
               style={{height:30, padding:0}} 
               value={canvasSettings.bgColor}
               onChange={(e) => updateCanvasSettings({ bgColor: e.target.value })} 
             />
           </div>
        </div>
      </div>
    );
  };

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
      {/* Drawer - Conditional rendering for Mobile vs Desktop */}
      {activeTab && (
        <div className="drawer">
          {tabs[activeTab] ? tabs[activeTab]() : <div style={{color:'#888'}}>Tool not implemented</div>}
          
          {/* GLOBAL EDIT SECTION FOR SELECTED LAYERS */}
          {selectedLayer && (
            <div style={{marginTop: 'auto', borderTop: '1px solid #333', paddingTop: 20}}>
               <div className="prop-row"><span style={{fontSize:12, color:'#888'}}>Selected: {selectedLayer.content}</span></div>
               
               {/* Motion Graphics Editors */}
               {(selectedLayer.subtype === 'motion-lower-third' || selectedLayer.subtype === 'motion-lower-third-corp') && (<div className="tool-group"><div style={{fontSize:12, marginBottom:4}}>Primary Text</div><input className="prop-input" value={selectedLayer.primaryText} onChange={(e) => updateLayer(selectedLayer.id, { primaryText: e.target.value })} style={{width:'100%', marginBottom:8}} /><div style={{fontSize:12, marginBottom:4}}>Secondary Text</div><input className="prop-input" value={selectedLayer.secondaryText} onChange={(e) => updateLayer(selectedLayer.id, { secondaryText: e.target.value })} style={{width:'100%'}} /></div>)}
               {selectedLayer.subtype === 'motion-lower-third-neon' && (<div className="tool-group"><div style={{fontSize:12, marginBottom:4}}>Name</div><input className="prop-input" value={selectedLayer.primaryText} onChange={(e) => updateLayer(selectedLayer.id, { primaryText: e.target.value })} style={{width:'100%', marginBottom:8}} /><div style={{fontSize:12, marginBottom:4}}>Handle</div><input className="prop-input" value={selectedLayer.secondaryText} onChange={(e) => updateLayer(selectedLayer.id, { secondaryText: e.target.value })} style={{width:'100%'}} /></div>)}
               {selectedLayer.subtype === 'motion-tweet' && (<div className="tool-group"><div style={{fontSize:12, marginBottom:4}}>User Name</div><input className="prop-input" value={selectedLayer.primaryText} onChange={(e) => updateLayer(selectedLayer.id, { primaryText: e.target.value })} style={{width:'100%', marginBottom:8}} /><div style={{fontSize:12, marginBottom:4}}>Tweet Content</div><textarea className="prop-input" value={selectedLayer.secondaryText} onChange={(e) => updateLayer(selectedLayer.id, { secondaryText: e.target.value })} style={{width:'100%', height:60}} /></div>)}
               {selectedLayer.subtype === 'motion-ticker' && (<div className="tool-group"><div style={{fontSize:12, marginBottom:4}}>Ticker Content</div><textarea className="prop-input" value={selectedLayer.content} onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value })} style={{width:'100%', height:60}} /></div>)}
               <button className="tool-btn" style={{color: '#ff4d4d', borderColor: '#ff4d4d'}} onClick={() => deleteLayer(selectedLayer.id)}><Trash2 size={16}/> Delete</button>
            </div>
          )}
        </div>
      )}
      <GenModal isOpen={activeModal === 'image'} onClose={() => setActiveModal(null)} title="Generate Image" placeholder="Describe image..." onGenerate={handleAIImage}/>
      <GenModal isOpen={activeModal === 'audio'} onClose={() => setActiveModal(null)} title="Generate Sound Effect" placeholder="Describe sound..." onGenerate={handleAIAudio}/>
    </>
  );
};

const Canvas = () => {
  const { layers, currentTime, isPlaying, updateLayer, setSelectedLayerId, selectedLayerId, trackSettings, updateClipDuration, canvasSettings } = useEditor();
  const [draggingId, setDraggingId] = useState(null);
  const containerRef = useRef(null);
  const handleMouseMove = (e) => { if (!draggingId || !containerRef.current) return; const rect = containerRef.current.getBoundingClientRect(); updateLayer(draggingId, { style: { ...layers.find(l => l.id === draggingId).style, left: `${((e.clientX - rect.left) / rect.width) * 100}%`, top: `${((e.clientY - rect.top) / rect.height) * 100}%` } }); };
  const isTrackVisible = (type) => { const s = trackSettings[type]; if (Object.values(trackSettings).some(t => t.solo)) return s.solo; return true; };
  const activeMedia = layers.filter(l => l.type === 'media' && currentTime >= l.start && currentTime < l.end);
  const iconMap = { 'YouTube': Youtube, 'Instagram': Instagram, 'Facebook': Facebook, 'Twitter': Twitter, 'Heart': Heart, 'Like': ThumbsUp, 'Bell': Bell, 'Star': Star, 'Hexagon': Hexagon };
  const formatStopwatch = (ms) => { const totalSeconds = Math.floor(ms); const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0'); const secs = (totalSeconds % 60).toString().padStart(2, '0'); const millis = Math.floor((ms % 1) * 100).toString().padStart(2, '0'); return `${mins}:${secs}.${millis}`; };

  const isPortrait = canvasSettings.height > canvasSettings.width;

  return (
    <div className="canvas-area" onMouseMove={handleMouseMove} onMouseUp={() => setDraggingId(null)} onClick={() => setSelectedLayerId(null)}>
      <div ref={containerRef} 
        style={{ 
          position: 'relative', 
          // FIX: Explicit dimensions to allow aspect-ratio to work in flex container without collapsing
          height: isPortrait ? '90%' : 'auto',
          width: isPortrait ? 'auto' : '90%',
          aspectRatio: `${canvasSettings.width} / ${canvasSettings.height}`, 
          boxShadow: '0 0 50px rgba(0,0,0,0.5)', 
          background: canvasSettings.bgColor,
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
        
        {isTrackVisible('media') && activeMedia.map(media => (media.subtype === 'video' ? <VideoPlayer key={media.id} src={media.src} isPlaying={isPlaying} currentTime={currentTime} startTime={media.start} trimStart={media.trimStart} muted={trackSettings.media.muted} onDurationLoad={(dur) => updateClipDuration(media.id, dur)} /> : <img key={media.id} src={media.src} className="media-element" alt="content" />))}

        {layers.filter(l => l.type !== 'media' && l.type !== 'audio' && currentTime >= l.start && currentTime <= l.end && isTrackVisible(l.type === 'text' ? 'text' : 'subtitle')).map(layer => {
          const isSelected = selectedLayerId === layer.id;
          const IconComponent = layer.subtype === 'icon' ? iconMap[layer.iconName] : null;

          // ... (Keep existing motion graphic renderers) ...
          if (layer.subtype === 'motion-lower-third') return <div key={layer.id} onMouseDown={(e)=>{e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id);}} style={{position:'absolute', ...layer.style, transform:'translate(-50%, -50%)', cursor:'move', border: isSelected ? '1px dashed var(--accent)' : 'none'}}><div className="motion-lower-third-bar" style={{height:'100%', background:'rgba(0,0,0,0.8)', borderLeft:'4px solid var(--accent)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 20px', overflow:'hidden'}}><div className="motion-text-reveal" style={{fontSize:'24px', fontWeight:'bold', color:'white', whiteSpace:'nowrap'}}>{layer.primaryText}</div><div className="motion-text-reveal" style={{fontSize:'16px', color:'var(--accent)', animationDelay:'0.5s', whiteSpace:'nowrap'}}>{layer.secondaryText}</div></div></div>;
          if (layer.subtype === 'motion-lower-third-corp') return <div key={layer.id} onMouseDown={(e)=>{e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id);}} style={{position:'absolute', ...layer.style, transform:'translate(-50%, -50%)', cursor:'move', border: isSelected ? '1px dashed var(--accent)' : 'none'}}><div className="motion-enter-slide-left" style={{height:'100%', background:'white', display:'flex', alignItems:'center', padding:'0 20px', borderBottom:'4px solid var(--accent)', color:'black'}}><div style={{fontWeight:'bold', fontSize:'24px', marginRight:'10px'}}>{layer.primaryText}</div><div style={{width:1, height:20, background:'#ccc', marginRight:'10px'}}></div><div style={{color:'#666'}}>{layer.secondaryText}</div></div></div>;
          if (layer.subtype === 'motion-lower-third-neon') return <div key={layer.id} onMouseDown={(e)=>{e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id);}} style={{position:'absolute', ...layer.style, transform:'translate(-50%, -50%)', cursor:'move', border: isSelected ? '1px dashed var(--accent)' : 'none'}}><div className="motion-enter-slide-left" style={{height:'100%', background:'linear-gradient(90deg, #7d55ff 0%, #000 100%)', display:'flex', alignItems:'center', padding:'0 20px', clipPath:'polygon(0 0, 90% 0, 100% 100%, 0 100%)'}}><Gamepad2 size={32} color="white" style={{marginRight:10}}/><div><div style={{fontSize:'24px', fontWeight:'900', color:'white', textTransform:'uppercase', fontStyle:'italic', whiteSpace:'nowrap'}}>{layer.primaryText}</div><div style={{fontSize:'12px', color:'white', opacity:0.8, whiteSpace:'nowrap'}}>{layer.secondaryText}</div></div></div></div>;
          if (layer.subtype === 'motion-subscribe') return <div key={layer.id} onMouseDown={(e)=>{e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id);}} style={{position:'absolute', ...layer.style, transform:'translate(-50%, -50%)', cursor:'move', display:'flex', alignItems:'center', background:'white', padding:'10px 20px', borderRadius:'40px', gap:15, animation:'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards', border: isSelected ? '1px dashed var(--accent)' : 'none', boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}><div style={{width:32, height:24, background:'red', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', position:'relative'}}><div style={{width:0, height:0, borderTop:'5px solid transparent', borderBottom:'5px solid transparent', borderLeft:'8px solid white'}}></div></div><div style={{color:'black', fontWeight:'bold', fontSize:'24px', letterSpacing:-0.5}}>SUBSCRIBE</div><Bell fill="#ccc" color="#ccc" style={{animation:'pulse-ring 2s infinite'}}/></div>;
          if (layer.subtype === 'motion-like-bell') return <div key={layer.id} onMouseDown={(e)=>{e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id);}} style={{position:'absolute', ...layer.style, transform:'translate(-50%, -50%)', cursor:'move', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#222', padding:'15px 30px', borderRadius:'50px', gap:20, animation:'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards', border: isSelected ? '1px dashed var(--accent)' : '1px solid #333', boxShadow:'0 4px 12px rgba(0,0,0,0.5)'}}><div style={{display:'flex', alignItems:'center', gap:8, color:'white', fontSize:14, fontWeight:600}}><ThumbsUp fill="#3ea6ff" color="#3ea6ff" size={28} className="motion-thumb-anim" /> <span>Liked</span></div><div style={{width:1, height:30, background:'#444'}}></div><div style={{display:'flex', alignItems:'center', gap:8, color:'#aaa', fontSize:14, fontWeight:600}}><div style={{position:'relative'}}><Bell fill="white" color="white" size={28} /><div style={{position:'absolute', top:0, right:0, width:10, height:10, background:'red', borderRadius:'50%', border:'2px solid #222'}}></div></div><span>Subscribed</span></div></div>;
          if (layer.subtype === 'motion-overlay-gaming') return <div key={layer.id} onMouseDown={(e)=>{e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id);}} style={{position:'absolute', ...layer.style, pointerEvents:'none', border:'4px solid var(--accent)', boxShadow:'0 0 20px var(--accent)', zIndex:5}}><div style={{position:'absolute', bottom:-20, left:'50%', transform:'translateX(-50%)', background:'var(--accent)', color:'white', fontSize:10, padding:'2px 8px', borderRadius:4}}>LIVE CAM</div></div>;
          if (layer.subtype === 'motion-ticker') return <div key={layer.id} style={{position:'absolute', bottom:0, left:0, width:'100%', height:40, background:'#d00', display:'flex', alignItems:'center', overflow:'hidden', zIndex:100}}><div style={{whiteSpace:'nowrap', color:'white', fontWeight:'bold', fontSize:18, display:'flex', gap:50}} className="motion-ticker-anim"><span>{layer.content}</span><span>{layer.content}</span><span>{layer.content}</span><span>{layer.content}</span><span>{layer.content}</span><span>{layer.content}</span></div></div>;
          if (layer.subtype === 'motion-tweet') return <div key={layer.id} onMouseDown={(e)=>{e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id);}} style={{position:'absolute', ...layer.style, transform:'translate(-50%, -50%)', cursor:'move', border: isSelected ? '1px dashed var(--accent)' : 'none', background:'white', color:'black', padding:20, borderRadius:12, fontFamily:'sans-serif'}}><div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}><div style={{width:40, height:40, background:'#1DA1F2', borderRadius:'50%'}}></div><div><div style={{fontWeight:'bold'}}>{layer.primaryText}</div><div style={{color:'#666', fontSize:12}}>@username</div></div><Twitter fill="#1DA1F2" color="#1DA1F2" style={{marginLeft:'auto'}}/></div><div style={{fontSize:16}}>{layer.secondaryText}</div></div>;
          if (layer.subtype === 'motion-insta-frame') return <div key={layer.id} style={{position:'absolute', inset:0, border:'20px solid transparent', borderImage:'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%) 1', pointerEvents:'none', zIndex:100}}></div>;
          if (layer.subtype === 'motion-health-bar') return (
            <div key={layer.id} onMouseDown={(e)=>{e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id);}} style={{position:'absolute', ...layer.style, transform:'translate(-50%, -50%)', cursor:'move', border: isSelected ? '2px solid var(--accent)' : '2px solid #444', background:'#222', padding:4, borderRadius:4}}>
                <div className="motion-health-anim" style={{height:'100%', background:'linear-gradient(90deg, #ff4d4d, #ff9e4d)', borderRadius:2}}></div>
            </div>
          );
          if (layer.subtype === 'motion-end-screen') return <div key={layer.id} style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', gap:40}}><div style={{width:300, height:180, border:'2px dashed white', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>NEXT VIDEO</div><div style={{width:150, height:150, borderRadius:'50%', border:'2px dashed white', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>SUBSCRIBE</div></div>;

          if (layer.subtype?.startsWith('overlay')) { let c=''; if(layer.subtype==='overlay-glitch')c='overlay-vhs'; if(layer.subtype==='overlay-vhs')c='overlay-vhs'; if(layer.subtype==='overlay-film')c='overlay-film'; return <div key={layer.id} className={c} style={{position:'absolute', inset:0, zIndex:10}}/>; }

          return (
            <div key={layer.id} onMouseDown={(e) => { if(trackSettings[layer.type === 'text' ? 'text' : 'subtitle']?.locked) return; e.stopPropagation(); setDraggingId(layer.id); setSelectedLayerId(layer.id); }} style={{ position: 'absolute', left: layer.style.left || '50%', top: layer.style.top || '50%', transform: 'translate(-50%, -50%)', cursor: trackSettings.text?.locked ? 'default' : 'move', userSelect: 'none', border: isSelected ? '1px dashed var(--accent)' : '1px dashed transparent', ...layer.style }}>
              {layer.subtype === 'image' && <img src={layer.src} alt="element" style={{width:'100%', height:'100%', objectFit:'contain'}} />}
              {layer.subtype === 'widget-qr' && <img src={layer.src} alt="qr" style={{width:'100%', height:'100%'}} />}
              {layer.subtype === 'widget-stopwatch' && (<div style={{fontFamily:'monospace'}}>{formatStopwatch(currentTime - layer.start)}</div>)}
              {layer.subtype === 'icon' && IconComponent && <IconComponent style={{width:'100%', height:'100%', color: layer.style.color}} />}
              {!layer.subtype && !layer.shape && layer.content}
              {layer.shape === 'rect' && <div style={{width:'100%', height:'100%', background: layer.style.backgroundColor}}></div>}
              {layer.shape === 'circle' && <div style={{width:'100%', height:'100%', background: layer.style.backgroundColor, borderRadius:'50%'}}></div>}
              {layer.shape === 'triangle' && <div style={{width:0, height:0, ...layer.style, left:0, top:0}}></div>}
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
    if (isPlaying && vidRef.current.paused) vidRef.current.play().catch(() => {});
    else if (!isPlaying && !vidRef.current.paused) vidRef.current.pause();
  }, [currentTime, isPlaying, startTime, trimStart, muted]);
  return <video ref={vidRef} src={src} className="media-element" playsInline onLoadedMetadata={(e) => onDurationLoad(e.target.duration)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />;
};

const Timeline = ({ height }) => {
  const { layers, duration, currentTime, setCurrentTime, isPlaying, setIsPlaying, updateLayer, selectedLayerId, setSelectedLayerId, trackSettings, toggleTrackLock, toggleTrackMute, toggleTrackSolo, setTrackHeight, magnetic, setMagnetic, ripple, setRipple, splitLayer } = useEditor();
  const [zoom, setZoom] = useState(30);
  const [interaction, setInteraction] = useState(null);
  const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const getSnapTime = (time, selfId) => { if (!magnetic) return time; const snapPoints = [0, currentTime, duration]; layers.forEach(l => { if (l.id !== selfId) { snapPoints.push(l.start, l.end); } }); const threshold = 10 / zoom; const closest = snapPoints.reduce((prev, curr) => Math.abs(curr - time) < Math.abs(prev - time) ? curr : prev); return Math.abs(closest - time) < threshold ? closest : time; };
  const handleMouseDown = (e, id, type, edge) => { e.stopPropagation(); const layer = layers.find(l => l.id === id); if (trackSettings[layer.type === 'media' ? 'media' : 'text']?.locked) return; setInteraction({ type, id, edge, startX: e.clientX, initialStart: layer.start, initialEnd: layer.end }); setSelectedLayerId(id); };
  const handleMouseMove = (e) => { if (!interaction) return; const delta = (e.clientX - interaction.startX) / zoom; if (interaction.type === 'move') { let newStart = Math.max(0, interaction.initialStart + delta); newStart = getSnapTime(newStart, interaction.id); const duration = interaction.initialEnd - interaction.initialStart; updateLayer(interaction.id, { start: newStart, end: newStart + duration }); } else if (interaction.type === 'resize') { if (interaction.edge === 'left') { let newStart = Math.min(interaction.initialEnd - 0.5, Math.max(0, interaction.initialStart + delta)); newStart = getSnapTime(newStart, interaction.id); const layer = layers.find(l => l.id === interaction.id); const diff = newStart - interaction.initialStart; const newTrim = (layer.trimStart || 0) + diff; updateLayer(interaction.id, { start: newStart, trimStart: newTrim }); } else { let newEnd = Math.max(interaction.initialStart + 0.5, interaction.initialEnd + delta); newEnd = getSnapTime(newEnd, interaction.id); updateLayer(interaction.id, { end: newEnd }); } } };
  const renderTrackHeader = (type, title, icon) => { const s = trackSettings[type]; return ( <div className="track-header" style={{height: s.height}}> <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, color:'#aaa'}}><span style={{display:'flex', gap:4}}>{icon} {title}</span><div className="track-controls"><button className={`track-btn ${s.locked?'active-red':''}`} onClick={()=>toggleTrackLock(type)}>{s.locked?<Lock size={10}/>:<Unlock size={10}/>}</button><button className={`track-btn ${s.muted?'active-red':''}`} onClick={()=>toggleTrackMute(type)}>{s.muted?<VolumeX size={10}/>:<Volume2 size={10}/>}</button><button className={`track-btn ${s.solo?'active-accent':''}`} onClick={()=>toggleTrackSolo(type)}><Eye size={10}/></button></div></div> <div style={{display:'flex', marginTop:4, gap:2}}><div style={{height:4, width:12, background:'#333', cursor:'pointer'}} onClick={()=>setTrackHeight(type, Math.max(40, s.height-20))}>-</div><div style={{height:4, width:12, background:'#333', cursor:'pointer'}} onClick={()=>setTrackHeight(type, Math.min(120, s.height+20))}>+</div></div> </div> ); };
  const renderTrackItems = (type, items) => ( <div style={{flex: 1, height: trackSettings[type].height, position: 'relative', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #222'}}> {items.map(item => ( <div key={item.id} onMouseDown={(e) => handleMouseDown(e, item.id, 'move')} style={{position: 'absolute', height: '100%', top: 0, background: selectedLayerId === item.id ? '#444' : (type === 'media' ? '#2d3a4f' : '#4f2d4b'), border: selectedLayerId === item.id ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)', left: `${item.start * zoom}px`, width: `${Math.max(2, (item.end - item.start) * zoom)}px`, zIndex: selectedLayerId === item.id ? 10 : 1, opacity: trackSettings[type].locked ? 0.6 : 1}} className="clip-item"> {!trackSettings[type].locked && <div className="clip-handle left" onMouseDown={(e) => handleMouseDown(e, item.id, 'resize', 'left')} />} <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents:'none', color:'white'}}>{item.content}</span> {!trackSettings[type].locked && <div className="clip-handle right" onMouseDown={(e) => handleMouseDown(e, item.id, 'resize', 'right')} />} </div> ))} </div> );

  return (
    <div className="timeline-container" style={{ height }} onMouseMove={handleMouseMove} onMouseUp={() => setInteraction(null)} onMouseLeave={() => setInteraction(null)}>
      <div className="timeline-toolbar"><button onClick={() => setIsPlaying(!isPlaying)} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}>{isPlaying ? <Pause size={18}/> : <Play size={18}/>}</button><span style={{fontSize:12, fontFamily:'monospace', color:'#aaa', minWidth:80}}>{formatTime(currentTime)}</span><div style={{width:1, height:20, background:'#333', margin:'0 8px'}}></div><button onClick={splitLayer} title="Split Clip" className="track-btn hover:text-white" style={{color: selectedLayerId ? 'white' : '#444'}}><Split size={16} /></button><button onClick={() => setMagnetic(!magnetic)} title="Magnetic Snapping" className={`track-btn ${magnetic?'active-accent':''}`}><Magnet size={16} /></button><button onClick={() => setRipple(!ripple)} title="Ripple Delete" className={`track-btn ${ripple?'active-accent':''}`}><AlignLeft size={16} /></button><div style={{flex:1}}></div><input type="range" min="10" max="100" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{width:100, accentColor:'var(--accent)'}}/></div>
      <div style={{flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'}}><div style={{display: 'flex', minWidth: '100%'}}>
           <div style={{width: 160, flexShrink: 0, background: '#111', zIndex:30}}><div style={{height:25, borderBottom:'1px solid #333'}}></div>{renderTrackHeader('media', 'Media', <Video size={10}/>)}{renderTrackHeader('audio', 'Audio', <Music size={10}/>)}{renderTrackHeader('text', 'Text', <Type size={10}/>)}{renderTrackHeader('subtitle', 'Subtitles', <Subtitles size={10}/>)}</div>
           <div style={{flex: 1, position: 'relative', minWidth: `${Math.max(duration * zoom, 800)}px`}}>
              <div onClick={(e) => {const rect = e.currentTarget.getBoundingClientRect(); setCurrentTime(Math.max(0, (e.clientX - rect.left) / zoom));}} style={{height: '25px', borderBottom: '1px solid var(--border)', position: 'relative', cursor: 'pointer', background:'#111'}}>{Array.from({ length: Math.ceil(duration || 60) }).map((_, i) => (<div key={i} style={{position: 'absolute', left: `${i * zoom}px`, fontSize: '9px', color: '#555', top: '6px', userSelect:'none', pointerEvents:'none'}}>{i % 5 === 0 ? formatTime(i) : '|'}</div>))}</div>
              <div style={{position: 'absolute', top: 0, bottom: 0, left: `${currentTime * zoom}px`, width: '1px', background: 'var(--playhead)', zIndex: 50, pointerEvents: 'none'}}><div style={{width: 11, height: 11, background: 'var(--playhead)', position: 'absolute', top: 0, left: -5, transform: 'rotate(45deg)'}}></div></div>
              {renderTrackItems('media', layers.filter(l => l.type === 'media'))}
              {renderTrackItems('audio', layers.filter(l => l.type === 'audio'))}
              {renderTrackItems('text', layers.filter(l => l.type === 'text' || l.type === 'element'))}
              {renderTrackItems('subtitle', layers.filter(l => l.type === 'subtitle'))}
           </div>
        </div></div>
    </div>
  );
};

export default function VeedClone() {
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
    <EditorProvider>
      <div className="app-container">
        <style>{styles}</style>
        <Sidebar />
        <div className="workspace">
          <div className="header"><div style={{display: 'flex', alignItems:'center', gap:'10px'}}><div style={{fontWeight: 'bold', fontSize:'18px'}}>VEED<span style={{color: 'var(--accent)'}}>.IO</span> Clone</div></div><button className="export-btn" onClick={() => setShowExport(true)}><Download size={16} /> Export</button></div>
          <Canvas />
          <div className="resizer-y" onMouseDown={(e) => { e.preventDefault(); isResizing.current = true; }}><div className="resizer-handle-icon"></div></div>
          <Timeline height={timelineHeight} />
        </div>
        <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
      </div>
    </EditorProvider>
  );
}