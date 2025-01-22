getStatsParser.checkAudioTracks = function(result) {
    if (result.kind !== 'audio' || !result.remoteId) return;

    const sendrecvType = getStatsResult.internal.getSendrecvType(result);
    if (!sendrecvType) return;

    const rtpResult = getRtpResult(getStatsResult.results, result.type, 'audio');
    if (!rtpResult) return;

    const remoteRtpResult = getStatsResult.results.find(r => r.id === result.remoteId);
    if(!remoteRtpResult) return;

    const codecResult = getCodecResult(getStatsResult.results, rtpResult.codecId);
    if (!codecResult) return;

    const mediaPlayoutResult = getStatsResult.results.find(r => r.type === 'media-playout');
    if (!mediaPlayoutResult) return;

    const currentCodec = getCodecName(codecResult.mimeType) || 'opus';
    if (getStatsResult.audio[sendrecvType].codecs.indexOf(currentCodec) === -1) {
        getStatsResult.audio[sendrecvType].codecs.push(currentCodec);
    }

    if (!!result.bytesSent) {
        if (!getStatsResult.internal.audio[sendrecvType].prevBytesSent) {
            getStatsResult.internal.audio[sendrecvType].prevBytesSent = result.bytesSent;
        }

        var bytes = result.bytesSent - getStatsResult.internal.audio[sendrecvType].prevBytesSent;
        getStatsResult.internal.audio[sendrecvType].prevBytesSent = result.bytesSent;

        var kilobytes = bytes / 1024;
        getStatsResult.audio[sendrecvType].bytesSent = kilobytes.toFixed(1);
        getStatsResult.audio.bytesSent = kilobytes.toFixed(1);
    }

    if (!!result.bytesReceived) {
        if (!getStatsResult.internal.audio[sendrecvType].prevBytesReceived) {
            getStatsResult.internal.audio[sendrecvType].prevBytesReceived = result.bytesReceived;
        }

        var bytes = result.bytesReceived - getStatsResult.internal.audio[sendrecvType].prevBytesReceived;
        getStatsResult.internal.audio[sendrecvType].prevBytesReceived = result.bytesReceived;

        var kilobytes = bytes / 1024;
        getStatsResult.audio.bytesReceived = (bytes / 1024).toFixed(1);
    }

    if (result.trackIdentifier && getStatsResult.audio[sendrecvType].tracks.indexOf(result.trackIdentifier) === -1) {
        getStatsResult.audio[sendrecvType].tracks.push(result.trackIdentifier);
    }

    // Audio quality
    getStatsResult.audio[sendrecvType].totalRoundTripTime = remoteRtpResult.totalRoundTripTime || 0;
    getStatsResult.audio[sendrecvType].jitter = remoteRtpResult.jitter || 0;
    getStatsResult.audio[sendrecvType].jitterBufferDelay = remoteRtpResult.jitterBufferDelay || 0;
    getStatsResult.audio[sendrecvType].packetsLost = result.type === 'inbound-rtp' ? rtpResult.packetsLost : remoteRtpResult.packetsLost;
    getStatsResult.audio[sendrecvType].packetsReceived = result.type === 'inbound-rtp' ? rtpResult.packetsReceived : 0;

    if(remoteRtpResult.totalRoundTripTime) {
        getStatsResult.audio.latency = remoteRtpResult.totalRoundTripTime;
    }

    // calculate packetsLost difference between reports
    if (Number.isInteger(rtpResult.packetsLost)) {
        var kilobytes = 0;
        if (!getStatsResult.internal.audio.prevPacketsLost) {
            getStatsResult.internal.audio.prevPacketsLost = rtpResult.packetsLost;
        }

        var bytes = rtpResult.packetsLost - getStatsResult.internal.audio.prevPacketsLost;
        getStatsResult.internal.audio.prevPacketsLost = rtpResult.packetsLost;

        getStatsResult.audio.packetsLost = bytes.toFixed(1);

        if (getStatsResult.audio.packetsLost < 0) {
            getStatsResult.audio.packetsLost = 0;
        }
    }
};
