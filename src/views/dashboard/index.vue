<template>
  <div class="dashboard-container">
    <!-- 搜索框 开始 -->
    <el-form :inline="true" :model="listQuery" class="siki-form-inline">
      <el-form-item label="" class="search-item">
        <el-select v-model="listQuery.level" size="small" placeholder="level" @change="fetchData()">
          <el-option
            v-for="item in levels"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="" class="search-item">
        <el-input v-model="listQuery.title" size="small" placeholder="title" @keyup.native="fetchData()"/>
      </el-form-item>
      <!--
      <el-form-item label="" class="search-item">
        <el-button class="sp-el-button" type="primary" size="small" @click="fetchData()">查询</el-button>
        <el-button class="sp-el-button" type="success" size="small" @click="editRow()">新建</el-button>
      </el-form-item>
      -->
      <el-form-item label="" class="search-item">
        <el-radio-group v-model="cate" size="small" @change="fetchData()">
          <el-radio-button label="Left"/>
          <el-radio-button label="Right"/>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <!-- 搜索框 结束 -->
    <!-- 列表 开始 -->
    <el-table v-loading="listLoading" :data="list" border class="siki-tabel">
      <!-- <el-table-column type="selection"/> -->
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="siki-tabel-expand">
            <el-form-item label="level">
              <span>{{ props.row.level }}</span>
            </el-form-item>
            <el-form-item label="c_date">
              <span>{{ props.row.c_date | dateFilter('yyyy-MM-dd hh:mm:ss') }}</span>
            </el-form-item>
            <el-form-item label="roma" style="width: 100%;">
              <span>{{ props.row.roma }}</span>
            </el-form-item>
            <el-form-item label="serifu" style="width: 100%;">
              <span>{{ props.row.serifu }}</span>
            </el-form-item>
            <el-form-item label="koner" style="width: 100%;">
              <span>{{ props.row.koner }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="stars" label="sort" width="60" />
      <el-table-column prop="file_id" label="file_id" width="120" />
      <el-table-column prop="file_id" label="title" width="150" />
      <el-table-column prop="roma" label="serifu" min-width="150" />
      <el-table-column label="operate" width="120">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="mini" @click="editRow(scope.row)"/>
          <el-button type="primary" icon="el-icon-tickets" circle size="mini"/>
        </template>
      </el-table-column>
    </el-table>
    <!-- 列表 结束 -->
    <!-- 分页器 start -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNo"
      :limit.sync="listQuery.pageSize"
      layout="total, prev, pager, next, jumper"
      @pagination="fetchData" />
    <!-- 分页器 end -->
    <!-- 对话框 测试项tag -->
    <el-dialog
      :visible.sync="diaVisible"
      :before-close="hiddenDia"
      :close-on-click-modal="false"
      :title="diaTitle"
      custom-class="dia-body">
      <el-form label-width="80px">
        <div class="box-shadow">
          <img :src="siki.src_image" class="box-image pointer" @click="showImage()">
          <div class="box-image pointer" />
          <div v-for="(vv, key) in vs" :key="key" :style="vv" class="ele" />
        </div>
        <el-form-item label="c_name">
          <el-input v-model="siki.c_name" :readonly="true"/>
        </el-form-item>
        <el-form-item label="title">
          <el-input v-model="siki.title" placeholder="input title" @blur="fillCname()"/>
        </el-form-item>
        <el-form-item label="serifu">
          <el-input v-model="siki.serifu" placeholder="input serifu" />
        </el-form-item>
        <el-form-item label="koner">
          <el-input v-model="siki.koner" placeholder="input koner" />
        </el-form-item>
        <el-form-item label="roma">
          <el-input v-model="siki.roma" placeholder="input roma" />
        </el-form-item>
        <el-form-item label="stars">
          <el-input-number v-model="siki.stars" :min="0" :max="999" controls-position="right"/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="hiddenDia">关闭</el-button>
        <el-button type="primary" @click="addItemConfirm()">确认更新</el-button>
      </div>
    </el-dialog>
    <!-- 对话框end -->
    <el-dialog :visible.sync="imageVisible" title="images:">
      <img v-for="(vv, key) in images" :src="vv" :key="key" class="box-image pointer" @click="selectImage(vv)">
    </el-dialog>
  </div>

</template>

<script>
import { queryList, findImage } from '@/api/siki'
import { formatDate } from '@/utils/date'
import Pagination from '@/components/Pagination'

const prefix = 'https://image-1256378396.cos.ap-guangzhou.myqcloud.com/'

export default {
  name: 'Dashboard',
  components: { Pagination },
  filters: {
    dateFilter(date, fmt) {
      if (!date) return ''
      return formatDate(new Date(date), fmt)
    }
  },
  data() {
    return {
      levels: [{ value: 'all' }, { value: 'ssr' }, { value: 'sr' }, { value: 'r' }, { value: 'n' }, { value: 'm' }],
      total: 0,
      images: [],
      vs: ['height:10px', 'height:20px', 'height:30px'],
      listLoading: true,
      diaVisible: false,
      imageVisible: false,
      cate: 'Right',
      diaTitle: 'm_qm_0_0',
      list: [],
      ssrList: [],
      srList: [],
      rList: [],
      mList: [],
      listQuery: {
        pageNo: 1,
        pageSize: 10,
        title: '',
        level: ''
      },
      siki: {
        file_id: '',
        title: '',
        c_name: '',
        serifu: '',
        koner: '',
        roma: '',
        src_image: '',
        stars: 1
      }
    }
  },
  computed: {
    foo() {
      return 'welcome ' + this.name
    }
  },
  created() {
    console.log('created!')
    this.fetchData()
    setTimeout(() => {
      this.name = 'smith'
    }, 3000)
  },
  mounted() {
    console.log('mounted!')
  },
  updated() {
    // console.log('updated!')
  },
  methods: {
    fetchData() {
      this.listQuery.title = this.listQuery.title.trim()
      if (this.listQuery.level === 'all') this.listQuery.level = ''
      console.log(JSON.stringify(this.listQuery))
      console.log(this.cate)
      queryList(this.listQuery).then(response => {
        console.log(response)
        const list = response.data.data
        var last = list.pop()
        this.total = last.total
        this.list = list
        this.listLoading = false
      })
    },
    showImage() {
      // if (this.images.length) return
      findImage().then(response => {
        var unq = []
        const content = response.data.data.content
        for (const v of content) {
          var sp = v.Key.split('_')
          if (sp.length < 2) continue
          var qq = sp[0] + sp[1]
          if (unq.indexOf(qq) !== -1) continue
          unq.push(qq)
          var img = prefix + v.Key
          this.images.push(img)
        }
        this.imageVisible = true
      })
    },
    selectImage(img) {
      console.log(img)
      this.siki.src_image = img
      this.imageVisible = false
    },
    filterLevel(value, row, column) {
      console.log(value)
      console.log(row)
      console.log(column)
    },
    editRow(row) {
      console.log(row)
      this.diaVisible = true
    },
    hiddenDia() {
      this.diaVisible = false
    },
    fillCname() {
      this.siki.c_name = this.siki.title.split('_')[0]
    }
  }
}
</script>

<style>

.siki-tabel{
  margin: 0 3px;
}
td {
  padding: 8px 0;
}
.siki-tabel-expand label {
  width: 100px;
  color: #99a9bf;
}
.siki-tabel-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 45%;
}
.siki-form-inline{
  margin: 3px 3px;
}
.search-item{
  margin: 0px 0px;
}
.sp-el-button{
  margin: 3px;
}
.dia-body{
  margin-top: 30px;
  width: 70%;
}
.box-shadow{
    height: 110px;
    width: 100%;
    display:flex;
    align-items:center;
    overflow: hidden;

    border:1px solid #eee;
    border-radius: 5px;
    margin: 5px 0 5px;
    padding: 5px 5px;
}
.ele {
    flex-shrink: 1;
    width: 6px;
    background-color: #bbb;
    box-shadow: 0px 0px 1px 1px #fff;
}
.pointer{
  cursor: pointer;
}
.box-image{
    border:1px solid #bbb;
    margin-right: 5px;
    height: 100px;
    width: 100px;
    border-radius: 5px;
}
</style>
