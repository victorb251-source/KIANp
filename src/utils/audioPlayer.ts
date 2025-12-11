import { AUDIO_SETTINGS_STORAGE_KEY } from '../constants';

interface AudioSettings {
  volume: number; // 0.0 to 1.0
  muted: boolean;
}

let settings: AudioSettings = {
  volume: 1.0,
  muted: false,
};

// Load initial settings from local storage
try {
  const saved = localStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
  if (saved) {
    settings = JSON.parse(saved);
  }
} catch (e) {
  console.error("Failed to load audio settings", e);
}

const saveSettings = () => {
  try {
    localStorage.setItem(AUDIO_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save audio settings", e);
  }
};

/**
 * Sets the global volume for the application.
 * @param volume A number between 0 and 1.
 */
export const setGlobalVolume = (volume: number) => {
  settings.volume = Math.max(0, Math.min(1, volume));
  saveSettings();
};

/**
 * Mutes or unmutes the application globally.
 * @param muted Boolean indicating if audio should be muted.
 */
export const setGlobalMute = (muted: boolean) => {
  settings.muted = muted;
  saveSettings();
};

/**
 * Retrieves the current audio settings.
 */
export const getAudioSettings = () => {
  return { ...settings };
};

/**
 * Plays an audio file from a given URL, respecting global volume and mute settings.
 * @param url The URL of the audio file to play.
 */
export const playSound = (url: string): void => {
  if (settings.muted) return;

  try {
    const audio = new Audio(url);
    audio.volume = settings.volume;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // We log errors to the console for debugging but don't interrupt the user experience,
        // as audio failing to play is not a critical application error.
        console.error(`Audio playback error for ${url}:`, error);
      });
    }
  } catch (e) {
    console.error(`Failed to create or play audio from ${url}:`, e);
  }
};
