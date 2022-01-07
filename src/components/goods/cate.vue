<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--添加分类的对话框-->
      <el-dialog
        title="提示"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed"
      >
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <el-cascader
              expand-trigger="click"
              :options="parentCateList"
              :props="cascaderProps"
              v-model="selectedCateList"
              @change="parentCateChanged"
              clearable
              change-on-select
            ></el-cascader>
          </el-form-item>
          <el-form-item label="分类等级:">
            <el-tag v-if="addCateForm.cat_level === 0">一级</el-tag>
            <el-tag v-else-if="addCateForm.cat_level === 1" type="success">二级</el-tag>
            <el-tag v-else-if="addCateForm.cat_level === 2" type="warning">三级</el-tag>
          </el-form-item>
        </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
          </span>
      </el-dialog>
      <!--表格-->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="序号"
        border
        show-row-hover
        class="treeTable"
      >
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false"
             style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: lightgreen" ></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <template slot="operation" slot-scope="">
          <el-button type="primary" icon="el-icon-edit" >编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" >删除</el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

      <!--分类-->
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品分类的数据列表
      cateList: [],
      // 数据查询参数
      queryInfo: {
        // 获取所有级别的分类
        type: 3,
        // 当前页码
        pagenum: 1,
        // 每页显示数据条数
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 为tree-table指定列的定义
      columns: [
        {
          label: '分类信息',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前列使用模板名称
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation'
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          {
            required: true, message: '请输入商品分类名称', trigger: 'blur'
          }
        ]
      },
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类ID数组
      selectedCateList: []

    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 分页-监听pageSize的改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    async getCateList () {
      const { data: res } = await this.$http.get('/categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类信息失败!')
      this.$message.success('获取商品分类信息成功!')
      this.cateList = res.data.result
      this.total = res.data.total
    },
    showAddCateDialog () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('/categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据错误！')
      this.parentCateList = res.data
    },
    parentCateChanged () {
      if (this.selectedCateList.length > 0) {
        this.addCateForm.cat_pid = this.selectedCateList[this.selectedCateList.length - 1]
        this.addCateForm.cat_level = this.selectedCateList.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedCateList = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return this.$message.error('输入数据非法,请重新输入!')
        const { data: res } = await this.$http.post('/categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加商品分类失败!')
        this.$message.success('添加商品分类成功!')
        this.addCateDialogVisible = false
        await this.getCateList()
      })
    }

  }
}
</script>
<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}

</style>
