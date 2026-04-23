import * as React from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Captions } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  kind: "audio" | "video";
  src: string;
  /** Optional WebVTT captions URL */
  captionsUrl?: string;
  poster?: string;
  className?: string;
};

function formatTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function MediaPlayer({ kind, src, captionsUrl, poster, className }: Props) {
  const ref = React.useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [captionsOn, setCaptionsOn] = React.useState(false);

  const ytId = kind === "video" ? getYouTubeId(src) : null;

  React.useEffect(() => {
    if (ytId) return;
    const el = ref.current;
    if (!el) return;
    const onTime = () => setTime(el.currentTime);
    const onMeta = () => setDuration(el.duration);
    const onEnd = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
    };
  }, [ytId, src]);

  React.useEffect(() => {
    if (ytId) return;
    const el = ref.current as HTMLMediaElement | null;
    if (!el || !("textTracks" in el)) return;
    Array.from(el.textTracks).forEach((t) => {
      t.mode = captionsOn ? "showing" : "hidden";
    });
  }, [captionsOn, ytId]);

  if (ytId) {
    return (
      <div className={cn("relative aspect-video w-full overflow-hidden rounded-2xl bg-black", className)}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&cc_load_policy=1`}
          title="Video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play();
      setPlaying(true);
    }
  };

  const seek = (v: number) => {
    const el = ref.current;
    if (!el) return;
    el.currentTime = v;
    setTime(v);
  };

  const toggleMute = () => {
    const el = ref.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const fullscreen = () => {
    const el = ref.current as HTMLVideoElement | null;
    if (el && "requestFullscreen" in el) void el.requestFullscreen();
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      {kind === "video" ? (
        <video
          ref={ref as React.RefObject<HTMLVideoElement>}
          src={src}
          poster={poster}
          className="aspect-video w-full bg-black"
          playsInline
        >
          {captionsUrl && (
            <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />
          )}
        </video>
      ) : (
        <div className="flex h-24 items-center justify-center bg-gradient-to-br from-[var(--ochre)]/30 to-primary/20">
          <audio ref={ref as React.RefObject<HTMLAudioElement>} src={src} preload="metadata">
            {captionsUrl && <track kind="captions" src={captionsUrl} srcLang="en" label="English" />}
          </audio>
          <div className="font-serif text-lg text-foreground/70">Audio</div>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
        </button>
        <span className="w-10 text-right text-[11px] tabular-nums text-muted-foreground">
          {formatTime(time)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(e) => seek(Number(e.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          aria-label="Seek"
        />
        <span className="w-10 text-[11px] tabular-nums text-muted-foreground">
          {formatTime(duration)}
        </span>
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        {captionsUrl && (
          <button
            onClick={() => setCaptionsOn((v) => !v)}
            aria-label="Toggle captions"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              captionsOn ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Captions className="h-4 w-4" />
          </button>
        )}
        {kind === "video" && (
          <button
            onClick={fullscreen}
            aria-label="Fullscreen"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
