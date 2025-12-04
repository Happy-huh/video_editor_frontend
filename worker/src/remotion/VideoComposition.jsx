import React from 'react';
import { AbsoluteFill, Sequence, Video, Img, useVideoConfig } from 'remotion';

export const VideoComposition = ({ layers }) => {
  const { fps } = useVideoConfig();

  if (!layers || layers.length === 0) {
    return <AbsoluteFill style={{ backgroundColor: 'black' }} />;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {layers.map((layer) => {
        // 1. CONVERT SECONDS TO FRAMES
        const startFrame = Math.round((layer.start || 0) * fps);
        const endFrame = Math.round((layer.end || 0) * fps);
        const durationInFrames = endFrame - startFrame;

        if (durationInFrames <= 0) return null;

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
              {layer.type === 'element' && layer.subtype !== 'image' && (
                 <div style={{ ...layer.style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {layer.content || layer.text || layer.subtype}
                 </div>
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
