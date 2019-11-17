<template>
  <div class="content">
    <user-allot-resource v-if="currView=='allot'" @close="() => currView='index'"></user-allot-resource>
    <div v-if="currView=='index'">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="16">
            <a-col span="8">
              <a-form-item label="设备类型">
                <a-input v-model="queryParam.name" placeholder="请选择设备！" />
              </a-form-item>
            </a-col>
            <a-col span="8">
              <a-form-item label="设备编号">
                <a-input v-model="queryParam.account" placeholder="请输入设备编号！" />
              </a-form-item>
            </a-col>

            <template v-if="advanced">
              <a-col span="8">
                <a-form-item :label="$t('common.status')">
                  <a-select v-model="queryParam.status" :placeholder="$t('common.choosePlaceholder')" default-value>
                    <a-select-option value>{{ $t('common.all') }}</a-select-option>
                    <a-select-option value="1">{{ $t('common.enable') }}</a-select-option>
                    <a-select-option value="2">{{ $t('common.disable') }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </template>
            <a-col :md="!advanced && 6 || 24" :sm="24">
              <span
                class="table-page-search-submitButtons"
                :style="advanced && { float: 'right', overflow: 'hidden' } || {} "
              >
                <a-button type="primary" @click="$refs.table.refresh(true)">{{ $t('common.search') }}</a-button>
                <a-button style="margin-left: 8px" @click="() => queryParam = {}">{{ $t('common.reset') }}</a-button>
                <a @click="toggleAdvanced" style="margin-left: 8px">
                  {{ advanced ? $t('common.collapse') : $t('common.expand') }}
                  <a-icon :type="advanced ? 'up' : 'down'" />
                </a>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div class="table-operator">
        <a-button
          :disabled="selectedRowKeys.length <= 0"
          type="primary"
          icon="clock-circle"
          @click="addTimeAll()"
        >批量永久</a-button>
        <a-button
          type="primary"
          :disabled="selectedRowKeys.length <= 0"
          icon="close"
          @click="delAll()"
        >批量禁用</a-button>
      </div>
      <s-table
        size="default"
        ref="table"
        row-key="id"
        :columns="columns"
        :data="loadData"
        :alert="options.alert"
        :rowSelection="options.rowSelection"
      >
        <span slot="avatar" slot-scope="text,record">
          <a-avatar :src="record.avatar" icon="user" style="backgroundColor:#87d068"/>
        </span>
        <span slot="isForever" slot-scope="text,record">
          <a-switch checkedChildren="是" unCheckedChildren="否" :checked="record.isForever==0" >
          </a-switch>
        </span>
        <span slot="status" slot-scope="text,record">
          <a-switch checkedChildren="是" unCheckedChildren="否" :checked="record.status==0" >
          </a-switch>
        </span>
        <span slot="action" slot-scope="text, record">
          <a-button icon="clock-circle" @click="addTime(record)">加时</a-button>
        </span>
      </s-table>
    </div>
    <a-modal
      title="增加资源有效期"
      :width="600"
      :visible="visible"
      @ok="handleOk"
      @cancel="handleClose"
    >
      <a-form :form="form">
        <a-form-item :label-col="{ span: 4 }" :wrapper-col="{ span: 24 }">
          <a-radio-group v-model="month1" defaultValue="a" buttonStyle="solid">
            <a-radio-button value="1">一个月</a-radio-button>
            <a-radio-button value="2">两个月</a-radio-button>
            <a-radio-button value="3">三个月</a-radio-button>
            <a-radio-button value="6">半年</a-radio-button>
            <a-radio-button value="12">一年</a-radio-button>
            <a-radio-button value="14">两年</a-radio-button>
            <a-radio-button value="99999">永久</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { STable } from '@/components'
import { userAuthData, updateUrStatus, updateUrIsforever, addUrTime } from '@/api/resource'
import UserAllotResource from './UserAllotResource'
export default {
  components: {
    STable,
    UserAllotResource
  },
  data () {
    return {
      selectOrder: null,
      form: this.$form.createForm(this, { name: 'coordinated' }),
      visible: false,
      month1: '1',
      currView: 'index',
      current: '',
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 表头
      columns: [
        {
          title: '账号',
          dataIndex: 'account'
        },
        {
          title: '头像',
          dataIndex: 'avatar',
          scopedSlots: { customRender: 'avatar' }
        },
        {
          title: '手机号',
          dataIndex: 'mobile'
        },
        {
          title: '资源数',
          dataIndex: 'rcount'
        },
        {
          title: '名称',
          dataIndex: 'name'
        },
        {
          title: '是否永久',
          dataIndex: 'isForever',
          scopedSlots: { customRender: 'isForever' }
        },
        {
          title: '是否禁用',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '有效期-开始',
          dataIndex: 'startTime'
        },
        {
          title: '有效期-结束',
          dataIndex: 'endTime'
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
        return userAuthData(Object.assign(parameter, this.queryParam))
          .then(res => {
            console.log('传回来的', res.result)
            return res.result
          })
      },

      selectedRowKeys: [],
      selectedRows: [],
      options: {
        alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
        rowSelection: {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onSelectChange
        }
      },
      optionAlertShow: false
    }
  },
  created () {

  },
  methods: {
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    handleOk () {
      const obj = {}
      obj.userId = this.selectOrder.userId
      obj.time = this.month1
      console.log('obj===', obj)
      addUrTime(obj).then(res => {
        if (res.success === true) {
          this.visible = false
          this.$message.info('操作成功')
          this.$refs.table.refresh()
        } else {
          this.$message.error('操作失败')
        }
      })
    },
    handleClose () {
      this.visible = false
    },
    delAll (record) {
      var that = this
      that.$confirm({
        title: '确认资源永久?',
        content: '您确认要设置永久所选的 ' + that.selectedRows.length + ' 条数据',
        onOk () {
          let ids = ''
          that.selectedRows.forEach(function (e) {
            ids += e.userId + ','
          })
          ids = ids.substring(0, ids.length - 1)
          const obj = {}
          obj.userIds = ids
          obj.status = 1
          updateUrStatus(obj).then(res => {
            console.log(res)
            if (res.success) {
              that.$message.info('操作成功')
              that.$refs.table.refresh(true)
            } else {
              that.$message.error('操作失败')
            }
          })
        }
      })
    },
    addTimeAll () {
      var that = this
      that.$confirm({
        title: '确认资源永久?',
        content: '您确认要设置永久所选的 ' + that.selectedRows.length + ' 条数据',
        onOk () {
          let ids = ''
          that.selectedRows.forEach(function (e) {
            ids += e.userId + ','
          })
          ids = ids.substring(0, ids.length - 1)
          const obj = {}
          obj.userIds = ids
          obj.isForever = 0
          updateUrIsforever(obj).then(res => {
            console.log(res)
            if (res.success) {
              that.$message.info('操作成功')
              that.$refs.table.refresh(true)
            } else {
              that.$message.error('操作失败')
            }
          })
        }
      })
    },
    showallot () {},
    addTime (v) {
      this.selectOrder = v
      this.visible = true
    }

  },
  watch: {

  }
}
</script>
