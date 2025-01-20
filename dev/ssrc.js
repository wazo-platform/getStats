var SSRC = {
    audio: {
        send: [],
        recv: []
    },
    video: {
        send: [],
        recv: []
    }
};

getStatsParser.ssrc = function(result) {
    if (result.mediaType !== 'video' && result.mediaType !== 'audio') return;
    if (result.type !== 'inbound-rtp' && result.type !== 'outbound-rtp') return;

    // @todo double check this logic when having multiple candidates
    const rtpResult = getRtpResult(getStatsResult.results, result.type, result.mediaType);
    if (!rtpResult) return;

    const codecResult = getCodecResult(getStatsResult.results, rtpResult.codecId);
    if (!codecResult) return;

    const sendrecvType = result.type === 'outbound-rtp' ? 'send' : 'recv';

    if (SSRC[result.mediaType][sendrecvType].indexOf(result.ssrc) === -1) {
        SSRC[result.mediaType][sendrecvType].push(result.ssrc)
    }

    getStatsResult[result.mediaType][sendrecvType].streams = SSRC[result.mediaType][sendrecvType].length;
};
