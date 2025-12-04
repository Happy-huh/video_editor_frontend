import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MainSequence"
        component={VideoComposition}
        durationInFrames={300} // This is a default. Overridden by inputProps if passed.
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          layers: []
        }}
      />
    </>
  );
};