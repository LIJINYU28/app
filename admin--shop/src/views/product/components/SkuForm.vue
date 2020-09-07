<template>
  <div>
    <el-form label-width="120px">
      <!--Spu名称-->
      <el-form-item label="SPU 名称">
        <span>小背心</span>
      </el-form-item>
      <!--SKU 名称-->
      <el-form-item label="SKU 名称">
        <el-input type="text" placeholder="请输入SKU名称" v-model="skuInfo.skuName"/>
      </el-form-item>
      <!--价格-->
      <el-form-item label="价格(元)">
        <el-input type="number" placeholder="请输入SKU价格" v-model="skuInfo.price"></el-input>
      </el-form-item>
      <!--重量-->
      <el-form-item label="重量(千克)">
        <el-input type="number" placeholder="请输入SKU重量" v-model="skuInfo.weight"></el-input>
      </el-form-item>
      <!--规格描述-->
      <el-form-item label="规格描述">
        <el-input type="textarea" rows="4" placeholder="请输入SKU描述信息"  v-model="skuInfo.skuDesc"></el-input>
      </el-form-item>

      <!--平台属性-->
      <el-form-item label="平台属性">
        <el-form inline label-width="80px">
          <el-form-item
            :label="attr.attrName"
            v-for="(attr,index) in attrList"
            :key="attr.id"
            style="margin-bottom:10px"
          >
            <el-select v-model="attr.attrIdValueId">
              <el-option
                :label="attrValue.valueNmae"
                v-for="(attrValue,index) in attr.attrValueList"
                :key="attrValue.id"
                :value="attr.id+'_'+attrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <!--销售属性-->
      <el-form-item label="销售属性">
        <el-form inline label-width="80px">
          <el-form-item
            :label="attr.saleAttrName"
            v-for="(attr,index) in saleAttrList "
            :key="attr.id"
            style="margin-bottom:10px"
          >
            <el-select v-model="attr.valurId">
              <el-option
                :label="value.saleAttrValueName"
                v-for="(value,index) in attr.spuSaleAttrValueList"
                :key="value.id"
                value="value.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <!--图片列表-->
      <el-form-item label="图片列表">
        <el-table border :data="spuImageList" @selection-change = "handleSelectionChange">
          <el-table-column type="selection" width="60"></el-table-column>
          <el-table-column label="图片">
            <template slot-scope="{row,$index}">
              <img :src="row.imgUrl" style="width:100px;height:100px;" />
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <el-tag type="success" v-if="row.isDefault === '1'">默认</el-tag>
              <el-button type="primary" v-else @click="setDefault(row)">设为默认</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "SkuForm",
  data() {
    return {
      skuInfo:{
        // 当前这个界面出现的时候就可以收集到数据
        category3Id:'',//三级分类的id
        tmId:'',//当前spu商品对象中的品牌id
        spuId:'',//
        //通过当前界面表单收集
        skuName:'',// 当前sku的名字
        price:'',// 当前sku的价格
        skuDesc:'',// 当前sku的描述
        weight:'', // 当前sku的重量
        //点击保存按钮时进行数据的收集及过滤操作
        skuAttrValueList:[], //平台属性
        skuImageList:[],//当前的sku的图片列表
        skuSaleAttrValueList:[],//销售属性

        skuDefaultImg:'',//当前的sku中的默认图片
        isSale:0//上下架的标识
      },
      spuInfo: {}, //保存传入进来的spuInfo对象
      attrList: [], //平台属性数组
      saleAttrList: [], //销售属性数组
      spuImageList: [], //图片列表数组
    };
  },
  methods: {
    // 添加sku操作的初始化方法
    initAddData(spuInfo) {
      this.spuInfo = spuInfo;
      // 当前方法调用的时候，需要收集三个数据
      this.skuInfo.category3Id = spuInfo.category3Id
      this.skuInfo.tmId = spuInfo.tmId
      this.skuInfo.spuId = spuInfo.id
      // 用来在当前界面中显示名字
      this.spuName = spuInfo.spuName 
      // 调用方法，发送三个请求
      this.getSkuFormInitData();
    },
    async getSkuFormInitData() {
      const { category1Id, category2Id, category3Id, id } = this.spuInfo;
      // 获取所有的平台属性
      const promise1 = await this.$API.attr.getAttrInfoList(
        category1Id,
        category2Id,
        category3Id
      );
      // 获取当前spu的销售属性
      const promise2 = await this.$API.sku.getSpuSaleAttrList(id);
      // 获取当前spu的图片列表
      const promise3 = await this.$API.sku.getSpuImageListById(id);
      // 统一处理
      const result = await Promise.all([promise1, promise2, promise3]);
      this.attrList = result[0].data;
      this.saleAttrList = result[1].data;
      // 把获取的数据先保存到spuImageList中
      this.spuImageList = result[2].data;
      spuImageList.forEach((item)=>(item,isDefault='0'))
      this.spuImageList = spuImageList
    },
    setDefault(img){
      this.spuImageList.forEach((item)=>(item.isDefault = '0'))
      img.isDefault = '1'
      this.skuInfo.skuDefaultImg = img.imgUrl
    },
    handleSelectionChange(val){
      this.selectedImageList = val
    },
    // 保存操作
    async save(){
      // 获取skuInfo对象，平台属性，销售属性，选择了那些图片
      const {skuInfo,attrList,saleAttrList,selectedImageList} = this
      // 过滤skuInfo数组
      skuInfo.skuAttrValueList = attrList.reduce((pre,item) => {
        // 获取每个平台属性对象下的attrIdValueId这个属性
        const attrIdValueId = item.attrIdValueId
        // 判断是否有值，有则被选中
        if (attrIdValueId) {
          const [attrId,valurId] = attrIdValueId.split('_')
          // 保存当前这个对象数据
          pre.push({
            attrId,
            valurId
          })
        }
        return pre
      },[])
      // saleAttrList: [], //销售属性数组--每个对象都有valueId属性
      // skuSaleAttrValueList:[],//选中的销售属性
      // 过滤选中的销售属性数据
      skuInfo.skuSaleAttrValueList = saleAttrList.reduce((pre,item)=>{
        // 获取带有valueId的销售属性对象
        const saleAttrValueId = item.attrIdValueId
        // 判断是否有值，有则被选中
        if (saleAttrValueId) {
          pre.push({
            // 选中的某个销售属性id，最终以对象的方式存到数组中
            saleAttrValueId 
          })
        }
        return pre
      },[])
      // 收集选中的图片
      skuInfo.skuImageList = selectedImageList.map((item)=>({
        imgName:item.imgName
        imgUrl:item.imgUrl
        isDefault:item.isDefault
        spuImgId:item.id
      }))
      // 调用接口
      const result = await this.$API.sku.saveOrUpdateSkuInfo(skuInfo)
      if (result.code === 200) {
        this.$message.success('保存SKU成功了')
        // 重置数据
        this.resetData()
        this.$emit('success')
      }else{
        this.$message.error('保存SKU失败')
      }
    },
    // 重置数据的方法
    resetData(){
      this.skuInfo={
        // 当前这个界面出现的时候就可以收集到数据
        category3Id:'',//三级分类的id
        tmId:'',//当前spu商品对象中的品牌id
        spuId:'',//
        //通过当前界面表单收集
        skuName:'',// 当前sku的名字
        price:'',// 当前sku的价格
        skuDesc:'',// 当前sku的描述
        weight:'', // 当前sku的重量
        //点击保存按钮时进行数据的收集及过滤操作
        skuAttrValueList:[], //平台属性
        skuImageList:[],//当前的sku的图片列表
        skuSaleAttrValueList:[],//销售属性

        skuDefaultImg:'',//当前的sku中的默认图片
        isSale:0//上下架的标识
      }
    }
  },
};
</script>
<style lang='less' rel='stylesheet/less' scoped>
</style>