// api/spotify.js

// 從環境變數讀取 Spotify 的金鑰
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// 取得 Access Token 的函式
async function getAccessToken() {
  // 使用 "Basic" 認證，將 ID 和 Secret 組合成 Base64 字串
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

// 【↓↓↓ 從這裡開始替換 ↓↓↓】
export default async function handler(request, response) {
  try {
    // 1. 先取得 Access Token
    const accessToken = await getAccessToken();

    // 【偵錯點 1】定義我們要呼叫的 URL
    const spotifyURL = `https://api.spotify.com/v1/browse/featured-playlists?country=TW&limit=6`;

    // 【偵錯點 2】在 Vercel 後台印出這個 URL，確認它是否正確
    console.log('Attempting to fetch Spotify URL:', spotifyURL);

    // 2. 帶著 Access Token 去取得精選播放清單
    const apiResponse = await fetch(spotifyURL, { // <-- 確認這裡使用的是我們定義的變數
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await apiResponse.json();

    if (data.error) {
      console.error('Spotify API Error:', data.error);
      return response.status(500).json({ error: data.error.message });
    }
    
    const playlists = data.playlists.items.map(item => ({
      name: item.name,
      url: item.external_urls.spotify,
      imageUrl: item.images[0].url,
    }));

    return response.status(200).json(playlists);

  } catch (error) {
    console.error('Server-side Error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
// 【↑↑↑ 替換到這裡結束 ↑↑↑】