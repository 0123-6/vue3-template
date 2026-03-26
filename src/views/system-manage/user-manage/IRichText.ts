import type {ISelectOption} from '@/components/base-form/useElSelect.ts'

// 这个文件是富文本组件的格式定义
// 0表示正常大小，1表示粗体
type TypeBold = 0 | 1
// 1左对齐，2居中，3右对齐， 默认左对齐
type TypeAlignment = 1 | 2 | 3
export const alignmentList: ISelectOption[] = [
  {
    label: '左对齐',
    value: 1,
  },
  {
    label: '居中',
    value: 2,
  },
  {
    label: '右对齐',
    value: 3,
  },
]
// 字符串格式的true,false
type TypeStringifyBoolean = 'true' | 'false'

// 富文本结构
export interface IRichText {
  // 标题
  header: {
    tag: 'header',
    color: string, // 背景颜色,'#123456' 这种格式
    text: {
      tag: 'text',
      content: string, // 标题内容
      // 属性
      attr: {
        // 文字颜色
        color: string,
        // 是否加粗
        weight: TypeBold,
        // 对齐方式
        alignment: TypeAlignment,
      },
    },
  },
  // 工具栏的5个选项,合并UI的文本和链接文本,将表格的普通表格和数据表格展开为2个,还是共5个,,默认为空数组
  elements: (ILine | IText | IPicture | IPureTable | IDataTable)[],
}

// 分割线
export interface ILine {
  tag: 'hr',
}

// 文本, 链接文本
export interface IText {
  tag: 'div',
  texts: [[ITextContent]],
}
export interface ITextContent {
  tag: 'text',
  content: string,
  // 属性
  attr: {
    color: string,
    weight: TypeBold,
    href: string,
    alignment: TypeAlignment,
  },
}

// 图片
export interface IPicture {
  tag: 'img',
  // 图片地址
  picurl: string,
  // 宽高比
  ratio: number,
  // 超链接地址
  url: string,
}

// 普通表格
export interface IPureTable {
  tag: 'table',
  // 把表格内容,把二维表格转换为1维,空值为'',
  content: string[],
  attr: {
    line: TypeStringifyBoolean,
    // 表格列数
    column: number,
    // 是否加粗
    bold: TypeStringifyBoolean,
  },
  // 自定义行
  attr_row: ITableRow[],
  // 自定义列
  attr_col: ITableColumn[],
}
// 自定义行
export interface ITableRow {
  row: number,
  color: string,
  bold: TypeStringifyBoolean,
}
// 自定义列
export interface ITableColumn {
  col: number,
  color: string,
  bold: TypeStringifyBoolean,
  // 列宽高占比
  width: number,
}

// 数据表格
export interface IDataTable {
  tag: 'dataTable',
  // 自定义行
  attr_row: ITableRow[],
  // 自定义列
  attr_col: ITableColumn[],
  // 属性
  attr: {
    line: TypeStringifyBoolean,
    // 表格列数
    column: number,
    // 是否加粗
    bold: TypeStringifyBoolean,
    // 字体颜色
    color: string,
    // 指标id,选择器数据为mockIndicatorObject.list生成的indicatorId作为key,indicatorName作为label的数组
    // 从接口取数据
    indicator: number | null,
    // 数据模型字段,其中
    field: {
      // fieldModel为mockIndicatorList的单项的extractColumnList的name
      fieldModel: string,
      // 用户手动输入
      name: string,
    }[],
  },
}

export const mockIndicatorObject = {
  total: 2,
  list: [
    {
      indicatorId: 1,
      indicatorName: '模拟数据1',
      extractColumnList: [
        {
          name: 'name1',
          label: 'label1',
        },
        {
          name: 'name2',
          label: 'label2',
        },
        {
          name: 'name3',
          label: 'label3',
        },
      ],
    },
    {
      indicatorId: 2,
      indicatorName: '模拟数据2',
      extractColumnList: [
        {
          name: 'name1',
          label: 'label1',
        },
        {
          name: 'name2',
          label: 'label2',
        },
        {
          name: 'name3',
          label: 'label3',
        },
      ],
    },
  ],
}
