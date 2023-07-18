import { TIsSupportedPromiseFactory } from '../types';

export const createIsSupportedPromise: TIsSupportedPromiseFactory = (window) => {
    if (
        window !== null &&
        // Bug #14: Before v14.1 Safari did not support the BlobEvent.
        window.BlobEvent !== undefined &&
        window.MediaStream !== undefined &&
        /*
         * Bug #10: An early experimental implemenation in Safari did not provide the isTypeSupported() function.
         */
        (window.MediaRecorder === undefined || window.MediaRecorder.isTypeSupported !== undefined)
    ) {
        /*
         * Bug #5: Up until v70 Firefox did emit a blob of type video/webm when asked to encode a MediaStream with a video track into an
         * audio codec.
         */
        return new Promise((resolve) => {
            const canvasElement = window.document.createElement('canvas');

            // @todo https://bugzilla.mozilla.org/show_bug.cgi?id=1388974
            canvasElement.getContext('2d');

            if (typeof canvasElement.captureStream !== 'function') {
                return resolve(false);
            }

            const mediaStream = canvasElement.captureStream();
            const mimeType = 'audio/webm';

            try {
                const mediaRecorder = new window.MediaRecorder(mediaStream, { mimeType });

                mediaRecorder.addEventListener('dataavailable', ({ data }) => resolve(data.type === mimeType));
                mediaRecorder.start();

                setTimeout(() => mediaRecorder.stop(), 10);
            } catch (err) {
                resolve(err.name === 'NotSupportedError');
            }
        });
    }

    return Promise.resolve(false);
};
