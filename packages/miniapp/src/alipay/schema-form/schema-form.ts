import {
  getFormMixins
} from '../../Core/Form'
declare var console: any;
declare var Component: any;
Component({
  mixins: getFormMixins(),
  data: {
    formCore: {},
  },
  props: {},
  didMount() { },
  didUpdate() { },
  didUnmount() { },
  methods: {},
});
