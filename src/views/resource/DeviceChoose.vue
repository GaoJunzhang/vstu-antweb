<template>
  <div class="content">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="16">
          <a-col span="8">
            <a-form-item label="设备名称">
              <a-input v-model="queryParam.deviceName" placeholder="请输入设备名称" />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item label="设备编号">
              <a-input v-model="queryParam.deviceMac" placeholder="设备编号" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col span="8">
              <a-form-item label="设备类型">
                <a-select v-model="queryParam.typeId" placeholder="设备类型" default-value>
                  <a-select-option v-for="item in typeList" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
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
            </span>
          </a-col>
        </a-row>
      </a-form>
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
      <span slot="action" slot-scope="text,record">
        <a-button icon="plus" type="primary" @click="addDevice(record)">添加</a-button>
      </span>
    </s-table>
  </div>
</template>

<script>
import { STable } from '@/components'
import { getVaildDevicePage, getAllDeviceType } from '@/api/resource'
export default {
  name: 'DeviceChoose',
  components: {
    STable
  },
  data () {
    return {
      typeList: [],
      selectedRowKeys: [],
      selectedRows: [],
      options: {
        alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
        rowSelection: {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onSelectChange
        }
      },
      optionAlertShow: false,
      advanced: false,
      queryParam: {},
      // 表头
      columns: [
        {
          title: '设备名称',
          dataIndex: 'deviceName'
        },
        {
          title: '分配用户',
          dataIndex: 'deviceBy'
        },
        {
          title: '设备编号',
          dataIndex: 'deviceMac'
        },
        {
          title: '设备类型',
          dataIndex: 'deviceTypeName'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime'
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        return getVaildDevicePage(Object.assign(parameter, this.queryParam))
          .then(res => {
            console.log('传回来的a', res.result)
            return res.result
          })
      }
    }
  },
  methods: {
    showallot () {},
    addDevice (record) {
      this.$emit('addDevice', record)
    },
    getTypeList () {
      getAllDeviceType().then(res => {
        console.log(res)
        if (res.success === true) {
          this.typeList = res.result
        } else {
          this.$Message.error('初始化设备类型失败')
        }
      })
    }
  },
  created () {
    this.getTypeList()
  }
}
</script>
