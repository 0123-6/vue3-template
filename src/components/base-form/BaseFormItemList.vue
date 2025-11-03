<script setup lang="ts">
import type {IElFormItem, IUseElFormReturn} from '@/components/base-form/useElForm.ts'
import {dateShortcutsWeekAndMonthAndYear, defaultTime} from '@/util/date.ts'
import {isTrue} from '@/util/validator.ts'
import {type FormItemRule} from 'element-plus'
import {computed} from 'vue'

interface IProps {
  formObject: IUseElFormReturn<Record<string, any>>,
  range?: number[],
}


const props = defineProps<IProps>()
const emit = defineEmits(['change'])

const getRules = (item: IElFormItem)
  : FormItemRule[] => {
  let rules = []
  if (isTrue(item.required)) {
    rules.push({
      required: true,
      trigger: 'change',
      message: `${item.label}不能为空`,
    })
  }
  if (item.rules) {
    if (Array.isArray(item.rules)) {
      rules = [
        ...rules,
        ...item.rules,
      ]
    } else {
      rules = [
        ...rules,
        item.rules,
      ]
    }
  }
  return rules
}

const computedMap = Object.create(null)
props.formObject.list
  .filter(item => ((item.type === 'daterange' || item.type === 'datetimerange')))
  .forEach(item => {
    if (!Array.isArray(item.prop)) {
      return new Error('item.type === \'daterange\' || item.type === \'datetimerange\'时, item.prop应该为数组')
    }
    computedMap[item.label] = computed({
      get: () => {
        return [
          props.formObject.data[item.prop[0]],
          props.formObject.data[item.prop[1]],
        ]
      },
      set: value => {
        if (!value) {
          props.formObject.reset({
            [item.prop[0]]: undefined,
            [item.prop[1]]: undefined,
          })
        } else if (Array.isArray(value)) {
          props.formObject.reset({
            [item.prop[0]]: value[0],
            [item.prop[1]]: value[1],
          })
        } else {
          throw new Error('getModel的set的value不合法,请检查代码!')
        }
      },
    })
  })
</script>

<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <el-form-item
    v-for="(item, index) in formObject.list.slice(range?.[0], range?.[1])"
    v-show="!(formObject.isFold.value && index >= formObject.foldNumber)"
    :key="index"
    :prop="Array.isArray(item.prop) ? item.prop[0] : item.prop"
    :label="isTrue(item.hiddenLabel) ? '' : item.label"
    :rules="getRules(item)"
  >
    <el-input
      v-if="item.type === 'input' || item.type === 'input-password' || item.type === 'textarea'"
      v-model="formObject.data[item.prop as string]"
      :type="item.type === 'input' ? 'text' : item.type === 'input-password' ? 'password' : 'textarea'"
      :placeholder="item.placeholder ? item.placeholder : `请输入${item.label}`"
      :size="item.size"
      clearable
      :disabled="isTrue(item.disabled)"
      :minlength="item.minLength"
      :maxlength="item.maxLength"
      :show-password="item.type === 'input-password'"
      :show-word-limit="item.maxLength > 0"
      :rows="item.rows"
      @change="emit('change')"
    />
    <el-input-number
      v-else-if="item.type === 'number'"
      v-model="formObject.data[item.prop as string]"
      :placeholder="item.placeholder ? item.placeholder : `请输入${item.label}`"
      :min="0"
      :step="1"
      :step-strictly="true"
      :precision="0"
      :size="item.size"
      :disabled="isTrue(item.disabled)"
      :controls="false"
      @change="emit('change')"
    />
    <el-select
      v-else-if="item.type === 'select'"
      v-model="formObject.data[item.prop as string]"
      v-loading="!Array.isArray(item.selectObject) ? item.selectObject?.isFetching : false"
      :placeholder="item.placeholder ? item.placeholder : `请选择${item.label}`"
      :size="item.size"
      clearable
      :multiple="item.multiple ?? true"
      filterable
      collapse-tags
      collapse-tags-tooltip
      :disabled="(!Array.isArray(item.selectObject) ? item.selectObject?.isFetching : false)
        || isTrue(item.disabled)"
      default-first-option
      :allow-create="item.allowCreate"
      @change="emit('change')"
    >
      <el-option
        v-for="(item2, index2) in (!Array.isArray(item.selectObject) ? item.selectObject?.data : item.selectObject)"
        :key="index2"
        :label="item2.label"
        :value="item2.value"
        :disabled="item2.disabled"
      />
    </el-select>
    <el-tree-select
      v-else-if="item.type === 'tree'"
      v-model="formObject.data[item.prop as string]"
      v-loading="!Array.isArray(item.selectObject) ? item.selectObject?.isFetching : false"
      :placeholder="item.placeholder ? item.placeholder : `请选择${item.label}`"
      :size="item.size"
      clearable
      :multiple="item.multiple ?? true"
      filterable
      collapse-tags
      collapse-tags-tooltip
      :disabled="(!Array.isArray(item.selectObject) ? item.selectObject?.isFetching : false)
        || isTrue(item.disabled)"
      :data="(!Array.isArray(item.selectObject) ? item.selectObject?.data : item.selectObject)"
      check-strictly
      :render-after-expand="false"
      :lazy="item.lazy"
      :load="item.load"
      :default-expand-all="item.defaultExpandAll"
      @change="emit('change')"
    />
    <el-radio-group
      v-else-if="item.type === 'radio'"
      v-model="formObject.data[item.prop as string]"
      :disabled="isTrue(item.disabled)"
      @change="emit('change')"
    >
      <el-radio
        v-for="(item2, index2) in (!Array.isArray(item.selectObject) ? item.selectObject?.data : item.selectObject)"
        :key="index2"
        :label="item2.label"
        :value="item2.value"
        :disabled="item2.disabled"
      />
    </el-radio-group>
    <el-checkbox
      v-else-if="item.type === 'checkbox'"
      v-model="formObject.data[item.prop as string]"
      :label="item.label"
      :disabled="isTrue(item.disabled)"
      @change="emit('change')"
    />
    <el-date-picker
      v-else-if="item.type === 'date' || item.type === 'datetime'"
      v-model="formObject.data[item.prop as string]"
      :placeholder="item.placeholder ? item.placeholder : `请选择${item.label}`"
      :size="item.size"
      :clearable="true"
      :type="item.type"
      :disabled="isTrue(item.disabled)"
      :disabled-date="item.disabledDateFn"
      range-separator="至"
      :start-placeholder="(item.type === 'date') ? '开始日期' : '开始时间'"
      :end-placeholder="(item.type === 'date') ? '结束日期' : '结束时间'"
      unlink-panels
      :format="(item.type === 'date') ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'"
      :value-format="(item.type === 'date') ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'"
      @change="emit('change')"
    />
    <el-date-picker
      v-else-if="item.type === 'daterange' || item.type === 'datetimerange'"
      v-model="computedMap[item.label].value"
      :placeholder="item.placeholder ? item.placeholder : `请选择${item.label}`"
      :size="item.size"
      :clearable="true"
      :type="item.type"
      :disabled="isTrue(item.disabled)"
      :disabled-date="item.disabledDateFn"
      range-separator="至"
      :start-placeholder="(item.type === 'daterange') ? '开始日期' : '开始时间'"
      :end-placeholder="(item.type === 'daterange') ? '结束日期' : '结束时间'"
      unlink-panels
      :shortcuts="item.shortcuts ?? dateShortcutsWeekAndMonthAndYear"
      :format="(item.type === 'daterange') ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'"
      :value-format="(item.type === 'daterange') ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'"
      :default-time="defaultTime"
      @change="emit('change')"
    />
  </el-form-item>
</template>
