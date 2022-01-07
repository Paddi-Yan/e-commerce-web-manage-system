<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-button type="primary" @click="showAddDialog">
          添加角色
        </el-button>
      </el-row>
      <!--角色列表区域-->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand" label="展开列">
          <template v-slot="scope">
            <el-row :class="['bottom',i1===0?'top':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级权限-->
              <el-col :span="19">
                <el-row :class="[i2===0?'':'top','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item3) in item2.children" :key="item3.id"
                            type="warning" closable @close="removeRightById(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" >
          <template v-slot="scope">
            <el-button size="medium" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button size="medium" type="danger" icon="el-icon-delete" @click="deleteRoles(scope.row.id)">删除</el-button>
            <el-button size="medium" type="warning" icon="el-icon-setting" @click="showSetRightDialog (scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--分配权限-->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      @close="setRightDialogClosed"
      width="50%"
    >
      <!--树形控件-->
      <el-tree
        :data="rightsList"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultList"
        :props="treeRolesProps"
        ref="treeRef"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改角色信息的对话框-->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editDialogVisible"
      width="50%"
      >
        <el-form :model="editForm" :rules="editFormRoles"
                 ref="editFormRef" label-width="70px">
          <el-form-item label="名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRole">确 定</el-button>
        </span>
    </el-dialog>
    <!--添加角色信息的对话框-->
    <el-dialog
      title="添加角色信息"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
      >
      <el-form :model="addForm" :rules="addFormRoles" ref="addRolesFormRef" label-width="70px">
        <el-form-item label="名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
export default {
  data () {
    return {
      rolesList: [],
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRoles: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 15, message: '输入数据长度应在2~15之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 1, max: 15, message: '输入数据长度应在1~15之间', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      editFormRoles: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 15, message: '角色名称长度在1~15之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      setRightDialogVisible: false,
      rightsList: [],
      // 树形空间的属性绑定对象
      treeRolesProps: {
        label: 'authName',
        children: 'children'
      },
      defaultList: [],
      roleId: ''

    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败!')
      this.rolesList = res.data
    },
    async showEditDialog (id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('/roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败!')
      this.editForm = res.data
      console.log(this.editForm)
    },
    editRole () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('修改数据不合法,请重新输入!')
        console.log('editFormData:')
        console.log(this.editForm)
        const { data: res } = await this.$http.put('/roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          })
        if (res.meta.status !== 200) return this.$message.error('修改角色数据失败!')
        this.editDialogVisible = false
        await this.getRolesList()
        this.$message.success('修改角色信息成功')
      })
    },
    deleteRoles (id) {
      this.$confirm('此操作将永久删除该角色信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete('/roles/' + id)
        if (res.meta.status === 200) {
          await this.getRolesList()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        } else {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    showAddDialog () {
      this.addDialogVisible = true
    },
    addRoles () {
      this.$refs.addRolesFormRef.validate(async valid => {
        if (!valid) return this.$message.error('输入角色数据非法,请重新输入!')
        const { data: res } = await this.$http.post('/roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色信息失败!')
        this.addDialogVisible = false
        await this.getRolesList()
        this.$message.success('添加角色信息成功!')
      })
    },
    addDialogClosed () {
      this.$refs.addRolesFormRef.resetFields()
    },
    removeRightById (role, rightId) {
      // 弹框提醒是否要删除
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`/roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) return this.$message.error('删除权限失败!')
        // 不建议这样做 这样会导致页面全部重新渲染
        // await this.getRolesList()
        role.children = res.data
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
    // 通过递归的形式,获取角色下所有三级劝降的id,并保存到defaultList中
    getLeafKeys (node, array) {
      // 如果当前node节点不包含children属性,则是三级节点
      if (!node.children) {
        return array.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, array)
      })
    },
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限信息失败!')
      this.rightsList = res.data
      // 通过递归获取三级节点的id
      this.getLeafKeys(role, this.defaultList)
      this.setRightDialogVisible = true
    },
    setRightDialogClosed () {
      this.defaultList = []
    },
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const rightsString = keys.join(',')
      const { data: res } = await this.$http.post(`/roles/${this.roleId}/rights`,
        {
          rids: rightsString
        })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败!')
      }
      this.$message.success('分配权限成功!')
      await this.getRolesList()
      this.setRightDialogVisible = false
    }

  }

}
</script>
<style lang="less" scoped>
.el-tag{
  margin: 7px;
}
.top{
  border-top: 1px solid #eee;
}
.bottom{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
