<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--警告区域-->
      <el-alert
        show-icon
        title="注意：只允许为第三级分类设置商品参数！"
        closable
        type="warning">
      </el-alert>
      <!--选择商品分类-->
      <el-row class="cat_opt">
        <el-col>
          <span>
            选择商品分类：
          </span>
          <!--级联选择器-->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many" >
          <el-button type="primary" :disabled="isButtonDisable" @click="addDialogVisible = true">添加参数</el-button>
          <!--动态参数表格-->
          <el-table :data="manyTableData" border stripe >
            <el-table-column type="expand" >
              <template slot-scope="scope">
                <el-tag
                  v-for=" (tag,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClosed(index,scope.row)"
                >
                  {{tag}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
             <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="medium" icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="medium" icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only" >
          <el-button type="primary" :disabled="isButtonDisable" @click="addDialogVisible = true">添加属性</el-button>
          <!--静态属性表格-->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand" >
              <template slot-scope="scope">
                <el-tag
                  v-for=" (tag,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClosed(index,scope.row)"
                >
                  {{tag}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="medium" icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="medium" icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
      >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      cateList: [],
      // 级联选择器的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器双向绑定的选项数组
      selectedCateKeys: [],
      // 默认选择的选项卡
      activeName: 'many',
      // 动态属性数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          {
            required: true, message: '请输入参数名称！', trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false,
      editForm: {
        attr_name: '',
        attr_id: ''
      },
      editFormRules: {
        attr_name: [
          {
            required: true, message: '请输入参数名称！', trigger: 'blur'
          }
        ]
      },
      inputVisible: false,
      inputValue: ''

    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败!')
      this.$message.success('获取商品分类数据成功!')
      console.log(res.data)
      this.cateList = res.data
    },
    // 级联选择器选项改变监听器
    handleChange () {
      this.getParamsData()
    },
    // Tab页签点击事件的处理函数
    handleClick () {
      this.getParamsData()
    },
    async getParamsData () {
      // 选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 选中了三级分类
      const { data: res } = await this.$http.get(`/categories/${this.selectedCateId}/attributes/`,
        {
          params: {
            sel: this.activeName
          }
        })

      // 处理商品参数标签-用空格分开的数据-转化成数组
      res.data.forEach(item => {
        // 空数组分割后也会有一个空格元素 要通过三元表达式去掉
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制标签文本输入框显示与隐藏
        item.inputVisible = false
        item.inputValue = ''
      })

      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败!')
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('输入参数不合法,请重新输入！')
        const { data: res } = await this.$http.post(`/categories/${this.selectedCateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败!')
        this.$message.success('添加参数成功!')
        this.addDialogVisible = false
        await this.getParamsData()
      })
    },
    async showEditDialog (attr_id) {
      const { data: res } = await this.$http.get(`/categories/${this.selectedCateId}/attributes/${attr_id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败!')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('输入参数不合法,请重新输入！')
        const { data: res } = await this.$http.put(`/categories/${this.selectedCateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 200) return this.$message.error('修改参数失败!')
        this.$message.success('修改参数成功!')
        this.editDialogVisible = false
        await this.getParamsData()
      })
    },
    removeParams (attr_id) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`/categories/${this.selectedCateId}/attributes/${attr_id}`)
        if (res.meta.status !== 200) {
          return this.$message({
            type: 'info',
            message: '已取消删除'
          })
        }
        await this.getParamsData()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 文本框失去焦点或者按下Enter都会触发
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      const { data: res } = await this.saveAttrValues(row)
      if (res.meta.status !== 200) {
        return this.$message.error('添加参数项失败!')
      }
      this.$message.success('添加参数项成功!')
    },
    showInput (row) {
      row.inputVisible = true
      // 获取文本框焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    /**
     *
     * @param index 标签在数组中的索引
     * @param row 数据
     */ async handleClosed (index, row) {
      row.attr_vals.splice(index, 1)
      const { data: res } = await this.saveAttrValues(row)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数项失败!')
      }
      this.$message.success('删除参数项成功!')
    },
    // 将对attr_vals数据的操作保存到数据库
    async saveAttrValues (row) {
      return await this.$http.put(`/categories/${this.selectedCateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        // 用空格隔开重新拼接成字符串
        attr_vals: row.attr_vals.join(' ')
      })
    }
  },
  computed: {
    // 如果按钮被禁用则返回true
    isButtonDisable () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    selectedCateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算提示框标题文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }

  }
}
</script>
<style lang="less" scoped>
.cat_opt{
  margin: 15px 0;
}
.input-new-tag{
  width: 120px;
}
</style>
