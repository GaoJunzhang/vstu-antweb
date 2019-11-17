<template>
  <div style="background-color: #ececec; padding: 20px;">
    <a-row :gutter="8">
      <a-col :span="24">
        <a-button type="danger" @click="close">返回</a-button>
        <a-button type="danger" @click="submit">保存</a-button>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false">
          <div class="table-operator">
            <a-button
              icon="setting"
              @click="() => visible=true"
            >选择用户</a-button>
          </div>
          <a-table :columns="columns" :dataSource="data" size="middle">
            <span slot="action" slot-scope="text, record">
              <a-button icon="delete" type="danger" @click="removeDtype(record)">移除</a-button>
            </span>
            <span slot="avatar" slot-scope="text,record">
              <a-avatar :src="record.avatar" icon="user" style="backgroundColor:#87d068"/>
            </span>
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false">
          <div class="table-operator">
            <a-button
              icon="setting"
              @click="() => visible1=true"
            >选择设备</a-button>
          </div>
          <a-table :columns="columns1" :dataSource="data1" size="middle">
            <span slot="action1" slot-scope="text, record">
              <a-button icon="delete" type="danger" @click="removeRtype(record)">移除</a-button>
            </span>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
    <a-drawer
      title="用户"
      placement="right"
      :closable="false"
      @close="onClose"
      :visible="visible"
      :width="800"
    >
      <userchoose @addUser="addUser"></userchoose>
    </a-drawer>
    <a-drawer
      title="设备"
      placement="right"
      :closable="false"
      @close="onClose1"
      :visible="visible1"
      :width="800"
    >
      <device-choose @addDevice="addDevice"></device-choose>
    </a-drawer>
  </div>
</template>

<script>
import userchoose from './userchoose'
import DeviceChoose from './DeviceChoose'
import { addUDevice } from '@/api/resource'
import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer/src/component.vue'
export default {
  name: 'DTypeallotRtype',
  components: {
    userchoose,
    DeviceChoose,
    Viewer
  },
  data () {
    return {
      isForever: '0',
      startDate: '',
      endDate: '',
      visible: false,
      visible1: false,
      columns: [
        {
          title: '头像',
          dataIndex: 'avatar',
          scopedSlots: { customRender: 'avatar' }
        },
        {
          title: '账号',
          dataIndex: 'account',
          sorter: true
        },
        {
          title: '手机号',
          dataIndex: 'mobile',
          sorter: true
        },
        {
          title: '名称',
          dataIndex: 'name',
          sorter: true
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      columns1: [
        {
          title: '设备名称',
          dataIndex: 'deviceName'
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
          dataIndex: 'action1',
          scopedSlots: { customRender: 'action1' }
        }
      ],
      data: [],
      data1: []
    }
  },
  methods: {
    onChangeDate (date, dateString) {
      this.startDate = dateString[0]
      this.endDate = dateString[1]
    },
    submit () {
      const that = this
      if (that.data.length <= 0) {
        that.$message.warning('请选择用户')
        return
      }
      if (that.data1.length <= 0) {
        that.$message.warning('请选择设备')
        return
      }
      var uIds = []
      var dIds = []
      this.data.forEach(function (v, k) {
        uIds.push(v.id)
      })
      this.data1.forEach(function (v, k) {
        dIds.push(v.id)
      })
      const param = {}
      param.uIds = uIds
      param.dIds = dIds
      addUDevice(param).then(res => {
        if (res.success === true) {
          this.$message.info('添加成功')
          this.close()
        }
      })
    },
    close () {
      this.$emit('close')
    },
    addUser (record) {
      const that = this
      // this.$message.info('已添加', v.name)
      const data = that.data
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === record.id) {
          that.$message.warning('【' + record.name + '】已添加过')
          return
        }
      }
      that.$message.info('添加【' + record.name + '】成功')
      that.data.push(record)
    },
    addDevice (record) {
      const that = this
      const data = that.data1
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === record.id) {
          that.$message.warning('【' + record.deviceName + '】已添加过')
          return
        }
      }
      this.$message.info('已添加' + record.deviceName)
      this.data1.push(record)
    },
    onClose () {
      this.visible = false
    },
    onClose1 () {
      this.visible1 = false
    },
    removeRtype (v) {
      this.data1.splice(this.data1.findIndex(item => item.id === v.id), 1)
    },
    removeDtype (v) {
      this.data.splice(this.data.findIndex(item => item.id === v.id), 1)
    }
  }
}
</script>
