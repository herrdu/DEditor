import {Component, Vue, Watch, Prop} from 'vue-property-decorator';

import {Editor} from '../Editor';

@Component
export class EditorContent extends Vue {
  @Prop({default: null, type: Object})
  editor!: Editor | null;

  @Watch('editor', {immediate: true})
  onEditorChange(ed: Editor) {
    if (ed && ed.element) {
      this.$nextTick(() => {
        if (ed.element.firstChild) {
          this.$el.appendChild(ed.element.firstChild);
        }
        ed.setParentComponent(this);
      });
    }
  }

  render() {
    return <div></div>;
  }

  beforeDestroy() {
    if (this.editor) {
      this.editor.element = this.$el as HTMLDivElement;
    }
  }
}

// export default {
//   props: {
//     editor: {
//       default: null,
//       type: Object,
//     },
//   },

//   watch: {
//     editor: {
//       immediate: true,
//       handler(editor: Editor) {
//         if (editor && editor.element) {
//           this.$nextTick(() => {
//             this.$el.appendChild(editor.element.firstChild);
//             editor.setParentComponent(this);
//           });
//         }
//       },
//     },
//   },

//   render(createElement) {
//     return createElement('div');
//   },

//   beforeDestroy() {
//     this.editor.element = this.$el;
//   },
// };
