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

// 主要的 API 處理函式
export default async function handler(request, response) {
  try {
    // 1. 先取得 Access Token
    const accessToken = await getAccessToken();

    // 2. 帶著 Access Token 去取得精選播放清單
    // limit=6 代表我們只要 6 個播放清單
    const apiResponse = await fetch('https://api.spotify.com/v1/browse/featured-playlists?limit=6', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await apiResponse.json();

    // 檢查 API 是否回傳錯誤
    if (data.error) {
      console.error('Spotify API Error:', data.error);
      return response.status(500).json({ error: data.error.message });
    }
    
    // 從回傳的資料中，挑選我們需要的欄位
    const playlists = data.playlists.items.map(item => ({
      name: item.name,
      url: item.external_urls.spotify,
      imageUrl: item.images[0].url, // 使用第一張圖 (通常是最大張的)
    }));

    // 成功！回傳整理好的播放清單資料
    return response.status(200).json(playlists);

  } catch (error) {
    console.error('Server-side Error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}