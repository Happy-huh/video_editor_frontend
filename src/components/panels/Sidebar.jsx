import React, { useState } from 'react';
import { useEditor } from '../../store/EditorContext';
import { Settings, Image as ImageIcon, LayoutTemplate, Subtitles, Type, Layers, Music, UploadCloud, Square, Circle } from 'lucide-react';
import { Trash2 } from 'lucide-react';

export const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const {
      handleUpload, layers, selectedLayerId, updateLayer, addLayer, deleteLayer,
      mediaAssets, addToTimeline, canvasSettings, updateCanvasSettings
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
                {mediaAssets.map(asset => (
                    <div key={asset.id} className="asset-card" onClick={() => addToTimeline(asset)}>
                        {asset.type === 'video' ? <video src={asset.src} /> : <img src={asset.src} alt={asset.name} />}
                        <div className="asset-label">{asset.name}</div>
                    </div>
                ))}
            </div>
         </div>
      </div>
  );

  const renderElements = () => (
    <div>
        <h3>Shapes</h3>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            <button className="tool-btn" onClick={() => addLayer('shape', 'Rect', { shape: 'rect', fill:'#ffffff', width:100, height:100 })}><Square size={16}/> Rect</button>
            <button className="tool-btn" onClick={() => addLayer('shape', 'Circle', { shape: 'circle', fill:'#ffffff', width:100, height:100 })}><Circle size={16}/> Circle</button>
        </div>
    </div>
  );

  const renderText = () => (
      <div>
          <h3>Add Text</h3>
          <button className="tool-btn" onClick={() => addLayer('text', 'Headline', { fontSize: 80, fill: 'white', fontWeight: 'bold' })}><Type size={16}/> Headline</button>
          <button className="tool-btn" onClick={() => addLayer('text', 'Subtitle', { fontSize: 40, fill: 'white' })}><AlignLeft size={16}/> Subtitle</button>
      </div>
  );

  const tabs = {
      settings: renderSettings,
      media: renderMedia,
      elements: renderElements,
      text: renderText
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

                    <button className="tool-btn" style={{color: '#ff4d4d', borderColor: '#ff4d4d'}} onClick={() => deleteLayer(selectedLayer.id)}><Trash2 size={16}/> Delete</button>
                </div>
            )}
        </div>
      )}
    </>
  );
};
