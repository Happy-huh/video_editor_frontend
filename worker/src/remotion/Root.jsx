import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MainSequence"
        component={VideoComposition}
        // These are default props; they will be overwritten by the JSON payload
        defaultProps={{
          layers: [],
          canvasSettings: { width: 1920, height: 1080, bgColor: '#000' },
        }}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={300} // Default 10s
      />
    </>
  );
};
