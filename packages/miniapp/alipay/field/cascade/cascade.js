Component({
  onInit() {
    var {
      props
    } = this.props;
    var {
      value
    } = props;

    if (Array.isArray(value)) {
      this.setData({
        labelValue: value.map(v => v.name).join(">")
      });
    }
  },

  methods: {
    openPicker() {
      var {
        props,
        onChange
      } = this.props;
      var {
        dataSource,
        placeholder = "请选择"
      } = props;
      my.multiLevelSelect && my.multiLevelSelect({
        title: placeholder,
        list: dataSource,
        success: res => {
          this.setData({
            labelValue: res.result.map(v => v.name).join(">")
          });
          onChange && onChange({
            value: res.result
          });
        },
        name: placeholder,
        fail: () => {}
      });
    }

  }
});