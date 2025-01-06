import {config} from './config.js';
import {u} from './utils.js';

const PLAY_RETRY_INTERVAL = 3 * 1000;
const STORE_PAUSE = "music-pause";
const STORE_VOLUME = "music-volume";
const SERVER_TRACKS = 'config.json';

// todo: next button on music player

export const music = (function() {

    class _SoundTrack {
        constructor() {
            this._track = undefined;
            this._track_config = undefined;
            this._track_id = 0;
            this._paused = false;
            this._sequence = [];
            this._blocked = false;
            this._lastPlayTry = undefined;
            this._busy = false;  // anti race-condition
            this._volume_step = 2;
            this._volume_steps = [0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
            this._TRACKS = undefined;
            this._FetchTracks();
        }

        async _FetchTracks() {
            let res = await fetch(config.SERVER + config.LOC_MUSIC + SERVER_TRACKS);
            if (res.ok) {
                this._TRACKS = await res.json();
                this._Init();
            } else {
                throw new Error('Request failed: ' + res.statusText);
            }
        }

        _Init() {
            this._RandomizeSequence();
            this._LoadPauseState();
            this._LoadVolumeState();
        }

        get Blocked() {
            if (this._track !== undefined && this._track.played.length > 0) {
                this._blocked = false;
                return false;
            }
            return u.True(this._blocked);
        }

        _RandomizeSequence() {
            this._sequence = u.ShuffleArray(this._TRACKS);
        }
        
        _NextTrack() {
            let trackConfig = this._sequence[this._track_id];
            let track = new Audio(config.SERVER + config.LOC_MUSIC + trackConfig.file);
            track.volume = this._volume_steps[this._volume_step];

            let autoplay = track.play();
            if (autoplay === undefined) {
                console.log('Error playing audio', track);
                return;
            }

            autoplay.then(_ => {
                if (u.True(config.DEBUG)) {
                    console.log(
                        "Playing song:", trackConfig.title, 
                        '(' + Math.ceil(track.duration) + 's)',
                        track,
                    );
                }
                this._lastPlayTry = undefined;
                this._track_id += 1;

                u.HtmlRemove(config.HTML_MUSIC_LOAD);
                let musicTitle = document.getElementById(config.HTML_MUSIC_TITLE);
                let musicBy = document.getElementById(config.HTML_MUSIC_BY);
                musicTitle.innerHTML = '<b>Title</b>: ' + trackConfig.title;
                musicBy.innerHTML = '<b>By</b>: ' + trackConfig.by;
                musicTitle.removeAttribute("hidden");
                musicBy.removeAttribute("hidden");

            }).catch(error => {
                // Autoplay not allowed!
                this._lastPlayTry = Date.now();
                this._blocked = true;
                return;
            });

            if (this._track !== undefined) {
                // workaround for random race conditions not catched by busy state :(
                this._track.pause();
            }
            this._track = track;
            this._track_config = trackConfig;

            // last track; loop to new sequence
            if (this._track_id == this._sequence.length - 1) {
                this._RandomizeSequence();
                this._track_id = 0
            }
        }

        OnPlay() {
            if (!u.IsSet(this._TRACKS)) {
                return;
            }

            if (this._track === undefined) {
                this._NextTrack();

            } else {
                let autoplay = this._track.play();

                if (autoplay === undefined) {
                    console.log('Error playing audio', track);
                    return;
                }
    
                autoplay.then(_ => {
                    this._paused = false;
    
                }).catch(error => {
                    // Autoplay not allowed!
                    this._lastPlayTry = Date.now();
                    this._blocked = true;
                    return;
                });

                if (u.True(config.DEBUG)) {
                    console.log(
                        "Playing song:",  this._track_config.title,
                        '(' + Math.ceil(this._track.currentTime) + '/' + Math.ceil(this._track.duration) + 's)',
                        this._track,
                    )
                }    
            }

            u.HtmlHide(config.HTML_MUSIC_PLAY);
            u.HtmlUnhide(config.HTML_MUSIC_PAUSE);
            this._SavePauseState(0);
        }

        OnPause() {
            this._paused = true;
            this._track.pause();
            u.HtmlHide(config.HTML_MUSIC_PAUSE);
            u.HtmlUnhide(config.HTML_MUSIC_PLAY);
            this._SavePauseState(1);
        }

        _UpdateVolume() {
            if (this._track !== undefined) {
                this._track.volume = this._volume_steps[this._volume_step];
            }
            localStorage.setItem(STORE_VOLUME, this._volume_step);

            let volumePercent = (this._volume_step / (this._volume_steps.length - 1)) * 100;
            document.getElementById(config.HTML_MUSIC_VOLUME).style.background="conic-gradient(" + config.COL_ACCENT + " 0, "  + config.COL_ACCENT + " " + volumePercent + "%, "  + config.COL_BG + " 0)";
        }

        OnVolumeChange() {
            this._volume_step = (this._volume_step + 1) % this._volume_steps.length;
            this._UpdateVolume();
            // console.log('Set music-volume to:', this._track.volume);
        }

        _LoadPauseState() {
            if (localStorage.getItem(STORE_PAUSE) == 1) {
                this._paused = true;
                u.HtmlHide(config.HTML_MUSIC_PAUSE);
                u.HtmlUnhide(config.HTML_MUSIC_PLAY);
                u.HtmlRemove(config.HTML_MUSIC_LOAD);
            }
        }

        _SavePauseState(state) {
            localStorage.setItem(STORE_PAUSE, state);
        }

        _LoadVolumeState() {
            let savedVolume = localStorage.getItem(STORE_VOLUME);
            if (savedVolume !== undefined && !isNaN(savedVolume)) {
                this._volume_step = savedVolume % this._volume_steps.length;
            }
            this._UpdateVolume();
        }

        _CheckIfTrackFinished() {
            if (u.True(this._paused) || u.True(this._busy)) {
                return false;
            }
            if (this._track === undefined || u.True(this.Blocked)) {
                return true;
            }
            if (this._track.played.length > 0) {
                if (u.True(this._track.ended) || this._track.currentTime >= this._track.duration) {
                    return true;
                }
            }
            return false;
        }

        Update() {
            if (!u.IsSet(this._TRACKS)) {
                return;
            }
            if (u.True(this.Blocked) && Date.now() < this._lastPlayTry + PLAY_RETRY_INTERVAL) {
                return;
            }
            if (u.True(this._CheckIfTrackFinished())) {
                this._busy = true;
                this._NextTrack();
                this._busy = false;
            }
            if (this._track !== undefined && u.True(this._track.paused) && u.False(this._paused)) {
                // edge-cases where the brower did pause the track (sleep mode)
                this.OnPause();
            }
        }
    }


    return {
        SoundTrack: _SoundTrack
    }
})();
  