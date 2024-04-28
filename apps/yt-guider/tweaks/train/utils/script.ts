export async function runScript(code: string) {
    const script = document.createElement('script');
    script.textContent = code;

    const div = document.createElement('div');
    const root = div.attachShadow({ mode: 'closed' });
    // root.appendChild(script);

    document.body.appendChild(div);

    const iframe = document.createElement('iframe');
    iframe.src = 'javascript:void 0';
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    iframe.style.display = 'display:none!important';

    root.appendChild(iframe);

    iframe.contentDocument.children[0].appendChild(script);

    return () => {
        document.body.removeChild(div);
    }
}

// const INIT_FUNC_NAME = '**VMInitInjection**';
// export const VM_UUID = chrome.runtime.getURL('');
// const kResponse = 'response';

// function getXhrInjection() {
//     console.log(VM_UUID)
//     try {
//       const quotedKey = `"${INIT_FUNC_NAME}"`;
//       // Accessing document.cookie may throw due to CSP sandbox
//       const cookieValue = document.cookie.split(`${quotedKey}=`)[1];
//       const blobId = cookieValue && cookieValue.split(';', 1)[0];
//       if (blobId) {
//         document.cookie = `${quotedKey}=0; max-age=0; SameSite=Lax`; // this removes our cookie
//         const xhr = new XMLHttpRequest();
//         const url = `blob:${VM_UUID}${blobId}`;
//         xhr.open('get', url, false); // `false` = synchronous
//         xhr.send();
//         URL.revokeObjectURL(url);
//         return JSON.parse(xhr[kResponse]);
//       }
//     } catch(e) { console.error(e); }
//   }