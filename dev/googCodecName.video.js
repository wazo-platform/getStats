getStatsParser.checkVideoTracks = function(result) {
    if (result.mediaType !== 'video') return;

    var sendrecvType = getStatsResult.internal.getSendrecvType(result);
    if (!sendrecvType) return;

    const rtpResultKey = sendrecvType === 'send' ? 'outbound-rtp' : 'inbound-rtp';
    // @todo double check this logic when having multiple candidates
    // @todo refator... rtpResultKey, can be result.type
    const rtpResult = getRtpResult(getStatsResult.results, rtpResultKey, 'video');
    if (!rtpResult) return;

    if (!rtpResult) return;

    const codecResult = getCodecResult(getStatsResult.results, rtpResult.codecId);
    if (!codecResult) return;

    const mediaPlayoutResult = getStatsResult.results.find(r => r.type === 'media-playout');
    if (!mediaPlayoutResult) return;

    const currentCodec = getCodecName(codecResult.mimeType) || 'VP8';
    if (getStatsResult.video[sendrecvType].codecs.indexOf(currentCodec) === -1) {
        getStatsResult.video[sendrecvType].codecs.push(currentCodec);
    }

    if (!!result.bytesSent) {
        var kilobytes = 0;
        if (!getStatsResult.internal.video[sendrecvType].prevBytesSent) {
            getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;
        }

        var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevBytesSent;
        getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;

        kilobytes = bytes / 1024;

        getStatsResult.video[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
        getStatsResult.video.bytesSent = kilobytes.toFixed(1);
    }

    if (!!result.bytesReceived) {
        var kilobytes = 0;
        if (!getStatsResult.internal.video[sendrecvType].prevBytesReceived) {
            getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;
        }

        var bytes = result.bytesReceived - getStatsResult.internal.video[sendrecvType].prevBytesReceived;
        getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;

        kilobytes = bytes / 1024;
        // getStatsResult.video[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
        getStatsResult.video.bytesReceived = kilobytes.toFixed(1);
    }

    if (rtpResult.frameHeight && result.frameWidth) {
        getStatsResult.resolutions[sendrecvType].width = result.frameHeight;
        getStatsResult.resolutions[sendrecvType].height = result.frameHeight;
    }

    if (result.trackIdentifier && getStatsResult.video[sendrecvType].tracks.indexOf(result.trackIdentifier) === -1) {
        getStatsResult.video[sendrecvType].tracks.push(result.trackIdentifier);
    }

    // @todo do not to existing in the migration guide and note inside the payload of result
    if (result.framerateMean) {
        getStatsResult.bandwidth.framerateMean = result.framerateMean;
        var kilobytes = 0;
        if (!getStatsResult.internal.video[sendrecvType].prevFramerateMean) {
            getStatsResult.internal.video[sendrecvType].prevFramerateMean = result.bitrateMean;
        }

        var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevFramerateMean;
        getStatsResult.internal.video[sendrecvType].prevFramerateMean = result.framerateMean;

        kilobytes = bytes / 1024;
        getStatsResult.video[sendrecvType].framerateMean = bytes.toFixed(1);
    }

    // @todo do not to existing in the migration guide and note inside the payload of result
    if (result.bitrateMean) {
        getStatsResult.bandwidth.bitrateMean = result.bitrateMean;
        var kilobytes = 0;
        if (!getStatsResult.internal.video[sendrecvType].prevBitrateMean) {
            getStatsResult.internal.video[sendrecvType].prevBitrateMean = result.bitrateMean;
        }

        var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevBitrateMean;
        getStatsResult.internal.video[sendrecvType].prevBitrateMean = result.bitrateMean;

        kilobytes = bytes / 1024;
        getStatsResult.video[sendrecvType].bitrateMean = bytes.toFixed(1);
    }

    // calculate latency
    // @todo latency still not working as expected... do not expect 0 or below ...
    const currentDelayMs = (rtpResult.jitterBufferDelay || 0) + mediaPlayoutResult.totalPlayoutDelay;
    if (!!currentDelayMs) {
        var kilobytes = 0;
        if (!getStatsResult.internal.video.prevGoogCurrentDelayMs) {
            getStatsResult.internal.video.prevGoogCurrentDelayMs = currentDelayMs;
        }

        var bytes = currentDelayMs - getStatsResult.internal.video.prevGoogCurrentDelayMs;
        getStatsResult.internal.video.prevGoogCurrentDelayMs = currentDelayMs;

        getStatsResult.video.latency = bytes.toFixed(1);

        if (getStatsResult.video.latency < 0) {
            getStatsResult.video.latency = 0;
        }
    }

    // calculate packetsLost
    if (!!result.packetsLost) {
        var kilobytes = 0;
        if (!getStatsResult.internal.video.prevPacketsLost) {
            getStatsResult.internal.video.prevPacketsLost = result.packetsLost;
        }

        var bytes = result.packetsLost - getStatsResult.internal.video.prevPacketsLost;
        getStatsResult.internal.video.prevPacketsLost = result.packetsLost;

        getStatsResult.video.packetsLost = bytes.toFixed(1);

        if (getStatsResult.video.packetsLost < 0) {
            getStatsResult.video.packetsLost = 0;
        }
    }
};
