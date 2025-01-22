getStatsParser.bweforvideo = function(result) {
    if (result.type === 'candidate-pair') {
        getStatsResult.bandwidth.availableSendBandwidth = result.availableOutgoingBitrate || 0;
    };

    if (result.type === 'outbound-rtp') {
        getStatsResult.bandwidth.transmitBitrate = (result.headerBytesSent + result.bytesSent) || 0;
        getStatsResult.bandwidth.bucketDelay = result.packetsSent > 0 ? result.totalPacketSendDelay / result.packetsSent : 0;
        getStatsResult.bandwidth.targetEncBitrate = result.targetBitrate;
        getStatsResult.bandwidth.actualEncBitrate = result.bytesSent - result.retransmittedBytesSent;
        getStatsResult.bandwidth.retransmitBitrate = result.retransmittedBytesSent;
    }
};
