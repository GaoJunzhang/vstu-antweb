<template>
  <div class="content">
    <div class="table-page-search-wrapper">
      <a-form layout="inline" ref="sform">
        <a-row>
          <a-col :md="16" :sm="24">
            <a-form-item label="设备类型名称">
              <a-input v-model="queryParam.name" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" icon="search" @click="searchForm">{{ $t('common.search') }}</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">{{ $t('common.reset') }}</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="table-operator">
      <a-button
        v-if="isParent"
        type="primary"
        icon="plus"
        @click="$refs.detail.add()"
      >{{ $t('common.new') }}</a-button>
      <a-button
        v-if="isParent"
        type="primary"
        :disabled="selectedRowKeys.length !== 1"
        icon="edit"
        @click="handleEdit()"
      >{{ $t('common.edit') }}</a-button>
      <a-button
        v-if="isParent"
        type="primary"
        :disabled="selectedRowKeys.length <= 0"
        icon="delete"
        @click="handleDelete()"
      >{{ $t('common.del') }}</a-button>
      <a-button
        v-if="!isParent"
        type="primary"
        icon="setting"
        @click="handleAllot()"
      >资源类型配置</a-button>
    </div>
    <s-table
      ref="table"
      size="default"
      row-key="id"
      :columns="columns"
      :data="loadData"
      :alert="options.alert"
      :rowSelection="options.rowSelection"
      :customRow="rowClick"
    >
      <span slot="action" slot-scope="text, record">
        <a v-if="isParent" @click="$refs.detail.edit(record)">{{ $t('common.edit') }}</a>
        <a-divider type="vertical"/>
        <a v-if="isParent" @click="handleDelete(record)">{{ $t('common.del') }}</a>
        <a-button v-if="!isParent" icon="plus" type="primary" @click="addDtype(record)">添加资源</a-button>
      </span>
      <div slot="isNull" slot-scope="text, record">
        <a-tag v-if="record.isNull==0" color="#f50">是</a-tag>
        <a-tag v-if="record.isNull==1" color="#87d068">否</a-tag>
      </div>
    </s-table>
    <device-detail ref="detail" @ok="handleOk"></device-detail>
  </div>
</template>

<script>
import { STable } from '@/components'
import deviceDetail from './deviceDetail'
import { deviceTypeData, delDeviceTypeByIds } from '@/api/device'
export default {
  name: 'DeviceList',
  props: {
    isParent: {
      type: Boolean,
      default: true
    }
  },
  components: {
    STable,
    deviceDetail
  },
  data () {
    return {
      currView: 'index',
      visible: false,

      form: null,
      mdl: {},

      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {
        name: '',
        pageNumber: 1,
        pageSize: 10
      },
      // 表头
      columns: [
        {
          title: '名称',
          dataIndex: 'name'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime'
        },
        {
          title: '允许编号为空',
          dataIndex: 'isNull',
          scopedSlots: { customRender: 'isNull' }
        },
        {
          title: '备注',
          dataIndex: 'remark'
        },
        {
          title: '操作',
          width: '150px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        return deviceTypeData(Object.assign(parameter, this.queryParam)).then(res => {
          console.log(res.result)
          res.result.data.forEach(function (v, k) {
            v.key = v.id
          })
          this.$refs.table.clearSelected()
          return res.result
        })
      },
      rowClick: record => ({
        // 事件
        on: {
          click: () => {
            // 点击改行时要做的事情
            // ......
            console.log(record, 'record')
            this.$emit('clickRow', record)
          }
        }
      }),
      selectedRowKeys: [],
      selectedRows: [],
      options: {
        alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
        rowSelection: {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onChange
        }
      },
      optionAlertShow: false
    }
  },
  methods: {
    init () {
    },
    handleEdit () {
      this.$refs.detail.edit(this.selectedRows[0])
    },
    handleDelete (record) {
      const ids = []
      if (record != null) {
        ids.push(record.id)
      } else {
        this.selectedRowKeys.forEach(function (v, k) {
          ids.push(v)
        })
      }
      var that = this
      this.$confirm({
        title: '确定删除' + this.selectedRowKeys.length + '条数据?',
        content: '删除后不可恢复',
        okType: 'danger',
        onOk () {
          console.log(ids)
          return delDeviceTypeByIds(ids).then(res => {
            if (res.success === true) {
              that.$message.success('删除成功')
              that.$refs.table.refresh()
            } else {
              that.$notification['error']({
                message: '错误',
                description: res.errMsg || '请求出现错误，请稍后再试',
                duration: 4
              })
            }
          })
        }
      })
    },
    handleOk () {
      // 新增/修改 成功时，重载列表
      this.$refs.table.refresh()
    },
    onChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    searchForm () {
      this.$refs.table.refresh()
    },
    submited () {
      this.currView = 'index'
    },
    handleAllot () {
      this.$emit('allot')
    },
    addDtype (record) {
      console.log('addDr', record)
      this.$emit('addDr', record)
    }
  },
  mounted () {
    this.init()
  },
  watch: {
  }
}
</script>
