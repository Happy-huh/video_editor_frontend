import React from 'react';
import { AbsoluteFill, Sequence, Video, Img } from 'remotion';

export const VideoComposition = ({ layers }) => {
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
        // Default to full duration if not specified
        const from = layer.startFrame || 0;
        const duration = layer.durationInFrames || 100; // Default fallback

        return (
          <Sequence key={layer.id} from={from} durationInFrames={duration}>
            <AbsoluteFill>
              {layer.type === 'video' && (
                <Video
                  src={layer.src}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              {layer.type === 'image' && (
                <Img
                  src={layer.src}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              {layer.type === 'text' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%',
                  color: layer.color || 'white',
                  fontSize: layer.fontSize || 50,
                  fontFamily: 'sans-serif',
                  ...layer.style
                }}>
                  {layer.text}
                </div>
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
