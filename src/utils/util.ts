export function formatSize (size) {
  size = parseInt(size)
  if (!size) {
    return 0
  }
  const sizeMap = ['B', 'KB', 'M', 'G', 'T']
  let index = 0
  while (size > 1024) {
    size = size / 1024
    index++
  }
  size = String(size.toFixed(1))
  if (/(.0)/.test(size)) size = size.split('.0')[0]
  return `${size}${sizeMap[index]}`
}

export function checkValidLink (url) {
  return /^(thunder|magnet|http[s]?|ftp|ed2k):/i.test(url)
}

export function debounce(fn, interval) {
  let timer = null;
  return function() {
    clearTimeout(timer);
    let context = this;
    let args = arguments;

    timer = setTimeout(function() {
      fn.apply(context, args);
    }, interval);
  };
}
