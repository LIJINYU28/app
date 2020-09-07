import request from '@/utils/request'
// 公共接口
const API_NAME = '/admin/product'
// 暴露出去一个对象
export default {
  // 获取所有销售属性
  getBaseSaleAttrList() {
    return request.get(`${API_NAME}/baseSaleAttrList`)
  },
  // 根据spu的id删除对应的spu的对象
  deleteSpuInfoBySpuTd(spuId) {
    return request.delete(`${API_NAME}/deleteSpu/${spuId}`)
  },
  // 根据spu的id获取对应的spu的对象
  getSpuInfoBySpuId(spuId) {
    return request.get(`${API_NAME}/getSpuById/${spuId}`)
  },
  // 添加或者修改apu商品对象信息
  saveOrUpdateSpuInfo(spuInfo) {
    return request.post(`${API_NAME}/${spuInfo.id ? 'update' : 'save'}SpuInfo`, spuInfo)
  },
  // 根据页码和每页显示的条数及三级分类的id来以分页的形式获取spu的商品列表信息数据
  getSpuInfoList(page, limit, category3Id) {
    return request.get(`${API_NAME}/${page}/${limit}`, { params: { category3Id } })
  }
}
