<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        :closable="false"
        center
      >
      </el-alert>
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addGoodsForm" :rules="addGoodsFormRules"
               ref="addGoodsFormRef" label-width="100px"
               label-position="top"
      >
        <el-tabs v-model="activeIndex" tab-position="left"
                 :before-leave="beforeTabLeave"
                 @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData"
                          :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="value" v-for="(value,index) in item.attr_vals"
                             :key="index" border
                ></el-checkbox>

              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData"
                          :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--这个组件内部封装发送请求 没有调用我们的axios去发起调用
            因此请求头中没有带token 请求被拒绝-->
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :headers="headers"
              list-type="picture">
              <el-button size="medium" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器组件-->
            <quill-editor
              ref="myQuillEditor"
              v-model="addGoodsForm.goods_introduce"
            />
            <!--添加按钮-->
            <el-button type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!--图片预览-->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%"
      >
      <img :src="previewPath" class="previewImg">

    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: '0',
      addGoodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片临时路径
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addGoodsFormRules: {
        goods_name: [
          {
            required: true, message: '请输入商品名称', trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true, message: '请输入商品价格', trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true, message: '请输入商品重量', trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true, message: '请输入商品数量', trigger: 'blur'

          }
        ],
        goods_cat: [
          {
            required: true, message: '请输入商品分类', trigger: 'blur'
          }
        ]
      },
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      manyTableData: [],
      onlyTableData: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headers: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewDialogVisible: false

    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表错误!')
      this.cateList = res.data
    },
    // 级联选择器选项变化触发函数
    handleChange () {
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' & this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类!')
        return false
      }
      return true
    },
    async tabClicked () {
      // 访问动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`/categories/${this.getSelectedCateId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数列表失败!')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0
            ? []
            : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`/categories/${this.getSelectedCateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          })
        if (res.meta.status !== 200) return this.$message.error('获取静态属性列表失败!')
        this.onlyTableData = res.data
      }
    },
    // 图片预览
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 删除图片
    handleRemove (file) {
      console.log(file)
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从pics数组中找到该图片所对应的索引值
      const index = this.addGoodsForm.pics.findIndex(x =>
        x.pic === filePath
      )
      // 3.调用数组的splice方法 移除该图片
      this.addGoodsForm.pics.splice(index, 1)
    },
    // 监听上传图片成功的事件
    handleSuccess (response) {
      const picInfo = {
        pic: response.data.tmp_path
      }
      this.addGoodsForm.pics.push(picInfo)
    },
    // 添加商品
    addGoods () {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项信息!')
        // lodash cloneDeep(obj)进行深拷贝
        const form = _.cloneDeep(this.addGoodsForm)

        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数和静态属性
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addGoodsForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addGoodsForm.attrs.push(newInfo)
        })
        form.attrs = this.addGoodsForm.attrs
        // 执行添加商品请求
        const { data: res } = await this.$http.post('/goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败!')
        this.$message.success('添加商品成功!')
        await this.$router.push('/goods')
      })
    }
  },
  computed: {
    getSelectedCateId () {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox{
  margin: 0 5px 0 0 !important;
}
.previewImg{
  width: 100%;
}
.el-button{
  margin-top: 15px;
}
</style>
