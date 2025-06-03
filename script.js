const clientId = 'e55397160a75484c9ba60eb25300d086';
const redirectUri = 'https://spotify-theta-blue.vercel.app/callback.html';
const scopes = 'user-read-currently-playing';

const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

function login() {
  window.location.href = authUrl;
}

async function getCurrentTrack() {
  const token = localStorage.getItem('spotify_access_token');
  if (!token) {
    console.log('No token found');
    return;
  }

  try {
    const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 204) {
      document.getElementById('title').textContent = 'No song currently playing';
      document.getElementById('image').src = 'placeholder.png';
      return;
    }

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    if (data && data.item) {
      const songTitle = `${data.item.name} by ${data.item.artists.map(a => a.name).join(', ')}`;
      document.getElementById('title').textContent = songTitle;
      
      if (data.item.album.images && data.item.album.images.length > 0) {
        document.getElementById('image').src = data.item.album.images[0].url;
      }
      
      console.log(`Now playing: ${songTitle}`);
    }
  } catch (error) {
    console.error('Error fetching current track:', error);
    if (error.message.includes('401')) {
      // Token might be expired, redirect to login
      window.location.href = 'index.html';
    }
  }
}

// Function to start periodic updates
function startTrackUpdates() {
  // Update immediately when the page loads
  getCurrentTrack();
  
  // Then update every 2 seconds for more responsive updates
  setInterval(getCurrentTrack, 2000);
}

// Start updates when on main page
if (window.location.pathname.includes('main.html')) {
  document.addEventListener('DOMContentLoaded', startTrackUpdates);
}
