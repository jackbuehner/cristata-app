interface RequestInit2 {
  body?: XMLHttpRequestBodyInit | null;
  onUploadProgress?: (progressEvent: ProgressEvent<XMLHttpRequestEventTarget>, progress: number | null) => void;
  method?: RequestInit['method'];
  headers?: RequestInit['headers'];
  credentials?: 'include' | 'omit';
}

function fetch2(input: string | URL, opts?: RequestInit2): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // start the request
    xhr.open(opts?.method || 'get', input.toString());

    // set headers
    if (opts?.headers) {
      if (Array.isArray(opts.headers)) {
        opts.headers.forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      } else if (opts?.headers instanceof Headers) {
        opts.headers.forEach((value, key) => {
          xhr.setRequestHeader(key, value);
        });
      } else {
        Object.entries(opts.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }
    }

    // return the response on load
    xhr.onload = () => resolve(xhr.response);

    // provide the error when it occurs
    xhr.onerror = reject;

    // provide upload progress
    if (xhr.upload && opts?.onUploadProgress) {
      xhr.upload.onprogress = (evt) => {
        let progress: number | null = null;
        if (evt.lengthComputable) progress = evt.loaded / evt.total;
        opts.onUploadProgress?.(evt as ProgressEvent<XMLHttpRequestEventTarget>, progress);
      };
    }

    // whether to send credentials (cookies)
    xhr.withCredentials = opts?.credentials === 'include';

    // send the request
    xhr.send(opts?.body);
  });
}

export default fetch2;
export type { RequestInit2 };
