import { Capacitor } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';

export function isNativePlatform() {
  return Capacitor.isNativePlatform();
}

export async function initializeNativeShell() {
  if (!isNativePlatform()) {
    return;
  }

  document.documentElement.classList.add('native-platform');
  document.body.classList.add('native-platform');

  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#111319' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (error) {
    console.warn('Status bar setup failed:', error);
  }

  try {
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
  } catch (error) {
    console.warn('Keyboard setup failed:', error);
  }
}
