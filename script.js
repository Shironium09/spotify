const clientId = 'e55397160a75484c9ba60eb25300d086';
const redirectUri = 'https://spotify-theta-blue.vercel.app/callback.html';
const scopes = 'user-read-currently-playing user-read-playback-state';

const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

function login() {
  window.location.href = authUrl;
}

// Initialize Spotify Web Playback SDK
async function initializePlayer() {
  const token = localStorage.getItem('spotify_access_token');
  if (!token) return;

  // Load the Spotify Web Playback SDK
  const script = document.createElement('script');
  script.src = 'https://sdk.scdn.co/spotify-player.js';
  document.body.appendChild(script);

  window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new window.Spotify.Player({
      name: 'Record Player',
      getOAuthToken: cb => { cb(token); }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => {
      if (state) {
        const track = state.track_window.current_track;
        const songTitle = `${track.name} by ${track.artists.map(a => a.name).join(', ')}`;
        document.getElementById('title').textContent = songTitle;
        
        if (track.album.images && track.album.images.length > 0) {
          document.getElementById('image').src = track.album.images[0].url;
        }
        
        console.log(`Now playing: ${songTitle}`);
      } else {
        document.getElementById('title').textContent = 'No song currently playing';
        document.getElementById('image').src = 'placeholder.png';
      }
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      // Transfer playback to our device
      fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_ids: [device_id],
          play: true
        })
      });
    });

    // Connect to the player
    player.connect();
  };
}

// Initialize player when on main page
if (window.location.pathname.includes('main.html')) {
  document.addEventListener('DOMContentLoaded', initializePlayer);
}
