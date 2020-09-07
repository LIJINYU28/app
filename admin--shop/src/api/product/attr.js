import request from '@/utils/request'
// 公共接口
const API_NAME = '/admin/product'
// 暴露出去一个对象
export default {
  // 获取平台属性信息列表数据
  getAttrInfoList(category1Id,category2Id,category3Id){
    return request.get(`${API_NAME}/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)
  },
  // 根据id删除某个平台属性信息数据对象
  deleteAttrInfoById(attrId){
    return request.delete(`${API_NAME}/deleteAttr/${attrId}`)
  },
  // 根据平台属性的id获取当前这个平台属性对应的属性值列表数据
  getAttrValueList(attrId){
    return request.get(`${API_NAME}/getAttrValueList/${attrId}`)
  },
  // 添加或者修改平台属性
  saveAttrInfo(attrInfo){
    return request.post(`${API_NAME}/saveAttrInfo`,attrInfo)
  }
}