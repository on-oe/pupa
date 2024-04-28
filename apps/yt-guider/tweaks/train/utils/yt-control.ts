export const PlayerID = 'movie_player';

export function getPlayerElement() {
  const ytPlayer = document.getElementById(PlayerID);
  if (!ytPlayer) return null;
  return ytPlayer;
}

export function getVideoElement() {
  const ytPlayer = getPlayerElement();
  if (!ytPlayer) return null;
  const video = ytPlayer.querySelector('video');
  if (!video) return null;
  return video;
}

export function pauseVideo() {
  const video = getVideoElement();
  video.pause();
}

export function playVideo(time?: number) {
  const video = getVideoElement();
  if (time !== undefined) video.currentTime = time;
  video.play();
}

export function onVideoTimeUpdate(video: HTMLVideoElement, callback: (time: number) => void) {
  let handle: number;
  const getTime = () => {
    const time = video.currentTime;
    callback(time);
    handle = requestAnimationFrame(getTime);
  }

  handle = requestAnimationFrame(getTime);

  return () => {
    cancelAnimationFrame(handle);
  }
}