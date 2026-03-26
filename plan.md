# 待办
## 富文本组件
### 需求说明
完善src/views/system-manage/user-manage/UserManageAddAndEditDrawer.vue组件

设计稿UI地址: src/views/system-manage/user-manage/icon/fu-text
技术栈: Vue3 + Element Plus + Typescript
富文本的接口定义: src/views/system-manage/user-manage/IRichText.ts
富文本属性为 'richText'

请注意: 
1. 请将设计图的文本和链接文本合并为1个属性,参考'图片'选项的实现
2. 将设计图的表格拆成2个, 普通表格 和 数据表格
3. UI的纯文本和富文本做在了一起,我认为无需这样做,纯文本是1行,富文本是1行就可以了,纯文本已经实现了,无需修改
4. 无需严格按照UI,UI的部分设计我认为不太好,你可以在充分理解功能的前提下,做成更漂亮的实现,更好的实现和布局
5. 自己制定可中断的计划,保存自己的进度,保证会话可中断,不影响下次接着做

获取指标id接口,请使用useElSelect来获取数据,indicatorId作为key,indicatorName作为label
url: 'indicator_rule/getIndicatorRuleDefinitionList'
method: 'post'
请求参数
{
  pageNum: 1,
  pageSize: 10000,
}
返回格式
{
  msg: '操作成功',
  code: 200,
  data: {
    // 参考src/views/system-manage/user-manage/IRichText.ts
  },
}


