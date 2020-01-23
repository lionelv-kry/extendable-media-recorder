export const createMediaStreamWithAudioTrack = (audioContext, channelCount = 2, frequency = 440) => {
    const mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(audioContext, { channelCount });
    const oscillatorNode = new OscillatorNode(audioContext, { frequency });

    oscillatorNode.connect(mediaStreamAudioDestinationNode);
    oscillatorNode.start();

    const stream = mediaStreamAudioDestinationNode.stream;

    return new Promise((resolve) => {
        const intervalId = setInterval(() => {
            const channelCountOfStream = stream.getAudioTracks()[0].getSettings().channelCount;

            if (channelCountOfStream === undefined || channelCountOfStream === channelCount) {
                clearInterval(intervalId);
                resolve(stream);
            }
        });
    });
};
