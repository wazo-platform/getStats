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
    if (result.kind !== 'video' && result.kind !== 'audio') return;
    if (result.type !== 'inbound-rtp' && result.type !== 'outbound-rtp') return;

    // @todo double check this logic when having multiple candidates
    const rtpResult = getRtpResult(getStatsResult.results, result.type, result.kind);
    if (!rtpResult) return;

    const codecResult = getCodecResult(getStatsResult.results, rtpResult.codecId);
    if (!codecResult) return;

    const sendrecvType = result.type === 'outbound-rtp' ? 'send' : 'recv';

    if (SSRC[result.kind][sendrecvType].indexOf(result.ssrc) === -1) {
        SSRC[result.kind][sendrecvType].push(result.ssrc)
    }

    getStatsResult[result.kind][sendrecvType].streams = SSRC[result.kind][sendrecvType].length;
};
