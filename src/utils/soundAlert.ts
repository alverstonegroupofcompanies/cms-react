// Modern Web Audio API Chime & Text-to-Speech synthesizer for Clinic TV Displays

class ClinicAudioNotifier {
  private audioCtx: AudioContext | null = null

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass()
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {/* ignore autoplay resume error */})
    }
    return this.audioCtx
  }

  /**
   * Plays a pleasant dual-tone / triple-tone hospital chime
   */
  public playChime(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext()
        if (!ctx) {
          resolve()
          return
        }

        const now = ctx.currentTime

        // Tone 1: E5 (659.25 Hz)
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(659.25, now)
        gain1.gain.setValueAtTime(0, now)
        gain1.gain.linearRampToValueAtTime(0.35, now + 0.05)
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
        osc1.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.start(now)
        osc1.stop(now + 0.75)

        // Tone 2: G#5 (830.61 Hz)
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(830.61, now + 0.2)
        gain2.gain.setValueAtTime(0, now + 0.2)
        gain2.gain.linearRampToValueAtTime(0.4, now + 0.25)
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1)
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start(now + 0.2)
        osc2.stop(now + 1.15)

        // Tone 3: B5 (987.77 Hz)
        const osc3 = ctx.createOscillator()
        const gain3 = ctx.createGain()
        osc3.type = 'sine'
        osc3.frequency.setValueAtTime(987.77, now + 0.45)
        gain3.gain.setValueAtTime(0, now + 0.45)
        gain3.gain.linearRampToValueAtTime(0.45, now + 0.5)
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.5)
        osc3.connect(gain3)
        gain3.connect(ctx.destination)
        osc3.start(now + 0.45)
        osc3.stop(now + 1.55)

        setTimeout(() => resolve(), 1500)
      } catch {
        resolve()
      }
    })
  }

  /**
   * Speaks the token announcement via SpeechSynthesis
   */
  public speakAnnouncement(tokenCode: string, doctorName?: string, roomNumber?: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve()
        return
      }

      try {
        window.speechSynthesis.cancel() // cancel ongoing speech

        // Split token code so it speaks letter by letter, e.g. "A M C 0 3"
        const spelledToken = tokenCode.replace(/([a-zA-Z]+)(\d+)/, '$1 $2').split('').join(' ')
        let text = `Token ${spelledToken}.`

        if (roomNumber) {
          text += ` Please proceed to ${roomNumber}.`
        }
        if (doctorName) {
          text += ` ${doctorName}.`
        }

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.95
        utterance.pitch = 1.05
        utterance.volume = 1.0

        // Select an English voice if available
        const voices = window.speechSynthesis.getVoices()
        const engVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Female') || v.name.includes('Google')))
          || voices.find((v) => v.lang.startsWith('en'))
        if (engVoice) utterance.voice = engVoice

        utterance.onend = () => resolve()
        utterance.onerror = () => resolve()

        window.speechSynthesis.speak(utterance)
      } catch {
        resolve()
      }
    })
  }

  /**
   * Combined announce: plays chime first, then speaks the token call
   */
  public async announce(tokenCode: string, doctorName?: string, roomNumber?: string) {
    await this.playChime()
    await this.speakAnnouncement(tokenCode, doctorName, roomNumber)
  }
}

export const clinicAudioNotifier = new ClinicAudioNotifier()
