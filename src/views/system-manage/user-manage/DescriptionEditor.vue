<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type {
  IRichText,
  ILine,
  IText,
  ITextContent,
  IPicture,
  IPureTable,
  IDataTable,
} from '@views/system-manage/user-manage/IRichText.ts'
import { alignmentList, mockIndicatorObject } from '@views/system-manage/user-manage/IRichText.ts'
import { useBaseFetch } from '@/util/hooks/useBaseFetch.ts'

interface IIndicatorRaw {
  indicatorId: number
  indicatorName: string
  extractColumnList: { name: string; label: string }[]
}

const props = defineProps<{
  modelValue: IRichText
}>()

const emit = defineEmits<{
  'update:modelValue': [value: IRichText]
}>()

// 稳定 key：避免删除/排序后 index 错位导致闪烁；Symbol 不会被 JSON 序列化
const _KEY = Symbol('elKey')
let _keyCounter = 0
function getElKey(element: any): number {
  return element[_KEY] ??= ++_keyCounter
}

function createDefault(): IRichText {
  return {
    header: {
      tag: 'header',
      color: '#ffffff',
      text: {
        tag: 'text',
        content: '',
        attr: { color: '#000000', weight: 0, alignment: 1 },
      },
    },
    elements: [],
  }
}

const richText = ref<IRichText>(props.modelValue ?? createDefault())

watch(richText, (val) => { emit('update:modelValue', val) }, { deep: true })
watch(() => props.modelValue, (val) => {
  if (val && val !== richText.value) {
    richText.value = val
  }
})

function getTagLabel(tag: string): string {
  return ({ hr: '分割线', div: '文本', img: '图片', table: '普通表格', dataTable: '数据表格' } as Record<string, string>)[tag] ?? tag
}

function getTagElType(tag: string): 'info' | 'success' | 'warning' | 'danger' | '' {
  return ({ hr: 'info', div: '', img: 'success', table: 'warning', dataTable: 'danger' } as Record<string, 'info' | 'success' | 'warning' | 'danger' | ''>)[tag] ?? ''
}

function getTagColor(tag: string): string {
  return ({
    hr: '#909399',
    div: '#409eff',
    img: '#67c23a',
    table: '#e6a23c',
    dataTable: '#f56c6c',
  } as Record<string, string>)[tag] ?? '#dcdfe6'
}

function makeText(): IText {
  return {
    tag: 'div',
    texts: [[{
      tag: 'text',
      content: '',
      attr: { color: '#000000', weight: 0, href: '', alignment: 1 },
    }]] as [[ITextContent]],
  }
}

function makeImg(): IPicture {
  return { tag: 'img', picurl: '', ratio: 1, url: '' }
}

function makeTable(): IPureTable {
  return {
    tag: 'table',
    content: Array(9).fill(''),
    attr: { line: 'false', column: 3, bold: 'false' },
    attr_row: [],
    attr_col: [],
  }
}

function makeDataTable(): IDataTable {
  return {
    tag: 'dataTable',
    attr_row: [],
    attr_col: [],
    attr: { line: 'false', column: 0, bold: 'false', color: '#000000', indicator: null, field: [] },
  }
}

type AddType = 'hr' | 'text' | 'img' | 'table' | 'dataTable'

function addElement(type: AddType) {
  const el = type === 'hr' ? { tag: 'hr' } as ILine
    : type === 'text' ? makeText()
      : type === 'img' ? makeImg()
        : type === 'table' ? makeTable()
          : makeDataTable()
  richText.value.elements.push(el)
}

async function removeElement(index: number) {
  try {
    await ElMessageBox.confirm('确定删除该内容块吗？删除后无法撤销。', '删除确认', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger',
    })
    richText.value.elements.splice(index, 1)
  } catch {
    // 用户取消
  }
}

function moveUp(index: number) {
  if (index === 0) return
  const elements = richText.value.elements
  ;[elements[index - 1], elements[index]] = [elements[index], elements[index - 1]]
}

function moveDown(index: number) {
  const elements = richText.value.elements
  if (index >= elements.length - 1) return
  ;[elements[index], elements[index + 1]] = [elements[index + 1], elements[index]]
}

// --- Pure table helpers ---
function tableRows(el: IPureTable): number {
  return el.attr.column > 0 ? Math.ceil(el.content.length / el.attr.column) : 0
}

function getCell(el: IPureTable, rowIndex: number, colIndex: number): string {
  return el.content[rowIndex * el.attr.column + colIndex] ?? ''
}

function setCell(el: IPureTable, rowIndex: number, colIndex: number, value: string) {
  el.content[rowIndex * el.attr.column + colIndex] = value
}

async function changeTableCols(el: IPureTable, newCols: number) {
  if (!newCols || newCols < 1) return
  const rows = tableRows(el)
  if (newCols < el.attr.column) {
    const hasData = Array.from({ length: rows }, (_, rowIdx) =>
      Array.from({ length: el.attr.column - newCols }, (__, colIdx) =>
        el.content[rowIdx * el.attr.column + newCols + colIdx],
      ),
    ).flat().some(cellValue => cellValue && cellValue.trim() !== '')
    if (hasData) {
      try {
        await ElMessageBox.confirm(
          `减少列数将永久删除第 ${newCols + 1} 列起的已有数据，确定继续吗？`,
          '数据丢失警告',
          {
            type: 'warning',
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            confirmButtonClass: 'el-button--danger',
          },
        )
      } catch {
        // 用户取消：强制 el-input-number 重置为原列数
        const originalCols = el.attr.column
        el.attr.column = 0
        await nextTick()
        el.attr.column = originalCols
        return
      }
    }
  }
  const newContent: string[] = Array(rows * newCols).fill('')
  for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
    for (let colIdx = 0; colIdx < Math.min(el.attr.column, newCols); colIdx++) {
      newContent[rowIdx * newCols + colIdx] = el.content[rowIdx * el.attr.column + colIdx] ?? ''
    }
  }
  el.content = newContent
  el.attr.column = newCols
}

function addRow(el: IPureTable) {
  el.content.push(...Array(el.attr.column).fill(''))
}

function delLastRow(el: IPureTable) {
  if (tableRows(el) <= 1) return
  el.content.splice(el.content.length - el.attr.column, el.attr.column)
}

// --- Attr row/col ---
function addAttrRow(el: IPureTable | IDataTable) {
  el.attr_row.push({ row: el.attr_row.length + 1, color: '#000000', bold: 'false' })
}

function delAttrRow(el: IPureTable | IDataTable, index: number) {
  el.attr_row.splice(index, 1)
}

function addAttrCol(el: IPureTable | IDataTable) {
  el.attr_col.push({ col: el.attr_col.length + 1, color: '#000000', bold: 'false', width: 1 })
}

function delAttrCol(el: IPureTable | IDataTable, index: number) {
  el.attr_col.splice(index, 1)
}

// --- Indicator data ---
const indicators = ref<IIndicatorRaw[]>([])

useBaseFetch({
  fetchOptionFn: () => ({
    url: 'indicator_rule/getIndicatorRuleDefinitionList',
    method: 'post' as const,
    data: { pageNum: 1, pageSize: 10000 },
    mockUrl: 'getList',
    mockObject: { list: mockIndicatorObject.list, labelName: 'indicatorName', valueName: 'indicatorId' },
  }),
  transformResponseDataFn: (data: any) => {
    indicators.value = data?.list ?? []
  },
  microTask: true,
})

function getIndicatorOpts() {
  return indicators.value.map(indicator => ({ label: indicator.indicatorName, value: indicator.indicatorId }))
}

function getIndicatorCols(indicatorId: number | null) {
  if (!indicatorId) return []
  return indicators.value.find(indicator => indicator.indicatorId === indicatorId)?.extractColumnList ?? []
}

function onRatioChange(picture: IPicture, ratio: number | null) {
  if (ratio === null || isNaN(ratio as number)) {
    ElMessage.warning('宽高比必须为有效数字')
    picture.ratio = 1
    return
  }
  if (ratio <= 0) {
    ElMessage.warning('宽高比必须大于 0')
    picture.ratio = 0.1
    return
  }
  picture.ratio = ratio
}

function onIndicatorChange(dataTable: IDataTable, indicatorId: number | null) {
  dataTable.attr.indicator = indicatorId
  const extractCols = getIndicatorCols(indicatorId)
  dataTable.attr.column = extractCols.length
  dataTable.attr.field = extractCols.map(col => ({ fieldModel: col.name, name: col.label }))
}
</script>

<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="flex flex-col gap-3">
    <!-- 标题配置 -->
    <div
      class="el-card"
      style="border-left: 3px solid #409eff;"
    >
      <div
        class="card-header"
        style="background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%); border-bottom: none;"
      >
        <span class="text-sm font-medium text-white">标题配置</span>
      </div>
      <div class="card-body">
        <div class="config-row">
          <span class="config-label">标题文本</span>
          <el-input
            v-model="richText.header.text.content"
            placeholder="请输入标题内容"
            style="flex: 1"
          />
        </div>
        <div class="flex flex-wrap gap-x-5 gap-y-1.5 items-center">
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-[#909399] whitespace-nowrap">字体颜色</span>
            <el-color-picker
              v-model="richText.header.text.attr.color"
              size="small"
              @keydown.stop
            />
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-[#909399] whitespace-nowrap">背景颜色</span>
            <el-color-picker
              v-model="richText.header.color"
              size="small"
              @keydown.stop
            />
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-[#909399] whitespace-nowrap">加粗</span>
            <el-checkbox
              :model-value="richText.header.text.attr.weight === 1"
              @change="(checked: boolean) => richText.header.text.attr.weight = checked ? 1 : 0"
            />
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-[#909399] whitespace-nowrap">对齐</span>
            <el-select
              v-model="richText.header.text.attr.alignment"
              style="width: 90px"
              size="small"
            >
              <el-option
                v-for="item in alignmentList"
                :key="item.value as number"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>

    <!-- 元素列表 -->
    <div
      v-for="(element, index) in richText.elements"
      :key="getElKey(element)"
      class="el-card element-card"
      :style="{ borderLeft: `3px solid ${getTagColor(element.tag)}` }"
    >
      <!-- 元素头部 -->
      <div class="card-header">
        <el-tag
          :type="getTagElType(element.tag) || undefined"
          size="small"
        >
          {{ getTagLabel(element.tag) }}
        </el-tag>
        <div class="flex items-center gap-1.5">
          <button
            class="sort-btn"
            :class="{ 'sort-btn--disabled': index === 0 }"
            :disabled="index === 0"
            title="上移"
            @click="moveUp(index)"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
            >
              <path d="M6 2l4.5 5.5H1.5z" />
            </svg>
          </button>
          <button
            class="sort-btn"
            :class="{ 'sort-btn--disabled': index === richText.elements.length - 1 }"
            :disabled="index === richText.elements.length - 1"
            title="下移"
            @click="moveDown(index)"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
            >
              <path d="M6 10L1.5 4.5h9z" />
            </svg>
          </button>
          <el-button
            link
            type="danger"
            @click="removeElement(index)"
          >
            删除
          </el-button>
        </div>
      </div>

      <div class="card-body">
        <!-- 分割线 -->
        <el-divider
          v-if="element.tag === 'hr'"
          class="my-1"
        />

        <!-- 文本 (div) -->
        <template v-else-if="element.tag === 'div'">
          <div class="config-row items-start!">
            <span class="config-label mt-1.5">文本内容</span>
            <el-input
              v-model="(element as IText).texts[0][0].content"
              type="textarea"
              :rows="2"
              placeholder="请输入文本内容"
              style="flex: 1"
            />
          </div>
          <div class="flex flex-wrap gap-x-5 gap-y-1.5 items-center">
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-[#909399] whitespace-nowrap">字体颜色</span>
              <el-color-picker
                v-model="(element as IText).texts[0][0].attr.color"
                size="small"
                @keydown.stop
              />
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-[#909399] whitespace-nowrap">加粗</span>
              <el-checkbox
                :model-value="(element as IText).texts[0][0].attr.weight === 1"
                @change="(checked: boolean) => (element as IText).texts[0][0].attr.weight = checked ? 1 : 0"
              />
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-[#909399] whitespace-nowrap">对齐</span>
              <el-select
                v-model="(element as IText).texts[0][0].attr.alignment"
                style="width: 90px"
                size="small"
              >
                <el-option
                  v-for="item in alignmentList"
                  :key="item.value as number"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
          <div class="config-row">
            <span class="config-label">链接地址</span>
            <el-input
              v-model="(element as IText).texts[0][0].attr.href"
              placeholder="请输入链接地址（选填）"
              size="small"
              style="flex: 1"
            />
          </div>
        </template>

        <!-- 图片 (img) -->
        <template v-else-if="element.tag === 'img'">
          <div class="config-row">
            <span class="config-label">图片地址</span>
            <el-input
              v-model="(element as IPicture).picurl"
              placeholder="请输入图片URL"
              size="small"
              style="flex: 1"
            />
          </div>
          <div class="config-row">
            <span class="config-label">链接地址</span>
            <el-input
              v-model="(element as IPicture).url"
              placeholder="请输入跳转链接URL（选填）"
              size="small"
              style="flex: 1"
            />
          </div>
          <div class="config-row">
            <span class="config-label flex items-center gap-1">
              宽高比
              <el-tooltip
                content="宽度 ÷ 高度的比值，例如 16:9 输入 1.78，须大于 0"
                placement="top"
              >
                <span class="tip-icon">?</span>
              </el-tooltip>
            </span>
            <el-input-number
              :model-value="(element as IPicture).ratio"
              :min="0.1"
              :step="0.1"
              :precision="2"
              size="small"
              :controls="false"
              @change="(ratio: number | null) => onRatioChange(element as IPicture, ratio)"
            />
            <span class="text-[11px] text-[#c0c4cc] shrink-0">须大于 0</span>
          </div>
        </template>

        <!-- 普通表格 (table) -->
        <template v-else-if="element.tag === 'table'">
          <div class="flex flex-wrap gap-x-5 gap-y-1.5 items-center">
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-[#909399] whitespace-nowrap">列数</span>
              <el-input-number
                :model-value="(element as IPureTable).attr.column"
                :min="1"
                :max="4"
                size="small"
                :controls="false"
                style="width: 70px"
                @change="(colCount: number) => changeTableCols(element as IPureTable, colCount)"
              />
              <span class="text-[11px] text-[#c0c4cc] shrink-0">1 ~ 4</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-[#909399] whitespace-nowrap">显示分割线</span>
              <el-checkbox
                :model-value="(element as IPureTable).attr.line === 'true'"
                @change="(checked: boolean) => (element as IPureTable).attr.line = checked ? 'true' : 'false'"
              />
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-[#909399] whitespace-nowrap">加粗</span>
              <el-checkbox
                :model-value="(element as IPureTable).attr.bold === 'true'"
                @change="(checked: boolean) => (element as IPureTable).attr.bold = checked ? 'true' : 'false'"
              />
            </div>
          </div>

          <!-- 表格内容 -->
          <div class="sub-section">
            <div class="sub-header">
              表格内容（{{ tableRows(element as IPureTable) }} 行 × {{ (element as IPureTable).attr.column }} 列）
            </div>
            <div
              class="table-grid"
              :style="{ gridTemplateColumns: `repeat(${(element as IPureTable).attr.column}, 1fr)` }"
            >
              <template
                v-for="rowNum in tableRows(element as IPureTable)"
                :key="rowNum"
              >
                <el-input
                  v-for="colNum in (element as IPureTable).attr.column"
                  :key="colNum"
                  :model-value="getCell(element as IPureTable, rowNum - 1, colNum - 1)"
                  size="small"
                  @update:model-value="(newValue: string) => setCell(element as IPureTable, rowNum - 1, colNum - 1, newValue)"
                />
              </template>
            </div>
            <div class="flex gap-2 mt-1">
              <el-button
                size="small"
                :disabled="tableRows(element as IPureTable) >= 4"
                @click="addRow(element as IPureTable)"
              >
                添加行
              </el-button>
              <el-button
                size="small"
                :disabled="tableRows(element as IPureTable) <= 1"
                @click="delLastRow(element as IPureTable)"
              >
                删除末行
              </el-button>
            </div>
          </div>

          <!-- 列属性 -->
          <div class="sub-section">
            <div class="sub-header-row">
              <div class="sub-header flex items-center gap-1">
                列属性（自定义列样式）
                <el-tooltip
                  content="针对特定列设置样式，优先级高于全局样式，第几列从 1 开始计数"
                  placement="top"
                >
                  <span class="tip-icon">?</span>
                </el-tooltip>
              </div>
              <el-button
                size="small"
                @click="addAttrCol(element as IPureTable)"
              >
                添加
              </el-button>
            </div>
            <div
              v-if="(element as IPureTable).attr_col.length > 0"
              class="attr-list"
            >
              <div
                v-for="(row, $index) in (element as IPureTable).attr_col"
                :key="$index"
                class="attr-item"
              >
                <span class="attr-seq">{{ $index + 1 }}</span>
                <span class="config-label">第几列</span>
                <el-input-number
                  v-model="row.col"
                  :min="1"
                  size="small"
                  :controls="false"
                  style="width: 60px"
                />
                <span class="config-label flex items-center gap-1">
                  列宽占比
                  <el-tooltip
                    content="各列宽度的相对权重，实际宽度 = 该列值 ÷ 所有列值之和"
                    placement="top"
                  >
                    <span class="tip-icon">?</span>
                  </el-tooltip>
                </span>
                <el-input-number
                  v-model="row.width"
                  :min="0.1"
                  :step="0.1"
                  :precision="1"
                  size="small"
                  :controls="false"
                  style="width: 70px"
                />
                <span class="text-[11px] text-[#c0c4cc] shrink-0">≥ 0.1</span>
                <span class="config-label">加粗</span>
                <el-checkbox
                  :model-value="row.bold === 'true'"
                  @change="(checked: boolean) => row.bold = checked ? 'true' : 'false'"
                />
                <span class="config-label">字体颜色</span>
                <el-color-picker
                  v-model="row.color"
                  size="small"
                  @keydown.stop
                />
                <el-button
                  link
                  type="danger"
                  class="ml-auto"
                  @click="delAttrCol(element as IPureTable, $index)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>

          <!-- 行属性 -->
          <div class="sub-section">
            <div class="sub-header-row">
              <div class="sub-header flex items-center gap-1">
                行属性（自定义行样式）
                <el-tooltip
                  content="针对特定行设置样式，优先级高于全局样式，第几行从 1 开始计数；当行与列都设置颜色时，以行为准"
                  placement="top"
                >
                  <span class="tip-icon">?</span>
                </el-tooltip>
              </div>
              <el-button
                size="small"
                @click="addAttrRow(element as IPureTable)"
              >
                添加
              </el-button>
            </div>
            <div
              v-if="(element as IPureTable).attr_row.length > 0"
              class="attr-list"
            >
              <div
                v-for="(row, $index) in (element as IPureTable).attr_row"
                :key="$index"
                class="attr-item"
              >
                <span class="attr-seq">{{ $index + 1 }}</span>
                <span class="config-label">第几行</span>
                <el-input-number
                  v-model="row.row"
                  :min="1"
                  size="small"
                  :controls="false"
                  style="width: 60px"
                />
                <span class="config-label">加粗</span>
                <el-checkbox
                  :model-value="row.bold === 'true'"
                  @change="(checked: boolean) => row.bold = checked ? 'true' : 'false'"
                />
                <span class="config-label">字体颜色</span>
                <el-color-picker
                  v-model="row.color"
                  size="small"
                  @keydown.stop
                />
                <el-button
                  link
                  type="danger"
                  class="ml-auto"
                  @click="delAttrRow(element as IPureTable, $index)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </template>

        <!-- 数据表格 (dataTable) -->
        <template v-else-if="element.tag === 'dataTable'">
          <!-- 指标选择 -->
          <div class="config-row">
            <span class="config-label flex items-center gap-1">
              指标
              <el-tooltip
                content="选择数据来源指标，选定后自动加载可配置字段列表"
                placement="top"
              >
                <span class="tip-icon">?</span>
              </el-tooltip>
            </span>
            <el-select
              :model-value="(element as IDataTable).attr.indicator"
              placeholder="请选择指标"
              size="small"
              clearable
              filterable
              style="flex: 1"
              @change="(indicatorId: number | null) => onIndicatorChange(element as IDataTable, indicatorId)"
            >
              <el-option
                v-for="item in getIndicatorOpts()"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>

          <!-- 字段配置 -->
          <template v-if="(element as IDataTable).attr.indicator && (element as IDataTable).attr.field.length > 0">
            <div class="sub-section">
              <div class="sub-header">
                字段配置（{{ (element as IDataTable).attr.column }} 列）
              </div>
              <div
                v-for="(field, fIdx) in (element as IDataTable).attr.field"
                :key="fIdx"
                class="config-row"
              >
                <span class="attr-seq">{{ fIdx + 1 }}</span>
                <el-select
                  v-model="field.fieldModel"
                  placeholder="数据模型字段"
                  size="small"
                  style="width: 160px"
                >
                  <el-option
                    v-for="col in getIndicatorCols((element as IDataTable).attr.indicator)"
                    :key="col.name"
                    :label="col.label"
                    :value="col.name"
                  />
                </el-select>
                <el-input
                  v-model="field.name"
                  placeholder="中文列名"
                  size="small"
                  style="flex: 1"
                />
              </div>
            </div>
          </template>

          <!-- 样式设置 -->
          <div class="flex flex-wrap gap-x-5 gap-y-1.5 items-center">
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-[#909399] whitespace-nowrap">显示分割线</span>
              <el-checkbox
                :model-value="(element as IDataTable).attr.line === 'true'"
                @change="(checked: boolean) => (element as IDataTable).attr.line = checked ? 'true' : 'false'"
              />
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-[#909399] whitespace-nowrap">加粗</span>
              <el-checkbox
                :model-value="(element as IDataTable).attr.bold === 'true'"
                @change="(checked: boolean) => (element as IDataTable).attr.bold = checked ? 'true' : 'false'"
              />
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-[#909399] whitespace-nowrap">字体颜色</span>
              <el-color-picker
                v-model="(element as IDataTable).attr.color"
                size="small"
                @keydown.stop
              />
            </div>
          </div>

          <!-- 列属性 -->
          <div class="sub-section">
            <div class="sub-header-row">
              <div class="sub-header flex items-center gap-1">
                列属性（自定义列样式）
                <el-tooltip
                  content="针对特定列设置样式，优先级高于全局样式，第几列从 1 开始计数"
                  placement="top"
                >
                  <span class="tip-icon">?</span>
                </el-tooltip>
              </div>
              <el-button
                size="small"
                @click="addAttrCol(element as IDataTable)"
              >
                添加
              </el-button>
            </div>
            <div
              v-if="(element as IDataTable).attr_col.length > 0"
              class="attr-list"
            >
              <div
                v-for="(row, $index) in (element as IDataTable).attr_col"
                :key="$index"
                class="attr-item"
              >
                <span class="attr-seq">{{ $index + 1 }}</span>
                <span class="config-label">第几列</span>
                <el-input-number
                  v-model="row.col"
                  :min="1"
                  size="small"
                  :controls="false"
                  style="width: 60px"
                />
                <span class="config-label flex items-center gap-1">
                  列宽占比
                  <el-tooltip
                    content="各列宽度的相对权重，实际宽度 = 该列值 ÷ 所有列值之和"
                    placement="top"
                  >
                    <span class="tip-icon">?</span>
                  </el-tooltip>
                </span>
                <el-input-number
                  v-model="row.width"
                  :min="0.1"
                  :step="0.1"
                  :precision="1"
                  size="small"
                  :controls="false"
                  style="width: 70px"
                />
                <span class="text-[11px] text-[#c0c4cc] shrink-0">≥ 0.1</span>
                <span class="config-label">加粗</span>
                <el-checkbox
                  :model-value="row.bold === 'true'"
                  @change="(checked: boolean) => row.bold = checked ? 'true' : 'false'"
                />
                <span class="config-label">字体颜色</span>
                <el-color-picker
                  v-model="row.color"
                  size="small"
                  @keydown.stop
                />
                <el-button
                  link
                  type="danger"
                  class="ml-auto"
                  @click="delAttrCol(element as IDataTable, $index)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>

          <!-- 行属性 -->
          <div class="sub-section">
            <div class="sub-header-row">
              <div class="sub-header flex items-center gap-1">
                行属性（自定义行样式）
                <el-tooltip
                  content="针对特定行设置样式，优先级高于全局样式，第几行从 1 开始计数；当行与列都设置颜色时，以行为准"
                  placement="top"
                >
                  <span class="tip-icon">?</span>
                </el-tooltip>
              </div>
              <el-button
                size="small"
                @click="addAttrRow(element as IDataTable)"
              >
                添加
              </el-button>
            </div>
            <div
              v-if="(element as IDataTable).attr_row.length > 0"
              class="attr-list"
            >
              <div
                v-for="(row, $index) in (element as IDataTable).attr_row"
                :key="$index"
                class="attr-item"
              >
                <span class="attr-seq">{{ $index + 1 }}</span>
                <span class="config-label">第几行</span>
                <el-input-number
                  v-model="row.row"
                  :min="1"
                  size="small"
                  :controls="false"
                  style="width: 60px"
                />
                <span class="config-label">加粗</span>
                <el-checkbox
                  :model-value="row.bold === 'true'"
                  @change="(checked: boolean) => row.bold = checked ? 'true' : 'false'"
                />
                <span class="config-label">字体颜色</span>
                <el-color-picker
                  v-model="row.color"
                  size="small"
                  @keydown.stop
                />
                <el-button
                  link
                  type="danger"
                  class="ml-auto"
                  @click="delAttrRow(element as IDataTable, $index)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 添加元素 -->
    <el-dropdown
      trigger="click"
      @command="addElement"
    >
      <div class="add-trigger">
        ＋ 添加内容块
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="hr">
            分割线
          </el-dropdown-item>
          <el-dropdown-item command="text">
            文本
          </el-dropdown-item>
          <el-dropdown-item command="img">
            图片
          </el-dropdown-item>
          <el-dropdown-item command="table">
            普通表格
          </el-dropdown-item>
          <!--          <el-dropdown-item command="dataTable">-->
          <!--            数据表格-->
          <!--          </el-dropdown-item>-->
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
/* Card base */
.el-card {
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #ebeef5;
}

/* Element cards with CSS custom property for accent color */
.element-card {
  border-left: 3px solid #dcdfe6;
}

/* Card header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
  padding: 8px 12px;
}


.sort-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  line-height: 1;
}

.sort-btn:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
}

.sort-btn--disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Card body */
.card-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Config row */
.config-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.config-label {
  min-width: 56px;
  text-align: right;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

/* Sub section */
.sub-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sub-header {
  border-left: 2px solid #e4e7ed;
  padding-left: 8px;
  font-size: 12px;
  color: #606266;
  font-weight: 500;
  line-height: 1.6;
}

.sub-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Attr items */
.attr-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attr-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  flex-wrap: wrap;
}

/* Tooltip icon */
.tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #c0c4cc;
  color: #fff;
  font-size: 10px;
  font-style: normal;
  cursor: pointer;
  flex-shrink: 0;
  line-height: 1;
}

.tip-icon:hover {
  background: #909399;
}

.attr-seq {
  min-width: 18px;
  font-size: 11px;
  color: #c0c4cc;
  text-align: center;
  flex-shrink: 0;
}

/* Table grid */
.table-grid {
  display: grid;
  gap: 1px;
  background-color: #dcdfe6;
  border: 1px solid #dcdfe6;
  margin-bottom: 4px;
}

.table-grid :deep(.el-input__wrapper) {
  border-radius: 0;
  box-shadow: none;
}

/* Add trigger */
.add-trigger {
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px dashed #c0c4cc;
  border-radius: 6px;
  cursor: pointer;
  color: #606266;
  font-size: 13px;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
  box-sizing: border-box;
}

.add-trigger:hover {
  border-color: #409eff;
  color: #409eff;
  background: #f0f7ff;
}
</style>
