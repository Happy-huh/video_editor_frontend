import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Video, Img } from 'remotion';

// Simple text component to replicate your frontend style
const TextLayer = ({ layer }) => (
  <div style={{
    position: 'absolute',
    top: layer.style.top || '50%',
    left: layer.style.left || '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: layer.style.fontSize || 40,
    fontWeight: 'bold',
    color: layer.style.color || 'white',
    fontFamily: 'Inter, sans-serif',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    ...layer.style // Apply any other dynamic styles
  }}>
    {layer.content}
  </div>
);

export const VideoComposition = ({ layers, canvasSettings }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: canvasSettings.bgColor || '#000' }}>
      {layers.map((layer) => {
        // Convert seconds to frames
        const startFrame = Math.round(layer.start * fps);
        const endFrame = Math.round(layer.end * fps);
        const durationInFrames = endFrame - startFrame;

        if (durationInFrames <= 0) return null;

        return (
          <Sequence key={layer.id} from={startFrame} durationInFrames={durationInFrames}>
            {/* RENDER LOGIC SWITCH */}
            {layer.type === 'video' && (
              <Video src={layer.src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            )}

            {layer.type === 'image' && (
              <Img src={layer.src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            )}

            {layer.type === 'text' && <TextLayer layer={layer} />}

            {/* Add more layer types (Clay, shapes, etc.) here as needed */}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
