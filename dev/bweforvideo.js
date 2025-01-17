getStatsParser.bweforvideo = function(result) {
    if (result.type === 'candidate-pair') {
        getStatsResult.bandwidth.availableSendBandwidth = result.availableOutgoingBitrate || 0;
        getStatsResult.bandwidth.googAvailableSendBandwidth = result.availableOutgoingBitrate || 0;
        getStatsResult.bandwidth.googAvailableReceiveBandwidth = result.availableIncomingBitrate || 0; // @todo not available anymore, check when using ICE
        getStatsResult.bandwidth.googTransmitBitrate = result.bytesSent || 0;
    };

    if (result.type === 'outbound-rtp') {
        getStatsResult.bandwidth.googBucketDelay = result.packetsSent > 0 ? result.totalPacketSendDelay / result.packetsSent : 0;
        getStatsResult.bandwidth.googTargetEncBitrate = result.headerBytesSent + result.bytesSent;
        getStatsResult.bandwidth.googActualEncBitrate = result.bytesSent - result.retransmittedBytesSent;
        getStatsResult.bandwidth.googRetransmitBitrate = result.retransmittedBytesSent;
    }
};
