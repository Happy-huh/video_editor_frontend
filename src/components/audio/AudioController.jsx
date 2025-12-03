import React, { useEffect, useRef } from 'react';
import { useEditor } from '../../store/EditorContext';

export const AudioController = () => {
  const { layers, currentTime, isPlaying, trackSettings } = useEditor();
  const audioSourcesRef = useRef({}); // Map layerId -> HTMLAudioElement

  useEffect(() => {
    // Sync audio elements
    const audioLayers = layers.filter(l => (l.type === 'audio' || l.type === 'media')); // Media also has audio

    // Cleanup removed layers
    Object.keys(audioSourcesRef.current).forEach(id => {
        if (!audioLayers.find(l => l.id === id)) {
            const el = audioSourcesRef.current[id];
            el.pause();
            el.src = "";
            delete audioSourcesRef.current[id];
        }
    });

    audioLayers.forEach(layer => {
        // Skip if muted globally or locally (to be implemented)
        const isMuted = trackSettings[layer.type === 'media' ? 'media' : 'audio']?.muted;

        if (!audioSourcesRef.current[layer.id]) {
            const audio = new Audio(layer.src);
            audio.preload = 'auto';
            audioSourcesRef.current[layer.id] = audio;
        }

        const audio = audioSourcesRef.current[layer.id];
        audio.muted = isMuted; // Sync mute state

        // Calculate relative time
        const relativeTime = (currentTime - layer.start) + layer.trimStart;

        // Check if active
        if (currentTime >= layer.start && currentTime < layer.end) {
            if (Math.abs(audio.currentTime - relativeTime) > 0.3) {
                audio.currentTime = relativeTime;
            }
            if (isPlaying && audio.paused) {
                audio.play().catch(e => console.warn("Audio play failed", e));
            } else if (!isPlaying && !audio.paused) {
                audio.pause();
            }
        } else {
            if (!audio.paused) audio.pause();
        }
    });
  }, [layers, currentTime, isPlaying, trackSettings]);

  return null; // Invisible component
};
