<template>
  <div class="body-container">
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
      <el-form-item label="" class="search-item">
        <el-radio-group v-model="cate" size="small" @change="fetchData()">
          <el-radio-button label="Left"/>
          <el-radio-button label="Right"/>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <!-- 搜索框 结束 -->
    <!-- 列表 开始 -->
    <el-table v-loading="listLoading" :data="list" highlight-current-row border class="siki-tabel">
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
      <el-table-column prop="title" label="title" width="150" />
      <el-table-column prop="serifu" label="serifu" min-width="150" />
      <el-table-column label="operate" width="120">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="mini" @click="initSiki(scope.row)"/>
          <el-button type="primary" icon="el-icon-caret-right" circle size="mini" @click="loadAudio(scope.row)"/>
        </template>
      </el-table-column>
    </el-table>
    <!-- 列表 结束 -->
    <!-- 分页器 start -->
    <pagination
      v-show="total > 0 && cate === 'Right'"
      :total="total"
      :page.sync="listQuery.pageNo"
      :limit.sync="listQuery.pageSize"
      layout="total, prev, pager, next, jumper"
      @pagination="fetchData" />
    <pagination v-show="total > 0 && cate === 'Left'" :total="total" layout="total"/>
    <!-- 分页器 end -->
    <!-- 对话框 测试项tag -->
    <el-dialog
      :visible.sync="diaVisible"
      :before-close="hideDia"
      :close-on-click-modal="false"
      :title="siki.file_id"
      custom-class="dia-body">
      <el-form label-width="80px">
        <div class="box-shadow">
          <img :src="siki.src_image" class="box-image pointer" @click="showImage()">
          <div class="box-image pointer" @click="loadAudio()"/>
          <div v-for="(vv, key) in shadow" :key="key" :style="vv" class="ele" />
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
        <el-button @click="initSiki()">关闭</el-button>
        <el-button v-if="cate == 'Right'" type="primary" @click="serConfirm()">确认更新</el-button>
        <el-button v-else type="primary" @click="serConfirm()">确认添加</el-button>
      </div>
    </el-dialog>
    <!-- 对话框end -->
    <el-dialog :visible.sync="imageVisible" title="images:">
      <img v-for="(vv, key) in images" :src="vv" :key="key" class="box-image pointer" @click="selectImage(vv)">
    </el-dialog>
  </div>

</template>

<script>
import { queryList, queryAudio, findImage, updatePublish, publishAudio } from '@/api/siki'
import { formatDate } from '@/utils/date'
import { playAudio } from '@/utils/shadow'
import Pagination from '@/components/Pagination'

const imgfix = 'https://image-1256378396.cos.ap-guangzhou.myqcloud.com/'
const rights = []

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
      shadow: ['height:10px', 'height:20px', 'height:30px'],
      listLoading: true,
      diaVisible: false,
      imageVisible: false,
      cate: 'Right',
      list: [],
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
        src_video: '',
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
    this.fetchData()
    setTimeout(() => {
      this.name = 'smith'
    }, 3000)
  },
  mounted() {
    // console.log('mounted!')
  },
  updated() {
    // console.log('updated!')
  },
  methods: {
    fetchData() {
      this.listQuery.title = this.listQuery.title.trim()
      if (this.listQuery.level === 'all') this.listQuery.level = ''
      if (this.cate === 'Right') {
        queryList(this.listQuery).then(response => {
          const list = response.data.data
          if (!list) return
          var last = list.pop()
          if (last) this.total = last['total']
          this.list = list
          this.listLoading = false
        })
      } else { // this.cate === 'Left'
        queryAudio().then(response => {
          const data = response.data.data
          const content = data.content
          const t_audio = data.t_audio
          // clear table
          this.list = []
          for (const val of t_audio) {
            var file_id = val.file_id
            rights.push(file_id)
          }
          for (const v of content) {
            const name = v.Key
            const file_id = name.substr(0, name.indexOf('.'))
            if (rights.includes(file_id)) continue
            if (this.listQuery.level && name.split('_')[0] !== this.listQuery.level) continue
            const ele = { file_id }
            this.list.push(ele)
          }
          this.total = this.list.length
        })
      }
    },
    showImage() {
      // if (this.images.length) return
      findImage().then(response => {
        this.images = []
        const file_id = this.siki.file_id
        const fsp = file_id.split('_')
        const level = fsp[0]
        const cname = fsp[1]
        const content = response.data.data.content
        for (const v of content) {
          var fname = v.Key.split('_') // sr_ghn_0.png
          if (fname.indexOf(level) === -1 || fname.indexOf(cname) === -1) continue
          var img = imgfix + v.Key
          this.images.push(img)
        }
        this.imageVisible = true
      })
    },
    selectImage(img) {
      this.siki.src_image = img
      this.imageVisible = false
    },
    hideDia() {
      this.initSiki()
    },
    serConfirm() {
      if (this.cate === 'Right') {
        updatePublish(this.siki).then(response => {
          this.fetchData()
          this.initSiki()
          this.showInfo('已更新!')
        })
      } else {
        publishAudio(this.siki).then(response => {
          this.fetchData()
          this.initSiki()
          this.showInfo('已保存!')
        })
      }
    },
    initSiki(row = null) {
      this.initShadow()
      if (row) {
        const file_id = row.file_id
        this.siki = {
          shadow: '',
          file_id: file_id,
          title: row.title,
          c_name: '',
          serifu: row.serifu,
          koner: row.koner,
          roma: row.roma,
          src_image: row.src_image,
          src_video: row.src_video,
          stars: row.stars
        }
        if (row.title) {
          this.fillCname()
          this.findAudio(file_id)
        }
        this.diaVisible = true
      } else {
        // this.siki = { shadow: '', file_id: '', title: '', c_name: '', serifu: '', koner: '', roma: '', src_image: '', src_video: '', stars: 1 }
        this.diaVisible = false
      }
    },
    findAudio(file_id) {
      queryAudio({ file_id }).then(response => {
        const t_audio = response.data.data.t_audio[0]
        const shadow = t_audio.shadow
        this.initShadow(shadow.split(','))
      })
    },
    fillCname() {
      if (!this.siki.title) return
      this.siki.c_name = this.siki.title.split('_')[0]
    },
    initShadow(shadow = []) {
      this.shadow = []
      this.siki.shadow = shadow.join(',')
      for (const v of shadow) {
        const cl = `height:${v}px`
        this.shadow.push(cl)
      }
    },
    loadAudio(row = null) {
      var file_id = this.siki.file_id
      if (row) file_id = row.file_id
      const fname = file_id + '.mp3'
      const url = imgfix.replace('image', 'audio') + fname
      this.showInfo(`【${fname}】播放中...`)
      playAudio(url).then(shadow => {
        this.initShadow(shadow)
      })
    },
    showInfo(message, type = 'success') {
      this.$message({ message, type })
    }
  }
}
</script>

<style>

.body-container{
  margin: 0 3px;
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
  margin-top: 20px !important;
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
