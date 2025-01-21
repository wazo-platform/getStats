getStatsParser.dataSentReceived = function(result) {
    if (result.type === 'remote-inbound-rtp' || (result.kind !== 'video' && result.kind !== 'audio')) return;

    if (!!result.bytesSent) {
        getStatsResult[result.kind].bytesSent = parseInt(result.bytesSent);
    }

    if (!!result.bytesReceived) {
        getStatsResult[result.kind].bytesReceived = parseInt(result.bytesReceived);
    }
};
