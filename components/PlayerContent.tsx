'use client'

import { Song } from "@/types";
import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import { BsPauseFill, BsPlayFill } from 'react-icons/bs';
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import Slider from "./Slider";
import usePlayer from "@/hooks/usePlayer";
import { useEffect, useState } from "react";
import useSound from "use-sound";

interface Props {
  song: Song;
  songUrl: string;
}

const PlayerContent = ({ song, songUrl }: Props) => {
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  // play next song
  const onPlayNext = () => {
    if (player.ids.length === 0) return;
    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];
    if (!nextSong) return player.setId(player.ids[0]);
    player.setId(nextSong);
  }

  // play prev song
  const onPlayPrev = () => {
    if (player.ids.length === 0) return;
    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const prevSong = player.ids[currentIndex - 1];
    if (!prevSong) return player.setId(player.ids[player.ids.length - 1]);
    player.setId(prevSong);
  }

  const [play, { pause, sound }] = useSound(songUrl, {
    volume: volume,
    onplay: () => setIsPlaying(true),
    onend: () => { setIsPlaying(false); onPlayNext(); },
    onpause: () => setIsPlaying(false),
    format: ['mp3']
  });

  // Play audio on mount
  useEffect(() => {
    sound?.play();
    return () => {
      sound?.unload();
    }
  }, [sound]);

  // Update currentTime and duration for slider
  useEffect(() => {
    const interval = setInterval(() => {
      if (sound) {
        setCurrentTime(sound.seek());
        setDuration(sound.duration() || 0);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [sound]);

  const handlePlay = () => {
    if (!isPlaying) play();
    else pause();
  }

  const toggleMute = () => {
    if (volume === 0) setVolume(1);
    else setVolume(0);
  }

  const handleSeek = (value: number) => {
    if (!sound) return;
    sound.seek(value);
    setCurrentTime(value);
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 h-full">
      {/* Left: Media + Like */}
      <div className="flex w-full justify-start">
        <div className="flex items-center gap-x-4">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
      </div>

      {/* Mobile play button */}
      <div className="flex md:hidden col-auto w-full justify-end items-center">
        <div onClick={handlePlay} className='h-10 w-10 flex items-center justify-center rounded-full bg-white p-1 cursor-pointer'>
          <Icon size={30} className='text-black' />
        </div>
      </div>

      {/* Desktop controls */}
      <div className="hidden h-full md:flex flex-col justify-center items-center w-full max-w-[722px] gap-y-2">
        <div className="flex items-center gap-x-6">
          <AiFillStepBackward size={30} className='text-neutral-400 cursor-pointer hover:text-white transition' onClick={onPlayPrev} />
          <div className='flex items-center justify-center h-10 w-10 rounded-full bg-white p-1 cursor-pointer' onClick={handlePlay}>
            <Icon size={30} className='text-black' />
          </div>
          <AiFillStepForward size={30} className='text-neutral-400 cursor-pointer hover:text-white transition' onClick={onPlayNext} />
          <span className="text-white text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>

        {/* Seek slider */}
        <div className="w-full flex items-center gap-x-2">
          <Slider value={currentTime} max={duration} onChange={handleSeek} />
        </div>
      </div>

      {/* Volume */}
      <div className="hidden md:flex w-full justify-end pr-2">
        <div className="flex items-center gap-x-2 w-[120px]">
          <VolumeIcon className="cursor-pointer" size={34} onClick={toggleMute} />
          <Slider value={volume} max={1} onChange={(value) => setVolume(value)} />
        </div>
      </div>
    </div>
  )
}

export default PlayerContent;
 