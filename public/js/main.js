// public/js/main.js

// 當整個網頁的 HTML 結構都載入完成後，才執行裡面的程式碼
document.addEventListener('DOMContentLoaded', function() {
  fetchYouTubeVideos();
  fetchSpotifyPlaylists(); // <-- 新增呼叫 Spotify 的函式
});

// ----- 抓取 YouTube 影片的函式 (維持不變) -----
async function fetchYouTubeVideos() {
  const container = document.getElementById('youtube-videos');
  container.innerHTML = '<p>載入影片中...</p>';
  try {
    const response = await fetch('/api/youtube');
    if (!response.ok) {
      throw new Error(`伺服器錯誤: ${response.status}`);
    }
    const videos = await response.json();
    container.innerHTML = '';
    videos.forEach(video => {
      const videoElement = document.createElement('div');
      videoElement.className = 'video-card';
      videoElement.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank" rel="noopener noreferrer">
          <img src="${video.thumbnail}" alt="${video.title}">
          <p>${video.title}</p>
        </a>
      `;
      container.appendChild(videoElement);
    });
  } catch (error) {
    console.error('抓取 YouTube 影片失敗:', error);
    container.innerHTML = '<p>無法載入影片，請稍後再試。</p>';
  }
}

// ----- (新增) 抓取 Spotify 播放清單的函式 -----
async function fetchSpotifyPlaylists() {
  const container = document.getElementById('spotify-playlists');
  container.innerHTML = '<p>載入播放清單中...</p>';

  try {
    const response = await fetch('/api/spotify');
    if (!response.ok) {
      throw new Error(`伺服器錯誤: ${response.status}`);
    }
    const playlists = await response.json();
    container.innerHTML = '';

    playlists.forEach(playlist => {
      const playlistElement = document.createElement('div');
      playlistElement.className = 'playlist-card'; // 給它一個 class
      
      playlistElement.innerHTML = `
        <a href="${playlist.url}" target="_blank" rel="noopener noreferrer">
          <img src="${playlist.imageUrl}" alt="${playlist.name}">
          <p>${playlist.name}</p>
        </a>
      `;
      container.appendChild(playlistElement);
    });

  } catch (error) {
    console.error('抓取 Spotify 播放清單失敗:', error);
    container.innerHTML = '<p>無法載入播放清單，請稍後再試。</p>';
  }
}