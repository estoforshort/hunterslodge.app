<script setup lang="ts">
import dayjs from "dayjs";
import {
  VisArea,
  VisCrosshair,
  VisLine,
  VisTooltip,
  VisXYContainer,
} from "@unovis/vue";

const props = defineProps<{
  changes: {
    quality: string;
    createdAt: string;
  }[];
}>();

type DataRecord = { x: number; y: number };
const data = ref<DataRecord[]>([]);

for (let c = 0, cl = props.changes.length; c < cl; c++) {
  const change = props.changes[c];

  if (change && change.createdAt) {
    data.value.push({
      x: dayjs(change.createdAt).unix(),
      y: Number(change.quality),
    });
  }
}

const template = (d: DataRecord) =>
  `${dayjs.unix(d.x).format("DD.MM.YYYY")}: ${d.y}%`;
</script>

<template>
  <VisXYContainer :data="data" class="h-24">
    <VisLine
      :x="(d: DataRecord) => d.x"
      :y="(d: DataRecord) => d.y"
      color="rgb(var(--color-primary-DEFAULT))"
    />

    <VisArea
      :x="(d: DataRecord) => d.x"
      :y="(d: DataRecord) => d.y"
      color="rgb(var(--color-primary-DEFAULT))"
      :opacity="0.1"
    />

    <VisCrosshair
      color="rgb(var(--color-primary-DEFAULT))"
      :template="template"
    />

    <VisTooltip />
  </VisXYContainer>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: rgb(var(--color-primary-500));
  --vis-crosshair-circle-stroke-color: #fff;

  --vis-axis-grid-color: rgb(var(--color-gray-200));
  --vis-axis-tick-color: rgb(var(--color-gray-200));
  --vis-axis-tick-label-color: rgb(var(--color-gray-400));

  --vis-tooltip-background-color: #fff;
  --vis-tooltip-border-color: rgb(var(--color-gray-200));
  --vis-tooltip-text-color: rgb(var(--color-gray-900));
}

.dark {
  .unovis-xy-container {
    --vis-crosshair-line-stroke-color: rgb(var(--color-primary-400));
    --vis-crosshair-circle-stroke-color: rgb(var(--color-gray-900));

    --vis-axis-grid-color: rgb(var(--color-gray-800));
    --vis-axis-tick-color: rgb(var(--color-gray-800));
    --vis-axis-tick-label-color: rgb(var(--color-gray-500));

    --vis-tooltip-background-color: rgb(var(--color-gray-900));
    --vis-tooltip-border-color: rgb(var(--color-gray-800));
    --vis-tooltip-text-color: #fff;
  }
}
</style>
