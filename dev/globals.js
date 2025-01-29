var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

if (typeof MediaStreamTrack === 'undefined') {
    MediaStreamTrack = {}; // todo?
}

const systemNetworkType = ((navigator.connection || {}).type || 'unknown').toString().toLowerCase();

var getStatsResult = {
    encryption: 'sha-256',
    audio: {
        send: {
            tracks: [],
            codecs: [],
            streams: 0,
        },
        recv: {
            tracks: [],
            codecs: [],
            streams: 0,
        },
        bytesSent: 0,
        bytesReceived: 0,
        packetsLost: 0
    },
    video: {
        send: {
            tracks: [],
            codecs: [],
            streams: 0,
        },
        recv: {
            tracks: [],
            codecs: [],
            streams: 0,
        },
        bytesSent: 0,
        bytesReceived: 0,
        latency: 0,
        packetsLost: 0
    },
    bandwidth: {
        systemBandwidth: 0,
        sentPerSecond: 0,
        encodedPerSecond: 0,
        helper: {
            audioBytesSent: 0,
            videoBytestSent: 0
        },
        speed: 0
    },
    results: {},
    connectionType: {
        systemNetworkType: systemNetworkType,
        systemIpAddress: '192.168.1.2',
        local: {
            candidateType: [],
            transport: [],
            ipAddress: [],
            networkType: []
        },
        remote: {
            candidateType: [],
            transport: [],
            ipAddress: [],
            networkType: []
        }
    },
    resolutions: {
        send: {
            width: 0,
            height: 0
        },
        recv: {
            width: 0,
            height: 0
        }
    },
    internal: {
        bandwidth: {
            prevBytesReceived: 0,
        },
        audio: {
            send: {},
            recv: {}
        },
        video: {
            send: {},
            recv: {}
        },
        candidates: {},
        getSendrecvType: function(result) {
            var sendrecvType = result.id.split('_').pop();
            if ('isRemote' in result) {
                if (result.isRemote === true) {
                    sendrecvType = 'recv';
                }
                if (result.isRemote === false) {
                    sendrecvType = 'send';
                }
            } else {
                var direction = result.type.split('-')[0];
                sendrecvType = direction === 'outbound' ? 'send' : (direction === 'inbound' ? 'recv' : null);
            }

            return sendrecvType;
        },
    },
    nomore: function() {
        nomore = true;
    }
};

const getStatsParser = {
    checkIfOfferer: function(result) {
        if (result.type === 'googLibjingleSession') {
            getStatsResult.isOfferer = result.googInitiator;
        }
    }
};

const getCodecResult = (results, codecId) => results.find(result => result.type === 'codec' && result.id === codecId);

const getCodecName = (mimeType) => mimeType && mimeType.split('/')[1];

const getRtpResult = (results, directionType, kind) => results.find(r => r.type === directionType  && r.kind === kind)

const getRemoteRtpResult = (results, directionType, kind) => results.find(r => r.type === directionType  && r.kind === kind)

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
