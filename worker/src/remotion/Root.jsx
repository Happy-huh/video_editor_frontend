import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MainSequence"
        component={VideoComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          layers: [
            {
              id: 'layer-1',
              type: 'text',
              text: 'Welcome to Onera AI',
              startFrame: 0,
              durationInFrames: 150,
              color: 'white'
            },
            {
              id: 'layer-2',
              type: 'text',
              text: 'Rendering Engine',
              startFrame: 150,
              durationInFrames: 150,
              color: '#00e5ff'
            }
          ]
        }}
      />
    </>
  );
};
