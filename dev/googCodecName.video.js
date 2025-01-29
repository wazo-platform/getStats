getStatsParser.checkVideoTracks = function(result) {
    if (result.kind !== 'video') return;

    var sendrecvType = getStatsResult.internal.getSendrecvType(result);
    if (!sendrecvType) return;

    const rtpResult = getRtpResult(getStatsResult.results, result.type, 'video');
    if (!rtpResult) return;

    const remoteRtpResult = getStatsResult.results.find(r => r.id === result.remoteId) || {};

    const codecResult = getCodecResult(getStatsResult.results, rtpResult.codecId);
    if (!codecResult) return;

    const currentCodec = getCodecName(codecResult.mimeType) || 'VP8';
    if (getStatsResult.video[sendrecvType].codecs.indexOf(currentCodec) === -1) {
        getStatsResult.video[sendrecvType].codecs.push(currentCodec);
    }

    if (!!result.bytesSent) {
        if (!getStatsResult.internal.video[sendrecvType].prevBytesSent) {
            getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;
        }

        var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevBytesSent;
        getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;

        var kilobytes = bytes / 1024;
        getStatsResult.video[sendrecvType].bytesSent = kilobytes;
        getStatsResult.video.bytesSent = kilobytes;
    }

    if (!!result.bytesReceived) {
        if (!getStatsResult.internal.video[sendrecvType].prevBytesReceived) {
            getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;
        }

        var bytes = result.bytesReceived - getStatsResult.internal.video[sendrecvType].prevBytesReceived;
        getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;

        var kilobytes = bytes / 1024;
        getStatsResult.video[sendrecvType].bytesReceived = kilobytes;
        getStatsResult.video.bytesReceived = kilobytes;
    }

    if (rtpResult.frameHeight && result.frameWidth) {
        getStatsResult.resolutions[sendrecvType].width = result.frameHeight;
        getStatsResult.resolutions[sendrecvType].height = result.frameHeight;
    }

    if (result.trackIdentifier && getStatsResult.video[sendrecvType].tracks.indexOf(result.trackIdentifier) === -1) {
        getStatsResult.video[sendrecvType].tracks.push(result.trackIdentifier);
    }

    // Frames Per Second (FPS) refers to the rate at which video frames are being sent or received
    if (result.framesPerSecond) {
        getStatsResult.video[sendrecvType].framesPerSecond = result.framesPerSecond;
    }

    // Frames Sent refers to the total number of video frames that have been sent since the start of the session
    if (Number.isInteger(result.framesSent)) {
        if (!getStatsResult.internal.video[sendrecvType].prevFramesSent) {
            getStatsResult.internal.video[sendrecvType].prevFramesSent = result.framesSent;
        }

        var newFramesSent = result.framesSent - getStatsResult.internal.video[sendrecvType].prevFramesSent;
        getStatsResult.internal.video[sendrecvType].prevFramesSent = result.framesSent;

        getStatsResult.video[sendrecvType].framesSent = newFramesSent;
    }

    // Video quality
    getStatsResult.video[sendrecvType].totalRoundTripTime = remoteRtpResult.totalRoundTripTime || 0;
    getStatsResult.video[sendrecvType].jitter = remoteRtpResult.jitter || 0;
    getStatsResult.video[sendrecvType].jitterBufferDelay = remoteRtpResult.jitterBufferDelay || 0;
    getStatsResult.video[sendrecvType].packetsLost = result.type === 'inbound-rtp' ? rtpResult.packetsLost : remoteRtpResult.packetsLost;
    getStatsResult.video[sendrecvType].packetsReceived = result.type === 'inbound-rtp' ? rtpResult.packetsReceived : 0;

    if(remoteRtpResult.totalRoundTripTime) {
        getStatsResult.video.latency = remoteRtpResult.totalRoundTripTime;
    }

    if (Number.isInteger(rtpResult.packetsLost)) {
        getStatsResult.video.packetsLost = rtpResult.packetsLost;
    }
};
