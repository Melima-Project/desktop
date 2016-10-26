Polymer({
    is: 'msc-audio-player',
    ready:function(){
      this.audio = mscIntf.audio;
      this.payments = mscIntf.payments;
      mscIntf.audioHub.attach(this)
        .to('currentPlay')
        .to('playbackPaymentPercentage')

      mscIntf.audioElement = this.$.player;

      var _updatePlayState = function() {this.updatePlayState()}.bind(this);
      this.$.player.addEventListener('playing', _updatePlayState);
      this.$.player.addEventListener('play', _updatePlayState);
      this.$.player.addEventListener('pause', _updatePlayState);
      this.$.player.addEventListener('abort', _updatePlayState);

      this.$.player.addEventListener('timeupdate', function() {
        var progress_percent = this.$.player.currentTime / this.$.player.duration * 100;
        this.$.progress.value = progress_percent;
        mscIntf.audio.reportPlaybackPercentage(this.currentPlay, progress_percent);
      }.bind(this));

      this.$.player.addEventListener('ended', function() {
        this.playNext();
      }.bind(this));
    },
    attached:function(){

    },
    properties: {
      currentPlay: {
        type: Object,
        observer: "_currentPlayChanged"
      },
      playState: {
        type: String,
        value: 'av:play-arrow'
      },
      playbackPaymentPercentage: Number
    },
    _currentPlayChanged: function(item) {
      this.$.progress.value = 0;
      if (item && item.resource_url_https) {
        this.$.player.src = item.resource_url_https;
        this.$.player.load();
      }
      else {
        this.$.player.src = '';
      }
    },
    updatePlayState: function() {
      this.playState = this.$.player.paused ? 'av:play-arrow' : 'av:pause';
    },
    togglePlayState: function(ev) {
      // I think this is a purely client side operation.  No need to call to back end (right?)
      if (this.$.player.paused) {
        if (this.$.player.readyState > 0) {
          this.$.player.play();
        }
      }
      else {
        this.$.player.pause();
      }
    },
    playNext: function() {
      this.audio.playNext();
    },
    sendTip: function() {
      var output = prompt("Enter pwd");
      mscIntf.fnPool('login', 'web3TestLogin', null, {pwd: output});
      if (this.currentPlay && this.currentPlay.contract_id) {
        this.payments.sendTip(this.currentPlay.contract_id, 1);
      }
    },
})
