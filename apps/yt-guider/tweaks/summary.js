import { sendMessage } from '@pupa/tweak';

try {
  const video = document.querySelector('ytd-player video');
  if (video) {
    let lastTime = -1;
    let videoId = new URLSearchParams(window.location.search).get('v');
    let { title } = document;

    const onTimeUpdate = () => {
      const id = new URLSearchParams(window.location.search).get('v');
      if (id !== videoId) {
        videoId = id;
        lastTime = -1;
        title = document.title;
      }
      if (lastTime < 0 || video.currentTime - lastTime > 60) {
        lastTime = video.currentTime;
        sendMessage({ videoId, title, time: lastTime });
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
  }
} catch (error) {
  console.error(error);
}
