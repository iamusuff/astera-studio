import { animate, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

/*
  A number that glides to its new value (on first view and when a filter
  changes), like the Stocks and Health apps. It starts from 85% of the value,
  not from zero: enough to feel alive, never a slot machine.
  Instant under reduce motion.
*/
export default function CountUp({ value, format }) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce ? value : value * 0.85)
  const from = useRef(reduce ? value : value * 0.85)

  useEffect(() => {
    if (reduce) {
      setDisplay(value)
      from.current = value
      return
    }
    const controls = animate(from.current, value, {
      duration: 0.9,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: setDisplay,
    })
    from.current = value
    return () => controls.stop()
  }, [value, reduce])

  return format(display)
}
