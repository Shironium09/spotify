const clientId = 'e55397160a75484c9ba60eb25300d086';
const redirectUri = 'https://spotify-theta-blue.vercel.app/callback.html';
const scopes = 'user-read-currently-playing';

const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

function login() {
  window.location.href = authUrl;
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('spotify_access_token');
  if (!token) return;

  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 204) {
    document.getElementById('title').textContent = 'No song currently playing';
    document.getElementById('image').src = 'placeholder.png';
    return;
  }

  const data = await res.json();
  if (data && data.item) {
    const songTitle = `${data.item.name} by ${data.item.artists.map(a => a.name).join(', ')}`;
    document.getElementById('title').textContent = songTitle;
    
    // Update album art if available
    if (data.item.album.images && data.item.album.images.length > 0) {
      document.getElementById('image').src = data.item.album.images[0].url;
    }
    
    console.log(`Now playing: ${songTitle}`);
  }
});

// Function to start periodic updates
function startTrackUpdates() {
  // Update immediately when the page loads
  getCurrentTrack();
  
  // Then update every 5 seconds
  setInterval(getCurrentTrack, 5000);
}

// Start updates when the page loads
if (window.location.pathname.includes('main.html')) {
  startTrackUpdates();
}
