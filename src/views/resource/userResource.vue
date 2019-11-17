<template>
  <div style="background-color: #ececec; padding: 20px;">
    <user-allot-resource v-if="currView=='allot'" @close="() => currView='index'"></user-allot-resource>
    <a-row v-if="currView=='index'" :gutter="16">
      <a-col :span="12">
        <a-card :bordered="false">
          <a-button icon="setting" type="primary" @click="() => currView='allot'">分配资源</a-button>
          <userchoose @clickRow="clickRow" :isAdd="false" @allot="() => currView='allot'"></userchoose>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="资源列表" :bordered="false">
          <a-table :columns="columns" :dataSource="data" size="middle">
            <span slot="action" slot-scope="text, record">
              <a-button type="danger" @click="handleDelete(record)">{{ $t('common.del') }}</a-button>
            </span>
            <a href="#" slot="proImg" slot-scope="text, record">
              <viewer :images="[record.proImg]">
                <img v-for="src in [record.proImg]" :src="src" :key="src" style="width: 80px;height: 80px;border-radius:5px;">
              </viewer>
            </a></a-table>
        </a-card></a-col>
    </a-row>
  </div>
</template>

<script>
import { STable } from '@/components'
import userchoose from './userchoose'
import { delUResourceIds, getUserResourceByUid } from '@/api/resource'
import UserAllotResource from './UserAllotResource'
import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer/src/component.vue'
export default {
  name: 'TableList',
  components: {
    STable,
    UserAllotResource,
    userchoose,
    Viewer
  },
  data () {
    return {
      selectDevice: null,
      currView: 'index',
      visible: false,

      form: null,
      mdl: {},

      // 高级搜索 展开/关闭
      advanced: false,
      // 表头
      clickTypeId: null,
      columns: [
        {
          title: '资源名称',
          dataIndex: 'name'
        },
        {
          title: '预览图',
          dataIndex: 'proImg',
          scopedSlots: { customRender: 'proImg' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      data: [],
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
    handleDelete (v) {
      var that = this
      that.$confirm({
        title: '确定删除【' + that.selectDevice.name + '】的【' + v.name + '】?',
        content: '删除后不可恢复',
        okType: 'danger',
        onOk () {
          var ids = []
          ids.push(v.id)
          delUResourceIds(ids).then(res => {
            console.log(res)
            if (res.success) {
              that.$message.info('删除成功')
              that.getRTData(that.selectDevice.id)
            } else {
              that.$message.error('操作失败')
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
    clickRow (v) {
      this.selectDevice = v
      this.getRTData(v.id)
    },
    getRTData (id) {
      getUserResourceByUid(id).then(res => {
        res.result.forEach(function (v, k) {
          v.key = v.id
        })
        this.data = res.result
      })
    }
  },
  mounted () {
    this.init()
  },
  watch: {
  }
}
</script>
