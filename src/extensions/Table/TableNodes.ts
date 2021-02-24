import { tableNodes } from 'prosemirror-tables';

const TN = tableNodes({
  tableGroup: 'block',
  cellContent: 'block+',
  cellAttributes: {
    style:{
      default: null,
      getFromDOM(dom) {
        if (dom instanceof HTMLElement) {
          return dom.getAttribute('style');
        } else {
          return null;
        }
      },
      setDOMAttr(value, attrs) {
        if (value) {
          const style = {style: `${attrs.style || ''}${value}`};
          Object.assign(attrs, style);
        }
      },
    },
  },
});

export default TN;