import React, { useState } from 'react';
import { useEditor } from '../../store/EditorContext';
import { Settings, Image as ImageIcon, LayoutTemplate, Subtitles, Type, Layers, Music, UploadCloud, Square, Circle, Video } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { SHAPES, TEXT_PRESETS, TEMPLATES } from '../../data/assets';

export const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const {
      handleUpload, layers, selectedLayerId, updateLayer, addLayer, deleteLayer,
      mediaAssets, addToTimeline, canvasSettings, updateCanvasSettings,
      setLayers, setDuration
  } = useEditor();

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  const navItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'media', icon: ImageIcon, label: 'Media' },
    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
    { id: 'subtitles', icon: Subtitles, label: 'Subtitles' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'elements', icon: Layers, label: 'Elements' },
    { id: 'audio', icon: Music, label: 'Audio' },
  ];

  const applyTemplate = (template) => {
      // Clear existing layers or append? Let's clear for now to show power
      if (window.confirm("Replace current project with template?")) {
          // Fix layer IDs to be unique
          const newLayers = template.layers.map(l => ({
              ...l,
              id: Math.random().toString(36).substr(2, 9),
              start: 0,
              end: 5, // Default 5s
              trimStart: 0
          }));
          setLayers(newLayers);
          updateCanvasSettings(template.canvas);
          setDuration(5);
      }
  };

  const renderSettings = () => (
      <div>
        <h3>Settings</h3>
        <div className="tool-group">
           <div className="prop-row">
             <span style={{fontSize:12, width:60}}>Size</span>
             <select className="prop-input" value={canvasSettings.width === 1080 && canvasSettings.height === 1920 ? "9:16" : (canvasSettings.width === 1080 ? "1:1" : "16:9")} onChange={(e) => {
                 const v = e.target.value;
                 const s = v === '9:16' ? { width: 1080, height: 1920 } : v === '1:1' ? { width: 1080, height: 1080 } : { width: 1920, height: 1080 };
                 updateCanvasSettings(s);
             }}>
               <option value="16:9">YouTube (16:9)</option>
               <option value="9:16">Story (9:16)</option>
               <option value="1:1">Square (1:1)</option>
             </select>
           </div>
           <div className="prop-row">
             <span style={{fontSize:12, width:60}}>Bg Color</span>
             <input type="color" className="prop-input" style={{height:30, padding:0}} value={canvasSettings.bgColor} onChange={(e) => updateCanvasSettings({ bgColor: e.target.value })} />
           </div>
        </div>
      </div>
  );

  const renderMedia = () => (
      <div>
         <div className="tool-group">
            <h3>Upload Media</h3>
            <label className="tool-btn" style={{justifyContent: 'center', height: '80px', border: '1px dashed #555', flexDirection: 'column', cursor: 'pointer'}}>
                <UploadCloud size={24} color="#7d55ff"/>
                <span style={{fontSize: '12px'}}>Click to Upload</span>
                <input type="file" accept="video/*,image/*" style={{display: 'none'}} onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])} />
            </label>
         </div>
         <div className="tool-group">
            <h3>Project Assets</h3>
            <div className="asset-grid">
                {mediaAssets.filter(a => a.type !== 'audio').map(asset => (
                    <div key={asset.id} className="asset-card" onClick={() => addToTimeline(asset)}>
                        {asset.type === 'video' ? <video src={asset.src} /> : <img src={asset.src} alt={asset.name} />}
                        <div className="asset-label">{asset.name}</div>
                    </div>
                ))}
            </div>
         </div>
      </div>
  );

  const renderAudio = () => (
      <div>
         <div className="tool-group">
            <h3>Audio Library</h3>
            <label className="tool-btn" style={{justifyContent: 'center', height: '60px', border: '1px dashed #555', flexDirection: 'column', cursor: 'pointer'}}>
                <UploadCloud size={20} color="#7d55ff"/>
                <span style={{fontSize: '12px'}}>Upload Audio</span>
                <input type="file" accept="audio/*" style={{display: 'none'}} onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0], 'audio')} />
            </label>
         </div>
         <div className="tool-group">
             {mediaAssets.filter(a => a.type === 'audio').map(asset => (
                 <div key={asset.id} className="tool-btn" onClick={() => addToTimeline(asset)}>
                     <Music size={16}/>
                     <span style={{fontSize:12, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{asset.name}</span>
                 </div>
             ))}
         </div>
      </div>
  );

  const renderTemplates = () => (
      <div>
          <h3>Templates</h3>
          <div className="asset-grid">
              {TEMPLATES.map(t => (
                  <div key={t.id} className="asset-card" style={{height:100, display:'flex', alignItems:'center', justifyContent:'center', background:'#333', flexDirection:'column'}} onClick={() => applyTemplate(t)}>
                      <LayoutTemplate size={24} style={{marginBottom:8}}/>
                      <div className="asset-label">{t.name}</div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderElements = () => (
    <div>
        <h3>Claymorphism Shapes</h3>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom: 20}}>
            {SHAPES.map(s => (
                <div key={s.id} className="asset-card" style={{height:80, display:'flex', alignItems:'center', justifyContent:'center', background:'#222'}}
                     onClick={() => addLayer('shape', s.name, s)}>
                     {s.shape === 'rect' ? <Square size={24} fill={s.fill}/> : <Circle size={24} fill={s.fill}/>}
                </div>
            ))}
        </div>

        <h3>Basic Shapes</h3>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            <button className="tool-btn" onClick={() => addLayer('shape', 'Rect', { shape: 'rect', fill:'#ffffff', width:100, height:100 })}><Square size={16}/> Rect</button>
            <button className="tool-btn" onClick={() => addLayer('shape', 'Circle', { shape: 'circle', fill:'#ffffff', width:100, height:100 })}><Circle size={16}/> Circle</button>
        </div>
    </div>
  );

  const renderText = () => (
      <div>
          <h3>Add Text</h3>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {TEXT_PRESETS.map((p, i) => (
                  <button key={i} className="tool-btn" onClick={() => addLayer('text', p.name, p)}>
                      <Type size={16}/> <span style={{fontFamily: p.fontFamily, fontWeight: p.fontWeight}}>{p.name}</span>
                  </button>
              ))}
          </div>
      </div>
  );

  const renderSubtitles = () => (
      <div>
          <h3>Subtitles</h3>
          <button className="tool-btn" onClick={() => addLayer('subtitle', 'New Subtitle', { fontSize: 30, fill: 'white', y: canvasSettings.height - 100 })}>
             <Subtitles size={16}/> Manual Entry
          </button>

          <div style={{marginTop: 20, padding: 15, background: '#222', borderRadius: 8, textAlign: 'center'}}>
              <div style={{fontWeight: 'bold', marginBottom: 5}}>AI Auto-Captions</div>
              <div style={{fontSize: 12, color: '#666', marginBottom: 10}}>Generate captions automatically</div>
              <button className="tool-btn" disabled style={{opacity: 0.5, cursor: 'not-allowed', justifyContent: 'center'}}>
                 Coming Soon
              </button>
          </div>
      </div>
  );

  const tabs = {
      settings: renderSettings,
      media: renderMedia,
      elements: renderElements,
      text: renderText,
      audio: renderAudio,
      templates: renderTemplates,
      subtitles: renderSubtitles
  };

  return (
    <>
      <div className="sidebar">
        {navItems.map(item => (
            <div key={item.id} onClick={() => setActiveTab(activeTab === item.id ? null : item.id)} className={`nav-item ${activeTab===item.id?'active':''}`}>
                <item.icon size={20}/><span>{item.label}</span>
            </div>
        ))}
      </div>

      {activeTab && (
        <div className="drawer">
            {tabs[activeTab] ? tabs[activeTab]() : <div style={{color:'#888', padding:20}}>Tool coming soon...</div>}

            {/* PROPERTIES PANEL */}
            {selectedLayer && (
                <div style={{marginTop: 'auto', borderTop: '1px solid #333', paddingTop: 20}}>
                    <div className="prop-row"><span style={{fontSize:12, color:'#888'}}>Selected: {selectedLayer.type}</span></div>

                    {(selectedLayer.type === 'text' || selectedLayer.content) && (
                        <div className="tool-group">
                            <div style={{fontSize:12, marginBottom:4}}>Content</div>
                            <textarea className="prop-input" value={selectedLayer.content || selectedLayer.text || ''} onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value, text: e.target.value })} />
                        </div>
                    )}

                    {(selectedLayer.type === 'shape' || selectedLayer.type === 'text') && (
                        <div className="prop-row">
                            <span style={{fontSize:12, width:40}}>Color</span>
                            <input type="color" className="prop-input" style={{height:30, padding:0}} value={selectedLayer.fill || '#ffffff'} onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })} />
                        </div>
                    )}

                    <div className="prop-row">
                         <span style={{fontSize:12, width:40}}>Opacity</span>
                         <input type="range" min="0" max="1" step="0.1" value={selectedLayer.opacity !== undefined ? selectedLayer.opacity : 1} onChange={(e) => updateLayer(selectedLayer.id, { opacity: Number(e.target.value) })} />
                    </div>

                    {selectedLayer.type === 'media' && selectedLayer.subtype === 'video' && (
                         <div className="prop-row">
                             <span style={{fontSize:12, width:40}}>Effect</span>
                             <button style={{background: selectedLayer.filters?.includes('vhs') ? '#7d55ff' : '#333', border:'none', padding:'4px 8px', color:'white', borderRadius:4, fontSize:10, cursor:'pointer'}}
                                     onClick={() => {
                                         const hasVhs = selectedLayer.filters?.includes('vhs');
                                         updateLayer(selectedLayer.id, { filters: hasVhs ? [] : ['vhs'] });
                                     }}>
                                 VHS Mode
                             </button>
                         </div>
                    )}

                    <button className="tool-btn" style={{color: '#ff4d4d', borderColor: '#ff4d4d'}} onClick={() => deleteLayer(selectedLayer.id)}><Trash2 size={16}/> Delete</button>
                </div>
            )}
        </div>
      )}
    </>
  );
};
