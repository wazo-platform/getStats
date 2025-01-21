// Note: This files only for Safari
// @todo remove safari code for our usecase?
getStatsParser.inboundrtp = function(result) {
    if (!isSafari) return;
    if (result.type !== 'inbound-rtp') return;

    var kind = result.kind || 'audio';
    var sendrecvType = result.isRemote ? 'recv' : 'send';

    if (!sendrecvType) return;

    if (!!result.bytesSent) {
        var kilobytes = 0;
        if (!getStatsResult.internal[kind][sendrecvType].prevBytesSent) {
            getStatsResult.internal[kind][sendrecvType].prevBytesSent = result.bytesSent;
        }

        var bytes = result.bytesSent - getStatsResult.internal[kind][sendrecvType].prevBytesSent;
        getStatsResult.internal[kind][sendrecvType].prevBytesSent = result.bytesSent;

        kilobytes = bytes / 1024;

        getStatsResult[kind][sendrecvType].availableBandwidth = kilobytes.toFixed(1);
        getStatsResult[kind].bytesSent = kilobytes.toFixed(1);
    }

    if (!!result.bytesReceived) {
        var kilobytes = 0;
        if (!getStatsResult.internal[kind][sendrecvType].prevBytesReceived) {
            getStatsResult.internal[kind][sendrecvType].prevBytesReceived = result.bytesReceived;
        }

        var bytes = result.bytesReceived - getStatsResult.internal[kind][sendrecvType].prevBytesReceived;
        getStatsResult.internal[kind][sendrecvType].prevBytesReceived = result.bytesReceived;

        kilobytes = bytes / 1024;
        // getStatsResult[kind][sendrecvType].availableBandwidth = kilobytes.toFixed(1);
        getStatsResult[kind].bytesReceived = kilobytes.toFixed(1);
    }
};
