// MoodPlaylist — Spotify songs matched to the detected mood.
// Each track is a custom card (cover + title + artist + play button); tapping
// play swaps in Spotify's official embed player, which streams the 30-second
// preview directly in the browser — no login, no app redirect.
import { useState } from 'react';
import { Music2, Play, ExternalLink } from 'lucide-react';
import { songsForMood } from '../data/moodSongs';

function TrackCard({ track }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="song-card is-playing">
        <iframe
          src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={`${track.title} — Spotify preview`}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="song-card"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${track.title} preview`}
    >
      <span className="song-cover">
        {track.image ? (
          <img src={track.image} alt="" loading="lazy" />
        ) : (
          <Music2 size={22} />
        )}
        <span className="song-playbtn" aria-hidden="true">
          <Play size={15} fill="currentColor" />
        </span>
      </span>
      <span className="song-meta">
        <b>{track.title}</b>
        <i>{track.artist}</i>
      </span>
    </button>
  );
}

function MoodPlaylist({ moodId, moodLabel }) {
  const songs = songsForMood(moodId);
  if (!songs.length) return null;

  return (
    <section className="song21" aria-label="Songs for your mood">
      <div className="song21-head">
        <span className="song21-icon">
          <Music2 size={20} />
        </span>
        <div>
          <span className="eyebrow">Mood radio</span>
          <h3>
            Tunes for your <em>{moodLabel || 'current'}</em> mood
          </h3>
          <p>
            Our AI pairs every craving with a vibe. Tap a track — it plays
            right here in your browser.
          </p>
        </div>
        <a
          className="btn btn-ghost btn-sm"
          href="https://open.spotify.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Spotify <ExternalLink size={14} />
        </a>
      </div>

      <div className="song21-grid">
        {songs.map((t) => (
          <TrackCard key={t.id} track={t} />
        ))}
      </div>

      <p className="song21-note">
        30-second previews stream in-browser · Hear the full tracks on Spotify
      </p>
    </section>
  );
}

export default MoodPlaylist;
