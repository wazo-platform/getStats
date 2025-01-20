var LOCAL_candidateType = {};
var LOCAL_transport = {};
var LOCAL_ipAddress = {};
var LOCAL_networkType = {};

getStatsParser.localcandidate = function(result) {
    if (result.type !== 'localcandidate' && result.type !== 'local-candidate') return;
    if (!result.id) return;

    if (!LOCAL_candidateType[result.id]) {
        LOCAL_candidateType[result.id] = [];
    }

    if (!LOCAL_transport[result.id]) {
        LOCAL_transport[result.id] = [];
    }

    if (!LOCAL_ipAddress[result.id]) {
        LOCAL_ipAddress[result.id] = [];
    }

    if (!LOCAL_networkType[result.id]) {
        LOCAL_networkType[result.id] = [];
    }

    if (result.candidateType && LOCAL_candidateType[result.id].indexOf(result.candidateType) === -1) {
        LOCAL_candidateType[result.id].push(result.candidateType);
    }

    if (result.protocol && LOCAL_transport[result.id].indexOf(result.protocol) === -1) {
        LOCAL_transport[result.id].push(result.protocol);
    }

    const resultIpAddress = `${result.address}:${result.port}`;
    if (result.address && LOCAL_ipAddress[result.id].indexOf(resultIpAddress) === -1) {
        LOCAL_ipAddress[result.id].push(resultIpAddress);
    }

    if (result.networkType && LOCAL_networkType[result.id].indexOf(result.networkType) === -1) {
        LOCAL_networkType[result.id].push(result.networkType);
    }

    getStatsResult.internal.candidates[result.id] = {
        candidateType: LOCAL_candidateType[result.id],
        ipAddress: LOCAL_ipAddress[result.id],
        portNumber: result.port,
        networkType: LOCAL_networkType[result.id],
        priority: result.priority,
        transport: LOCAL_transport[result.id],
        timestamp: result.timestamp,
        id: result.id,
        type: result.type
    };

    getStatsResult.connectionType.local.candidateType = LOCAL_candidateType[result.id];
    getStatsResult.connectionType.local.ipAddress = LOCAL_ipAddress[result.id];
    getStatsResult.connectionType.local.networkType = LOCAL_networkType[result.id];
    getStatsResult.connectionType.local.transport = LOCAL_transport[result.id];
};
