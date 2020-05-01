function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var Format;

(function (Format) {
  Format["YMD"] = "yyyy-MM-dd";
  Format["HM"] = "HH:mm";
  Format["YMD_HM"] = "yyyy-MM-dd HH:mm";
  Format["YM"] = "yyyy-MM";
  Format["Y"] = "yyyy";
})(Format || (Format = {}));

var ValueType;

(function (ValueType) {
  ValueType["Format"] = "format";
  ValueType["Timestamp"] = "timestamp";
})(ValueType || (ValueType = {}));

var DateFormat = function DateFormat(format, timestamp) {
  if (format === void 0) {
    format = Format.YMD;
  }

  var date = new Date(timestamp);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  return format.replace("yyyy", year.toString()).replace("MM", month.toString()).replace("dd", day.toString()).replace("HH", hours.toString()).replace("mm", minutes.toString());
};

var GetDateValue = function GetDateValue(value, props) {
  var {
    valueType,
    format
  } = props; // format to timestamp

  if (valueType === ValueType.Timestamp && format !== Format.HM) {
    var date = new Date(0);
    var [ymd, hm = "00:00"] = value.split(' ');
    var [year, month = 1, day = 1] = ymd.split('-');
    var [hours, minutes] = hm.split(":");
    date.setFullYear(+year);
    date.setMonth(+month - 1);
    date.setDate(+day);
    date.setHours(+hours);
    date.setMinutes(+minutes);
    return +date;
  }

  return value;
};

Component({
  mixins: [],
  data: {},
  props: {},

  didMount() {
    var {
      props
    } = this.props;
    var {
      valueType,
      value
    } = props;
    var labelValue = value;

    if (value && !isNaN(+value) && valueType === ValueType.Timestamp) {
      labelValue = DateFormat(props.format, +value);
    }

    this.setData({
      labelValue,
      value: labelValue
    });
  },

  didUpdate() {},

  didUnmount() {},

  methods: {
    openPicker() {
      var {
        labelValue
      } = this.data;
      var {
        props = {},
        onChange
      } = this.props;
      props.format = props.format || Format.YMD;

      if (labelValue) {
        props.currentDate = labelValue;
      } else if (!props.currentDate) {
        props.currentDate = DateFormat(props.format, Date.now());
      }

      my.datePicker && my.datePicker(_extends({}, props, {
        success: res => {
          var {
            date
          } = res;
          var value = GetDateValue(date, props);
          this.setData({
            value,
            labelValue: date
          });
          onChange && onChange({
            value
          });
        },
        fail: res => {},
        complete: res => {}
      }));
    }

  }
});