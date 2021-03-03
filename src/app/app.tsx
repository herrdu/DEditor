import './app.less';

import {Component, Vue} from 'vue-property-decorator';
import {Editor, EditorContent} from 'tiptap';
import Bold from '@/extensions/Bold';
import Placeholder from '@/extensions/Placeholder';
import History from '@/extensions/History';
import Blockquote from '@/extensions/Blockquote';
import BulletList from '@/extensions/BulletList';
import HardBreak from '@/extensions/HardBreak';
import Heading from '@/extensions/Heading';
import Image from '@/extensions/Image';
import ListItem from '@/extensions/ListItem';
import OrderedList from '@/extensions/OrderedList';
import HorizontalRule from '@/extensions/HorizontalRule';
import LineHeight from '@/extensions/LineHeight';
import {Table, TableHeader, TableRow, TableCell} from '@/extensions/Table';
import Link from '@/extensions/Link';
import FontSize from '@/extensions/FontSize';
import FontFamily from '@/extensions/FontFamily';
import FontColor from '@/extensions/FontColor';
import Font from '@/extensions/Font';
import Italic from '@/extensions/Italic';
import Underline from '@/extensions/Underline';
import BGColor from '@/extensions/BGColor';
import {
  Message,
  Handler,
  SetUpdateTimeData,
  OnUpdateData,
  OnTransactionData,
  SetFontSizeData,
  SetColorData,
  InsertImageData,
  SetContentData,
  GetInitContentData,
  GetContentData,
} from './NoteBridge';
import {isIOS} from '@/utils/utils';

const HeaderHeight = 18;

@Component({
  components: {
    EditorContent,
  },
})
export default class App extends Vue {
  editor!: Editor;
  updateTime = '';

  beforeCreate() {
    this.$bridge.registerVoidHandler<SetUpdateTimeData>(Handler.SetUpdateTime, async request => {
      this.updateTime = request.param.updateTime;
    });

    this.$bridge.registerVoidHandler<never>(Handler.ToggleBold, async _request => {
      this.editor?.commands.bold();
    });

    this.$bridge.registerVoidHandler<never>(Handler.ToggleBulletList, async _request => {
      this.editor?.commands.bullet_list();
    });

    this.$bridge.registerVoidHandler<never>(Handler.ToggleOrderedList, async _request => {
      this.editor?.commands.ordered_list();
    });
    this.$bridge.registerVoidHandler<SetFontSizeData>(Handler.SetFontSize, async request => {
      this.editor?.commands.fontSize({
        fontSize: `${request.param.fontSize}px`,
      });
    });
    this.$bridge.registerVoidHandler<SetColorData>(Handler.SetColor, async request => {
      this.editor?.commands.fontColor({
        color: request.param.color,
      });
    });
    this.$bridge.registerVoidHandler<InsertImageData>(Handler.InsertImage, async request => {
      this.editor?.commands.image({
        src: request.param.src,
        thumbnail: request.param.thumbnail,
      });
    });

    this.$bridge.registerVoidHandler<SetContentData>(Handler.SetContent, async request => {
      this.editor?.setContent(request.param.content, false, undefined);
    });

    this.$bridge.registerVoidHandler<never>(Handler.Focus, async _request => {
      this.editor?.focus();
    });
    this.$bridge.registerVoidHandler<never>(Handler.Blur, async _request => {
      this.editor?.blur();
    });

    this.$bridge.registerHandler<never, GetContentData>(Handler.GetJson, async request => {
      return {
        id: request.id,
        code: 0,
        data: {
          content: JSON.stringify(this.editor?.getJSON()),
        },
      };
    });

    this.$bridge.registerHandler<never, GetContentData>(Handler.GetHtml, async request => {
      return {
        id: request.id,
        code: 0,
        data: {
          content: this.editor?.getHTML(),
        },
      };
    });
  }

  created() {
    this.editor = new Editor({
      content: '',
      onUpdate: () => {
        this.$bridge.sendMessage<OnUpdateData, never>(Message.OnUpdate, {
          json: JSON.stringify(this.editor?.getJSON() ?? {}),
        });
      },
      onTransaction: () => {
        this.$bridge.sendMessage<OnTransactionData, never>(Message.OnTransaction, {
          isBold: this.editor?.isActive.bold() ?? false,
          isBulletList: this.editor?.isActive.bullet_list() ?? false,
          isOrderedList: this.editor?.isActive.ordered_list() ?? false,
        });
      },
      injectCSS: true,
      extensions: [
        new Blockquote(),
        new BulletList(),
        new HardBreak(),
        new Heading(),
        new Image(),
        new ListItem(),
        new OrderedList(),
        new HorizontalRule(),
        new LineHeight(),
        new Table({
          resizable: true,
        }),
        new TableHeader(),
        new TableCell(),
        new TableRow(),
        new Link(),
        new Bold(),
        new FontSize(),
        new FontFamily(),
        new FontColor(),
        new Font(),
        new Italic(),
        new Underline(),
        new BGColor(),
        new History(),
        new Placeholder(),
      ],
    });
  }

  async mounted() {
    let initContent = '';

    /** 
    if (isIOS()) {
      initContent = (await this.$bridge.sendMessage<any, GetInitContentData>(Message.GetInitContent, {}))
        .content;
    }*/

    initContent = (await this.$bridge.sendMessage<any, GetInitContentData>(Message.GetInitContent, {}))
    .content;

    const isEmptyContent =
      initContent == null || (typeof initContent === 'string' && initContent.length == 0);
    if (isEmptyContent) {
      this.editor.commands.bold();
      this.editor.commands.fontSize({fontSize: '24px', toggle: true});
    } else {
      this.editor.setContent(initContent, false, {});
    }

    // this.editor.commands.image({
    //   src:
    //     'https://dss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=1533847389,899994729&fm=55&app=54&f=JPEG?w=1140&h=640',
    //   thumbnail:
    //     'https://dss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=1533847389,899994729&fm=55&app=54&f=JPEG?w=1140&h=640',
    // });

    this.$nextTick(function() {
      (this.$refs.editor as Element).scrollTo(0, HeaderHeight);

      // setTimeout(() => {
      //   this.editor?.focus();
      //   if (isEmptyContent) {
      //     this.editor?.commands.bold();
      //     this.editor?.commands.fontSize({ fontSize: "24px", toggle: true });
      //   }
      // }, 500);
    });
    this.$bridge.sendEmptyMessage(Message.OnLoad);
  }

  beforeDestroy() {
    this.editor?.destroy();
  }

  render() {
    return (
      <div class="editor" ref="editor">
        <div id="header" style={`height:${HeaderHeight}px;`}>
          {this.updateTime}
        </div>
        <editor-content class="editor__content" editor={this.editor} />
        <div id="footer" style="height:0;"></div>
      </div>
    );
  }
}
