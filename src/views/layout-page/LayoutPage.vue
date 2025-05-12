<script lang="ts" setup>
import {onBeforeUnmount, onMounted} from "vue";
import {microWebChild} from "@/util/microWeb.ts";
import router from "@/plugin/vue-router.ts";
import {usePermissionsStore} from "@/plugin/pinia";

const isChildWeb = window !== window.parent
if (isChildWeb) {
	const microWebChildInstance = microWebChild({
		router,
		initEvent: (initData: Record<string, any>) => {
			const permissionsStore = usePermissionsStore()
			permissionsStore.permissions = initData.permissions
		},
	})
	onMounted(microWebChildInstance.ready)
	onBeforeUnmount(microWebChildInstance.cancel)
}
</script>

<template>
	<div class="w-full min-w-[1440px] h-full min-h-[700px] flex flex-col">
		<RouterView></RouterView>
		<div class="h-[16px] shrink-0"></div>
	</div>
</template>