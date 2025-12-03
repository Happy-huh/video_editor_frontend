import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { generateId } from '../utils/helpers';

const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
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
  const [duration, setDuration] = useState(10); // Default 10s

  // Konva Stage Ref (for export)
  const stageRef = useRef(null);

  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Main Loop
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
    const type = typeOverride || (file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : 'audio'));
    const newAsset = { id: generateId(), src: url, type, name: file.name };
    setMediaAssets(prev => [newAsset, ...prev]);

    // Add to timeline automatically if it's a main media or audio
    if (!typeOverride && type !== 'audio') {
       addToTimeline(newAsset);
    }
    if (type === 'audio') {
       // Add audio to audio track automatically
       const newLayer = {
          id: generateId(), type: 'audio', subtype: 'audio', src: newAsset.src,
          content: newAsset.name, start: currentTime, end: currentTime + 10, // Default 10s
          trimStart: 0,
          opacity: 1
       };
       setLayers(prev => [...prev, newLayer]);
    }
  };

  const addToTimeline = (asset) => {
    if (asset.type === 'audio') {
        const audioLayers = layers.filter(l => l.type === 'audio');
        const startTime = magnetic ? (audioLayers.length > 0 ? Math.max(...audioLayers.map(l => l.end)) : 0) : currentTime;
        const newLayer = {
            id: generateId(), type: 'audio', subtype: 'audio', src: asset.src,
            content: asset.name, start: startTime, end: startTime + 10,
            trimStart: 0
        };
        setLayers(prev => [...prev, newLayer]);
        if (newLayer.end > duration) setDuration(newLayer.end);
        return;
    }

    const mediaLayers = layers.filter(l => l.type === 'media');
    const startTime = magnetic ? (mediaLayers.length > 0 ? Math.max(...mediaLayers.map(l => l.end)) : 0) : currentTime;

    // Default duration for images is 5s, video uses actual duration (handled by VideoLayer later)
    const defaultDur = 5;

    const newLayer = {
      id: generateId(), type: 'media', subtype: asset.type, src: asset.src,
      content: asset.name, start: startTime, end: startTime + defaultDur,
      trimStart: 0,
      // Default Konva props
      x: canvasSettings.width / 2,
      y: canvasSettings.height / 2,
      scaleX: 1, scaleY: 1,
      rotation: 0,
      width: asset.type === 'video' ? 400 : 400, // Placeholder size, will update on load
      height: asset.type === 'video' ? 225 : 225,
      opacity: 1
    };
    setLayers(prev => [...prev, newLayer]);
    if (newLayer.end > duration) setDuration(newLayer.end);
  };

  const addLayer = (type, content, extra = {}) => {
    const newLayer = {
      id: generateId(), type, content, start: currentTime,
      end: currentTime + 5 > duration ? duration + 5 : currentTime + 5,
      trimStart: 0,
      x: canvasSettings.width / 2,
      y: canvasSettings.height / 2,
      scaleX: 1, scaleY: 1,
      rotation: 0,
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
      if (maxEnd > duration) setDuration(maxEnd);
      return updatedLayers;
    });
  };

  const splitLayer = (id, time) => {
    const layer = layers.find(l => l.id === id);
    if (!layer || time <= layer.start || time >= layer.end) return;

    const splitPoint = time;
    const firstHalfDuration = splitPoint - layer.start;

    // Update first half
    const updatedLayer = { ...layer, end: splitPoint };

    // Create second half
    const newLayer = {
        ...layer,
        id: generateId(),
        start: splitPoint,
        end: layer.end,
        trimStart: layer.trimStart + firstHalfDuration
    };

    setLayers(prev => prev.map(l => l.id === id ? updatedLayer : l).concat(newLayer));
    setSelectedLayerId(newLayer.id);
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

  // Used to update video actual duration after metadata load
  const updateClipDuration = (id, actualDuration) => {
    setLayers(prev => {
      const layer = prev.find(l => l.id === id);
      // Only update if it hasn't been manually trimmed yet (heuristic)
      if (layer && (layer.subtype === 'video' || layer.type === 'audio') && (layer.end - layer.start === 5 || layer.end - layer.start === 10)) {
             const newEnd = layer.start + actualDuration;
             setDuration(d => Math.max(d, newEnd));
             return prev.map(l => l.id === id ? { ...l, end: newEnd } : l);
      }
      return prev;
    });
  };

  // Track Controls
  const toggleTrackLock = (track) => {
    setTrackSettings(prev => ({
        ...prev,
        [track]: { ...prev[track], locked: !prev[track].locked }
    }));
  };

  const toggleTrackMute = (track) => {
    setTrackSettings(prev => ({
        ...prev,
        [track]: { ...prev[track], muted: !prev[track].muted }
    }));
  };

  const toggleTrackSolo = (track) => {
      // Toggle logic usually involves muting all others, but for MVP just toggling state
      setTrackSettings(prev => ({
          ...prev,
          [track]: { ...prev[track], solo: !prev[track].solo }
      }));
  };

  return (
    <EditorContext.Provider value={{
      projectStatus, setProjectStatus, layers, setLayers,
      selectedLayerId, setSelectedLayerId, mediaAssets,
      addLayer, updateLayer, deleteLayer, splitLayer, addToTimeline,
      trackSettings, setTrackSettings, toggleTrackLock, toggleTrackMute, toggleTrackSolo,
      magnetic, setMagnetic, ripple, setRipple,
      currentTime, setCurrentTime, isPlaying, setIsPlaying,
      duration, setDuration, handleUpload, updateClipDuration,
      canvasSettings, updateCanvasSettings: (s) => setCanvasSettings(p => ({...p, ...s})),
      stageRef
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => useContext(EditorContext);
