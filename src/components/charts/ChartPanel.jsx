import { ChartBar, Table } from '@phosphor-icons/react'
import { useState } from 'react'

import { useIsPhone } from '../../hooks/useMediaQuery.js'
import { usePipeline } from '../../state/AppStore.jsx'
import Button from '../ui/Button.jsx'
import ChartCard from './ChartCard.jsx'
import ChartView from './ChartView.jsx'
import DataTable from './DataTable.jsx'

/*
  A dashboard chart: ChartCard + chart + a "View as table" switch in its header.
  `chart` is a definition from data/dashboard.js: { title, subtitle, pipelineId, spec, table }.
*/
export default function ChartPanel({ chart, onSelect, staleNotice, actions, footer, height, className }) {
  const pipeline = usePipeline(chart.pipelineId)
  const [view, setView] = useState('chart')
  const isPhone = useIsPhone()
  const asTable = view === 'table'

  return (
    <ChartCard
      title={chart.title}
      description={chart.subtitle}
      pipeline={pipeline}
      staleNotice={staleNotice}
      footer={footer}
      className={className}
      actions={
        <>
          {actions}
          <Button
            variant="ghost"
            size="icon"
            aria-pressed={asTable}
            aria-label={asTable ? `Show ${chart.title} as a chart` : `Show ${chart.title} as a table`}
            title={asTable ? 'View as chart' : 'View as table'}
            onClick={() => setView(asTable ? 'chart' : 'table')}
          >
            {asTable ? (
              <ChartBar className="size-[18px]" aria-hidden="true" />
            ) : (
              <Table className="size-[18px]" aria-hidden="true" />
            )}
          </Button>
        </>
      }
    >
      {asTable ? (
        <DataTable
          columns={chart.table.columns}
          rows={chart.table.rows}
          caption={chart.title}
          flagKey={chart.table.flagKey}
          flagLabel={chart.table.flagLabel}
          compact={isPhone}
        />
      ) : (
        <ChartView spec={chart.spec} height={height ?? (isPhone ? 200 : 240)} onSelect={onSelect} />
      )}
    </ChartCard>
  )
}
