<template>
  <div>
    <!-- 第一个卡片 -->
    <el-card>
      <CategorySelector @changeCategory="changeCategory" ref="cs"/>
    </el-card>
    <!-- 第二个卡片 -->
    <el-card style="margin-top:20px;">
      <!-- 展示平台属性列表的界面 -->
      <div v-show="isShowUpdateAttr">
        <el-button type="primary" icon="el-icon-plus" style="margin-bottom:20px;" @click="showAddAttr" :disabled='!category3Id'>添加属性</el-button>
        <!--表格-->
        <el-table :data="attrList" stripe style="width: 100%" border>
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="240"></el-table-column>
          <el-table-column prop="attrValueList" label="属性值列表">
            <template slot-scope="{row,$index}">
              <el-tag
                type="info"
                v-for="(item,index) in row.attrValueList"
                :key="item.id"
              >{{item.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{row,$index}">
              <HintButton
                title="修改"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showUpdateAttr(row)"
              />
                <!-- 气泡对话框 -->
                <el-popconfirm :title="`确定要删除${row.attrName}吗？`" @onConfirm="deleteAttr(row.id)">
                  <HintButton
                    title="删除"
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    slot="reference"
                  />
                </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 修改平台属性的界面 -->
      <div v-show="!isShowUpdateAttr">
        <!-- 表单内容 -->
        <el-form inline :model="formAttr">
          <el-form-item label="属性">
            <el-input v-model="formAttr.attrName" placeholder="属性名称"></el-input>
          </el-form-item>
        </el-form>
        <div style="margin-bottom:20px;">
          <el-button type="primary" @click="addValue" icon="el-icon-plus" :disabled='!formAttr.attrName.trim()'>添加属性值</el-button>
          <el-button @click="isShowUpdateAttr=true">取消</el-button>
        </div>
        <!--表格-->
        <el-table :data="formAttr.attrValueList" stripe style="width: 100%" border>
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="valueName" label="属性值名称">
            <template slot-scope="{row,$index}">
              <!-- 编辑模式 -->
              <el-input
                :ref="$index"
                type="text"
                size="mini"
                v-model="row.valueName"
                placeholder="请输入名称"
                v-if="row.edit"
                @keyup.enter.native="toView(row)"
                @blur="toView(row)"
              ></el-input>
              <!-- 查看模式 -->
              <span
                v-else
                @click="toEdit(row)"
                style="display:inline-block;width:100%"
              >{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <!-- 气泡对话框 -->
              <el-popconfirm :title="`确定要删除${row.valueName}吗？`" @onConfirm="deleteValue($index)">
                <HintButton
                  title="删除"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  slot="reference"
                />
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top:20px;">
          <el-button type="primary" @click="updateAttr" :disabled="!isSaveValid">保存</el-button>
          <el-button @click="isShowUpdateAttr=true">取消</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "AttrList",
  data() {
    return {
      category1Id: "", //用来储存一级分类的Id
      category2Id: "", //用来储存二级分类的Id
      category3Id: "", //用来储存三级分类的Id
      attrList: [], //用来存储平台属性数据
      isShowUpdateAttr: true, //切换平台属性界面和修改平台属性界面
      formAttr: {
        attrName: "", //存储平台属性的名字
        attrValueList: [], //这个平台属性中的属性值列表数据
      },
    };
  },
  computed:{
    // 设置内部的保存按钮是否禁用
    isSaveValid(){
      return (
        this.formAttr.attrName.trim() &&
        this.formAttr.attrValueList.some((item) => !!item.valueName.trim())
      )
    }
  },
  watch:{
    // 设置下拉框是否禁用
    isShowUpdateAttr(val){
      this.$refs.cs.isDisabled = !val
    }
  },
  methods: {
    // 获取平台属性数据
    async getAttrList() {
      const result = await this.$API.attr.getAttrInfoList(
        this.category1Id,
        this.category2Id,
        this.category3Id
      );
      if (result.code === 200) {
        this.attrList = result.data;
      }
    },
    // 获取各级分类的id，判断只有在三级id，再发送请求
    changeCategory({ categoryId, level }) {
      if (level === 3) {
        this.category3Id = categoryId;
        // 调用接口，发送请求，获取平台属性数据
        this.getAttrList();
      } else if (level === 1) {
        this.category1Id = categoryId;
        this.category2Id = null;
        this.attrList = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        this.category3Id = null;
        this.attrList = [];
      }
    },
    // 点击修改按钮，展示修改平台属性界面
    showUpdateAttr(attrInfo) {
      this.isShowUpdateAttr = false;
      // this.formAttr = attrInfo;
      // 深拷贝
      this.formAttr = cloneDeep(attrInfo);
    },
    // 点击删除按钮，从属性值列表数组中移除某个属性值对象，
    deleteValue(index) {
      this.formAttr.attrValueList.splice(index, 1);
    },
    // 点击添加属性值按钮，是向attrValueList数组中添加一个对象
    addValue() {
      // 添加一个属性值
      this.formAttr.attrValueList.push({
        valueName: "", //属性值
        attrId: this.formAttr.id, //当前的这个属性对象中的Id（平台属性的id）
        edit: true, //标识，用来区分是查看模式还是编辑模式
      });
      // 报错原因：此时是向数组中添加一个对象，html中还没有出现这个文本框
      this.$nextTick(() => {
        this.$refs[this.formAttr.attrValueList.length - 1].focus();
      });
    },
    // 进入查看模式
    toView(value) {
      if (value.valueName) {
        value.edit = false;
      }
    },
    // 进入编辑模式
    toEdit(value) {
      // 判断当前的这个属性值对象中是否有edit属性，没有添加，有就改为true
      if (!value.hasOwnProperty("edit")) {
        this.$set(value, "edit", true);
      } else {
        value.edit = true;
      }
    },
    // 保存按钮，更新平台属性值
    async updateAttr() {
      // 干掉edit，干掉空数据
      this.formAttr.attrValueList = this.formAttr.attrValueList.filter(
        (item) => {
          delete item.edit;
          return !!item.valueName.trim();
        }
      );
      // 调用接口
      const result = await this.$API.attr.saveAttrInfo(this.formAttr);
      if (result.code === 200) {
        this.$message.success("修改平台属性成功");
        // 重新获取数据
        this.getAttrList();
        // 关闭当前修改平台属性值的界面
        this.isShowUpdateAttr = true;
      } else {
        this.$message.error("修改属性失败");
      }
    },
    // 添加平台属性的按钮点击事件
    showAddAttr(){
      // 显示添加或者修改按钮
      this.isShowUpdateAttr = false
      this.formAttr = {
        attrName:'', //要添加的平台属性名
        attrValueList:[],//用来存储平台属性值对象的数组
        categoryId:this.category3Id,
        categoryLevel:3
      }
    },
    // 点击删除按钮，删除某个平台属性
    async deleteAttr(id){
      const result = await this.$API.attr.deleteAttrInfoById(id)
      if (result.code === 200) {
        this.$message.success('删除成功')
        this.getAttrList()
      }else{
        this.$message.error('删除失败')
      }
    }
  },
};
</script>
<style >
</style>