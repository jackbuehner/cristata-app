// hook from https://louisrli.github.io/blog/2020/06/04/react-dynamic-script-hook/
// by Louis Li

/**
 * Dynamic script loading hook.
 */
import React from 'react';

// If no callback is provided, the script will not be removed on unmount. This
// kinda matters if the script loading is not idempotent (for some reason
// MathJax is not, which is one of the scripts I was using this for) or
// if you need the callback to happen again.
const useScript = (scriptUrl: string, scriptId: string, callback?: () => void) => {
  React.useEffect(() => {
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.id = scriptId;
      document.body.appendChild(script);

      script.onload = () => {
        if (callback) {
          callback();
        }
      };
    }

    if (existingScript && callback) {
      callback();
    }

    return () => {
      if (existingScript && callback) {
        existingScript.remove();
      }
    };
    // callback should never change, so it should not be here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptUrl, scriptId]);
};

export default useScript;
