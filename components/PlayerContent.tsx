'use client'

import { Song } from "@/types";
import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import { BsPauseFill, BsPlayFill } from 'react-icons/bs'
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai"
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2'
import Slider from "./Slider"
import usePlayer from "@/hooks/usePlayer"
import { useEffect, useState, useCallback } from "react"
import useSound from "use-sound"

interface Props {
  song: Song;
  songUrl: string;
}

const PlayerContent = ({ song, songUrl }: Props) => {

  const player = usePlayer()

  const [volume, setVolume] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const Icon = isPlaying ? BsPauseFill : BsPlayFill
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave

  const onPlayNext = useCallback(() => {
    if (player.ids.length === 0) return
    const currentIndex = player.ids.findIndex(id => id === player.activeId)
    const nextSong = player.ids[currentIndex + 1] || player.ids[0]
    player.setId(nextSong)
  }, [player])

  const onPlayPrev = useCallback(() => {
    if (player.ids.length === 0) return
    const currentIndex = player.ids.findIndex(id => id === player.activeId)
    const prevSong = player.ids[currentIndex - 1] || player.ids[player.ids.length - 1]
    player.setId(prevSong)
  }, [player])

  const [play, { pause, sound }] = useSound(songUrl, {
    volume: volume,
    onplay: () => setIsPlaying(true),
    onend: () => {
      setIsPlaying(false)
      onPlayNext()
    },
    onpause: () => setIsPlaying(false),
    format: ['mp3']
  })

  // play audio pe mount
  useEffect(() => {
    sound?.play()
    return () => {
      sound?.unload()
    }
  }, [sound])

  // update progress
  useEffect(() => {
    if (!sound) return
    const interval = setInterval(() => {
      const seek = sound.seek() as number
      setCurrentTime(seek)
      setDuration(sound.duration())
    }, 500)
    return () => clearInterval(interval)
  }, [sound])

  const handlePlay = useCallback(() => {
    if (!isPlaying) play()
    else pause()
  }, [isPlaying, play, pause])

  const toggleMute = useCallback(() => {
    setVolume(prev => prev === 0 ? 1 : 0)
    if (sound) sound.volume(volume)
  }, [volume, sound])

  const handleSeek = (value: number) => {
    sound?.seek(value)
    setCurrentTime(value)
  }

  const formatTime = (time: number) => {
    if (!time) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          handlePlay()
          break
        case 'ArrowRight':
          onPlayNext()
          break
        case 'ArrowLeft':
          onPlayPrev()
          break
        case 'KeyM':
          toggleMute()
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePlay, onPlayNext, onPlayPrev, toggleMute])

  // Media Session API – lockscreen & controls
  useEffect(() => {
    if (!sound) return

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.author,
        artwork: [
          
        ],
      })

      navigator.mediaSession.setActionHandler('play', () => {
        sound.play()
        setIsPlaying(true)
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        sound.pause()
        setIsPlaying(false)
      })
      navigator.mediaSession.setActionHandler('previoustrack', onPlayPrev)
      navigator.mediaSession.setActionHandler('nexttrack', onPlayNext)
    }
  }, [sound, song, onPlayPrev, onPlayNext])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 h-full">

      {/* Left */}
      <div className="flex w-full justify-start">
        <div className="flex items-center gap-x-4">
          <div className="relative flex items-center gap-x-2">
            <MediaItem data={song} />
            <div className="hidden md:flex items-center gap-1 text-[10px] font-medium text-red-600 mb-1">
              <div className="flex gap-[2px]">
                <span className="w-[2px] h-2 bg-red-600 animate-bounce" />
                <span className="w-[2px] h-3 bg-red-600 animate-bounce delay-75" />
                <span className="w-[2px] h-1.5 bg-red-600 animate-bounce delay-150" />
              </div>
              <span className="uppercase tracking-wide">Now Playing</span>
            </div>
          </div>
          <LikeButton songId={song.id} />
        </div>
      </div>

      {/* Mobile Play */}
      <div className="flex md:hidden col-auto w-full justify-end items-center">
        <div
          onClick={handlePlay}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-white p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
        >
          <Icon size={30} className="text-black" />
        </div>
      </div>

      {/* Center */}
      <div className="hidden h-full md:flex flex-col justify-center items-center w-full max-w-[722px] gap-y-2">
        <div className="flex items-center gap-x-6">
          <AiFillStepBackward
            size={30}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
            onClick={onPlayPrev}
          />
          <div
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
            onClick={handlePlay}
          >
            <Icon size={30} className="text-black" />
          </div>
          <AiFillStepForward
            size={30}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
            onClick={onPlayNext}
          />
        </div>

        <div className="flex items-center gap-x-2 w-full">
          <span className="text-xs text-neutral-400">{formatTime(currentTime)}</span>
          <Slider value={currentTime} max={duration} onChange={handleSeek} />
          <span className="text-xs text-neutral-400">{formatTime(duration)}</span>
          <span className="text-xs text-neutral-400">-{formatTime(duration - currentTime)}</span>
        </div>

        {player.ids.length > 1 && (
          <p className="text-xs text-neutral-400 mt-1">{player.ids.length - 1} in queue</p>
        )}
      </div>

      {/* Right */}
      <div className="hidden md:flex w-full justify-end pr-2">
        <div className="flex items-center gap-x-2 w-[120px] relative group">
          <VolumeIcon
            className="cursor-pointer"
            size={34}
            onClick={toggleMute}
          />
          <Slider
            value={volume}
            onChange={(value) => setVolume(value)}
          />
          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block text-xs bg-black text-white px-1 rounded">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

    </div>
  )
}

export default PlayerContent
