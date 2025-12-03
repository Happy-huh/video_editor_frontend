// Claymorphism & Modern Assets Library

export const SHAPES = [
    {
        id: 'clay-rect',
        name: 'Clay Rect',
        type: 'shape',
        shape: 'rect',
        width: 200,
        height: 200,
        fill: '#ffffff',
        cornerRadius: 20,
        shadowColor: '#000',
        shadowBlur: 20,
        shadowOffset: { x: 10, y: 10 },
        shadowOpacity: 0.2
    },
    {
        id: 'clay-circle',
        name: 'Clay Circle',
        type: 'shape',
        shape: 'circle',
        width: 200,
        height: 200,
        fill: '#7d55ff',
        shadowColor: '#000',
        shadowBlur: 20,
        shadowOffset: { x: 10, y: 10 },
        shadowOpacity: 0.3
    }
];

export const TEMPLATES = [
    {
        id: 'social-story',
        name: 'Social Story',
        description: '9:16 Layout with animated text',
        layers: [
             { type: 'shape', shape: 'rect', fill: '#FF5733', width: 1080, height: 1920, x: 0, y: 0, opacity: 0.2 },
             { type: 'text', content: 'NEW POST', fontSize: 100, fill: 'white', x: 540, y: 800 }
        ],
        canvas: { width: 1080, height: 1920 }
    },
    {
        id: 'youtube-intro',
        name: 'YT Intro',
        description: '16:9 Intro with Clay elements',
        layers: [
            { type: 'shape', shape: 'circle', fill: '#7d55ff', width: 400, height: 400, x: 960, y: 540, shadowBlur: 30, shadowOffset: {x:15, y:15}, opacity: 0.8 },
            { type: 'text', content: 'WELCOME', fontSize: 120, fill: 'white', x: 960, y: 540, shadowColor: 'black', shadowBlur: 10 }
        ],
        canvas: { width: 1920, height: 1080 }
    }
];

export const TEXT_PRESETS = [
    { name: 'Big Bold', fontSize: 120, fontWeight: '900', fill: 'white', fontFamily: 'Impact' },
    { name: 'Subtitle', fontSize: 40, fontWeight: '400', fill: '#cccccc', fontFamily: 'Arial' },
    { name: 'Neon', fontSize: 80, fill: '#fff', shadowColor: '#0f0', shadowBlur: 20, fontFamily: 'Courier New' }
];
