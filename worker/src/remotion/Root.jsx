import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MainSequence"
        component={VideoComposition}
        durationInFrames={300} // Default duration, overridden by renderMedia
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ layers: [] }}
        calculateMetadata={async ({ props }) => {
            const durationInFrames = props.durationInFrames || 300;
            return {
                durationInFrames,
                props
            }
        }}
      />
    </>
  );
};
