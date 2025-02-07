import { Movie } from "@/services/tmdb";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/services/tmdb";
import { ArrowLeft, Play, Plus, Check } from "lucide-react";
import { Button } from "./ui/button";
import { VideoPlayer } from "./movie/VideoPlayer";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { toast } from "sonner";

interface HeroProps {
  movie: Movie;
  onModalOpen?: () => void;
  onModalClose?: () => void;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

export const Hero = ({ 
  movie, 
  onModalOpen, 
  onModalClose,
  onPlayStart,
  onPlayEnd 
}: HeroProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const { data: movieDetails } = useQuery({
    queryKey: ["movie", movie.id, movie.media_type],
    queryFn: () => tmdb.getMovieDetails(movie.id, movie.media_type as 'movie' | 'tv'),
    enabled: showModal || showPlayer,
  });

  const trailerKey = movieDetails?.videos ? tmdb.getTrailerKey(movieDetails.videos) : null;

  const embedUrl = movie.media_type === 'movie' 
    ? `https://embed.su/embed/movie/${movie.id}`
    : `https://embed.su/embed/tv/${movie.id}/1/1`;
  const multiEmbedUrl = movie.media_type === 'movie'
    ? `https://multiembed.mov/?video_id=${movie.id}&tmdb=1`
    : `https://multiembed.mov/?video_id=${movie.id}&tmdb=1&s=1&e=1`;

  const handleModalOpen = (open: boolean) => {
    setShowModal(open);
    if (open && onModalOpen) {
      onModalOpen();
    } else if (!open && onModalClose) {
      onModalClose();
    }
  };

  const handleWatchlistToggle = () => {
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
      toast.success("Removed from watchlist");
    } else {
      addToWatchlist(movie);
      toast.success("Added to watchlist");
    }
  };

  const handlePlayerOpen = () => {
    setShowPlayer(true);
    if (onPlayStart) onPlayStart();
  };

  const handlePlayerClose = () => {
    setShowPlayer(false);
    if (onPlayEnd) onPlayEnd();
  };

  return (
    <>
      <div className="relative h-[50vh] md:h-[70vh] mb-8">
        <div className="absolute inset-0">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 p-4 md:p-8 max-w-2xl">
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-2 md:mb-4">
            {movie.title || movie.name}
          </h1>
          <p className="text-white/80 text-sm md:text-lg mb-4 line-clamp-3 md:line-clamp-none">
            {movie.overview}
          </p>
          <div className="flex gap-2 md:gap-4">
            <button 
              className="bg-white text-netflix-black px-4 md:px-6 py-2 rounded-md font-bold hover:bg-white/80 transition text-sm md:text-base"
              onClick={handlePlayerOpen}
            >
              ▶ Play
            </button>
            <button 
              className="bg-gray-500/50 text-white px-4 md:px-6 py-2 rounded-md font-bold hover:bg-gray-500/70 transition text-sm md:text-base"
              onClick={() => handleModalOpen(true)}
            >
              ℹ More Info
            </button>
          </div>
        </div>
      </div>

      {/* More Info Modal */}
      <Dialog open={showModal} onOpenChange={handleModalOpen}>
        <DialogContent className="max-w-3xl h-[70vh] p-0 bg-black overflow-y-auto">
          <DialogTitle className="sr-only">{movie.title || movie.name}</DialogTitle>
          <DialogDescription className="sr-only">Details for {movie.title || movie.name}</DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 z-50 text-white hover:bg-white/20"
            onClick={() => handleModalOpen(false)}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Return</span>
          </Button>
          {trailerKey ? (
            <iframe
              className="w-full aspect-video"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
              <p className="text-white">No trailer available</p>
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                className="rounded-full bg-white hover:bg-white/90 text-black"
                onClick={() => {
                  handleModalOpen(false);
                  setShowPlayer(true);
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Play
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white hover:border-white bg-black/30 text-white"
                onClick={handleWatchlistToggle}
              >
                {isInWatchlist(movie.id) ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Remove from Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Watchlist
                  </>
                )}
              </Button>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">{movie.title || movie.name}</h2>
            <p className="text-gray-400">{movie.overview}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Player */}
      <VideoPlayer
        isOpen={showPlayer}
        onClose={handlePlayerClose}
        title={movie.title || movie.name}
        embedUrl={embedUrl}
        multiEmbedUrl={multiEmbedUrl}
        movieId={movie.id}
        mediaType={movie.media_type as 'movie' | 'tv'}
        season={1}
        episode={1}
      />
    </>
  );
};