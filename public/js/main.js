// public/js/main.js

// 當整個網頁的 HTML 結構都載入完成後，才執行裡面的程式碼
document.addEventListener('DOMContentLoaded', function() {
  fetchYouTubeVideos();
});

async function fetchYouTubeVideos() {
  // 找到我們要放置影片的容器
  const container = document.getElementById('youtube-videos');
  
  // 顯示「載入中...」的提示
  container.innerHTML = '<p>載入影片中...</p>';

  try {
    // 呼叫我們自己的後端 API
    const response = await fetch('/api/youtube');
    
    // 如果後端回傳錯誤 (例如 API Key 錯誤)，就在畫面上顯示錯誤訊息
    if (!response.ok) {
      throw new Error(`伺服器錯誤: ${response.status}`);
    }
    
    const videos = await response.json();

    // 清空「載入中...」的提示
    container.innerHTML = '';
    
    // 遍歷每一筆影片資料，並將它轉成 HTML 元素
    videos.forEach(video => {
      const videoElement = document.createElement('div');
      videoElement.className = 'video-card'; // 給它一個 class 方便用 CSS 美化
      
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