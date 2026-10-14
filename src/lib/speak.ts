import { useEffect, useState } from 'react'

// "Read it to me" (C6, 14 Oct): the phone's own voice reads the page. Only voices that run on the device
// (localService) are used, so the page's words never leave it for a speech service; with none, the button stays hidden.
// English (India) first, then any English voice on the device.
function pick(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  const local = window.speechSynthesis.getVoices().filter((v) => v.localService)
  return local.find((v) => v.lang === 'en-IN') ?? local.find((v) => v.lang.startsWith('en')) ?? null
}

export function useLocalVoice() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(() => pick())
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const on = () => setVoice(pick())
    window.speechSynthesis.addEventListener('voiceschanged', on)
    on()
    return () => window.speechSynthesis.removeEventListener('voiceschanged', on)
  }, [])
  return voice
}

export function speak(text: string, voice: SpeechSynthesisVoice, onEnd: () => void) {
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.voice = voice
  u.lang = voice.lang
  u.rate = 0.95
  u.onend = onEnd
  u.onerror = onEnd
  synth.speak(u)
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
}
