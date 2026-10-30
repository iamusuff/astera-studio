/*
  Demo clock.

  The sample data describes one specific morning: the Regional sales pipeline
  failed at 6:04 AM and it is now 9:10 AM. If we used the real clock, a reviewer
  opening the mockup next week would see "failed 7 days ago" and the story would
  stop making sense. So time starts at DEMO_START and then moves forward in real
  time, which keeps "just now" and "2 min ago" honest after a re-run.
*/
export const DEMO_START = new Date('2026-10-31T09:10:00')

const loadedAt = Date.now()

export function now() {
  return new Date(DEMO_START.getTime() + (Date.now() - loadedAt))
}

// Build a demo timestamp relative to DEMO_START, e.g. at(-1, '18:02') = yesterday 6:02 PM.
export function at(dayOffset, hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(DEMO_START)
  d.setDate(d.getDate() + dayOffset)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}
