import PageHeader from '../../components/layout/PageHeader.jsx'
import ScreenPlaceholder from '../../components/layout/ScreenPlaceholder.jsx'

export default function PipelinesScreen() {
  return (
    <>
      <PageHeader title="Pipelines" description="Every pipeline that feeds your charts, and how its last run went." />
      <ScreenPlaceholder phase={5} />
    </>
  )
}
