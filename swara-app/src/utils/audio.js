import { Audio } from 'expo-av';
import client from '../api/client';

let soundInstance = null;

export async function startRecording() {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Audio recording permission not granted');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    return recording;
  } catch (error) {
    console.error('startRecording error:', error);
    throw error;
  }
}

export async function stopRecording(recording) {
  try {
    await recording.stopAndUnloadAsync();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    return {
      uri,
      mimeType: 'audio/m4a',
    };
  } catch (error) {
    console.error('stopRecording error:', error);
    throw error;
  }
}

export async function playAudio(uri) {
  try {
    if (soundInstance) {
      await soundInstance.stopAsync();
      await soundInstance.unloadAsync();
      soundInstance = null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );

    soundInstance = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
        soundInstance = null;
      }
    });

    return sound;
  } catch (error) {
    console.error('playAudio error:', error);
    throw error;
  }
}

export async function stopAudio() {
  try {
    if (soundInstance) {
      await soundInstance.stopAsync();
      await soundInstance.unloadAsync();
      soundInstance = null;
    }
  } catch (error) {
    console.error('stopAudio error:', error);
  }
}

export async function uploadAudio(uri, endpoint, extraFormData = {}) {
  try {
    const formData = new FormData();

    const filename = uri.split('/').pop();
    const mimeType = filename.endsWith('.m4a')
      ? 'audio/m4a'
      : filename.endsWith('.mp3')
      ? 'audio/mpeg'
      : filename.endsWith('.wav')
      ? 'audio/wav'
      : 'audio/m4a';

    formData.append('audio', {
      uri,
      name: filename,
      type: mimeType,
    });

    Object.entries(extraFormData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await client.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('uploadAudio error:', error);
    throw error;
  }
}
