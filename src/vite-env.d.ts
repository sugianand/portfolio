/// <reference types="vite/client" />

declare const __BUILD__: {
  hash: string
  count: number
  message: string
  date: string
}

/** Whether this build plays the title card by default (off in production while it's tested). */
declare const __INTRO__: boolean
