'use strict';
function _classCallCheck(t, e) {
    if (!(t instanceof e)) {
        throw new TypeError('Cannot call a class as a function');
    }
}

let Beep = (function() {
    function t() {
        let e = arguments.length <= 0 || void 0 === arguments[0] ? 1 : arguments[0],
            o = arguments.length <= 1 || void 0 === arguments[1] ? 'square' : arguments[1];
        _classCallCheck(this, t), (this._volume = e), (this._waveType = o);
    }
    return (
        (t.prototype.init = function() {
            return void 0 === this._audioContext ? ((this._audioContext = this._getAudioContext()), Promise.resolve()) : Promise.resolve();
        }),
        (t.prototype.beep = function(t) {
            let e = this;
            return this.init().then(
                () =>
                    new Promise(o => {
                        let n = e._createGainNode(e._volume),
                            r = e._createOscillatorNode(e._waveType);
                        r.onended = function() {
                            return o();
                        };
                        let i = e._audioContext.currentTime,
                            a = t.shift(),
                            s = a[0],
                            u = a[1],
                            c = i + e._msToS(u);
                        (r.frequency.value = s),
                            t.forEach(t => {
                                let o = t[0],
                                    n = t[1];
                                r.frequency.setValueAtTime(o, c), (c += e._msToS(n));
                            }),
                            r.connect(n),
                            n.connect(e._audioContext.destination),
                            r.start(i),
                            r.stop(c);
                    })
            );
        }),
        (t.prototype._createOscillatorNode = function(t) {
            let e = this._audioContext.createOscillator();
            return (e.start = e.noteOn || e.start), (e.stop = e.noteOff || e.stop), (e.type = t), e;
        }),
        (t.prototype._createGainNode = function(t) {
            let e = this._audioContext.createGain();
            return (e.start = e.noteOn || e.start), (e.stop = e.noteOff || e.stop), (e.gain.value = t), e;
        }),
        (t.prototype._getAudioContext = function() {
            return new (window.AudioContext || window.webkitAudioContext)();
        }),
        (t.prototype._msToS = function(t) {
            return t / 1e3;
        }),
        t
    );
})();
