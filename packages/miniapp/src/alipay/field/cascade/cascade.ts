Component({
  onInit() {
    let {props} = this.props
    let {value} = props
    if(Array.isArray(value)){
      this.setData({
        labelValue: value.map(v=>v.name).join(">")
      })
    }
  },
  methods: {
    openPicker(){
      let {props, onChange} = this.props
      let {dataSource, placeholder = "请选择"} = props
      
      my.multiLevelSelect &&  my.multiLevelSelect({
        title: placeholder,
        list: dataSource,
        success:(res: {result: {name: any}[], success: boolean})=>{
          this.setData({labelValue: res.result.map(v=>v.name).join(">") })
          onChange && onChange({value: res.result})
        },
        name: placeholder,
        fail: ()=>{}
      })
    }
  },
})