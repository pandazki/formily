import SelectorCore from 'selector-core'
import _get from 'lodash.get'
Component({
  mixins: [],
  data: {
    images: []
  },
  props: {},
  onInit() {
    let {value} = this.props.props
    let dataSource = []

    if(Array.isArray(value)){
      dataSource = value
    }
    dataSource = dataSource.map((v,i)=>{
      return {
        label: i,
        value: v
      }
    })
    this.selector = new SelectorCore(dataSource, dataSource)
    this.setData({
      images: this.selector.getValues().map(v=>v.value)
    })
  },
  didUpdate() {},
  didUnmount() {},
  methods: {
    async uploadImage(api, path,header,formData){
      return new Promise((resolve,reject)=>{
        my.uploadFile({
          url: api,
          fileType: 'image',
          fileName: `image_${Date.now().toString(32)}`,
          filePath: path,
          header,
          formData,
          success: res => {
            resolve(path)
          },
          fail(res) {
            console.error(res)
            reject(res)
          }
        })
      })
    },
    openPicker(){
      let {props, onChange} = this.props
      let {
        sourceType = ['camera','album'],
        count = 9,
        // original 原图
        // compressed 压缩图
        sizeType = "compressed",
        header,
        formData,
        api
      } = props
      my.chooseImage({
        sourceType,
        count,
        sizeType,
        success: (res) => {
          let { apFilePaths = [] } = res
          let ln = apFilePaths.length
          this.setData({
            loading: true
          })
          apFilePaths.map((path,index)=>{
            this.uploadImage(api, path,header,formData).then(path=>{
              let values = [...this.data.images, path]
              let source = values.map(v=> {return {value: v, label: ""}})
              this.selector = new SelectorCore(source, source)
              this.setData({
                images: values
              })
              onChange && onChange({value: values})
            }).catch(()=>{
              my.showToast({
                content: `第${index}张上传失败`
              })
            }).finally(()=>{
              ln = ln - 1
              if(ln === 0){
                this.setData({
                  loading: false
                })
              }
            })
          })
        },
        fail:()=>{}
      })
    },
    deleteOne(e){
      let value = _get(e,"target.dataset.value")
      this.selector.change([{value,label:""}],"mutil")
      this.setData({
        images: this.selector.getValues().map(v=>v.value)
      })
    }
  },
});
