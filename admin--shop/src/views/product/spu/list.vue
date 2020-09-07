<template>
  <div>
    <!-- 第一个卡片 -->
    <el-;l>
      <CategorySelector @changeCategory="changeCategory" ref="cs" />
    </el-;l>
    <!-- 第二个卡片 -->
    <el-card style="margin-top:20px;">
      <!-- 展示平台属性列表的界面 -->
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button
          type="primary"
          icon="el-icon-plus"
          style="margin-bottom:20px;"
          :disabled="!category3Id"
          @click="showAddSpuForm"
        >添加SPU</el-button>
        <!--表格-->
        <el-table :data="spuInfoList" stripe style="width: 100%" border>
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="spuName" label="SPU名称" width="240"></el-table-column>
          <el-table-column prop="description" label="SPU描述"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <HintButton title="添加SKU" type="primary" icon="el-icon-plus" size="mini" />
              <HintButton
                title="修改SPU"
                @click="showUpdateSpuForm(row.id)"
                type="success"
                icon="el-icon-edit"
                size="mini"
              />
              <HintButton title="查看SKU列表" type="info" icon="el-icon-info" size="mini" />
              <!-- 气泡对话框 -->
              <el-popconfirm :title="`确定要删除${row.attrName}吗？`" @onConfirm="deleteSpu(row.id)">
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
        <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="getSpuInfoList"
          :current-page="page"
          :page-sizes="[3,6,9,12]"
          :page-size="limit"
          layout=" prev, pager, next, jumper,->, sizes,total"
          :total="total"
          style="text-align:center;margin-top:20px"
          background
        ></el-pagination>
      </div>
      <!--修改Spu的SpuForm组件-->
      <SpuForm :visible.sync="isShowSpuForm" ref="spuForm" @saveSuccess="saveSuccess" />
      <!--修改SkuForm组件-->
      <SkuForm
        :visible.sync="isShowSkuForm"
        ref="skuForm"
        @success="()=>isShowSkuForm=false"
        @cancel="()=>isShowSkuForm=false"
      />
    </el-card>
    <el-dialog :title="`${spuName}`" :visible.sync="isShowSkuList">
      <el-table :data="skuList">
        <el-table-column property="skuName" label="名称" width="150"></el-table-column>
        <el-table-column property="price" label="价格" width="200"></el-table-column>
        <el-table-column property="weigth" label="重量"></el-table-column>
        <el-table-column label="图片">
          <template slot-scope="{row,$index}">
            <img :src="row.skuDefaultImg" width="100" height="100">
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import SpuForm from "../components/SpuForm";
export default {
  name: "SpuList",
  data() {
    return {
      spuInfoList: [], //用来存储spu列表数据
      page: 1, //默认第一页
      limit: 3, //默认每页3条数据
      total: 0, //总数据条数
      category1Id: "", //用来存储一级分类的id
      category2Id: "", //用来存储二级分类的id
      category3Id: "", //用来存储三级分类的id
      isShowSpuForm: false,//设置当前的skuForm组件隐藏或显示
      spuName:'', //保存当前的sku列表对应的spu商品名称
      skuList:[],//保存当前的spu对应的所有列表数据
      isShowSkuList:false//显示或者隐藏当前spu对应的sku列表 
    };
  },
  components: {
    SpuForm,
  },
  methods: {
    // 获取spu的列表数据
    async getSpuInfoList(page = 1) {
      // 用来更新页码
      this.page = page;
      const { limit, category3Id } = this;
      const result = await this.$API.spu.getSpuInfoList(
        page,
        limit,
        category3Id
      );
      if (result.code === 200) {
        // 结构出总条数和获取到的spu列表的数据数组
        const { total, records } = result.data;
        // 更新总条数数据---目的：分页组件中要使用这个总条数
        this.total = total;
        // 更新spu列表数据
        this.spuInfoList = records;
      }
    },
    // 由子组件分发该事件，传递过来三个级别的分类的id和分类的级别标识
    changeCategory({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
        // 清空数据
        this.category2Id = null;
        this.category3Id = null;
        this.spuInfoList = [];
        this.total = 0;
      } else if (level === 2) {
        this.category2Id = categoryId;
        this.category3Id = null;
        this.spuInfoList = [];
        this.total = 0;
      } else if (level === 3) {
        this.category3Id = categoryId;
        this.getSpuInfoList();
      }
    },
    // 分页组件---更改每页的条数
    handleSizeChange() {
      // 更新每页显示的条数
      this.limit = val;
      // 立刻重新获取数据
      this.getSpuInfoList();
    },
    async deleteSpu(id) {
      const result = await this.$API.spu.deleteSpuInfoBySpuTd(id);
      if (result.code === 200) {
        this.$message.success("删除成功");
        this.getSpuInfoList(
          (this.spuInfoList.length = 1 ? this.page - 1 : this.page)
        );
      } else {
        this.$message.console.error("删除失败");
      }
    },
    // 点击修改按钮，显示spuForm组件
    showUpdateSpuForm(spuId) {
      this.spuId = spuId;
      this.isShowSpuForm = true;
      this.$refs.spuForm.initSpuFormData(spuId);
    },
    // 子组件中需要分发这个父级组件中自定义的事件 ---目的：刷新界面，重新获取数据
    saveSuccess() {
      if (this.spuId) {
        this.getSpuInfoList(this.page);
      } else {
        this.getSpuInfoList();
      }
    },
    // 点击按钮实现添加SPU操作
    showAddSpuForm() {
      this.isShowSpuForm = true;
      this.$refs.spuForm.initSpuFormAddData(this.category3Id);
    },
    // 点击按钮添加sku操作
    showAddSpuForm(spuInfo) {
      spuInfo = {
        ...spuInfo,
        category1Id: this.category1Id,
        category2Id: this.category2Id,
      };
      this.isShowSpuForm = true;
      this.$refs.skuForm.initAddData(spuInfo);
    },
    // 显示或者隐藏当前的spu对应的sku列表对话框
    async showSkuList(spuInfo){
      this.spuName = spuInfo.spuName
      this.isShowSkuList = true
      const result = await this.$API.sku.getSkuInfoListBySpuId(spuInfo.id)
      if (result.code === 200) {
        this.skuList = result.data
      }
    }
  },
};
</script>
<style >
</style>