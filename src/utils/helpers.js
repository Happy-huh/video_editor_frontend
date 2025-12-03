export const generateId = () => Math.random().toString(36).substr(2, 9);
export const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
