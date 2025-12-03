import React, { useState } from 'react';
import { useEditor } from '../../store/EditorContext';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Loader2, X } from 'lucide-react';

export const ExportModal = ({ isOpen, onClose }) => {
  const { stageRef, duration, setCurrentTime, layers } = useEditor();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const waitForVideoSeek = async (videoNode, time) => {
     return new Promise(resolve => {
         const video = videoNode.getAttr('videoElement');
         if (!video) {
             resolve();
             return;
         }

         const onSeeked = () => {
             video.removeEventListener('seeked', onSeeked);
             resolve();
         };

         // If already close enough, resolve immediately
         if (Math.abs(video.currentTime - time) < 0.1 && video.readyState >= 2) {
             resolve();
             return;
         }

         video.addEventListener('seeked', onSeeked);
         video.currentTime = time;
     });
  };

  const handleExport = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = new FFmpeg();
      setStatus('Loading FFmpeg Core...');

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setStatus('Initializing Capture...');
      const fps = 30;
      const totalFrames = Math.ceil(duration * fps);
      const stage = stageRef.current;

      if (!stage) throw new Error("Stage not initialized");

      // --- PHASE 1: VIDEO RENDERING ---
      const videoNodes = stage.find('.video-layer');
      console.log(`Found ${videoNodes.length} video layers to sync.`);

      for (let i = 0; i < totalFrames; i++) {
         const time = i / fps;

         // 1. Update Global Time (Updates Text/Shapes position)
         setCurrentTime(time);

         // 2. Manually sync video elements
         const seekPromises = videoNodes.map(node => {
             const layerId = node.id();
             const layer = layers.find(l => l.id === layerId);

             if (!layer) return Promise.resolve();

             // Check if video is active at this time
             if (time >= layer.start && time < layer.end) {
                 const relativeTime = (time - layer.start) + layer.trimStart;
                 return waitForVideoSeek(node, relativeTime);
             } else {
                 return Promise.resolve();
             }
         });

         await Promise.all(seekPromises);

         // 3. Render Stage
         stage.getLayers().forEach(l => l.draw());

         // 4. Capture Frame
         const dataURL = stage.toDataURL({ pixelRatio: 2 });
         const data = await fetchFile(dataURL);
         const frameName = `frame-${String(i).padStart(4, '0')}.png`;
         await ffmpeg.writeFile(frameName, data);

         const pct = Math.round((i / totalFrames) * 80); // Video is 80% of work
         setProgress(pct);
         setStatus(`Rendering visual frame ${i}/${totalFrames}`);

         await new Promise(r => setTimeout(r, 0));
      }

      // --- PHASE 2: AUDIO PROCESSING ---
      setStatus('Processing Audio...');
      const audioLayers = layers.filter(l => (l.type === 'audio' || l.type === 'media') && !l.muted);
      let audioInputs = [];
      let filterComplex = '';

      if (audioLayers.length > 0) {
          // Write all audio source files to ffmpeg virtual fs
          for (let i = 0; i < audioLayers.length; i++) {
              const layer = audioLayers[i];
              const fileName = `audio_${i}.${layer.type === 'video' || layer.subtype === 'video' ? 'mp4' : 'mp3'}`;
              await ffmpeg.writeFile(fileName, await fetchFile(layer.src));
              audioInputs.push(`-i ${fileName}`);

              // Calculate delays and trims
              // [0:a]atrim=start=0:end=5,adelay=1000|1000[a0];
              // Note: adelay is in milliseconds
              const startDelay = Math.round(layer.start * 1000);
              const trimStart = layer.trimStart;
              const duration = layer.end - layer.start;
              const trimEnd = trimStart + duration;

              filterComplex += `[${i}:a]atrim=start=${trimStart}:end=${trimEnd},asetpts=PTS-STARTPTS,adelay=${startDelay}|${startDelay}[a${i}];`;
          }

          // Mix all streams
          // [a0][a1]amix=inputs=2[outa]
          const mixInputs = audioLayers.map((_, i) => `[a${i}]`).join('');
          filterComplex += `${mixInputs}amix=inputs=${audioLayers.length}:duration=first:dropout_transition=0[outa]`;
      }

      // --- PHASE 3: ENCODING ---
      setStatus('Encoding Final Output...');

      const ffmpegArgs = [
          '-framerate', String(fps),
          '-pattern_type', 'glob',
          '-i', 'frame-*.png'
      ];

      // Add audio inputs if any
      if (audioLayers.length > 0) {
          // Parse manual inputs string
          const inputArgs = audioInputs.map(i => i.split(' ')).flat();
          ffmpegArgs.push(...inputArgs);

          ffmpegArgs.push('-filter_complex', filterComplex, '-map', '0:v', '-map', '[outa]');
      } else {
          // No audio
          ffmpegArgs.push('-map', '0:v');
      }

      ffmpegArgs.push(
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          '-shortest', // Stop when shortest stream ends (video usually)
          'output.mp4'
      );

      // Clean up inputs string for exec
      const finalArgs = ffmpegArgs.flat().filter(arg => arg && arg.trim() !== '');
      console.log('FFmpeg Args:', finalArgs);

      await ffmpeg.exec(finalArgs);

      setStatus('Finalizing...');
      const data = await ffmpeg.readFile('output.mp4');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

      // Trigger Download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported_video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setProgress(100);
      setStatus('Export Complete!');

      setTimeout(() => {
          setIsProcessing(false);
          onClose();
      }, 2000);

    } catch (e) {
      console.error(e);
      setStatus('Error: ' + e.message);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div className="modal-content" style={{background:'#1f1f1f', padding:24, borderRadius:12, width:420, color:'white', border:'1px solid #333', boxShadow:'0 20px 50px rgba(0,0,0,0.5)'}}>
         <div style={{display:'flex', justifyContent:'space-between', marginBottom:24, alignItems:'center'}}>
            <h3 style={{margin:0, fontSize:18}}>Export Video</h3>
            {!isProcessing && <button onClick={onClose} style={{background:'none', border:'none', color:'#aaa', cursor:'pointer'}}><X size={20}/></button>}
         </div>

         {isProcessing ? (
             <div style={{textAlign:'center', padding:'20px 0'}}>
                 <Loader2 className="animate-spin" size={32} style={{margin:'0 auto 16px', color:'#7d55ff'}}/>
                 <div style={{marginBottom:12, fontWeight:500}}>{status}</div>
                 <div style={{height:6, background:'#333', marginTop:16, borderRadius:3, overflow:'hidden'}}>
                     <div style={{width:`${progress}%`, height:'100%', background:'#7d55ff', transition:'width 0.2s'}}></div>
                 </div>
                 <div style={{fontSize:12, color:'#666', marginTop:8}}>{progress}%</div>
             </div>
         ) : (
             <div>
                 <div style={{background:'#111', padding:16, borderRadius:8, marginBottom:20, fontSize:13, color:'#aaa', border:'1px solid #333'}}>
                    <p style={{margin:0, marginBottom:8}}><strong>Settings:</strong> MP4 • 30 FPS • H.264</p>
                    <p style={{margin:0}}>Includes all audio tracks and visual effects. Processing is done locally.</p>
                 </div>
                 <button className="btn-primary" onClick={handleExport} style={{width:'100%', background:'#7d55ff', color:'white', padding:'12px', border:'none', borderRadius:6, cursor:'pointer', fontWeight:'bold', fontSize:14}}>
                    Start Render
                 </button>
             </div>
         )}
      </div>
    </div>
  );
};
