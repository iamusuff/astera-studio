/*
  The light behind the glass. Three very soft color fields (blue, indigo, teal,
  the same family as the tint) drift slowly behind the whole app, like an iOS
  wallpaper. Glass only reads as glass when there is something behind it.

  Light mode needs stronger color than dark: on a pale page a faint glow just
  reads as grey, so the fields are about twice as saturated there.

  Pure CSS gradients: sharp at every size, adapts to dark mode, no image files.
  Only transform is animated (cheap on the GPU); it stops under reduce motion.
*/
const FIELD = 'absolute rounded-full will-change-transform motion-safe:animate-[var(--drift)]'

export default function Ambient() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className={`${FIELD} -top-[25vmax] -left-[15vmax] size-[75vmax] bg-[radial-gradient(closest-side,rgb(0_122_255/0.30),transparent)] dark:bg-[radial-gradient(closest-side,rgb(10_132_255/0.2),transparent)]`}
        style={{ '--drift': 'drift-a 40s ease-in-out infinite' }}
      />
      <div
        className={`${FIELD} top-[15vh] -right-[25vmax] size-[70vmax] bg-[radial-gradient(closest-side,rgb(94_92_230/0.24),transparent)] dark:bg-[radial-gradient(closest-side,rgb(94_92_230/0.2),transparent)]`}
        style={{ '--drift': 'drift-b 48s ease-in-out infinite' }}
      />
      <div
        className={`${FIELD} -bottom-[35vmax] left-[10vw] size-[80vmax] bg-[radial-gradient(closest-side,rgb(48_176_199/0.24),transparent)] dark:bg-[radial-gradient(closest-side,rgb(64_200_224/0.12),transparent)]`}
        style={{ '--drift': 'drift-c 56s ease-in-out infinite' }}
      />
    </div>
  )
}
