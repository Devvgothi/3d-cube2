import React, { useState, useEffect, useRef } from 'react';
import { Upload, RotateCcw, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [images, setImages] = useState<string[]>(Array(6).fill(''));
  const [uploading, setUploading] = useState<boolean[]>(Array(6).fill(false));
  const cubeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 15, y: 15 });
  const [activeFace, setActiveFace] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  // Face names for better user experience
  const faceNames = ['Front', 'Back', 'Top', 'Bottom', 'Left', 'Right'];
  const faceColors = [
    'from-blue-500 to-blue-600',
    'from-red-500 to-red-600',
    'from-green-500 to-green-600',
    'from-yellow-500 to-yellow-600',
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600'
  ];

  // Handle file upload
  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(prev => {
        const newState = [...prev];
        newState[index] = true;
        return newState;
      });

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => {
            const newImages = [...prev];
            newImages[index] = event.target?.result as string;
            return newImages;
          });
          
          setUploading(prev => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
          });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Auto rotation effect
  useEffect(() => {
    const cube = cubeRef.current;
    if (!cube || !autoRotate || isDragging) return;

    let animationFrameId: number;
    let currentRotation = rotation.y;

    const animate = () => {
      currentRotation += 0.2;
      if (cube) {
        cube.style.transform = `rotateX(${rotation.x}deg) rotateY(${currentRotation}deg)`;
        
        // Determine which face is currently visible
        const normalizedY = ((currentRotation % 360) + 360) % 360;
        
        if (normalizedY >= 315 || normalizedY < 45) {
          setActiveFace(0); // Front
        } else if (normalizedY >= 45 && normalizedY < 135) {
          setActiveFace(4); // Left
        } else if (normalizedY >= 135 && normalizedY < 225) {
          setActiveFace(1); // Back
        } else if (normalizedY >= 225 && normalizedY < 315) {
          setActiveFace(5); // Right
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [autoRotate, isDragging, rotation.x]);

  // Mouse/Touch event handlers
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setAutoRotate(false);
    setLastPosition({ x: clientX, y: clientY });
    setShowInstructions(false);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !cubeRef.current) return;
    
    const deltaX = clientX - lastPosition.x;
    const deltaY = clientY - lastPosition.y;
    
    const newRotation = {
      x: rotation.x - deltaY * 0.5,
      y: rotation.y + deltaX * 0.5
    };
    
    // Limit vertical rotation to prevent cube from flipping too far
    newRotation.x = Math.max(-60, Math.min(60, newRotation.x));
    
    setRotation(newRotation);
    cubeRef.current.style.transform = `rotateX(${newRotation.x}deg) rotateY(${newRotation.y}deg)`;
    setLastPosition({ x: clientX, y: clientY });
    
    // Determine which face is currently visible
    const normalizedY = ((newRotation.y % 360) + 360) % 360;
    
    if (normalizedY >= 315 || normalizedY < 45) {
      setActiveFace(0); // Front
    } else if (normalizedY >= 45 && normalizedY < 135) {
      setActiveFace(4); // Left
    } else if (normalizedY >= 135 && normalizedY < 225) {
      setActiveFace(1); // Back
    } else if (normalizedY >= 225 && normalizedY < 315) {
      setActiveFace(5); // Right
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Mouse event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleEnd();
    };

    const handleMouseLeave = () => {
      handleEnd();
      setAutoRotate(true);
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDragging, lastPosition]);

  // Touch event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      handleEnd();
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, lastPosition]);

  // Hide instructions after 5 seconds
  useEffect(() => {
    if (showInstructions) {
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showInstructions]);

  // Check if all images are uploaded
  const allImagesUploaded = images.every(img => img !== '');

  // Calculate cube size based on viewport
  const cubeSize = Math.min(200, window.innerWidth * 0.8); // Responsive size
  const halfSize = cubeSize / 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-violet-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      <motion.h1 
        className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        3D Interactive Cube
      </motion.h1>
      
      {!allImagesUploaded && (
        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8 w-full max-w-2xl border border-white/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Upload Images for Each Face</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, index) => (
              <motion.div 
                key={index} 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <label 
                  htmlFor={`face-${index}`}
                  className={`
                    w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer
                    transition-all duration-200 relative overflow-hidden
                    ${img ? 'border-green-400 bg-green-400/10' : `border-white/30 hover:border-white/50 bg-gradient-to-br ${faceColors[index]}/20 hover:bg-gradient-to-br hover:${faceColors[index]}/30`}
                  `}
                >
                  {uploading[index] ? (
                    <div className="animate-pulse text-white flex items-center">
                      <div className="w-4 h-4 rounded-full bg-white/70 animate-ping mr-2"></div>
                      <span>Loading...</span>
                    </div>
                  ) : img ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={img} 
                        alt={`Face ${index + 1}`} 
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="text-white text-sm font-medium px-2 py-1 bg-black/50 rounded-md">Change</span>
                      </motion.div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-white mb-2" />
                      <span className="text-white text-sm">Upload</span>
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      />
                    </>
                  )}
                </label>
                <input 
                  type="file" 
                  id={`face-${index}`} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(index, e)}
                />
                <motion.span 
                  className="text-white text-sm mt-2 font-medium"
                  whileHover={{ scale: 1.1 }}
                >
                  {faceNames[index]}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      
      <div className="relative">
        <AnimatePresence>
          {showInstructions && (
            <motion.div 
              className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm z-10 whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {window.innerWidth > 768 ? "Drag with mouse to rotate" : "Swipe to rotate the cube"}
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div 
          ref={containerRef}
          className="relative w-full max-w-md aspect-square mb-8 perspective-1000 touch-manipulation"
          style={{ 
            perspective: '1000px', 
            height: `${cubeSize}px`, 
            width: `${cubeSize}px`,
            touchAction: 'none'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div 
            ref={cubeRef}
            className="w-full h-full relative transform-style-3d transition-transform duration-100"
            style={{ 
              transformStyle: 'preserve-3d',
              width: `${cubeSize}px`,
              height: `${cubeSize}px`,
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
            }}
          >
            {/* Front face */}
            <div 
              className={`absolute backface-hidden shadow-xl ${activeFace === 0 ? 'active-face' : ''}`}
              style={{ 
                width: `${cubeSize}px`,
                height: `${cubeSize}px`,
                transform: `translateZ(${halfSize}px)`,
                backfaceVisibility: 'hidden'
              }}
            >
              {images[0] ? (
                <div className="w-full h-full relative overflow-hidden">
                  <img src={images[0]} alt="Front" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 border-4 border-white/30 ${activeFace === 0 ? 'pulse-border' : ''}`}></div>
                </div>
              ) : (
                <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-white/20 ${activeFace === 0 ? 'pulse-bg' : ''}`}>
                  <span className="text-white text-xl font-bold">Front</span>
                </div>
              )}
            </div>
            
            {/* Back face */}
            <div 
              className={`absolute backface-hidden shadow-xl ${activeFace === 1 ? 'active-face' : ''}`}
              style={{ 
                width: `${cubeSize}px`,
                height: `${cubeSize}px`,
                transform: `rotateY(180deg) translateZ(${halfSize}px)`,
                backfaceVisibility: 'hidden'
              }}
            >
              {images[1] ? (
                <div className="w-full h-full relative overflow-hidden">
                  <img src={images[1]} alt="Back" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 border-4 border-white/30 ${activeFace === 1 ? 'pulse-border' : ''}`}></div>
                </div>
              ) : (
                <div className={`w-full h-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center border-2 border-white/20 ${activeFace === 1 ? 'pulse-bg' : ''}`}>
                  <span className="text-white text-xl font-bold">Back</span>
                </div>
              )}
            </div>
            
            {/* Top face */}
            <div 
              className={`absolute backface-hidden shadow-xl ${activeFace === 2 ? 'active-face' : ''}`}
              style={{ 
                width: `${cubeSize}px`,
                height: `${cubeSize}px`,
                transform: `rotateX(90deg) translateZ(${halfSize}px)`,
                backfaceVisibility: 'hidden'
              }}
            >
              {images[2] ? (
                <div className="w-full h-full relative overflow-hidden">
                  <img src={images[2]} alt="Top" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 border-4 border-white/30 ${activeFace === 2 ? 'pulse-border' : ''}`}></div>
                </div>
              ) : (
                <div className={`w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center border-2 border-white/20 ${activeFace === 2 ? 'pulse-bg' : ''}`}>
                  <span className="text-white text-xl font-bold">Top</span>
                </div>
              )}
            </div>
            
            {/* Bottom face */}
            <div 
              className={`absolute backface-hidden shadow-xl ${activeFace === 3 ? 'active-face' : ''}`}
              style={{ 
                width: `${cubeSize}px`,
                height: `${cubeSize}px`,
                transform: `rotateX(-90deg) translateZ(${halfSize}px)`,
                backfaceVisibility: 'hidden'
              }}
            >
              {images[3] ? (
                <div className="w-full h-full relative overflow-hidden">
                  <img src={images[3]} alt="Bottom" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 border-4 border-white/30 ${activeFace === 3 ? 'pulse-border' : ''}`}></div>
                </div>
              ) : (
                <div className={`w-full h-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center border-2 border-white/20 ${activeFace === 3 ? 'pulse-bg' : ''}`}>
                  <span className="text-white text-xl font-bold">Bottom</span>
                </div>
              )}
            </div>
            
            {/* Left face */}
            <div 
              className={`absolute backface-hidden shadow-xl ${activeFace === 4 ? 'active-face' : ''}`}
              style={{ 
                width: `${cubeSize}px`,
                height: `${cubeSize}px`,
                transform: `rotateY(-90deg) translateZ(${halfSize}px)`,
                backfaceVisibility: 'hidden'
              }}
            >
              {images[4] ? (
                <div className="w-full h-full relative overflow-hidden">
                  <img src={images[4]} alt="Left" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 border-4 border-white/30 ${activeFace === 4 ? 'pulse-border' : ''}`}></div>
                </div>
              ) : (
                <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center border-2 border-white/20 ${activeFace === 4 ? 'pulse-bg' : ''}`}>
                  <span className="text-white text-xl font-bold">Left</span>
                </div>
              )}
            </div>
            
            {/* Right face */}
            <div 
              className={`absolute backface-hidden shadow-xl ${activeFace === 5 ? 'active-face' : ''}`}
              style={{ 
                width: `${cubeSize}px`,
                height: `${cubeSize}px`,
                transform: `rotateY(90deg) translateZ(${halfSize}px)`,
                backfaceVisibility: 'hidden'
              }}
            >
              {images[5] ? (
                <div className="w-full h-full relative overflow-hidden">
                  <img src={images[5]} alt="Right" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 border-4 border-white/30 ${activeFace === 5 ? 'pulse-border' : ''}`}></div>
                </div>
              ) : (
                <div className={`w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center border-2 border-white/20 ${activeFace === 5 ? 'pulse-bg' : ''}`}>
                  <span className="text-white text-xl font-bold">Right</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {faceNames[activeFace]} face active
        </motion.div>
      </div>
      
      <motion.div 
        className="text-white text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="mb-4 text-white/90">Drag or swipe the cube to rotate it!</p>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <motion.button 
            onClick={() => setImages(Array(6).fill(''))}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Images</span>
          </motion.button>
          <motion.button 
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              autoRotate ? 'bg-green-500/30 hover:bg-green-500/40' : 'bg-white/10 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {autoRotate ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Rotation</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Auto-Rotate</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
      
      <div className="fixed bottom-4 right-4">
        <motion.div 
          className="text-xs text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          Interactive 3D Cube
        </motion.div>
      </div>
    </div>
  );
}

export default App;