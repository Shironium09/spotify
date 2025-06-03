export default async function handler(req, res) {
    const { code } = req.query;
  
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const redirectUri = 'https://spotify-theta-blue.vercel.app/callback.html';
  
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });
  
    const data = await response.json();
    res.status(200).json(data);
  }
  