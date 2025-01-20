getStatsParser.checkAudioTracks = function(result) {
    if (result.mediaType !== 'audio') return;

    const sendrecvType = getStatsResult.internal.getSendrecvType(result);
    if (!sendrecvType) return;

    const rtpResultKey = sendrecvType === 'send' ? 'outbound-rtp' : 'inbound-rtp';
    // @todo double check this logic when having multiple candidates
    // @todo refator... rtpResultKey, can be result.type
    const rtpResult = getRtpResult(getStatsResult.results, rtpResultKey, 'audio');
    if (!rtpResult) return;

    if (!rtpResult) return;

    const codecResult = getCodecResult(getStatsResult.results, rtpResult.codecId);
    if (!codecResult) return;

    const mediaPlayoutResult = getStatsResult.results.find(r => r.type === 'media-playout');
    if (!mediaPlayoutResult) return;

    const currentCodec = getCodecName(codecResult.mimeType) || 'opus';
    if (getStatsResult.audio[sendrecvType].codecs.indexOf(currentCodec) === -1) {
        getStatsResult.audio[sendrecvType].codecs.push(currentCodec);
    }

    if (!!result.bytesSent) {
        var kilobytes = 0;
        if (!getStatsResult.internal.audio[sendrecvType].prevBytesSent) {
            getStatsResult.internal.audio[sendrecvType].prevBytesSent = result.bytesSent;
        }

        var bytes = result.bytesSent - getStatsResult.internal.audio[sendrecvType].prevBytesSent;
        getStatsResult.internal.audio[sendrecvType].prevBytesSent = result.bytesSent;

        kilobytes = bytes / 1024;
        getStatsResult.audio[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
        getStatsResult.audio.bytesSent = kilobytes.toFixed(1);
    }

    if (!!result.bytesReceived) {
        var kilobytes = 0;
        if (!getStatsResult.internal.audio[sendrecvType].prevBytesReceived) {
            getStatsResult.internal.audio[sendrecvType].prevBytesReceived = result.bytesReceived;
        }

        var bytes = result.bytesReceived - getStatsResult.internal.audio[sendrecvType].prevBytesReceived;
        getStatsResult.internal.audio[sendrecvType].prevBytesReceived = result.bytesReceived;

        kilobytes = bytes / 1024;

        // getStatsResult.audio[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
        getStatsResult.audio.bytesReceived = kilobytes.toFixed(1);
    }

    if (result.trackIdentifier && getStatsResult.audio[sendrecvType].tracks.indexOf(result.trackIdentifier) === -1) {
        getStatsResult.audio[sendrecvType].tracks.push(result.trackIdentifier);
    }

    // calculate latency
    // @todo latency still not working as expected... do not expect 0 or below ...
    const currentDelayMs = (rtpResult.jitterBufferDelay || 0) + mediaPlayoutResult.totalPlayoutDelay;
    if (!!currentDelayMs) {
        var kilobytes = 0;
        if (!getStatsResult.internal.audio.prevGoogCurrentDelayMs) {
            getStatsResult.internal.audio.prevGoogCurrentDelayMs = currentDelayMs;
        }

        var bytes = currentDelayMs - getStatsResult.internal.audio.prevGoogCurrentDelayMs;
        getStatsResult.internal.audio.prevGoogCurrentDelayMs = currentDelayMs;

        getStatsResult.audio.latency = bytes.toFixed(1);

        if (getStatsResult.audio.latency < 0) {
            getStatsResult.audio.latency = 0;
        }
    }

    // calculate packetsLost
    if (!!rtpResult.packetsLost) {
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
