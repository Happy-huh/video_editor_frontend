import React, { useState } from 'react';
import { useEditor } from '../../store/EditorContext';
import { Play, Pause, Magnet, AlignLeft, Video, Music, Type, Subtitles, Lock, Unlock, VolumeX, Volume2 } from 'lucide-react';
import { formatTime } from '../../utils/helpers';

// --- STYLES FOR TIMELINE (Inline for simplicity) ---
const styles = {
    container: { background: '#0f0f0f', display: 'flex', flexDirection: 'column', height: '100%', borderTop: '1px solid #333' },
    toolbar: { height: 40, borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, background: '#151515' },
    trackContainer: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' },
    trackHeader: { width: 160, borderRight: '1px solid #333', background: '#151515', display: 'flex', flexDirection: 'column', padding: 8, justifyContent: 'center', position: 'sticky', left: 0, zIndex: 20 },
    clipItem: { cursor: 'grab', position: 'absolute', height: '100%', borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }
};

export const Timeline = ({ height }) => {
    const {
        layers, duration, currentTime, setCurrentTime, isPlaying, setIsPlaying,
        updateLayer, selectedLayerId, setSelectedLayerId, trackSettings,
        toggleTrackLock, toggleTrackMute,
        magnetic, setMagnetic, ripple, setRipple
    } = useEditor();

    const [zoom, setZoom] = useState(30);
    const [interaction, setInteraction] = useState(null);

    const getSnapTime = (time, selfId) => {
        if (!magnetic) return time;
        const snapPoints = [0, currentTime, duration];
        layers.forEach(l => { if (l.id !== selfId) { snapPoints.push(l.start, l.end); } });
        const closest = snapPoints.reduce((prev, curr) => Math.abs(curr - time) < Math.abs(prev - time) ? curr : prev);
        return Math.abs(closest - time) < (10 / zoom) ? closest : time;
    };

    const handleMouseDown = (e, id, type, edge) => {
        e.stopPropagation();
        const layer = layers.find(l => l.id === id);
        if (trackSettings[layer.type === 'media' ? 'media' : 'text']?.locked) return;
        setInteraction({ type, id, edge, startX: e.clientX, initialStart: layer.start, initialEnd: layer.end, initialTrim: layer.trimStart || 0 });
        setSelectedLayerId(id);
    };

    const handleMouseMove = (e) => {
        if (!interaction) return;
        const delta = (e.clientX - interaction.startX) / zoom;

        if (interaction.type === 'move') {
            let newStart = Math.max(0, interaction.initialStart + delta);
            newStart = getSnapTime(newStart, interaction.id);
            const dur = interaction.initialEnd - interaction.initialStart;
            updateLayer(interaction.id, { start: newStart, end: newStart + dur });
        } else if (interaction.type === 'resize') {
            if (interaction.edge === 'left') {
                let newStart = Math.min(interaction.initialEnd - 0.5, Math.max(0, interaction.initialStart + delta));
                newStart = getSnapTime(newStart, interaction.id);
                const diff = newStart - interaction.initialStart;
                updateLayer(interaction.id, { start: newStart, trimStart: interaction.initialTrim + diff });
            } else {
                let newEnd = Math.max(interaction.initialStart + 0.5, interaction.initialEnd + delta);
                newEnd = getSnapTime(newEnd, interaction.id);
                updateLayer(interaction.id, { end: newEnd });
            }
        }
    };

    const renderTrackHeader = (type, title, icon) => {
        const s = trackSettings[type];
        return (
            <div style={{...styles.trackHeader, height: s.height}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, color:'#aaa'}}>
                    <span style={{display:'flex', gap:4}}>{icon} {title}</span>
                    <div style={{display:'flex', gap:4}}>
                        <button onClick={()=>toggleTrackLock(type)} style={{color: s.locked ? 'red' : '#666', background:'none', border:'none', cursor:'pointer'}}>{s.locked?<Lock size={10}/>:<Unlock size={10}/>}</button>
                        <button onClick={()=>toggleTrackMute(type)} style={{color: s.muted ? 'red' : '#666', background:'none', border:'none', cursor:'pointer'}}>{s.muted?<VolumeX size={10}/>:<Volume2 size={10}/>}</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderTrackItems = (type, items) => (
        <div style={{flex: 1, height: trackSettings[type].height, position: 'relative', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #222'}}>
            {items.map(item => {
                const isSelected = selectedLayerId === item.id;
                return (
                    <div key={item.id}
                        onMouseDown={(e) => handleMouseDown(e, item.id, 'move')}
                        style={{
                            ...styles.clipItem,
                            left: `${item.start * zoom}px`,
                            width: `${Math.max(2, (item.end - item.start) * zoom)}px`,
                            background: isSelected ? '#444' : (type === 'media' ? '#2d3a4f' : '#4f2d4b'),
                            borderColor: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                            zIndex: isSelected ? 10 : 1
                        }}
                    >
                         {!trackSettings[type].locked && <div className="clip-handle left" style={{position:'absolute', left:0, width:10, height:'100%', cursor:'ew-resize', zIndex:20}} onMouseDown={(e) => handleMouseDown(e, item.id, 'resize', 'left')} />}
                         <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents:'none', color:'white', marginLeft: 10}}>{item.content || item.subtype}</span>
                         {!trackSettings[type].locked && <div className="clip-handle right" style={{position:'absolute', right:0, width:10, height:'100%', cursor:'ew-resize', zIndex:20}} onMouseDown={(e) => handleMouseDown(e, item.id, 'resize', 'right')} />}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div style={{...styles.container, height}} onMouseMove={handleMouseMove} onMouseUp={() => setInteraction(null)} onMouseLeave={() => setInteraction(null)}>
             <div style={styles.toolbar}>
                 <button onClick={() => setIsPlaying(!isPlaying)} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}>{isPlaying ? <Pause size={18}/> : <Play size={18}/>}</button>
                 <span style={{fontSize:12, fontFamily:'monospace', color:'#aaa', minWidth:80}}>{formatTime(currentTime)}</span>
                 <div style={{width:1, height:20, background:'#333', margin:'0 8px'}}></div>
                 <button onClick={() => setMagnetic(!magnetic)} style={{color: magnetic ? '#7d55ff' : '#666', background:'none', border:'none', cursor:'pointer'}}><Magnet size={16}/></button>
                 <button onClick={() => setRipple(!ripple)} style={{color: ripple ? '#7d55ff' : '#666', background:'none', border:'none', cursor:'pointer'}}><AlignLeft size={16}/></button>
                 <div style={{flex:1}}></div>
                 <input type="range" min="10" max="100" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{width:100, accentColor:'#7d55ff'}}/>
             </div>

             <div style={{flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', minWidth: '100%'}}>
                    <div style={{width: 160, flexShrink: 0, background: '#111', zIndex:30}}>
                        <div style={{height:25, borderBottom:'1px solid #333'}}></div>
                        {renderTrackHeader('media', 'Media', <Video size={10}/>)}
                        {renderTrackHeader('audio', 'Audio', <Music size={10}/>)}
                        {renderTrackHeader('text', 'Text', <Type size={10}/>)}
                        {renderTrackHeader('subtitle', 'Subtitles', <Subtitles size={10}/>)}
                    </div>
                    <div style={{flex: 1, position: 'relative', minWidth: `${Math.max(duration * zoom, 800)}px`}}>
                         {/* Ruler */}
                         <div onClick={(e) => {const rect = e.currentTarget.getBoundingClientRect(); setCurrentTime(Math.max(0, (e.clientX - rect.left) / zoom));}} style={{height: '25px', borderBottom: '1px solid #333', position: 'relative', cursor: 'pointer', background:'#111'}}>
                             {Array.from({ length: Math.ceil(duration + 5) }).map((_, i) => (
                                 <div key={i} style={{position: 'absolute', left: `${i * zoom}px`, fontSize: '9px', color: '#555', top: '6px', userSelect:'none', pointerEvents:'none'}}>
                                     {i % 5 === 0 ? formatTime(i) : '|'}
                                 </div>
                             ))}
                         </div>

                         {/* Playhead */}
                         <div style={{position: 'absolute', top: 0, bottom: 0, left: `${currentTime * zoom}px`, width: '1px', background: '#ff4d4d', zIndex: 50, pointerEvents: 'none'}}>
                             <div style={{width: 11, height: 11, background: '#ff4d4d', position: 'absolute', top: 0, left: -5, transform: 'rotate(45deg)'}}></div>
                         </div>

                         {renderTrackItems('media', layers.filter(l => l.type === 'media'))}
                         {renderTrackItems('audio', layers.filter(l => l.type === 'audio'))}
                         {renderTrackItems('text', layers.filter(l => l.type === 'text' || l.type === 'element' || l.type === 'shape'))}
                         {renderTrackItems('subtitle', layers.filter(l => l.type === 'subtitle'))}
                    </div>
                </div>
             </div>
        </div>
    );
};
