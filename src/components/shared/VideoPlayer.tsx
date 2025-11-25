import { useState } from 'react';
import { AppleCard } from '@/components/apple';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto';
}

export default function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = false,
  controls = true,
  className = '',
  aspectRatio = '16/9',
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    const video = document.getElementById('video-player') as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = document.getElementById('video-player') as HTMLVideoElement;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const video = document.getElementById('video-player') as HTMLVideoElement;
    if (video) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '16/9':
        return 'aspect-video';
      case '4/3':
        return 'aspect-[4/3]';
      case '1/1':
        return 'aspect-square';
      default:
        return '';
    }
  };

  return (
    <div
      className={`relative ${getAspectRatioClass()} bg-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        id="video-player"
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={isMuted}
        className="w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        controls={!controls}
      />

      {/* Custom Controls Overlay */}
      {controls && (
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={togglePlay}
            >
              <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl hover:bg-white transition-colors">
                <Play className="w-10 h-10 text-[rgb(0,113,227)] ml-1" />
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-[rgb(29,29,31)]" />
              ) : (
                <Play className="w-4 h-4 text-[rgb(29,29,31)]" />
              )}
            </button>

            {/* Volume Button */}
            <button
              onClick={toggleMute}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[rgb(29,29,31)]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[rgb(29,29,31)]" />
              )}
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <Maximize className="w-4 h-4 text-[rgb(29,29,31)]" />
            </button>
          </div>

          {/* Title Overlay */}
          {title && (
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white font-semibold text-sm">{title}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
