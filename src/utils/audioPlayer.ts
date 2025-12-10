/**
 * Plays an audio file from a given URL.
 * This function creates a new Audio object for each call to ensure reliability
 * and bypasses issues with replaying the same audio element.
 * It also handles the promise returned by the .play() method to catch
 * potential browser-side errors gracefully.
 *
 * @param url The URL of the audio file to play.
 */
export const playSound = (url: string): void => {
  try {
    const audio = new Audio(url);
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