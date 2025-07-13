<script>
import {defineComponent} from 'vue'
import 'cropperjs'

export default defineComponent({
  name: 'CropperComp',
  props: {
    imgUrl: {
      type: String,
      required: true,
    },
  },
  emits: ['exportImg'],
  data() {
    return {}
  },
  created() {
  },
  methods: {
    inSelection: function (selection, maxSelection) {
      return (
        selection.x >= maxSelection.x
        && selection.y >= maxSelection.y
        && (selection.x + selection.width) <= (maxSelection.x + maxSelection.width)
        && (selection.y + selection.height) <= (maxSelection.y + maxSelection.height)
      )
    },
    onCropperImageTransform(event) {
      const cropperCanvas = this.$refs.cropperCanvas

      if (!cropperCanvas) {
        return
      }

      const cropperImage = this.$refs.cropperImage
      const cropperSelection = this.$refs.cropperSelection
      const cropperCanvasRect = cropperCanvas.getBoundingClientRect()

      // 1. Clone the cropper image.
      const cropperImageClone = cropperImage.cloneNode()

      // 2. Apply the new matrix to the cropper image clone.
      cropperImageClone.style.transform = `matrix(${event.detail.matrix.join(', ')})`

      // 3. Make the cropper image clone invisible.
      cropperImageClone.style.opacity = '0'

      // 4. Append the cropper image clone to the cropper canvas.
      cropperCanvas.appendChild(cropperImageClone)

      // 5. Compute the boundaries of the cropper image clone.
      const cropperImageRect = cropperImageClone.getBoundingClientRect()

      // 6. Remove the cropper image clone.
      cropperCanvas.removeChild(cropperImageClone)

      const selection = cropperSelection
      const maxSelection = {
        x: cropperImageRect.left - cropperCanvasRect.left,
        y: cropperImageRect.top - cropperCanvasRect.top,
        width: cropperImageRect.width,
        height: cropperImageRect.height,
      }

      if (maxSelection.width > 0
        && maxSelection.height > 0
        && !this.inSelection(selection, maxSelection)) {
        event.preventDefault()
      }
    },
    onCropperSelectionChange(event) {
      const cropperCanvas = this.$refs.cropperCanvas

      if (!cropperCanvas) {
        return
      }

      const cropperCanvasRect = cropperCanvas.getBoundingClientRect()
      const selection = event.detail

      const cropperImage = this.$refs.cropperImage
      const cropperImageRect = cropperImage.getBoundingClientRect()
      const maxSelection = {
        x: cropperImageRect.left - cropperCanvasRect.left,
        y: cropperImageRect.top - cropperCanvasRect.top,
        width: cropperImageRect.width,
        height: cropperImageRect.height,
      }

      if (maxSelection.width > 0
        && maxSelection.height > 0
        && !this.inSelection(selection, maxSelection)
      ) {
        event.preventDefault()
      }
    },
    async exportImg() {
      const cropperSelection = this.$refs.cropperSelection
      const canvasElement = await cropperSelection.$toCanvas()
      canvasElement.toBlob(blob => {
        const file = new File([blob], 'cropper-image.webp', {
          type: 'image/webp',
        })
        console.log(file)
        this.$emit('exportImg', file)
      }, 'image/webp', 0.95)
    },
  },
})

</script>

<template>
  <div class="hpj w-[1000px] h-[600px] flex justify-between items-center">
    <!--左-->
    <cropper-canvas
      ref="cropperCanvas"
      background
      class="w-[600px] h-[100%]"
    >
      <cropper-image
        ref="cropperImage"
        :src="imgUrl"
        rotatable
        scalable
        skewable
        translatable
        @transform="onCropperImageTransform"
      />
      <cropper-shade hidden />
      <cropper-handle
        action="select"
        plain
      />
      <cropper-selection
        id="cropper-selection"
        ref="cropperSelection"
        class="rounded-full"
        aspect-ratio="1"
        initial-coverage="0.5"
        movable
        resizable
        zoomable
        @change="onCropperSelectionChange"
      >
        <cropper-grid
          role="grid"
          bordered
          covered
        />
        <cropper-crosshair centered />
        <cropper-handle
          action="move"
          theme-color="rgba(255, 255, 255, 0.35)"
        />
        <cropper-handle action="n-resize" />
        <cropper-handle action="e-resize" />
        <cropper-handle action="s-resize" />
        <cropper-handle action="w-resize" />
        <cropper-handle action="ne-resize" />
        <cropper-handle action="nw-resize" />
        <cropper-handle action="se-resize" />
        <cropper-handle action="sw-resize" />
      </cropper-selection>
    </cropper-canvas>
    <!--右-->
    <div class="flex flex-col items-center">
      <cropper-viewer
        selection="#cropper-selection"
        class="w-[300px] h-[300px] border border-orange-400 rounded-full"
      />
      <button
        class="mt-5 w-[100px] h-[50px]"
        @click="exportImg"
      >
        导出
      </button>
    </div>
  </div>
</template>