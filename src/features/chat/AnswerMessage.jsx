import { ChartColumn, Check, Pin, Table2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { LogoMark } from '../../components/brand/Logo.jsx'
import ChartCard from '../../components/charts/ChartCard.jsx'
import ChartView from '../../components/charts/ChartView.jsx'
import DataTable from '../../components/charts/DataTable.jsx'
import Button from '../../components/ui/Button.jsx'
import { notify } from '../../components/ui/notify.jsx'
import { getAnswer } from '../../data/chat.js'
import { useIsPhone } from '../../hooks/useMediaQuery.js'
import { usePipeline, useStore } from '../../state/AppStore.jsx'

/*
  One answer: the summary first (the answer itself), then the chart as evidence,
  then what you can do with it. The chart card's footer names the pipeline and
  how fresh it is, and warns if that pipeline's last run failed.
*/
export default function AnswerMessage({ answerId }) {
  const answer = useMemo(() => getAnswer(answerId), [answerId])
  const pipeline = usePipeline(answer.pipelineId)
  const [view, setView] = useState('chart')
  const isPhone = useIsPhone()

  return (
    // Fades and rises in over 200ms when it replaces "Reading…", so the swap isn't jarring.
    <article className="flex gap-3 transition-[opacity,translate] duration-200 ease-out-ui starting:translate-y-1.5 starting:opacity-0" aria-label={`Answer: ${answer.title}`}>
      <LogoMark className="hidden size-7 shrink-0 md:block" />
      <div className="min-w-0 flex-1 space-y-4">
        <p className="max-w-[65ch] leading-relaxed">{answer.summary}</p>

        <ChartCard title={answer.title} description={answer.subtitle} pipeline={pipeline} headingLevel="h2">
          {view === 'chart' ? (
            <ChartView spec={answer.chart} height={isPhone ? 220 : 260} />
          ) : (
            <DataTable
              columns={answer.table.columns}
              rows={answer.table.rows}
              caption={answer.title}
              flagKey="missed"
              compact={isPhone}
            />
          )}
        </ChartCard>

        <div className="flex flex-wrap gap-2">
          <PinButton answer={answer} />
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={view === 'table'}
            onClick={() => setView(view === 'chart' ? 'table' : 'chart')}
          >
            {view === 'chart' ? (
              <Table2 className="size-4" aria-hidden="true" />
            ) : (
              <ChartColumn className="size-4" aria-hidden="true" />
            )}
            {view === 'chart' ? 'View as table' : 'View as chart'}
          </Button>
        </div>
      </div>
    </article>
  )
}

function PinButton({ answer }) {
  const { state, actions } = useStore()
  const navigate = useNavigate()
  const pinned = state.pins.some((p) => p.answerId === answer.id)

  function toggle() {
    if (pinned) {
      const undoId = actions.unpin(answer.id)
      notify({
        title: 'Removed from dashboard',
        description: answer.title,
        action: { label: 'Undo', onClick: () => actions.undo(undoId) },
      })
      return
    }
    const undoId = actions.pin(answer.id)
    notify({
      title: 'Pinned to dashboard',
      description: answer.title,
      secondary: { label: 'View', onClick: () => navigate('/dashboard') },
      action: { label: 'Undo', onClick: () => actions.undo(undoId) },
    })
  }

  return (
    <Button variant={pinned ? 'secondary' : 'primary'} size="sm" aria-pressed={pinned} onClick={toggle}>
      {pinned ? <Check className="size-4" aria-hidden="true" /> : <Pin className="size-4" aria-hidden="true" />}
      {pinned ? 'Pinned' : 'Pin to dashboard'}
    </Button>
  )
}
