const video = document.querySelector("ytd-player video");
if (!video) return;
let lastTime = -1;
let videoId = new URLSearchParams(window.location.search).get("v");
let { title } = document;

function onTimeUpdate() {
  const id = new URLSearchParams(window.location.search).get("v");
  if (id !== videoId) {
    videoId = id;
    lastTime = -1;
    title = document.title;
  }
  if (lastTime < 0 || video.currentTime - lastTime > 60) {
    lastTime = video.currentTime;
    PupaPage.sendMessage({ videoId, title, time: lastTime });
  }
}

video.addEventListener("timeupdate", onTimeUpdate);
