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

      // Find all Konva nodes that are wrapping videos
      // We look for nodes with name 'video-layer' which we added in EditorCanvas
      const videoNodes = stage.find('.video-layer');

      console.log(`Found ${videoNodes.length} video layers to sync.`);

      for (let i = 0; i < totalFrames; i++) {
         const time = i / fps;

         // 1. Update Global Time (Updates Text/Shapes position)
         setCurrentTime(time);

         // 2. Manually sync video elements
         // We must wait for them to seek to the exact frame time
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
         // Force a redraw of the Konva layer to ensure the video texture is updated
         stage.getLayers().forEach(l => l.draw());

         // 4. Capture Frame
         const dataURL = stage.toDataURL({ pixelRatio: 2 }); // 2x for better quality
         const data = await fetchFile(dataURL);
         const frameName = `frame-${String(i).padStart(4, '0')}.png`;
         await ffmpeg.writeFile(frameName, data);

         const pct = Math.round((i / totalFrames) * 100);
         setProgress(pct);
         setStatus(`Rendering frame ${i}/${totalFrames}`);

         // Small delay to allow UI to update
         await new Promise(r => setTimeout(r, 0));
      }

      setStatus('Encoding MP4...');

      // -r 30: Output framerate
      // -pix_fmt yuv420p: Ensure compatibility with all players
      await ffmpeg.exec([
          '-framerate', String(fps),
          '-pattern_type', 'glob',
          '-i', 'frame-*.png',
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          'output.mp4'
      ]);

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
          // Cleanup files to free memory
          // ffmpeg.deleteFile('output.mp4');
          // ffmpeg.deleteFile('frame-*.png');
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
                    <p style={{margin:0}}>This process runs entirely in your browser. It may take a minute for longer videos.</p>
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
