<script setup lang="ts">
import {isFalse} from '@/util/validator.ts'
import BaseTableColumn from '@/components/base-table/BaseTableColumn.vue'
import {IBaseTableColumn} from '@/components/base-table/useElTable.ts'

interface IProps {
  list: IBaseTableColumn[],
}

defineProps<IProps>()

const getColumnProps = (item: IBaseTableColumn) => ({
  type: item.type ?? 'default',
  prop: item.prop,
  label: item.prop !== 'index' ? item.label : '序号',
  width: item.width ? item.width
    : item.type === 'selection' ? 38
      : item.prop === 'index' ? 60
        : item.list?.length ? Math.max(16 * item.label.length, 14 * Math.max(...(item.list.map(_item => _item.label.length))) + 16 * 2) + 12 * 2 + 2
          : item.operatorList?.length ? Math.max(16 * item.label.length, (item.operatorList.filter(__item => isFalse(__item.hidden))?.length - 1) * 8 + item.operatorList.filter(__item => isFalse(__item.hidden)).reduce((acc, _item) => (acc + _item.text.length), 0) * 14) + 12 * 2 + 2 : undefined,
  minWidth: item.minWidth,
  align: item.children ? 'left' : (item.align ?? 'center'),
  fixed: (item.type === 'selection' || item.prop === 'index') ? 'left'
    : item.operatorList?.length ? 'right'
      : item.fixed,
  sortable: item.sortable,
})
</script>

<template>
  <el-table-column
    v-for="(item, index) in list
      .filter(Boolean)
      .filter(_item => isFalse(_item.hidden))
      .filter(_item => (_item.type || _item.prop || _item.label))
      .filter(_item => !(_item.operatorList?.length && _item.operatorList.filter(__item => isFalse(__item.hidden)).length === 0))
    "
    :key="index"
    v-bind="getColumnProps(item)"
    class="hpj"
  >
    <template v-if="Array.isArray(item.children)">
      <el-table-column
        v-for="(item2, index2) in item.children
          .filter(Boolean)
          .filter(_item => isFalse(_item.hidden))
          .filter(_item => (_item.type || _item.prop || _item.label || _item.operatorList?.length))
          .filter(_item => !(_item.operatorList?.length && _item.operatorList.filter(__item => isFalse(__item.hidden)).length === 0))
        "
        :key="index2"
        v-bind="getColumnProps(item2)"
      >
        <!--3层嵌套暂不考虑-->
        <template
          v-if="$slots[item2.prop]"
          #default="scope"
        >
          <div class="w-full h-full flex justify-center items-center">
            <slot
              :name="item2.prop"
              v-bind="scope"
            />
          </div>
        </template>
        <template
          v-else-if="!Array.isArray(item2.children) && item2.type !== 'selection'"
          #default="scope2"
        >
          <base-table-column
            :item="item2"
            :scope="scope2"
          />
        </template>
      </el-table-column>
    </template>
    <template
      v-if="$slots[item.prop]"
      #default="scope"
    >
      <div class="w-full h-full flex justify-center items-center">
        <slot
          :name="item.prop"
          v-bind="scope"
        />
      </div>
    </template>
    <template
      v-else-if="!Array.isArray(item.children) && item.type !== 'selection'"
      #default="scope"
    >
      <base-table-column
        :item="item"
        :scope="scope"
      />
    </template>
  </el-table-column>
</template>