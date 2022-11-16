const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'TAI_Player'
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd');
const playBtn = $('.btn-toggle-play')
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next')
const preBtn = $('.btn-pre')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const menuBtn = $('.menu-btn')
const volumnBtn = $('.volumn-change')
const volumnChange = $('#volumn')
const volumnPercent = $('.current-volumn')
const app = {
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isMute: false,
    currentIndex: 0,
    currentVolume: 1.0,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Chiều hôm ấy',
            singer: 'Jaykee',
            path: './assets/music/song1.mp3',
            image: './assets/image/song1.jpeg'
        },
        {
            name: 'Ngày cưới',
            singer: 'Khắc Việt',
            path: './assets/music/song2.mp3',
            image: './assets/image/song2.jpeg'
        },
        {
            name: 'Lặng Yên',
            singer: 'Bùi Anh Tuấn',
            path: './assets/music/song3.mp3',
            image: './assets/image/song3.jpeg'
        },
        {
            name: 'Hẹn Một Mai',
            singer: 'Bùi Anh Tuấn',
            path: './assets/music/song4.mp3',
            image: './assets/image/song4.jpeg'
        },
        {
            name: 'Ngốc',
            singer: 'Hương Tràm',
            path: './assets/music/song5.mp3',
            image: './assets/image/song5.jpeg'
        },
        {
            name: 'Ngại Ngùng',
            singer: 'Hương Tràm',
            path: './assets/music/song6.mp3',
            image: './assets/image/song6.jpeg'
        },
        {
            name: 'Đã Từng',
            singer: 'Bùi Anh Tuấn',
            path: './assets/music/song7.mp3',
            image: './assets/image/song7.jpeg'
        },
    ],
    setConfig : function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const html = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        })
        playlist.innerHTML = html.join('');

    },
    defineProperties() {
        Object.defineProperty(this,'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function() {
        const _this = this;
        // xử lí quay CD
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();
        // Play/Pause
        playBtn.addEventListener('click', function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
            // Khi play
            audio.onplay = function() {
                _this.isPlaying = true;
                player.classList.add('playing')
                cdThumbAnimate.play();
            }
            // Khi bi pause
            audio.onpause = function() {
                _this.isPlaying = false;
                player.classList.remove('playing')
                cdThumbAnimate.pause();
            }
            // Khi tiến độ bài hát thay đổi
            audio.ontimeupdate = function() {
                if(audio.duration) {
                    const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                    progress.value = progressPercent;
                    $('.current-time').innerText = _this.timeFormat(audio.currentTime);
                    $('.duration-time').innerText = _this.timeFormat(audio.duration);
                }
            }  
        });
         // Xư lí tua bài hát
        progress.oninput = function(e) {
            const seekTime = (e.target.value * audio.duration) / 100;
            audio.currentTime = seekTime;
        }
        // Xử lí tăng giảm âm lượng
        volumnChange.oninput = function(e) {
            if(e.target.value == 0) {
                volumnPercent.innerText = '0 %';
                _this.isMuted = true;
                volumnBtn.classList.add('active');
                audio.volume = 0;
            } else {
                volumnPercent.innerText = `${e.target.value} %`;
                _this.isMuted = false;
                volumnBtn.classList.remove('active');
                audio.volume = e.target.value / 100;
                _this.currentVolume = audio.volume
            }
        }

        volumnBtn.onclick = function () {
			_this.isMute = !_this.isMute;
			// console.log({ volumeBar });
			_this.setConfig('isMute', _this.isMute);
			volumnBtn.classList.toggle('active', _this.isMute);
			if (_this.isMute) {
				audio.volume = 0;
				volumnChange.value = 0;
                volumnPercent.innerText = '0 %';
			} else {
				volumnChange.value = _this.currentVolume * 100;
				audio.volume = _this.currentVolume;
                volumnPercent.innerText = `${_this.currentVolume * 100}%`;
			}
		};
        // Xử lí khi next bài / quay lại bài cũ
        nextBtn.onclick = function() {
            if(_this.isRandom) {
            _this.playRandomSong()
            } else {
                _this.nextSong();                 
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        preBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
                } else {
                    _this.prevSong();                 
                }
                audio.play();
                _this.render();
                _this.scrollToActiveSong();
        }
        // Xử lí khi bật / tắt random song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle ("active", _this.isRandom);
        }
        // Xử lí auto next khi hết bài hát
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            }else {
                nextBtn.click();
            }
        }
        // Xử lí repeat bài hát
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle ("active", _this.isRepeat);
        }
        
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if(e.target.closest('.song:not(.active)') || e.target.closest('.option')) {
                // Xử lí khi click vào bài hát bất kỳ
                if(songNode) {
                    _this.currentIndex = Number(songNode.getAttribute('data-index'))
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                // Xử lí khi click vào song option
                if(e.target.closest('.option')) {

                }
            }
        }
        // xử lí bật tắt playlist
        menuBtn.onclick = function() {
            playlist.classList.remove('nonActive');
            playlist.classList.toggle('active');
        }     
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function() {
        this.currentIndex ++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex --;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while(newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong();
    },
    timeFormat(seconds) {
		const date = new Date(null);
		date.setSeconds(seconds);
		return date.toISOString().slice(14, 19);
	},
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
        }, 300)
    },

    start: function() {
        this.loadConfig()
        this.defineProperties();
        this.handleEvents();
        this.render();
        this.loadCurrentSong()
        // Hiển thị trạng thái ban đầu cảu btn Repeat và Random
        randomBtn.classList.toggle ("active", this.isRandom);
        repeatBtn.classList.toggle ("active", this.isRepeat);
    }
}

app.start();
