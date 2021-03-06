import request from '@/utils/request'
// 公共接口
const API_NAME = '/admin/product'
// 暴露出去一个对象
export default {
  // 下架
  cancelSale(skuId) {
    return request.get(`${API_NAME}/cancelSale/${skuId}`)
  },
  // 上架
  onSale(skuId) {
    return request.get(`${API_NAME}/onSale/${skuId}`)
  },
  // 根据sku的id删除对应的sku商品对象
  deleteSkuInfoById(skuId) {
    return request.delete(`${API_NAME}/deleteSku${skuId}`)
  },
  // 根据spu的商品id获取当前这个spusp下所有的sku的商品对象信息列表数据
  getSkuInfoListBySpuId(spuId) {
    return request.get(`${API_NAME}/findBySpuId${spuId}`)
  },
  // 根据sku商品的id获取当前这个sku商品详情信息对象
  getSkuInfoBySkuId(skuId) {
    return request.get(`${API_NAME}/getSkuById${skuId}`)
  },
  // 根据页码及每页的条数获取当前的sku商品列表数据
  getSkuInfoList(page, limit) {
    return request.get(`${API_NAME}/list/${page}/${limit}`)
  },
  // 添加或者修改sku商品信息对象
  saveOrUpdateSkuInfo(skuInfo) {
    return request.post(`${API_NAME}/${skuInfo.id ? 'update' : 'save'}SkuInfo`, skuInfo)
  },
  // 根据spu商品的id获取当前的所有图片列表信息数据
  getSpuImageListBySpuId(spuId) {
    return request.get(`${API_NAME}/spuImageList/${spuId}`)
  },
  // 根据spu商品的id获取当前所有的平台属性列表信息数据
  getSpuSaleAttrList(spuId) {
    return request.get(`${API_NAME}/spuSaleAttrList/${spuId}`)
  }
}
