// api/youtube.js

export default async function handler(request, response) {
  // 從 Vercel 的環境變數中讀取我們的秘密金鑰和 ID
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const PLAYLIST_ID = process.env.YOUTUBE_PLAYLIST_ID;
  
  // YouTube API 的網址
  // part=snippet 會告訴 API 我們需要影片的基本資訊 (標題、描述、縮圖)
  // playlistId 是我們要抓取的播放清單
  // maxResults=5 代表我們只要最新的 5 筆
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=5&key=${API_KEY}`;

  try {
    // 使用 fetch 向 YouTube API 發出請求
    const apiResponse = await fetch(url);
    const data = await apiResponse.json();

    // 檢查 API 是否回傳錯誤
    if (data.error) {
      console.error('YouTube API Error:', data.error);
      // 如果出錯，回傳 500 錯誤碼給前端
      return response.status(500).json({ error: data.error.message });
    }

    // 從回傳的複雜資料中，只挑選我們需要的欄位
    const videos = data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.snippet.resourceId.videoId,
      thumbnail: item.snippet.thumbnails.high.url, // 使用高畫質縮圖
    }));

    // 成功！回傳 200 狀態碼和整理好的影片資料給前端
    return response.status(200).json(videos);

  } catch (error) {
    console.error('Server-side Error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}