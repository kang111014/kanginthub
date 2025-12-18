// api/spotify.js

// 主要的 API 處理函式
export default async function handler(request, response) {
  // Deezer 的公開排行榜 API 網址，超級簡單！
  // chart/0/playlists 代表全球排行榜的播放清單
  const deezerURL = `https://api.deezer.com/chart/0/playlists?limit=6`;

  try {
    const apiResponse = await fetch(deezerURL);
    const data = await apiResponse.json();

    // 檢查 API 是否回傳錯誤 (雖然它很穩定，但這是好習慣)
    if (data.error) {
      console.error('Deezer API Error:', data.error);
      return response.status(500).json({ error: data.error.message });
    }
    
    // 從回傳的資料中，挑選我們需要的欄位
    // 注意：Deezer 的欄位名稱和 Spotify 不同，所以我們在這裡進行轉換
    const playlists = data.data.map(item => ({
      name: item.title,
      url: item.link,
      imageUrl: item.picture_big, // 使用大尺寸的封面圖
    }));

    // 成功！回傳整理好的播放清單資料
    return response.status(200).json(playlists);

  } catch (error) {
    console.error('Server-side Error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}