import PageHeader from '../../components/layout/PageHeader.jsx'
import ScreenPlaceholder from '../../components/layout/ScreenPlaceholder.jsx'

export default function DashboardScreen() {
  return (
    <>
      <PageHeader title="Q3 sales overview" description="Revenue, targets and the pipelines that feed them." />
      <ScreenPlaceholder phase={4} />
    </>
  )
}
