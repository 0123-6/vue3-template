<script setup lang="ts">
import {onMounted, useTemplateRef} from "vue";
import {Graph} from "@antv/g6";

// const data = {
// 	nodes: [
// 		{ id: 'node-1', style: { x: 50, y: 50 } },
// 		{ id: 'node-2', style: { x: 250, y: 50 } },
// 	],
// 	edges: [{ source: 'node-1', target: 'node-2' }],
// };
const data = {
	nodes: Array.from({ length: 10 }).map((_, i) => ({
		id: `node-${i}`,
		data: { category: i === 0 ? 'central' : 'around' },
	})),
	edges: Array.from({ length: 9 }).map((_, i) => ({ source: `node-0`, target: `node-${i + 1}` })),
};
const g6Ref = useTemplateRef('g6Ref')
onMounted(() => {
	const graph = new Graph({
		container: g6Ref.value,
		data,
		layout: {
			type: 'd3-force',
		},
		// 配置全局节点样式
		node: {
			// type: (datum) => datum.id === 'node-1' ? 'circle' : 'rect',
			style: {
				// fill: 'pink',
				size: [20, 20],
			},
			palette: {
				field: 'category',
				color: 'tableau',
			},
		},
		// 配置全局边样式
		edge: {
			style: {
				stroke: 'green',
			},
		},
		behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
		// plugins: [{ type: 'grid-line', follow: true }],
	});
	graph.render();
  console.log(graph.getData())
  console.log(graph.getEdgeData())
})
</script>

<template>
	<div class="w-full h-full flex flex-col gap-y-4">
		<div ref="g6Ref" class="w-[500px] h-[500px] border border-primary"></div>
	</div>
</template>