import { useParams } from 'react-router'

import PageHeader from '../../components/layout/PageHeader.jsx'
import ScreenPlaceholder from '../../components/layout/ScreenPlaceholder.jsx'

export default function PipelineDetailScreen() {
  const { pipelineId } = useParams()
  return (
    <>
      <PageHeader title="Pipeline" description={`Steps for ${pipelineId}`} />
      <ScreenPlaceholder phase={5} />
    </>
  )
}
