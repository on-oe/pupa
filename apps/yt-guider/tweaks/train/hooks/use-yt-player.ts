import { useState } from "react";
import { getPlayerElement, getVideoElement } from "../utils/yt-control";
import { useInterval, useMutationObserver } from "ahooks";

export const enum PlayerStatus {
  IDLE = 'idle',
  PAUSED = 'paused',
  PLAYING = 'playing',
  AD = 'ad',
}

export function useYTPlayer() {
  const [status, setStatus] = useState<PlayerStatus>(PlayerStatus.IDLE);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [videoId, setVideoId] = useState('');

  // check video id
  useInterval(() => {
    const v = new URLSearchParams(window.location.search).get('v');
    v && setVideoId(v);
  }, 1000, { immediate: true });

  // check player status
  useMutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const ytPlayer = document.getElementById('movie_player');
        if (!ytPlayer) {
          return;
        }
        const isPlaying = ytPlayer.classList.contains('playing-mode');
        const isAd = ytPlayer.classList.contains('ad-showing');
        const isPaused = ytPlayer.classList.contains('paused-mode');

        if (isAd) {
          setStatus(PlayerStatus.AD);
        } else if (isPlaying) {
          setStatus(PlayerStatus.PLAYING);
        } else if (isPaused) {
          setStatus(PlayerStatus.PAUSED);
        }
      }
    });
  }, () => getPlayerElement(), { attributes: true, attributeFilter: ['class']})

  useMutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const player = getPlayerElement();
        if (!player) {
          return;
        }
        const rect = player.getBoundingClientRect();
        setSize({ width: rect.width, height: rect.height });
      }
    });
  }, () => getVideoElement(), { attributes: true, attributeFilter: ['style'] });

  return { status, size, videoId };
}