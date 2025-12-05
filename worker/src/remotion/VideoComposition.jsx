import React from 'react';
import { AbsoluteFill, Sequence, Video, Img, useVideoConfig, useCurrentFrame } from 'remotion';
import {
  Play, Pause, Type, Video as VideoIcon, Music, Scissors,
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

  /* ANIMATIONS */
  @keyframes slideInLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes lowerThirdBar { 0% { width: 0; } 100% { width: 100%; } }
  @keyframes textReveal { 0% { clip-path: inset(0 100% 0 0); } 100% { clip-path: inset(0 0 0 0); } }
  @keyframes health-drain { 0% { width: 100%; } 50% { width: 60%; } 100% { width: 30%; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  /* MOTION CLASSES */
  .motion-enter-slide-left { animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .motion-lower-third-bar { animation: lowerThirdBar 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .motion-text-reveal { animation: textReveal 0.8s 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; clip-path: inset(0 100% 0 0); }
  .motion-health-anim { animation: health-drain 5s linear infinite alternate; }
  .animate-spin { animation: spin 1s linear infinite; }

  /* OVERLAYS */
  .overlay-vhs { background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 2px, 3px 100%; pointer-events: none; mix-blend-mode: overlay; }
`;

const getClayStyle = (bg = '#333', color = '#fff', radius = '16px') => ({
    background: bg, color: color, borderRadius: radius,
    boxShadow: 'var(--clay-shadow)',
    borderTop: '1px solid rgba(255,255,255,0.2)', borderLeft: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(5px)',
});

const iconMap = { 'Youtube': Youtube, 'Instagram': Instagram, 'Facebook': Facebook, 'Twitter': Twitter, 'Check': Check, 'Message': MessageCircle, 'Star': Star, 'Music': Music, 'Zap': Zap, 'Bell': Bell, 'ShoppingBag': ShoppingBag };

// Helper component for Stopwatch to use hooks safely
const Stopwatch = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // frame is relative to the Sequence start, so it represents duration active
    const timeInSeconds = frame / fps;

    const totalSeconds = Math.floor(timeInSeconds);
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    const millis = Math.floor((timeInSeconds % 1) * 100).toString().padStart(2, '0');

    return <>{`${mins}:${secs}.${millis}`}</>;
};

export const VideoComposition = ({ layers }) => {
  const { fps } = useVideoConfig();

  if (!layers || layers.length === 0) {
    return <AbsoluteFill style={{ backgroundColor: 'black' }} />;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <style>{styles}</style>
      {layers.map((layer) => {
        // 1. CONVERT SECONDS TO FRAMES
        const startFrame = Math.round((layer.start || 0) * fps);
        const endFrame = Math.round((layer.end || 0) * fps);
        const durationInFrames = endFrame - startFrame;

        if (durationInFrames <= 0) return null;

        const IconComp = layer.iconName ? iconMap[layer.iconName] : (layer.icon ? iconMap[layer.icon] : null);

        return (
          <Sequence key={layer.id} from={startFrame} durationInFrames={durationInFrames}>
            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>

              {/* MEDIA HANDLING (Video/Image) */}
              {layer.type === 'media' && layer.subtype === 'video' && (
                <Video src={layer.src} style={{ width: '100%', height: '100%', objectFit: 'contain', ...layer.style }} />
              )}
              {(layer.subtype === 'image') && (
                <Img src={layer.src} style={{ width: '100%', height: '100%', objectFit: 'contain', ...layer.style }} />
              )}

              {/* TEXT HANDLING */}
              {layer.type === 'text' && (
                <div style={{ ...layer.style, position: 'absolute' }}>
                  {layer.content || layer.text}
                </div>
              )}

              {/* GENERIC ELEMENT HANDLING */}
              {layer.type === 'element' && (
                 <div style={{ position: 'absolute', left: layer.style.left, top: layer.style.top, transform: 'translate(-50%, -50%)', ...layer.style, left: undefined, top: undefined }}>
                    {/* CLASSIC RENDERERS */}
                    {layer.subtype === 'motion-lower-third' && <div style={{width:'100%', height:'100%', position:'relative'}}><div className="motion-lower-third-bar" style={{height:'100%', background:'rgba(0,0,0,0.8)', borderLeft:'4px solid var(--accent)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 20px', overflow:'hidden'}}><div className="motion-text-reveal" style={{fontSize:'24px', fontWeight:'bold', color:'white', whiteSpace:'nowrap'}}>{layer.primaryText}</div><div className="motion-text-reveal" style={{fontSize:'16px', color:'var(--accent)', animationDelay:'0.5s', whiteSpace:'nowrap'}}>{layer.secondaryText}</div></div></div>}
                    {layer.subtype === 'motion-lower-third-corp' && <div style={{width:'100%', height:'100%', position:'relative'}}><div className="motion-enter-slide-left" style={{height:'100%', background:'white', display:'flex', alignItems:'center', padding:'0 20px', borderBottom:'4px solid var(--accent)', color:'black'}}><div style={{fontWeight:'bold', fontSize:'24px', marginRight:'10px'}}>{layer.primaryText}</div><div style={{width:1, height:20, background:'#ccc', marginRight:'10px'}}></div><div style={{color:'#666'}}>{layer.secondaryText}</div></div></div>}
                    {layer.subtype === 'motion-lower-third-neon' && <div style={{width:'100%', height:'100%', position:'relative'}}><div className="motion-enter-slide-left" style={{height:'100%', background:'linear-gradient(90deg, #7d55ff 0%, #000 100%)', display:'flex', alignItems:'center', padding:'0 20px', clipPath:'polygon(0 0, 90% 0, 100% 100%, 0 100%)'}}><Gamepad2 size={32} color="white" style={{marginRight:10}}/><div><div style={{fontSize:'24px', fontWeight:'900', color:'white', textTransform:'uppercase', fontStyle:'italic', whiteSpace:'nowrap'}}>{layer.primaryText}</div><div style={{fontSize:'12px', color:'white', opacity:0.8, whiteSpace:'nowrap'}}>{layer.secondaryText}</div></div></div></div>}
                    {layer.subtype === 'motion-tweet' && <div style={{width:'100%', height:'100%', background:'white', color:'black', padding:20, borderRadius:12, fontFamily:'sans-serif'}}><div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}><div style={{width:40, height:40, background:'#1DA1F2', borderRadius:'50%'}}></div><div><div style={{fontWeight:'bold'}}>{layer.primaryText}</div><div style={{color:'#666', fontSize:12}}>@username</div></div><Twitter fill="#1DA1F2" color="#1DA1F2" style={{marginLeft:'auto'}}/></div><div style={{fontSize:16}}>{layer.secondaryText}</div></div>}
                    {layer.subtype === 'motion-health-bar' && <div style={{width:'100%', height:'100%', border: '2px solid #444', background:'#222', padding:4, borderRadius:4}}><div className="motion-health-anim" style={{height:'100%', background:'linear-gradient(90deg, #ff4d4d, #ff9e4d)', borderRadius:2}}></div></div>}

                    {layer.subtype === 'overlay-vhs' && <div className="overlay-vhs" style={{width:'100%', height:'100%'}}/>}

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

                    {layer.subtype === 'widget-stopwatch' && (<div style={{fontFamily:'monospace', display:'flex', alignItems:'center', justifyContent:'center', height:'100%', width:'100%'}}><Stopwatch /></div>)}
                    {layer.subtype === 'widget-qr' && <img src={layer.src} alt="qr" style={{width:'100%', height:'100%'}} />}
                    {layer.subtype === 'icon' && IconComp && <IconComp style={{width:'100%', height:'100%', color: layer.style.color}} />}

                    {/* CLAY ELEMENT RENDERERS */}
                    {layer.subtype === 'clay-shape' && <div style={{width:'100%', height:'100%'}}></div>}
                    {layer.subtype === 'clay-emoji' && <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>{layer.content}</div>}
                    {layer.subtype === 'clay-spinner' && <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}><Loader2 className="animate-spin" size={40} color={layer.style.color}/></div>}
                    {layer.subtype === 'clay-icon-float' && IconComp && <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}><IconComp size={40} color={layer.style.color === '#fff' ? 'white' : 'white'}/></div>}

                    {/* Standard Fallbacks */}
                    {layer.subtype === 'image' && <Img src={layer.src} alt="el" style={{width:'100%', height:'100%', objectFit:'contain', borderRadius: layer.style.borderRadius}} />}
                 </div>
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
