import { ArrowLeft } from '@phosphor-icons/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import Logo from '../../components/brand/Logo.jsx'
import SegmentedControl from '../../components/ui/SegmentedControl.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

/*
  For reviewers: the live mockup at the brief's three sizes, side by side.
  Each frame is a real, separate copy of the app (tap through it), scaled down
  to fit the window. Not part of the product, so it sits outside the app shell.
*/

const DEVICES = [
  { id: 'iphone', label: 'iPhone', width: 375, height: 812 },
  { id: 'ipad', label: 'iPad', width: 768, height: 1024 },
  { id: 'desktop', label: 'Desktop', width: 1440, height: 900 },
]

const SCREENS = [
  { value: '/chat', label: 'Chat' },
  { value: '/dashboard', label: 'Dashboard' },
  { value: '/pipelines/regional-sales', label: 'Pipeline' },
]

const GAP = 32

export default function DevicePreview() {
  useDocumentTitle('Device preview')
  const [screen, setScreen] = useState('/pipelines/regional-sales')
  const areaRef = useRef(null)
  const [area, setArea] = useState({ width: 1200, height: 700 })

  useLayoutEffect(() => {
    const el = areaRef.current
    const measure = () => setArea({ width: el.clientWidth, height: window.innerHeight - el.getBoundingClientRect().top - 72 })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Wide window: all three in a row at one shared scale, so their real sizes compare
  // honestly. Narrow window: stacked, each scaled to the available width.
  const totalWidth = DEVICES.reduce((sum, d) => sum + d.width, 0) + GAP * (DEVICES.length - 1)
  const row = area.width >= 900
  const rowScale = Math.min((area.width - GAP * (DEVICES.length - 1)) / (totalWidth - GAP * (DEVICES.length - 1)), Math.max(area.height, 360) / 1024)
  const base = window.location.href.split('#')[0]

  return (
    <div className="min-h-dvh px-4 py-6 md:px-8">
      <header className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Logo />
          <div>
            <h1 className="font-semibold">Device preview</h1>
            <p className="text-sm text-ink-muted">Live copies of the mockup at the brief’s three sizes. Each frame works on its own.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl label="Screen" options={SCREENS} value={screen} onChange={setScreen} />
          <Link to="/chat" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium hover:underline pointer-fine:min-h-9">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Open the app
          </Link>
        </div>
      </header>

      <div
        ref={areaRef}
        className={`mx-auto mt-8 flex max-w-[1600px] ${row ? 'items-end justify-center' : 'flex-col items-center'}`}
        style={{ gap: GAP }}
      >
        {DEVICES.map((device) => {
          const scale = row ? rowScale : Math.min(1, area.width / device.width)
          return (
            <figure key={device.id} className="m-0 flex flex-col items-center gap-3">
              <div
                className="overflow-hidden rounded-[14px] border border-line-strong bg-surface shadow-[0_10px_30px_rgb(22_32_42/0.10)]"
                style={{ width: device.width * scale, height: device.height * scale }}
              >
                <iframe
                  key={screen}
                  title={`${device.label} preview`}
                  src={`${base}#${screen}`}
                  width={device.width}
                  height={device.height}
                  className="origin-top-left border-0"
                  style={{ transform: `scale(${scale})` }}
                />
              </div>
              <figcaption className="text-sm text-ink-muted">
                {device.label}, {device.width} × {device.height}
              </figcaption>
            </figure>
          )
        })}
      </div>
    </div>
  )
}
