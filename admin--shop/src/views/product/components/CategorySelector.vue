<template>
  <div>
    <el-form :inline="true" :model="form">
      <!-- 一级分类 -->
      <el-form-item label="一级分类">
        <el-select v-model="form.category1Id" placeholder="请选择" @change="changeCategory1Handle" :disabled="isDisabled">
          <el-option v-for="(c1,index) in category1List" :label="c1.name" :value="c1.id" :key="c1.id"></el-option>
        </el-select>
      </el-form-item>

      <!-- 二级分类 -->
      <el-form-item label="二级分类">
        <el-select v-model="form.category2Id" placeholder="请选择" @change="changeCategory2Handle" :disabled="isDisabled">
          <el-option v-for="(c2,index) in category2List" :label="c2.name" :value="c2.id" :key="c2.id"></el-option>
        </el-select>
      </el-form-item>

      <!-- 一级分类 -->
      <el-form-item label="三级分类">
        <el-select v-model="form.category3Id" placeholder="请选择" @change="changeCategory3Handle" :disabled="isDisabled">
          <el-option v-for="(c3,index) in category3List" :label="c3.name" :value="c3.id" :key="c3.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "CategorySelector",
  data() {
    return {
      form: {
        category1Id: "", //一级分类Id
        category2Id: "", //二级分类Id
        category3Id: "", //三级分类Id
      },
      category1List: [], //一级分类的数据列表
      category2List: [], //二级分类的数据列表
      category3List: [], //三级分类的数据列表
      isDisabled:false
    };
  },
  mounted() {
    // 获取一级分类的数据
    this.getCategoryList();
  },
  methods: {
    // 获取一级分类的数据
    async getCategoryList() {
      // 调用接口
      const result = await this.$API.category.getCategorys1();
      if (result.code === 200) {
        // 更新数据
        this.category1List = result.data;
      }
    },
    // 一级分类的远中内容改变后触发的事件的对应的回调函数，一级分类改变获取二级分类的数据
    async changeCategory1Handle(category1Id) {
      this.form.category2Id = null;
      this.form.category3Id = null;
      this.category2List = [];
      this.category3List = [];
      const result = await this.$API.category.getCategorys2(category1Id);
      if (result.code === 200) {
        // 更新数据
        this.category2List = result.data;
      }
      // 分发父级组件的自定义事件，并传入当前的一级分类id及标识
      this.$emit('changeCategory',{categoryId:category1Id,level:1})
    },
    // 二级分类的远中内容改变后触发的事件的对应的回调函数，二级分类改变获取三级分类的数据
    async changeCategory2Handle(category2Id) {
      this.form.category3Id = null;
      this.category3List = [];
      const result = await this.$API.category.getCategorys3(category2Id);
      if (result.code === 200) {
        // 更新数据
        this.category3List = result.data;
      }
      // 分发父级组件的自定义事件，并传入当前的一级分类id及标识
      this.$emit('changeCategory',{categoryId:category2Id,level:2})
    },
    changeCategory3Handle(category3Id){
      // 分发父级组件的自定义事件，并传入当前的一级分类id及标识
      this.$emit('changeCategory',{categoryId:category3Id,level:3})
    }
  },
};
</script>
<style lang='less' rel='stylesheet/less' scoped>
</style>