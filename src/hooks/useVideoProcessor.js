import { useState, useEffect, useCallback } from 'react';
import { triggerAI, getProject } from '../services/api';

export const useVideoProcessor = (projectId) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [projectData, setProjectData] = useState(null);

  // Poll for updates when processing is true
  useEffect(() => {
    let interval;
    if (processing && projectId) {
      interval = setInterval(async () => {
        try {
          const data = await getProject(projectId);
          
          // check flags based on what we are waiting for
          // Assuming the backend sets is_transcribing = False when done
          if (!data.is_transcribing && !data.is_cleaning_audio) {
             setProcessing(false);
             setProjectData(data); // Update local state with new subtitles/files
          }
        } catch (err) {
          console.error("Polling error", err);
          setError(err);
        }
      }, 2000); // Poll every 2 seconds
    }
    return () => clearInterval(interval);
  }, [processing, projectId]);

  const runTranscribe = useCallback(async () => {
    if (!projectId) return;
    setProcessing(true);
    try {
      await triggerAI(projectId, 'transcribe');
      // Processing state stays true until polling (useEffect) detects completion
    } catch (err) {
      setProcessing(false);
      setError(err.message);
    }
  }, [projectId]);

  const runMagicCut = useCallback(async () => {
    if (!projectId) return;
    setProcessing(true);
    try {
      await triggerAI(projectId, 'magic_cut');
    } catch (err) {
      setProcessing(false);
      setError(err.message);
    }
  }, [projectId]);

  return {
    processing,
    error,
    projectData,
    runTranscribe,
    runMagicCut
  };
};