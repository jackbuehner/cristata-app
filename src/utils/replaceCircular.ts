// adpated from https://gist.github.com/saitonakamura/d51aa672c929e35cc81fa5a0e31f12a9
// @ts-nocheck

function replaceCircular(val: any, cache = new WeakSet()) {
  cache = cache || new WeakSet();

  if (val && typeof val == 'object') {
    if (!!val.props) return '[Circular]';
    if (cache.has(val)) return '[Circular]';

    cache.add(val);

    var obj = Array.isArray(val) ? [] : {};
    for (var idx in val) {
      obj[idx] = replaceCircular(val[idx], cache);
    }

    cache.delete(val);
    return obj;
  }

  return val;
}

export { replaceCircular };
