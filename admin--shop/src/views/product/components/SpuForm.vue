<template>
  <div v-show="visible">
    <el-form label-width="80px">
      <!-- SPU名称 -->
      <el-form-item label="SPU名称">
        <el-input type="text" placeholder="请输入SPU名称" v-model="spuInfo.spuName"></el-input>
      </el-form-item>
      <!-- SPU品牌 -->
      <el-form-item label="品牌">
        <el-select v-model="spuInfo.tmId">
          <el-option
            v-for="(tm,index) in tradematkList"
            :key="tm.id"
            :label="tm.tmName"
            :value="tm.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- SPU描述 -->
      <el-form-item label="SPU描述">
        <el-input type="textarea" rows="4" placeholder="请输入SPU描述信息"></el-input>
      </el-form-item>
      <!-- SPU的图片 -->
      <el-form-item label="spu图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :file-list="spuImageList"
          :on-success="handleSuccess"
          multiple
        >
          <i class="el-icon-plus"></i>
          <div slot="tip" class="el-upload__tip">
            <span>只能上传jpg/png文件，且不超过2M</span>
          </div>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt />
        </el-dialog>
      </el-form-item>
      <!-- 销售属性 -->
      <el-form-item label="销售属性">
        <el-select
          v-model="attrIdAttrName"
          :placeholder="`${unSelectedSaleAttrList.length>0?`还有${unSelectedSaleAttrList}个选项`:'没有了'}`"
        >
          <el-option
            v-for="(attr,index) in unSelectedSaleAttrList"
            :key="attr.id"
            :label="attr.name"
            :value="attr.id+''+attr.name"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addSaleAttr"
          :disabled="!attrIdAttrName"
        >添加销售属性</el-button>
        <!--表格-->
        <el-table :data="spuInfo.spuSaleAttrList" style="width:100%; margin-top:20px;" border>
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="150"></el-table-column>
          <el-table-column prop="spuSaleAttrValueList" label="属性值名称列表">
            <template slot-scope="{row,$index}">
              <el-tag
                v-for="(value,index) in row.spuSaleAttrValueList"
                :key="value.id"
                closable
                :disable-transitions="false"
                @close="handleClose(row.spuSaleAttrValueList,index)"
              >{{value.saleAttrValueName}}</el-tag>
              <el-input
                class="input-new-tag"
                v-if="row.edit"
                v-model="row.saleAttrValueName"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              ></el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ 添加</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{row,$index}">
              <HintButton
                title="删除"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                slot="reference"
                @click="deleteAttr($index)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <!-- 两个按钮 -->
      <el-form-item>
        <el-button type="primary">保存</el-button>
        <el-button @click="back">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "SpuForm",
  data() {
    return {
      dialogImageUrl: "", //预览图片地址
      dialogVisible: false, // 是否预览
      spuId: null, //用来存储spu的id
      spuInfo: {
        category3Id:'',//三级分类的id
        description:'',//描述
        spuImageList:[],//图片数组
        spuName:'',//名字
        tmId:'',//品牌的id
        spuSaleAttrList: [], //当前的spuInfo中的销售属性数组
      }, //保存spu商品信息对象
      tradematkList: [], //保存所有品牌列表信息数据
      saleAttrList: [], //保存所有的销售属性列表信息数据
      spuImageList: [], //保存当前spu的图片列表信息数据
      attrIdAttrName: "", //用来保存销售属性数据的Id
    };
  },
  props: ["visible"],
  computed: {
    unSelectedSaleAttrList() {
      // 获取所有的销售属性和spuInfo中的销售属性
      const {
        saleAttrList,
        spuInfo: { spuSaleAttrList },
      } = this;
      // 筛选spuInfo对象中不存在的销售属性
      const result = saleAttrList.filter(
        (sa) => !spuSaleAttrList.some((ssa) => ssa.saleAttrName === sa.name)
      );
      return result;
    },
  },

  methods: {
    // 取消
    back() {
      // 分发update事件
      this.$emit("update:visible", false);
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    // 初始化发送请求的方法--发送四个请求
    initSpuFormData(spuId) {
      this.spuId = spuId; //保存id
      // 根据spu的id获取对应的spuInfo对象
      this.getSpuInfoById();
      // 获取所有的品牌信息列表数据
      this.getTrademarkList();
      // 获取所有的销售属性列表数据
      this.getSaleAttrList();
      // 获取当前的spuInfo对象中已存在的所有的图片列表数据
      this.getSpuImageList();
    },
    // 据spu的id获取对应的spuInfo对象
    async getSpuInfoById() {
      const result = await this.$API.spu.getSpuInfoBySpuId(this.spuId);
      if (result.code === 200) {
        this.spuInfo = result.data;
      }
    },
    // 获取所有的品牌信息列表数据
    async getTrademarkList() {
      const result = await this.$API.trademark.getTrademarkList();
      if (result.code == 200) {
        this.tradematkList = result.data;
      }
    },
    // 获取所有的销售属性列表数据
    async getSaleAttrList() {
      const result = await this.$API.spu.getBaseSaleAttrList();
      if (result.code === 200) {
        this.saleAttrList = result.data;
      }
    },
    // 获取当前的spuInfo对象中已存在的所有的图片列表数据
    async getSpuImageList() {
      const result = await this.$API.sku.getSpuImageListBySpuId(this.spuId);
      if (result.code === 200) {
        const spuImageList = result.data;
        spuImageList.forEach((item) => {
          item.name = item.spuName;
          item.url = item.spuUrl;
        });
        this.spuImageList = spuImageList;
      }
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 删除上传的图片
    handleRemove(file, fileList) {
      this.spuImageList = fileList;
    },
    // 照片上传成功
    handleSuccess(response, file, fileList) {
      // 把上传成功的图片列表数组重新的更新到之前保存图片列表数组中
      this.spuImageList = fileList;
    },
    // 显示预览的效果
    handlePictureCardPreview(file) {
      // 预览图片的地址
      this.dialogImageUrl = file.url;
      // 是否预览
      this.dialogVisible = true;
    },
    // 点击列表中的tag标签的x，移除这个销售属性
    handleClose(valueList, index) {
      valueList.splice(index, 1);
    },
    // 进入编辑模式
    showInput(attr) {
      // 判断当前这个对象有没有edit标识
      if (attr.hasOwnProperty("edit")) {
        attr.edit = true;
      } else {
        this.$set(attr, "edit", true);
      }
      // 点击按钮时，设置文本框自动获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },
    // 添加属性值操作
    handleInputConfirm(attr) {
      // 获取文本框中输入的数据
      const saleAttrValueName = attr.saleAttrValueName;
      // 判断数据是否输入
      if (saleAttrValueName) {
        const isRepeat = attr.spuSaleAttrValueList.some(
          (item) => item.saleAttrValueName === saleAttrValueName
        );
        if (!isRepeat) {
          // 向当前的数组中添加一个对象
          attr.saleAttrValueName.push({
            baseSaleAttrId: attr.baseSaleAttrId, //当前的销售属性的id
            saleAttrValueName, //属性值内容
          });
        } else {
          this.$message.warning("不能添加重复数据");
          return;
        }
      }
      // 查看模式
      attr.edit = false;
      // 清空文本框的数据
      attr.saleAttrValueName = "";
    },
    deleteAttr(index) {
      this.spuInfo.spuSaleAttrList.splice(index, 1);
    },
    // 添加销售属性按钮，把当前选中的销售属性添加到spuinfo中的spuSaleAttrlist
    addSaleAttr() {
      const [baseSaleAttrId, saleAttrName] = this.attrIdAttrName.split("_");
      this.spuInfo.spuSaleAttrList.push({
        baseSaleAttrId, //当前销售属性id
        saleAttrName, //当前销售属性名字
        spuSaleAttrValueList: [], //属性值数组
      });
      this.attrIdAttrName = "";
    },
    // 保存操作
    async saveSpuInfo() {
      const { spuInfo, spuImageList } = this;
      // 过滤所需的参数
      // 图片列表数组中的数据需要过滤
      spuInfo.spuImageList = spuImageList.map((item) => ({
        imgName: item.name,
        imgUrl: item.response ? item.response.data : item.url,
      }));
      // 销售属性的列表数据也需要过滤
      spuInfo.spuSaleAttrList = spuInfo.spuSaleAttrList.filter((item) => {
        if (item.spuSaleAttrValueList.length > 0) {
          delete item.edit;
          delete item.saleAttrValueName;
          return true;
        }
        return false
      });
      // 调用接口
      const result = await this.$API.spu.saveOrUpdateSpuInfo(apuInfo)
      if (result.code === 200) {
        this.$message.success('保存成功')
        this.$emit('update:visible',false)
        this.$emit('saveSuccess')
        this.resetData()

      }else{
        this.$message.error('保存失败')
      }
    },
    resetData(){
       this.dialogImageUrl= "", //预览图片地址
      this.dialogVisible= false, // 是否预览
      this.spuId= null, //用来存储spu的id
      this.spuInfo= {
        spuSaleAttrList: [], //当前的spuInfo中的销售属性数组
        category3Id:'',//三级分类的id
        description:'',//描述
        spuImageList:[],//图片数组
        spuName:'',//名字
        tmId:'',//品牌的id
      }, //保存spu商品信息对象
      this.tradematkList= [], //保存所有品牌列表信息数据
      this.saleAttrList= [], //保存所有的销售属性列表信息数据
      this.spuImageList= [], //保存当前spu的图片列表信息数据
      this.attrIdAttrName= "" //用来保存销售属性数据的Id
    },
    // 点击添加spu按钮后，显示当前的spuform界面的时候，初始化数据的方法（所有的品牌和所有的销售属性）
    initSpuFormAddData(category3Id){
      this.spuInfo.category3Id = category3Id
      // 获取所有的品牌
      this.getTrademarkList()
      // 获取所有的销售属性
      this.getSaleAttrList()
    }
  },
};
</script>
<style lang='less' rel='stylesheet/less' scoped>
</style>