import type { Language } from '@/types'

export class SpeechRecognitionManager {
  private recognition: SpeechRecognition | null = null
  private language: Language = 'en-US'
  private onResultCallback: (transcript: string, interim: boolean) => void = () => {}
  private onErrorCallback: (error: string) => void = () => {}
  private onEndCallback: () => void = () => {}

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        if (this.recognition) {
          this.recognition.continuous = true
          this.recognition.interimResults = true
          this.recognition.lang = this.language

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            this.onResultCallback(finalTranscript, false)
          } else if (interimTranscript) {
            this.onResultCallback(interimTranscript, true)
          }
        }

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          this.onErrorCallback(event.error)
        }

        this.recognition.onend = () => {
          if (this.recognition && this.language) {
            this.onEndCallback()
          }
        }
        }
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null
  }

  start(): void {
    if (this.recognition) {
      this.recognition.lang = this.language
      this.recognition.start()
    }
  }

  stop(): void {
    if (this.recognition) {
      this.recognition.stop()
    }
  }

  setLanguage(language: Language): void {
    this.language = language
    if (this.recognition) {
      this.recognition.lang = language
    }
  }

  onResult(callback: (transcript: string, interim: boolean) => void): void {
    this.onResultCallback = callback
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback
  }

  abort(): void {
    if (this.recognition) {
      this.recognition.abort()
    }
  }
}
