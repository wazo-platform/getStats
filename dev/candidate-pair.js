getStatsParser.candidatePair = function(result) {
    if (isSafari) return; // We do not support Safari
    if (result.type !== 'googCandidatePair' && result.type !== 'candidate-pair' && result.type !== 'local-candidate' && result.type !== 'remote-candidate') return;
    const transportResult = getStatsResult.results.find(result => result.type === 'transport');
    const localCandidateResult = getStatsResult.results.find(result => result.type === 'local-candidate');

    // The active connection refers to the candidate pair that is currently selected by the transport
    // Logic from deprecated `googActiveConnection`, whish should means either STUN or TURN is used.
    const isStunTurnUsed = transportResult && transportResult.selectedCandidatePairId === result.id;
    var localCandidate;
    var remoteCandidate;

    if (isStunTurnUsed) {
        Object.keys(getStatsResult.internal.candidates).forEach(function(cid) {
            const candidate = getStatsResult.internal.candidates[cid];

            if (candidate.id === result.localCandidateId) {
                getStatsResult.connectionType.local.candidateType = candidate.candidateType;
                getStatsResult.connectionType.local.ipAddress = candidate.ipAddress;
                getStatsResult.connectionType.local.networkType = candidate.networkType;
                getStatsResult.connectionType.local.transport = candidate.transport;
            }

            if (candidate.id === result.remoteCandidateId) {
                getStatsResult.connectionType.remote.candidateType = candidate.candidateType;
                getStatsResult.connectionType.remote.ipAddress = candidate.ipAddress;
                getStatsResult.connectionType.remote.networkType = candidate.networkType;
                getStatsResult.connectionType.remote.transport = candidate.transport;
            }
        });

        // Use local-candidate to define transport
        getStatsResult.connectionType.transport = localCandidateResult.protocol;

        localCandidate = getStatsResult.internal.candidates[result.localCandidateId];
        if (localCandidate) {
            if (localCandidate.ipAddress) {
                getStatsResult.connectionType.systemIpAddress = localCandidate.ipAddress;
            }
        }

        remoteCandidate = getStatsResult.internal.candidates[result.remoteCandidateId];
        if (remoteCandidate) {
            if (remoteCandidate.ipAddress) {
                getStatsResult.connectionType.systemIpAddress = remoteCandidate.ipAddress;
            }
        }
    }

    if (result.type === 'candidate-pair') {
        if (result.selected === true && result.nominated === true && result.state === 'succeeded') {
            // Firefox used below two pairs for connection
            localCandidate = getStatsResult.internal.candidates[result.remoteCandidateId];
            remoteCandidate = getStatsResult.internal.candidates[result.remoteCandidateId];
        }
    }

    if (result.type === 'local-candidate') {
        getStatsResult.connectionType.local.candidateType = result.candidateType;
        getStatsResult.connectionType.local.ipAddress = result.adress;
        getStatsResult.connectionType.local.networkType = result.networkType;
        getStatsResult.connectionType.local.transport = result.protocol;
    }

    if (result.type === 'remote-candidate') {
        getStatsResult.connectionType.remote.candidateType = result.candidateType;
        getStatsResult.connectionType.remote.ipAddress = result.adress;
        getStatsResult.connectionType.remote.networkType = result.networkType;
        getStatsResult.connectionType.remote.transport = result.protocol;
    }
};
