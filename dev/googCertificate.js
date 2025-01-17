getStatsParser.googCertificate = function(result) {
    if (result.type == 'certificate') {
        const transportResult = getStatsResult.results.find(r => r.type === 'transport');

        if (transportResult.localCertificateId === result.id) {
            getStatsResult.encryption = result.fingerprintAlgorithm; // local candidate as default value
            getStatsResult.encryptionLocal = result.fingerprintAlgorithm;
        }

        if (transportResult.remoteCertificateId === result.id) {
            getStatsResult.encryptionRemote = result.fingerprintAlgorithm;
        }
    }
};
