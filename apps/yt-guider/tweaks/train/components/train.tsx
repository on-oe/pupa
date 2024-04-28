import { useState, useEffect, useRef } from 'react';
import { TrainInput } from './train-input';
import {
  getPlayerElement,
  getVideoElement,
  onVideoTimeUpdate,
  pauseVideo,
  playVideo,
} from '../utils/yt-control';
import { apiService } from '../services/api-service';
import { useAbortEffect } from '../hooks/use-abort-effect';
import { useInterval, useMutationObserver } from 'ahooks';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SegmentType } from '../types';

type PlayerStatus = 'idle' | 'playing' | 'ad' | 'train';

interface TranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

type Transcript = TranscriptItem[];

export function Train() {
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [videoId, setVideoId] = useState<string>('');
  const [transcript, setTranscript] = useState<Transcript>(null);
  const [currentTranscript, setCurrentTranscript] = useState<TranscriptItem>();
  const [playerSize, setPlayerSize] = useState({ width: 0, height: 0 });
  const [currentTime, setCurrentTime] = useState(-1);

  const delayedCountRef = useRef(0);

  // check video id
  useInterval(
    () => {
      const v = new URLSearchParams(window.location.search).get('v');
      v && setVideoId(v);
    },
    1000,
    { immediate: true },
  );

  // check player status
  useMutationObserver(
    (mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          const ytPlayer = document.getElementById('movie_player');
          if (!ytPlayer) {
            return;
          }
          const isPlaying = ytPlayer.classList.contains('playing-mode');
          const isAd = ytPlayer.classList.contains('ad-showing');

          if (isAd) {
            setStatus('ad');
          } else if (isPlaying) {
            setStatus('playing');
          }
        }
      });
    },
    () => getPlayerElement(),
    { attributes: true, attributeFilter: ['class'] },
  );

  // reset when video id changed
  useEffect(() => {
    videoId && reset();
  }, [videoId]);

  // fetch transcript
  useAbortEffect(
    (signal) => {
      if (!videoId) return;
      apiService
        .getYTTranscript(videoId, { segment: SegmentType.Pause }, { signal })
        .then((res) => {
          setTranscript(res.data);
        })
        .catch((err) => {
          console.error(err);
          setStatus('idle');
        });
    },
    [videoId],
  );

  // update size
  useEffect(() => {
    if (status !== 'train') return;
    const player = getPlayerElement();
    const rect = player.getBoundingClientRect();
    setPlayerSize({ width: rect.width, height: rect.height });
  }, [status]);

  // video element control
  useEffect(() => {
    const video = getVideoElement();
    if (!video) return;

    if (status === 'playing') {
      const remove = onVideoTimeUpdate(video, (time) => setCurrentTime(time));

      const onSeeking = () => {
        setCurrentTranscript(null);
      };
      video.addEventListener('seeking', onSeeking);

      return () => {
        remove();
        video.removeEventListener('seeking', onSeeking);
      };
    } else if (status === 'train') {
      pauseVideo();
    }
  }, [status]);

  useEffect(() => {
    if (!transcript) return;

    const current = transcript.find((t, i) => {
      const t1 = transcript[i + 1];

      // last one
      if (!t1) return;

      return t.offset <= currentTime && currentTime < t1.offset;
    });

    if (!current) return;
    if (!currentTranscript) {
      setCurrentTranscript(current);
    } else if (current !== currentTranscript) {
      if (delayedCountRef.current >= 0) {
        delayedCountRef.current = 0;
        setStatus('train');
      } else {
        delayedCountRef.current++;
        setCurrentTranscript(current);
      }
    }
  }, [currentTime, transcript, currentTranscript]);

  function onTrainDone() {
    const currentIndex = transcript.findIndex((t) => t === currentTranscript);
    setStatus('playing');
    setCurrentTranscript(transcript[currentIndex + 1]);
    playVideo();
  }

  function onTrainReplay() {
    if (!currentTranscript) return;
    playVideo(currentTranscript.offset);
    delayedCountRef.current = 0;
  }

  function reset() {
    setStatus('idle');
    setCurrentTranscript(null);
    setCurrentTime(-1);
    setTranscript(null);
  }

  function handleCloseClick() {
    playVideo();
  }

  if (status !== 'train') return null;

  return (
    <div
      className=" bg-gradient-to-t from-[rgba(0,0,0,0.7)] to-[transparent]"
      style={{ ...playerSize }}
    >
      <div className="absolute bottom-0 w-full h-[80px]">
        <div className="transcript">
          {currentTranscript && (
            <TrainInput
              transcript={currentTranscript}
              onDone={onTrainDone}
              onReplay={onTrainReplay}
            />
          )}
        </div>
        <XMarkIcon
          className="absolute right-0 top-0 w-6 h-6 m-2 text-white cursor-pointer"
          onClick={handleCloseClick}
        />
      </div>
    </div>
  );
}
