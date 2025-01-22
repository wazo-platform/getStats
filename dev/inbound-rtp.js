// Note: This files only for Safari
// @todo remove safari code for our usecase?
getStatsParser.inboundrtp = function(result) {
    if (!isSafari) return;
    if (result.type !== 'inbound-rtp') return;

    var kind = result.kind || 'audio';
    var sendrecvType = result.isRemote ? 'recv' : 'send';

    if (!sendrecvType) return;

    if (!!result.bytesSent) {
        if (!getStatsResult.internal[kind][sendrecvType].prevBytesSent) {
            getStatsResult.internal[kind][sendrecvType].prevBytesSent = result.bytesSent;
        }

        var bytes = result.bytesSent - getStatsResult.internal[kind][sendrecvType].prevBytesSent;
        getStatsResult.internal[kind][sendrecvType].prevBytesSent = result.bytesSent;

        var kilobytes = bytes / 1024;

        getStatsResult[kind][sendrecvType].bytesSent = kilobytes;
        getStatsResult[kind].bytesSent = kilobytes;
    }

    if (!!result.bytesReceived) {
        if (!getStatsResult.internal[kind][sendrecvType].prevBytesReceived) {
            getStatsResult.internal[kind][sendrecvType].prevBytesReceived = result.bytesReceived;
        }

        var bytes = result.bytesReceived - getStatsResult.internal[kind][sendrecvType].prevBytesReceived;
        getStatsResult.internal[kind][sendrecvType].prevBytesReceived = result.bytesReceived;

        var kilobytes = bytes / 1024;
        getStatsResult[kind][sendrecvType].bytesSent = kilobytes;
        getStatsResult[kind].bytesReceived = kilobytes;
    }
};
