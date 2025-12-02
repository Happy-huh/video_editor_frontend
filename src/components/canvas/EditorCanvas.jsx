import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Stage, Layer, Image, Text, Rect, Transformer, Circle } from 'react-konva';
import { useEditor } from '../../store/EditorContext';
import Konva from 'konva';

// --- VIDEO ELEMENT WRAPPER FOR KONVA ---
const VideoObj = ({ layer, isPlaying, currentTime, isSelected, onSelect, onChange }) => {
  const imageRef = useRef(null);
  const videoElement = useMemo(() => {
    const el = document.createElement('video');
    el.src = layer.src;
    el.crossOrigin = 'anonymous';
    // important for seeking performance
    el.preload = 'auto';
    return el;
  }, [layer.src]);

  // Expose video element on the Konva Node for the Exporter to find
  useEffect(() => {
    if (imageRef.current) {
        imageRef.current.setAttr('videoElement', videoElement);
        imageRef.current.setAttr('sourceLayerId', layer.id);
    }
  }, [videoElement, layer.id]);

  useEffect(() => {
    // Sync video time
    // Logic: calculate local time relative to layer start
    const relativeTime = (currentTime - layer.start) + layer.trimStart;

    // We only control playback here if NOT exporting.
    // During export, the Exporter manually seeks.
    if (currentTime >= layer.start && currentTime < layer.end) {
        // Only sync if significant drift or seek happened
        if (Math.abs(videoElement.currentTime - relativeTime) > 0.2) {
            videoElement.currentTime = relativeTime;
        }

        if (isPlaying && videoElement.paused) {
             videoElement.play().catch(() => {});
        } else if (!isPlaying && !videoElement.paused) {
             videoElement.pause();
        }
    } else {
        if (!videoElement.paused) videoElement.pause();
    }
  }, [currentTime, isPlaying, layer.start, layer.end, layer.trimStart]);

  // Force redraw Konva layer on video update
  useEffect(() => {
    let anim;
    const update = () => {
        if (imageRef.current) {
            imageRef.current.getLayer().batchDraw();
        }
    };

    if (isPlaying) {
        anim = new Konva.Animation(update, [imageRef.current.getLayer()]);
        anim.start();
    } else {
        // One manual update when paused (seeking)
        update();
    }
    return () => { if(anim) anim.stop(); };
  }, [isPlaying, videoElement]);

  // Update duration in store once metadata loads
  const { updateClipDuration } = useEditor();
  useEffect(() => {
      const handleMeta = () => updateClipDuration(layer.id, videoElement.duration);
      videoElement.addEventListener('loadedmetadata', handleMeta);
      return () => videoElement.removeEventListener('loadedmetadata', handleMeta);
  }, [videoElement, layer.id, updateClipDuration]);

  const trRef = useRef();
  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Don't render if outside timeline range
  if (currentTime < layer.start || currentTime >= layer.end) return null;

  return (
    <>
      <Image
        ref={imageRef}
        image={videoElement}
        name="video-layer" // Tag for selector
        id={layer.id}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        rotation={layer.rotation}
        scaleX={layer.scaleX}
        scaleY={layer.scaleY}
        offsetX={layer.width/2}
        offsetY={layer.height/2}
        opacity={layer.opacity}
        draggable={isSelected}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = imageRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};

// --- IMAGE ELEMENT WRAPPER ---
const ImageObj = ({ layer, isSelected, onSelect, onChange, currentTime }) => {
  const [image] = useState(new window.Image());
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    image.src = layer.src;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
       if (shapeRef.current) shapeRef.current.getLayer().batchDraw();
    }
  }, [layer.src]);

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  if (currentTime < layer.start || currentTime >= layer.end) return null;

  return (
    <>
      <Image
        ref={shapeRef}
        image={image}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        rotation={layer.rotation}
        scaleX={layer.scaleX}
        scaleY={layer.scaleY}
        opacity={layer.opacity}
        draggable={isSelected}
        offsetX={layer.width/2}
        offsetY={layer.height/2}
        onClick={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
};

// --- TEXT ELEMENT WRAPPER ---
const TextObj = ({ layer, isSelected, onSelect, onChange, currentTime }) => {
    const shapeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (isSelected && trRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    if (currentTime < layer.start || currentTime >= layer.end) return null;

    return (
        <>
            <Text
                ref={shapeRef}
                text={layer.content || layer.text}
                fontSize={layer.fontSize || 40}
                fill={layer.fill || 'white'}
                fontFamily={layer.fontFamily || 'Arial'}
                x={layer.x}
                y={layer.y}
                rotation={layer.rotation}
                scaleX={layer.scaleX}
                scaleY={layer.scaleY}
                opacity={layer.opacity}
                draggable={isSelected}
                onClick={onSelect}
                onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
                onTransformEnd={(e) => {
                   const node = shapeRef.current;
                   onChange({
                       x: node.x(),
                       y: node.y(),
                       scaleX: node.scaleX(),
                       scaleY: node.scaleY(),
                       rotation: node.rotation()
                   });
                }}
            />
            {isSelected && <Transformer ref={trRef} />}
        </>
    );
};

// --- SHAPE ELEMENT WRAPPER ---
const ShapeObj = ({ layer, isSelected, onSelect, onChange, currentTime }) => {
    const shapeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (isSelected && trRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    if (currentTime < layer.start || currentTime >= layer.end) return null;

    const commonProps = {
        x: layer.x,
        y: layer.y,
        width: layer.width || 100,
        height: layer.height || 100,
        fill: layer.fill || 'red',
        rotation: layer.rotation,
        scaleX: layer.scaleX,
        scaleY: layer.scaleY,
        opacity: layer.opacity,
        draggable: isSelected,
        onClick: onSelect,
        onDragEnd: (e) => onChange({ x: e.target.x(), y: e.target.y() }),
        onTransformEnd: (e) => {
            const node = shapeRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
              rotation: node.rotation(),
            });
        }
    };

    return (
        <>
            {layer.shape === 'rect' && <Rect ref={shapeRef} {...commonProps} offsetX={(layer.width || 100)/2} offsetY={(layer.height || 100)/2} cornerRadius={layer.cornerRadius || 0} />}
            {layer.shape === 'circle' && <Circle ref={shapeRef} {...commonProps} offsetX={0} offsetY={0} radius={(layer.width || 100)/2} />}
            {isSelected && <Transformer ref={trRef} />}
        </>
    );
};


export const EditorCanvas = () => {
  const {
      layers, selectedLayerId, setSelectedLayerId, updateLayer,
      currentTime, isPlaying, canvasSettings, stageRef
  } = useEditor();

  const checkDeselect = (e) => {
    // clicked on stage - clear selection
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedLayerId(null);
    }
  };

  return (
    <div className="canvas-container" style={{background:'#111', width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <Stage
        ref={stageRef}
        width={canvasSettings.width}
        height={canvasSettings.height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        style={{
            transform: 'scale(0.4)', // Scale down for preview
            transformOrigin: 'center center',
            border: '1px solid #333',
            background: canvasSettings.bgColor
        }}
      >
        <Layer>
          {/* Background Rect */}
          <Rect width={canvasSettings.width} height={canvasSettings.height} fill={canvasSettings.bgColor} listening={false} />

          {layers.map(layer => {
             const isSelected = selectedLayerId === layer.id;
             const handleChange = (attrs) => updateLayer(layer.id, attrs);
             const handleSelect = () => setSelectedLayerId(layer.id);

             if (layer.type === 'media') {
                 if (layer.subtype === 'video') return <VideoObj key={layer.id} layer={layer} isPlaying={isPlaying} currentTime={currentTime} isSelected={isSelected} onSelect={handleSelect} onChange={handleChange} />;
                 if (layer.subtype === 'image') return <ImageObj key={layer.id} layer={layer} currentTime={currentTime} isSelected={isSelected} onSelect={handleSelect} onChange={handleChange} />;
             }
             if (layer.type === 'text') return <TextObj key={layer.id} layer={layer} currentTime={currentTime} isSelected={isSelected} onSelect={handleSelect} onChange={handleChange} />;
             if (layer.type === 'shape') return <ShapeObj key={layer.id} layer={layer} currentTime={currentTime} isSelected={isSelected} onSelect={handleSelect} onChange={handleChange} />;

             // Fallback for other "Element" types mapped to images or shapes
             if (layer.type === 'element') {
                if (layer.subtype === 'image' || layer.subtype.includes('icon')) return <ImageObj key={layer.id} layer={layer} currentTime={currentTime} isSelected={isSelected} onSelect={handleSelect} onChange={handleChange} />;
                if (layer.shape) return <ShapeObj key={layer.id} layer={layer} currentTime={currentTime} isSelected={isSelected} onSelect={handleSelect} onChange={handleChange} />;
                // Default Text Elements
                if (layer.text || layer.content) return <TextObj key={layer.id} layer={layer} currentTime={currentTime} isSelected={isSelected} onSelect={handleSelect} onChange={handleChange} />;
             }

             return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
};
