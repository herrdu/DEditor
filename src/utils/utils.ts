export function isAndriod() {
  const u = navigator.userAgent;
  return u.indexOf("Android") > -1 || u.indexOf("Linux") > -1;
}

export function isIOS() {
  const u = navigator.userAgent;
  return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
}
