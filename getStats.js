'use strict';

// Last time updated: 2025-01-23 4:14:50 PM UTC

// _______________
// getStats v1.2.0

// Open-Sourced: https://github.com/muaz-khan/getStats

// --------------------------------------------------
// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// --------------------------------------------------

var getStats = function(mediaStreamTrack, callback, interval) {

var browserFakeUserAgent = 'Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45';

(function(that) {
    if (!that) {
        return;
    }

    if (typeof window !== 'undefined') {
        return;
    }

    if (typeof global === 'undefined') {
        return;
    }

    global.navigator = {
        userAgent: browserFakeUserAgent,
        getUserMedia: function() {}
    };

    if (!global.console) {
        global.console = {};
    }

    if (typeof global.console.log === 'undefined' || typeof global.console.error === 'undefined') {
        global.console.error = global.console.log = global.console.log || function() {
            console.log(arguments);
        };
    }

    if (typeof document === 'undefined') {
        /*global document:true */
        that.document = {
            documentElement: {
                appendChild: function() {
                    return '';
                }
            }
        };

        document.createElement = document.captureStream = document.mozCaptureStream = function() {
            var obj = {
                getContext: function() {
                    return obj;
                },
                play: function() {},
                pause: function() {},
                drawImage: function() {},
                toDataURL: function() {
                    return '';
                }
            };
            return obj;
        };

        that.HTMLVideoElement = function() {};
    }

    if (typeof location === 'undefined') {
        /*global location:true */
        that.location = {
            protocol: 'file:',
            href: '',
            hash: ''
        };
    }

    if (typeof screen === 'undefined') {
        /*global screen:true */
        that.screen = {
            width: 0,
            height: 0
        };
    }

    if (typeof URL === 'undefined') {
        /*global screen:true */
        that.URL = {
            createObjectURL: function() {
                return '';
            },
            revokeObjectURL: function() {
                return '';
            }
        };
    }

    if (typeof MediaStreamTrack === 'undefined') {
        /*global screen:true */
        that.MediaStreamTrack = function() {};
    }

    if (typeof RTCPeerConnection === 'undefined') {
        /*global screen:true */
        that.RTCPeerConnection = function() {};
    }

    /*global window:true */
    that.window = global;
})(typeof global !== 'undefined' ? global : null);

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

var peer = this;

if (!(arguments[0] instanceof RTCPeerConnection)) {
    throw '1st argument is not instance of RTCPeerConnection.';
}

peer = arguments[0];

if (arguments[1] instanceof MediaStreamTrack) {
    mediaStreamTrack = arguments[1]; // redundant on non-safari
    callback = arguments[2];
    interval = arguments[3];
}

var nomore = false;

function getStatsLooper() {
    getStatsWrapper(function(results) {
        if (!results || !results.forEach) return;

        // allow users to access native results
        getStatsResult.results = results;

        results.forEach(function(result) {
            Object.keys(getStatsParser).forEach(function(key) {
                if (typeof getStatsParser[key] === 'function') {
                    try {
                        getStatsParser[key](result);
                    } catch (e) {
                        console.error(e.message, e.stack, e);
                    }
                }
            });
        });

        try {
            if (peer.iceConnectionState.search(/failed|closed|disconnected/gi) !== -1) {
                nomore = true;
            }
        } catch (e) {
            nomore = true;
        }

        if (nomore === true) {
            if (getStatsResult.datachannel) {
                getStatsResult.datachannel.state = 'close';
            }
            getStatsResult.ended = true;
        }

        if (getStatsResult.audio && getStatsResult.video) {
            getStatsResult.bandwidth.speed = (getStatsResult.audio.bytesSent - getStatsResult.bandwidth.helper.audioBytesSent) + (getStatsResult.video.bytesSent - getStatsResult.bandwidth.helper.videoBytesSent);
            getStatsResult.bandwidth.helper.audioBytesSent = getStatsResult.audio.bytesSent;
            getStatsResult.bandwidth.helper.videoBytesSent = getStatsResult.video.bytesSent;
        }

        callback(getStatsResult);

        // second argument checks to see, if target-user is still connected.
        if (!nomore) {
            typeof interval != undefined && interval && setTimeout(getStatsLooper, interval || 1000);
        }
    });
}

// a wrapper around getStats which hides the differences (where possible)
// following code-snippet is taken from somewhere on the github
function getStatsWrapper(cb) {
    peer.getStats(window.mediaStreamTrack || null).then(function(res) {
        var items = [];
        res.forEach(function(r) {
            items.push(r);
        });
        cb(items);
    }).catch(cb);
};

getStatsParser.datachannel = function(result) {
    if (result.type !== 'datachannel') return;

    getStatsResult.datachannel = {
        state: result.state // open or connecting
    }
};

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

getStatsParser.checkAudioTracks = function(result) {
    if (result.kind !== 'audio' || !result.remoteId) return;

    const sendrecvType = getStatsResult.internal.getSendrecvType(result);
    if (!sendrecvType) return;

    const rtpResult = getRtpResult(getStatsResult.results, result.type, 'audio');
    if (!rtpResult) return;

    const remoteRtpResult = getStatsResult.results.find(r => r.id === result.remoteId) || {};

    const codecResult = getCodecResult(getStatsResult.results, rtpResult.codecId);
    if (!codecResult) return;

    const currentCodec = getCodecName(codecResult.mimeType) || 'opus';
    if (getStatsResult.audio[sendrecvType].codecs.indexOf(currentCodec) === -1) {
        getStatsResult.audio[sendrecvType].codecs.push(currentCodec);
    }

    if (!!result.bytesSent) {
        if (!getStatsResult.internal.audio[sendrecvType].prevBytesSent) {
            getStatsResult.internal.audio[sendrecvType].prevBytesSent = result.bytesSent;
        }

        var bytes = result.bytesSent - getStatsResult.internal.audio[sendrecvType].prevBytesSent;
        getStatsResult.internal.audio[sendrecvType].prevBytesSent = result.bytesSent;

        var kilobytes = bytes / 1024;
        getStatsResult.audio[sendrecvType].bytesSent = kilobytes;
        getStatsResult.audio.bytesSent = kilobytes;
    }

    if (!!result.bytesReceived) {
        if (!getStatsResult.internal.audio[sendrecvType].prevBytesReceived) {
            getStatsResult.internal.audio[sendrecvType].prevBytesReceived = result.bytesReceived;
        }

        var bytes = result.bytesReceived - getStatsResult.internal.audio[sendrecvType].prevBytesReceived;
        getStatsResult.internal.audio[sendrecvType].prevBytesReceived = result.bytesReceived;

        var kilobytes = bytes / 1024;
        getStatsResult.audio.bytesReceived = (bytes / 1024);
    }

    if (result.trackIdentifier && getStatsResult.audio[sendrecvType].tracks.indexOf(result.trackIdentifier) === -1) {
        getStatsResult.audio[sendrecvType].tracks.push(result.trackIdentifier);
    }

    // Audio quality
    getStatsResult.audio[sendrecvType].totalRoundTripTime = remoteRtpResult.totalRoundTripTime || 0;
    getStatsResult.audio[sendrecvType].jitter = remoteRtpResult.jitter || 0;
    getStatsResult.audio[sendrecvType].jitterBufferDelay = remoteRtpResult.jitterBufferDelay || 0;
    getStatsResult.audio[sendrecvType].packetsLost = result.type === 'inbound-rtp' ? rtpResult.packetsLost : remoteRtpResult.packetsLost;
    getStatsResult.audio[sendrecvType].packetsReceived = result.type === 'inbound-rtp' ? rtpResult.packetsReceived : 0;

    if(remoteRtpResult.totalRoundTripTime) {
        getStatsResult.audio.latency = remoteRtpResult.totalRoundTripTime;
    }

    // calculate packetsLost difference between reports
    if (Number.isInteger(rtpResult.packetsLost)) {
        if (!getStatsResult.internal.audio.prevPacketsLost) {
            getStatsResult.internal.audio.prevPacketsLost = rtpResult.packetsLost;
        }

        var diff = rtpResult.packetsLost - getStatsResult.internal.audio.prevPacketsLost;
        getStatsResult.internal.audio.prevPacketsLost = rtpResult.packetsLost;

        getStatsResult.audio.packetsLost = diff;

        if (getStatsResult.audio.packetsLost < 0) {
            getStatsResult.audio.packetsLost = 0;
        }
    }
};

getStatsParser.checkVideoTracks = function(result) {
    if (result.kind !== 'video') return;

    var sendrecvType = getStatsResult.internal.getSendrecvType(result);
    if (!sendrecvType) return;

    const rtpResult = getRtpResult(getStatsResult.results, result.type, 'video');
    if (!rtpResult) return;

    const remoteRtpResult = getStatsResult.results.find(r => r.id === result.remoteId) || {};

    const codecResult = getCodecResult(getStatsResult.results, rtpResult.codecId);
    if (!codecResult) return;

    const currentCodec = getCodecName(codecResult.mimeType) || 'VP8';
    if (getStatsResult.video[sendrecvType].codecs.indexOf(currentCodec) === -1) {
        getStatsResult.video[sendrecvType].codecs.push(currentCodec);
    }

    if (!!result.bytesSent) {
        if (!getStatsResult.internal.video[sendrecvType].prevBytesSent) {
            getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;
        }

        var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevBytesSent;
        getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;

        var kilobytes = bytes / 1024;
        getStatsResult.video[sendrecvType].bytesSent = kilobytes;
        getStatsResult.video.bytesSent = kilobytes;
    }

    if (!!result.bytesReceived) {
        if (!getStatsResult.internal.video[sendrecvType].prevBytesReceived) {
            getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;
        }

        var bytes = result.bytesReceived - getStatsResult.internal.video[sendrecvType].prevBytesReceived;
        getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;

        var kilobytes = bytes / 1024;
        getStatsResult.video[sendrecvType].bytesReceived = kilobytes;
        getStatsResult.video.bytesReceived = kilobytes;
    }

    if (rtpResult.frameHeight && result.frameWidth) {
        getStatsResult.resolutions[sendrecvType].width = result.frameHeight;
        getStatsResult.resolutions[sendrecvType].height = result.frameHeight;
    }

    if (result.trackIdentifier && getStatsResult.video[sendrecvType].tracks.indexOf(result.trackIdentifier) === -1) {
        getStatsResult.video[sendrecvType].tracks.push(result.trackIdentifier);
    }

    // Frames Per Second (FPS) refers to the rate at which video frames are being sent or received
    if (result.framesPerSecond) {
        getStatsResult.video[sendrecvType].framesPerSecond = result.framesPerSecond;
    }

    // Frames Sent refers to the total number of video frames that have been sent since the start of the session
    if (Number.isInteger(result.framesSent)) {
        if (!getStatsResult.internal.video[sendrecvType].prevFramesSent) {
            getStatsResult.internal.video[sendrecvType].prevFramesSent = result.framesSent;
        }

        var newFramesSent = result.framesSent - getStatsResult.internal.video[sendrecvType].prevFramesSent;
        getStatsResult.internal.video[sendrecvType].prevFramesSent = result.framesSent;

        getStatsResult.video[sendrecvType].framesSent = newFramesSent;
    }

    // Video quality
    getStatsResult.video[sendrecvType].totalRoundTripTime = remoteRtpResult.totalRoundTripTime || 0;
    getStatsResult.video[sendrecvType].jitter = remoteRtpResult.jitter || 0;
    getStatsResult.video[sendrecvType].jitterBufferDelay = remoteRtpResult.jitterBufferDelay || 0;
    getStatsResult.video[sendrecvType].packetsLost = result.type === 'inbound-rtp' ? rtpResult.packetsLost : remoteRtpResult.packetsLost;
    getStatsResult.video[sendrecvType].packetsReceived = result.type === 'inbound-rtp' ? rtpResult.packetsReceived : 0;

    if(remoteRtpResult.totalRoundTripTime) {
        getStatsResult.video.latency = remoteRtpResult.totalRoundTripTime;
    }

    if (Number.isInteger(rtpResult.packetsLost)) {
        getStatsResult.video.packetsLost = rtpResult.packetsLost;
    }
};

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

var REMOTE_candidateType = {};
var REMOTE_transport = {};
var REMOTE_ipAddress = {};
var REMOTE_networkType = {};

getStatsParser.remotecandidate = function(result) {
    if (result.type !== 'remotecandidate' && result.type !== 'remote-candidate') return;
    if (!result.id) return;

    if (!REMOTE_candidateType[result.id]) {
        REMOTE_candidateType[result.id] = [];
    }

    if (!REMOTE_transport[result.id]) {
        REMOTE_transport[result.id] = [];
    }

    if (!REMOTE_ipAddress[result.id]) {
        REMOTE_ipAddress[result.id] = [];
    }

    if (!REMOTE_networkType[result.id]) {
        REMOTE_networkType[result.id] = [];
    }

    if (result.candidateType && REMOTE_candidateType[result.id].indexOf(result.candidateType) === -1) {
        REMOTE_candidateType[result.id].push(result.candidateType);
    }

    if (result.protocol && REMOTE_transport[result.id].indexOf(result.protocol) === -1) {
        REMOTE_transport[result.id].push(result.protocol);
    }

    const resultIpAddress = `${result.address}:${result.port}`;
    if (result.address && REMOTE_ipAddress[result.id].indexOf(resultIpAddress) === -1) {
        REMOTE_ipAddress[result.id].push(resultIpAddress);
    }

    if (result.networkType && REMOTE_networkType[result.id].indexOf(result.networkType) === -1) {
        REMOTE_networkType[result.id].push(result.networkType);
    }

    getStatsResult.internal.candidates[result.id] = {
        candidateType: REMOTE_candidateType[result.id],
        ipAddress: REMOTE_ipAddress[result.id],
        portNumber: result.port,
        networkType: REMOTE_networkType[result.id],
        priority: result.priority,
        transport: REMOTE_transport[result.id],
        timestamp: result.timestamp,
        id: result.id,
        type: result.type
    };

    getStatsResult.connectionType.remote.candidateType = REMOTE_candidateType[result.id];
    getStatsResult.connectionType.remote.ipAddress = REMOTE_ipAddress[result.id];
    getStatsResult.connectionType.remote.networkType = REMOTE_networkType[result.id];
    getStatsResult.connectionType.remote.transport = REMOTE_transport[result.id];
};

getStatsParser.dataSentReceived = function(result) {
    if (result.type === 'remote-inbound-rtp' || (result.kind !== 'video' && result.kind !== 'audio')) return;

    if (!!result.bytesSent) {
        getStatsResult[result.kind].bytesSent = parseInt(result.bytesSent);
    }

    if (!!result.bytesReceived) {
        getStatsResult[result.kind].bytesReceived = parseInt(result.bytesReceived);
    }
};

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

// Note: This files only for Safari
// @todo remove safari code for our usecase?
getStatsParser.outboundrtp = function(result) {
    if (!isSafari) return;
    if (result.type !== 'outbound-rtp') return;

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

// Note: This files only for Safari
// @todo remove safari code for our usecase?
getStatsParser.track = function(result) {
    if (!isSafari) return;
    if (result.type !== 'track') return;

    var sendrecvType = result.remoteSource === true ? 'send' : 'recv';

    if (result.frameWidth && result.frameHeight) {
        getStatsResult.resolutions[sendrecvType].width = result.frameWidth;
        getStatsResult.resolutions[sendrecvType].height = result.frameHeight;
    }

    // framesSent, framesReceived
};

var SSRC = {
    audio: {
        send: [],
        recv: []
    },
    video: {
        send: [],
        recv: []
    }
};

getStatsParser.ssrc = function(result) {
    if (result.kind !== 'video' && result.kind !== 'audio') return;
    if (result.type !== 'inbound-rtp' && result.type !== 'outbound-rtp') return;

    const rtpResult = getRtpResult(getStatsResult.results, result.type, result.kind);
    if (!rtpResult) return;

    const codecResult = getCodecResult(getStatsResult.results, rtpResult.codecId);
    if (!codecResult) return;

    const sendrecvType = result.type === 'outbound-rtp' ? 'send' : 'recv';

    if (SSRC[result.kind][sendrecvType].indexOf(result.ssrc) === -1) {
        SSRC[result.kind][sendrecvType].push(result.ssrc)
    }

    getStatsResult[result.kind][sendrecvType].streams = SSRC[result.kind][sendrecvType].length;
};

getStatsLooper();

};

if (typeof module !== 'undefined' /* && !!module.exports*/ ) {
    module.exports = getStats;
}

if (typeof define === 'function' && define.amd) {
    define('getStats', [], function() {
        return getStats;
    });
}
