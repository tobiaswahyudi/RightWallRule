export const OPTIONS = {
  UI: {
    fontSize: {
      key: 'UI.fontSize',
      value: null,
      default: 12,
      parser: Number
    }
  },
};

export const setOption = (opt, val) => {
  window.localStorage.setItem(opt.key, val);
  opt.value = val;
}
export const getOption = (opt) => opt.value;

export function initializeOptions() {
  for(const optionSet in OPTIONS) {
    for(const optionKey in OPTIONS[optionSet]) {
      const theOption = OPTIONS[optionSet][optionKey];
      const optCheck = window.localStorage.getItem(theOption.key);
      if(optCheck) {
        theOption.value = theOption.parser(optCheck);
      } else {
        setOption(theOption, theOption.default);
      }
    }
  }

  document.children[0].style.fontSize = `${OPTIONS.UI.fontSize.value}px`;
}