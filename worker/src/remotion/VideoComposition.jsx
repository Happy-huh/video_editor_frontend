import React from 'react';
import { AbsoluteFill, Sequence, Video, Img, useVideoConfig } from 'remotion';

export const VideoComposition = ({ layers }) => {
  const { fps } = useVideoConfig();

  if (!layers || layers.length === 0) {
    return (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
        <h1 style={{ color: 'white', fontFamily: 'sans-serif' }}>No Layers Provided</h1>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {layers.map((layer) => {
        // 1. CALCULATE TIMING (Seconds -> Frames)
        // Default to 0 if start/end are missing
        const startFrame = Math.round((layer.start || 0) * fps);
        const endFrame = Math.round((layer.end || 0) * fps);
        const durationInFrames = endFrame - startFrame;

        // Safety check: prevent negative or zero duration
        if (durationInFrames <= 0) return null;

        return (
          <Sequence key={layer.id} from={startFrame} durationInFrames={durationInFrames}>
            <AbsoluteFill>
              {/* 2. HANDLE MEDIA LAYERS (Video/Image) */}
              {layer.type === 'media' && layer.subtype === 'video' && (
                <Video
                  src={layer.src}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', ...layer.style }}
                />
              )}
              
              {(layer.type === 'media' && layer.subtype === 'image') || (layer.type === 'element' && layer.subtype === 'image') && (
                <Img
                  src={layer.src}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', ...layer.style }}
                />
              )}

              {/* 3. HANDLE TEXT LAYERS */}
              {layer.type === 'text' && (
                <div style={{
                  position: 'absolute',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  // Frontend sends styles like 'top', 'left', 'fontSize' in layer.style
                  ...layer.style 
                }}>
                  {layer.content}
                </div>
              )}

              {/* 4. HANDLE CLAY/ELEMENT LAYERS (Basic Fallback) */}
              {(layer.type === 'element' && layer.subtype !== 'image') && (
                 <div style={{...layer.style, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    {/* For now, just render the text representation if specific Clay components aren't imported yet */}
                    {layer.text || layer.content || layer.subtype} 
                 </div>
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};