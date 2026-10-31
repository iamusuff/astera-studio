import { ArrowUUpLeft, ChartLineUp, FlowArrow, Megaphone, Package } from '@phosphor-icons/react'

// What each pipeline is about, as an icon: the Pipelines list tiles and the
// sidebar use the same one. Status is shown separately, never by icon color.
const SUBJECT_ICON = {
  'regional-sales': ChartLineUp,
  'inventory-levels': Package,
  'customer-returns': ArrowUUpLeft,
  'marketing-spend': Megaphone,
}

export const subjectIcon = (pipelineId) => SUBJECT_ICON[pipelineId] ?? FlowArrow
