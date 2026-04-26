const {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo
} = React;

// --- 데이터 세팅 ---
const dummyArtists = ['아이팟 밴드', '인디 뮤지션', '클래식 오케스트라'];
const dummyAlbums = ['명곡 모음 1집', '여름밤의 어쿠스틱', '베스트 컬렉션'];

// 스플릿 뷰용 앨범 아트 플레이스홀더
const generateOfflineImage = seed => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="210" viewBox="0 0 200 210">
        <rect width="200" height="210" fill="hsl(${h}, 70%, 80%)"/>
        <circle cx="100" cy="105" r="50" fill="hsl(${(h + 120) % 360}, 70%, 60%)" opacity="0.8"/>
        <circle cx="120" cy="85" r="20" fill="white" opacity="0.6"/>
      </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};
const coverImages = {
  music: generateOfflineImage('ipod_music'),
  podcasts: generateOfflineImage('ipod_podcasts'),
  shuffle: generateOfflineImage('ipod_shuffle'),
  photos: generateOfflineImage('ipod_photos'),
  videos: generateOfflineImage('ipod_videos'),
  extras: generateOfflineImage('ipod_extras'),
  settings: generateOfflineImage('ipod_settings')
};
const dummySongs = Array.from({
  length: 25
}, (_, i) => {
  const artist = dummyArtists[i % dummyArtists.length];
  const album = dummyAlbums[i % dummyAlbums.length];
  return {
    id: i,
    label: `${artist} - Track ${i + 1}`,
    title: `Track ${i + 1}`,
    type: 'song',
    artist: artist,
    album: album,
    duration: 180 + Math.floor(Math.random() * 120),
    image: generateOfflineImage(`song_${i}`)
  };
});

// 동적 메뉴 생성 유틸리티
const generateMenu = (id, title, items) => ({
  id,
  title,
  items
});
const getArtistsMenu = () => {
  const items = dummyArtists.map(artist => ({
    label: artist,
    type: 'dynamic',
    image: generateOfflineImage(`artist_${artist}`),
    action: () => generateMenu(`artist_${artist}`, artist, dummySongs.filter(s => s.artist === artist))
  }));
  return generateMenu('artists', '아티스트', items);
};
const getAlbumsMenu = () => {
  const items = dummyAlbums.map(album => ({
    label: album,
    type: 'dynamic',
    image: generateOfflineImage(`album_${album}`),
    action: () => generateMenu(`album_${album}`, album, dummySongs.filter(s => s.album === album))
  }));
  return generateMenu('albums', '앨범', items);
};

// 기본 메뉴 구조
const initialSubMenus = {
  music: generateMenu('music', '음악', [{
    label: '재생목록',
    target: 'empty',
    image: coverImages.music
  }, {
    label: '아티스트',
    type: 'dynamic',
    action: getArtistsMenu,
    image: coverImages.podcasts
  }, {
    label: '앨범',
    type: 'dynamic',
    action: getAlbumsMenu,
    image: coverImages.photos
  }, {
    label: '모든 노래',
    target: 'songs',
    image: coverImages.shuffle
  }]),
  songs: generateMenu('songs', '모든 노래', dummySongs),
  settings: generateMenu('settings', '설정', [{
    label: '정보 (About)',
    target: 'about'
  }, {
    label: '화면 밝기',
    target: 'brightness'
  }, {
    label: '주메뉴',
    target: 'empty'
  }]),
  about: generateMenu('about', '정보', []),
  brightness: generateMenu('brightness', '화면 밝기', []),
  nowplaying: generateMenu('nowplaying', '지금 재생 중', []),
  empty: generateMenu('empty', '준비 중', [{
    label: '항목이 없습니다.',
    target: null
  }])
};
const menuData = generateMenu('root', 'iPod', [{
  label: '음악',
  target: 'music',
  image: coverImages.music
}, {
  label: '지금 재생 중',
  target: 'nowplaying',
  image: coverImages.music
}, {
  label: '팟캐스트',
  target: 'empty',
  image: coverImages.podcasts
}, {
  label: '사진',
  target: 'empty',
  image: coverImages.photos
}, {
  label: '비디오',
  target: 'empty',
  image: coverImages.videos
}, {
  label: '기타',
  target: 'empty',
  image: coverImages.extras
}, {
  label: '설정',
  target: 'settings',
  image: coverImages.settings
}, {
  label: '노래 임의재생',
  type: 'shuffle',
  image: coverImages.shuffle
}]);

// --- 고품질 SVG 아이콘 ---
const PlayPauseIcon = ({
  className
}) => /*#__PURE__*/React.createElement("svg", {
  width: "17",
  height: "10",
  viewBox: "0 0 24 16",
  fill: "currentColor",
  className: className
}, /*#__PURE__*/React.createElement("polygon", {
  points: "0,1 11,8 0,15"
}), /*#__PURE__*/React.createElement("rect", {
  x: "14",
  y: "1",
  width: "3.5",
  height: "14"
}), /*#__PURE__*/React.createElement("rect", {
  x: "20.5",
  y: "1",
  width: "3.5",
  height: "14"
}));
const PrevIcon = ({
  className
}) => /*#__PURE__*/React.createElement("svg", {
  width: "19",
  height: "11",
  viewBox: "0 0 24 16",
  fill: "currentColor",
  className: className
}, /*#__PURE__*/React.createElement("rect", {
  x: "0",
  y: "1",
  width: "3",
  height: "14"
}), /*#__PURE__*/React.createElement("polygon", {
  points: "3,8 13,1 13,15"
}), /*#__PURE__*/React.createElement("polygon", {
  points: "13,8 23,1 23,15"
}));
const NextIcon = ({
  className
}) => /*#__PURE__*/React.createElement("svg", {
  width: "19",
  height: "11",
  viewBox: "0 0 24 16",
  fill: "currentColor",
  className: className
}, /*#__PURE__*/React.createElement("polygon", {
  points: "11,8 1,1 1,15"
}), /*#__PURE__*/React.createElement("polygon", {
  points: "21,8 11,1 11,15"
}), /*#__PURE__*/React.createElement("rect", {
  x: "21",
  y: "1",
  width: "3",
  height: "14"
}));
const BatteryIcon = ({
  level
}) => /*#__PURE__*/React.createElement("div", {
  className: "w-[18px] h-[9px] border border-[#555] rounded-[2px] p-[1px] relative flex bg-white shadow-sm"
}, /*#__PURE__*/React.createElement("div", {
  className: "h-full rounded-[1px] transition-all bg-gradient-to-b from-[#7CE052] to-[#48B021]",
  style: {
    width: `${level}%`
  }
}), /*#__PURE__*/React.createElement("div", {
  className: "absolute -right-[2px] top-[2px] w-[2px] h-[3px] bg-[#555] rounded-r-[1px]"
}));
const ChevronIcon = ({
  className
}) => /*#__PURE__*/React.createElement("svg", {
  width: "8",
  height: "12",
  viewBox: "0 0 8 12",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.5",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, /*#__PURE__*/React.createElement("polyline", {
  points: "2 2 6 6 2 10"
}));
function App() {
  const [menuStack, setMenuStack] = useState([menuData]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isSelectionActive, setIsSelectionActive] = useState(false);

  // OS 상태
  const [time, setTime] = useState('12:00');
  const [battery, setBattery] = useState(85);
  const [brightness, setBrightness] = useState(100);
  const [isScreenOff, setIsScreenOff] = useState(false);

  // 플레이어 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [nowPlayingMode, setNowPlayingMode] = useState('volume');
  const [musicBridgeConnected, setMusicBridgeConnected] = useState(false);
  const [appleMusicSongs, setAppleMusicSongs] = useState([]);
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const wheelRef = useRef(null);
  const interactionState = useRef({
    prevAngle: null,
    accumulatedDelta: 0
  });
  const wheelScrollAccumulator = useRef(0);
  const audioCtxRef = useRef(null);
  const lastHapticAtRef = useRef(0);
  const activeButtonRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const currentMenu = menuStack[menuStack.length - 1];
  const VISIBLE_ITEMS = 6;
  const ITEM_HEIGHT = 32;
  const isMenuScreen = !['nowplaying', 'about', 'brightness'].includes(currentMenu.id);
  const showSplitView = isMenuScreen && isSelectionActive && currentMenu.items?.some(item => item.image);
  const activeSongs = appleMusicSongs.length ? appleMusicSongs : dummySongs;
  const appSubMenus = useMemo(() => {
    const artists = [...new Set(activeSongs.map(song => song.artist).filter(Boolean))];
    const albums = [...new Set(activeSongs.map(song => song.album).filter(Boolean))];
    const artistsMenu = () => generateMenu('artists', '아티스트', artists.map(artist => ({
      label: artist,
      type: 'dynamic',
      image: coverImages.music,
      action: () => generateMenu(`artist_${artist}`, artist, activeSongs.filter(song => song.artist === artist))
    })));
    const albumsMenu = () => generateMenu('albums', '앨범', albums.map(album => ({
      label: album,
      type: 'dynamic',
      image: coverImages.music,
      action: () => generateMenu(`album_${album}`, album, activeSongs.filter(song => song.album === album))
    })));
    return {
      ...initialSubMenus,
      music: generateMenu('music', '음악', [{
        label: '모든 노래',
        target: 'songs',
        image: coverImages.music
      }, {
        label: '지금 재생 중',
        target: 'nowplaying',
        image: coverImages.music
      }, {
        label: '아티스트',
        type: 'dynamic',
        action: artistsMenu,
        image: coverImages.podcasts
      }, {
        label: '앨범',
        type: 'dynamic',
        action: albumsMenu,
        image: coverImages.photos
      }]),
      songs: generateMenu('songs', appleMusicSongs.length ? 'Apple Music' : '모든 노래', activeSongs)
    };
  }, [appleMusicSongs, activeSongs]);
  const hasMusicBridge = () => Boolean(window.webkit?.messageHandlers?.musicControl?.postMessage);
  const postMusicCommand = useCallback((action, value = null) => {
    try {
      const bridge = window.webkit?.messageHandlers?.musicControl;
      if (!bridge?.postMessage) return false;
      bridge.postMessage({
        action,
        value
      });
      return true;
    } catch (e) {
      return false;
    }
  }, []);
  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }));
    updateTime();
    const intv = setInterval(updateTime, 60000);
    return () => clearInterval(intv);
  }, []);
  useEffect(() => {
    let intv;
    if (!musicBridgeConnected && isPlaying && currentSong) {
      intv = setInterval(() => {
        setProgress(p => {
          if (p >= currentSong.duration) {
            handleNextSong();
            return 0;
          }
          return p + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intv);
  }, [isPlaying, currentSong, musicBridgeConnected]);
  useEffect(() => {
    if (!hasMusicBridge()) return;
    setMusicBridgeConnected(true);
    const handleMusicState = event => {
      const state = event.detail || {};
      if (!state.running) {
        setIsPlaying(false);
        setCurrentSong(null);
        setCurrentPlaylist([]);
        return;
      }
      setIsPlaying(state.playerState === 'playing');
      setVolume(Number.isFinite(state.volume) ? state.volume : 50);
      setProgress(Math.max(0, Math.floor(state.position || 0)));
      if (state.title) {
        const bridgedSong = {
          id: 'music-app-current-track',
          label: `${state.artist || 'Apple Music'} - ${state.title}`,
          title: state.title,
          type: 'song',
          artist: state.artist || 'Apple Music',
          album: state.album || '',
          duration: Math.max(0, Math.floor(state.duration || 0)),
          image: coverImages.music
        };
        setCurrentSong(bridgedSong);
        setCurrentPlaylist([bridgedSong]);
      } else {
        setCurrentSong(null);
        setCurrentPlaylist([]);
      }
    };
    const handleMusicLibrary = event => {
      const tracks = event.detail?.tracks || [];
      setAppleMusicSongs(tracks.map(track => ({
        id: `music-${track.persistentID}`,
        musicPersistentID: track.persistentID,
        label: `${track.artist || 'Apple Music'} - ${track.title}`,
        title: track.title,
        type: 'song',
        source: 'apple-music',
        artist: track.artist || 'Apple Music',
        album: track.album || '',
        duration: Math.max(0, Math.floor(track.duration || 0)),
        image: coverImages.music
      })));
    };
    window.addEventListener('music-bridge-state', handleMusicState);
    window.addEventListener('music-bridge-library', handleMusicLibrary);
    postMusicCommand('getState');
    postMusicCommand('getLibrary');
    const intv = setInterval(() => postMusicCommand('getState'), 1000);
    return () => {
      window.removeEventListener('music-bridge-state', handleMusicState);
      window.removeEventListener('music-bridge-library', handleMusicLibrary);
      clearInterval(intv);
    };
  }, [postMusicCommand]);
  useEffect(() => {
    if (selectedIndex < scrollOffset) {
      setScrollOffset(selectedIndex);
    } else if (selectedIndex >= scrollOffset + VISIBLE_ITEMS) {
      setScrollOffset(selectedIndex - VISIBLE_ITEMS + 1);
    }
  }, [selectedIndex, scrollOffset]);
  const resetSleepTimer = useCallback(() => {
    if (isScreenOff) setIsScreenOff(false);
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    sleepTimerRef.current = setTimeout(() => setIsScreenOff(true), 15000);
  }, [isScreenOff]);
  useEffect(() => {
    resetSleepTimer();

    // 앱 시작 직후 메인 스레드 경쟁을 피하기 위해 오디오 컨텍스트는 idle 구간에 지연 초기화
    let initAudioTimeout = null;
    let idleHandle = null;
    const warmAudioContext = () => {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
      } catch (e) {}
    };
    const scheduleAudioWarmup = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(() => {
          initAudioTimeout = window.setTimeout(warmAudioContext, 300);
        }, {
          timeout: 1200
        });
        return;
      }
      initAudioTimeout = window.setTimeout(warmAudioContext, 1200);
    };
    scheduleAudioWarmup();
    return () => {
      clearTimeout(sleepTimerRef.current);
      if (initAudioTimeout) clearTimeout(initAudioTimeout);
      if (idleHandle && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle);
      }
    };
  }, [resetSleepTimer]);
  const playTick = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.02);
    } catch (e) {}
  }, []);
  const triggerSwitchHaptic = () => {
    if (!window.matchMedia?.('(pointer: coarse)').matches) return false;
    const labelEl = document.createElement('label');
    const inputEl = document.createElement('input');
    labelEl.ariaHidden = 'true';
    labelEl.style.display = 'none';
    inputEl.type = 'checkbox';
    inputEl.setAttribute('switch', '');
    labelEl.appendChild(inputEl);
    document.head.appendChild(labelEl);
    labelEl.click();
    document.head.removeChild(labelEl);
    return true;
  };
  const isIOSLike = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const triggerHaptic = useCallback((kind = 'selection') => {
    try {
      const isPulse = kind === 'selection' || kind === 'button';
      if (isPulse) {
        const now = window.performance?.now?.() ?? Date.now();
        if (now - lastHapticAtRef.current < 35) return;
        lastHapticAtRef.current = now;
      }
      const payload = {
        type: 'haptic',
        kind
      };
      const handlers = window.webkit?.messageHandlers;
      const iosHandler = handlers?.haptic || handlers?.haptics || handlers?.iPodHaptic;
      if (iosHandler?.postMessage) {
        iosHandler.postMessage(payload);
        return;
      }
      const capacitorHaptics = window.Capacitor?.Plugins?.Haptics;
      if (capacitorHaptics) {
        if (kind === 'selection-start' && capacitorHaptics.selectionStart) {
          capacitorHaptics.selectionStart();
          return;
        }
        if (kind === 'selection' && capacitorHaptics.selectionChanged) {
          capacitorHaptics.selectionChanged();
          return;
        }
        if (kind === 'selection-end' && capacitorHaptics.selectionEnd) {
          capacitorHaptics.selectionEnd();
          return;
        }
        if (isPulse && capacitorHaptics.impact) {
          capacitorHaptics.impact({
            style: 'LIGHT'
          });
          return;
        }
      }
      if (isPulse && isIOSLike() && triggerSwitchHaptic()) return;
      if (isPulse && navigator.vibrate) {
        navigator.vibrate(kind === 'button' ? 12 : 8);
        return;
      }
      if (isPulse) triggerSwitchHaptic();
    } catch (e) {}
  }, []);
  const handleInteraction = actionFn => {
    resetSleepTimer();
    if (isScreenOff) return;
    actionFn();
  };
  const getAngleFromPoint = (clientX, clientY, rect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  };
  const getEventPoint = e => {
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    if (touch) return {
      clientX: touch.clientX,
      clientY: touch.clientY
    };
    return {
      clientX: e.clientX,
      clientY: e.clientY
    };
  };
  const handleStart = e => {
    if (e.pointerType === 'touch') return;
    resetSleepTimer();
    if (isScreenOff) return;
    if (e.target.closest('.wheel-btn') || e.target.id === 'center-btn') return;
    if (wheelRef.current) {
      const rect = wheelRef.current.getBoundingClientRect();
      const point = getEventPoint(e);
      interactionState.current.prevAngle = getAngleFromPoint(point.clientX, point.clientY, rect);
      interactionState.current.accumulatedDelta = 0;
      setIsInteracting(true);
      triggerHaptic('selection-start');
    }
  };
  const processScroll = useCallback(direction => {
    playTick();
    if (currentMenu.id === 'nowplaying') {
      if (nowPlayingMode === 'volume') {
        setVolume(prev => {
          const nextVolume = Math.min(Math.max(prev + (direction > 0 ? -5 : 5), 0), 100);
          postMusicCommand('setVolume', nextVolume);
          return nextVolume;
        });
      } else {
        if (currentSong) setProgress(prev => {
          const nextProgress = Math.min(Math.max(prev + (direction > 0 ? -5 : 5), 0), currentSong.duration);
          postMusicCommand('setPosition', nextProgress);
          return nextProgress;
        });
      }
    } else if (currentMenu.id === 'brightness') {
      setBrightness(prev => Math.min(Math.max(prev + (direction > 0 ? -10 : 10), 20), 100));
    } else if (currentMenu.items && currentMenu.items.length > 0) {
      if (!isSelectionActive) {
        setIsSelectionActive(true);
      } else {
        const nextIndex = direction > 0 ? Math.max(selectedIndex - 1, 0) : Math.min(selectedIndex + 1, currentMenu.items.length - 1);
        if (nextIndex !== selectedIndex) {
          triggerHaptic('selection');
          setSelectedIndex(nextIndex);
        }
      }
    }
  }, [currentMenu.id, currentMenu.items, isSelectionActive, selectedIndex, nowPlayingMode, currentSong, playTick, postMusicCommand, triggerHaptic]);
  const handleMove = useCallback(e => {
    if (e.pointerType === 'touch') return;
    if (!isInteracting || !wheelRef.current || isScreenOff) return;
    resetSleepTimer();
    const rect = wheelRef.current.getBoundingClientRect();
    const point = getEventPoint(e);
    const currentAngle = getAngleFromPoint(point.clientX, point.clientY, rect);
    const prevAngle = interactionState.current.prevAngle;
    if (prevAngle !== null) {
      let delta = currentAngle - prevAngle;
      if (delta > 180) delta -= 360;else if (delta < -180) delta += 360;
      interactionState.current.accumulatedDelta += delta;
      const sensitivity = 15;
      if (Math.abs(interactionState.current.accumulatedDelta) > sensitivity) {
        processScroll(interactionState.current.accumulatedDelta > 0 ? -1 : 1);
        interactionState.current.accumulatedDelta = 0;
      }
    }
    interactionState.current.prevAngle = currentAngle;
    if (e.cancelable) e.preventDefault();
  }, [isInteracting, isScreenOff, processScroll, resetSleepTimer]);
  const handleEnd = useCallback(() => {
    if (isInteracting) triggerHaptic('selection-end');
    setIsInteracting(false);
    interactionState.current.prevAngle = null;
    activeButtonRef.current = null;
    setActiveButton(null);
  }, [isInteracting, triggerHaptic]);
  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    const handleTouchStart = e => {
      resetSleepTimer();
      if (isScreenOff) return;
      if (e.target.closest('.wheel-btn') || e.target.id === 'center-btn') return;
      if (!e.touches?.[0]) return;
      const rect = wheel.getBoundingClientRect();
      const point = getEventPoint(e);
      interactionState.current.prevAngle = getAngleFromPoint(point.clientX, point.clientY, rect);
      interactionState.current.accumulatedDelta = 0;
      setIsInteracting(true);
      triggerHaptic('selection-start');
      if (e.cancelable) e.preventDefault();
    };
    const handleTouchMove = e => {
      if (!isInteracting || !e.touches?.[0] || isScreenOff) return;
      resetSleepTimer();
      const rect = wheel.getBoundingClientRect();
      const point = getEventPoint(e);
      const currentAngle = getAngleFromPoint(point.clientX, point.clientY, rect);
      const prevAngle = interactionState.current.prevAngle;
      if (prevAngle !== null) {
        let delta = currentAngle - prevAngle;
        if (delta > 180) delta -= 360;else if (delta < -180) delta += 360;
        interactionState.current.accumulatedDelta += delta;
        const sensitivity = 15;
        if (Math.abs(interactionState.current.accumulatedDelta) > sensitivity) {
          processScroll(interactionState.current.accumulatedDelta > 0 ? -1 : 1);
          interactionState.current.accumulatedDelta = 0;
        }
      }
      interactionState.current.prevAngle = currentAngle;
      if (e.cancelable) e.preventDefault();
    };
    wheel.addEventListener('touchstart', handleTouchStart, {
      passive: false
    });
    wheel.addEventListener('touchmove', handleTouchMove, {
      passive: false
    });
    wheel.addEventListener('touchend', handleEnd, {
      passive: false
    });
    wheel.addEventListener('touchcancel', handleEnd, {
      passive: false
    });
    return () => {
      wheel.removeEventListener('touchstart', handleTouchStart);
      wheel.removeEventListener('touchmove', handleTouchMove);
      wheel.removeEventListener('touchend', handleEnd);
      wheel.removeEventListener('touchcancel', handleEnd);
    };
  }, [handleEnd, isScreenOff, processScroll, resetSleepTimer, triggerHaptic]);
  const handleNativeWheel = useCallback(e => {
    if (isScreenOff) return resetSleepTimer();
    resetSleepTimer();
    wheelScrollAccumulator.current += e.deltaY;
    const sensitivity = 40;
    if (Math.abs(wheelScrollAccumulator.current) > sensitivity) {
      processScroll(wheelScrollAccumulator.current > 0 ? -1 : 1);
      wheelScrollAccumulator.current = 0;
    }
  }, [isScreenOff, processScroll, resetSleepTimer]);
  useEffect(() => {
    const handleGlobalMouseUp = () => handleEnd();
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleEnd]);
  const handleNextSong = () => {
    if (currentPlaylist.length > 0 && currentSong) {
      const idx = currentPlaylist.findIndex(s => s.id === currentSong.id);
      setCurrentSong(currentPlaylist[(idx + 1) % currentPlaylist.length]);
      setProgress(0);
      setIsPlaying(true);
    }
  };
  const handlePrevSong = () => {
    if (progress > 3) {
      setProgress(0);
    } else if (currentPlaylist.length > 0 && currentSong) {
      const idx = currentPlaylist.findIndex(s => s.id === currentSong.id);
      setCurrentSong(currentPlaylist[(idx - 1 + currentPlaylist.length) % currentPlaylist.length]);
      setProgress(0);
      setIsPlaying(true);
    }
  };
  const handleWheelAction = action => {
    handleInteraction(() => {
      activeButtonRef.current = action;
      setActiveButton(action);
      triggerHaptic('button');
      playTick();
      setTimeout(() => {
        if (activeButtonRef.current === action) {
          activeButtonRef.current = null;
          setActiveButton(null);
        }
      }, 150);
      if (action === 'menu') {
        setIsSelectionActive(false);
        if (menuStack.length > 1) {
          setMenuStack(prev => prev.slice(0, -1));
          setSelectedIndex(0);
          setScrollOffset(0);
        }
      } else if (action === 'playpause') {
        if (!postMusicCommand('playpause') && currentSong) setIsPlaying(!isPlaying);
      } else if (action === 'next') {
        if (!postMusicCommand('next') && currentSong) handleNextSong();
      } else if (action === 'prev') {
        if (!postMusicCommand('prev') && currentSong) handlePrevSong();
      } else if (action === 'center') {
        if (currentMenu.id === 'nowplaying') {
          setNowPlayingMode(prev => prev === 'volume' ? 'scrub' : 'volume');
          return;
        }
        if (currentMenu.id === 'about' || currentMenu.id === 'brightness') return;
        if (!isSelectionActive) return;
        const selectedItem = currentMenu.items[selectedIndex];
        if (selectedItem) {
          if (selectedItem.type === 'song') {
            setCurrentPlaylist(currentMenu.items.filter(i => i.type === 'song'));
            setCurrentSong(selectedItem);
            setIsPlaying(true);
            setProgress(0);
            if (selectedItem.source === 'apple-music' && selectedItem.musicPersistentID) {
              postMusicCommand('playTrack', selectedItem.musicPersistentID);
            }
            setMenuStack(prev => [...prev, appSubMenus['nowplaying']]);
            setIsSelectionActive(false);
          } else if (selectedItem.type === 'shuffle') {
            const shuffled = [...dummySongs].sort(() => Math.random() - 0.5);
            setCurrentPlaylist(shuffled);
            setCurrentSong(shuffled[0]);
            setIsPlaying(true);
            setProgress(0);
            setMenuStack(prev => [...prev, appSubMenus['nowplaying']]);
            setIsSelectionActive(false);
          } else if (selectedItem.type === 'dynamic') {
            setMenuStack(prev => [...prev, selectedItem.action()]);
            setSelectedIndex(0);
            setScrollOffset(0);
            setIsSelectionActive(false);
          } else if (selectedItem.target) {
            const nextMenu = appSubMenus[selectedItem.target] || appSubMenus['empty'];
            setMenuStack(prev => [...prev, nextMenu]);
            setSelectedIndex(0);
            setScrollOffset(0);
            setIsSelectionActive(false);
          }
        }
      }
    });
  };
  const handleWheelButtonDown = (e, action) => {
    e.stopPropagation();
    handleInteraction(() => {
      activeButtonRef.current = action;
      setActiveButton(action);
    });
  };
  const handleWheelButtonUp = (e, action) => {
    e.stopPropagation();
    if (activeButtonRef.current === action) {
      handleWheelAction(action);
    } else {
      activeButtonRef.current = null;
      setActiveButton(null);
    }
  };
  const clearActiveButton = () => {
    activeButtonRef.current = null;
    setActiveButton(null);
  };
  const formatTime = seconds => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen bg-[#2A2A2A] flex items-center justify-center p-4 font-sans select-none"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-[340px] h-[560px] rounded-[32px] bg-gradient-to-br from-[#EAEAEA] via-[#D8D8D8] to-[#B8B8B8] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),inset_0_2px_5px_rgba(255,255,255,1),inset_0_-2px_8px_rgba(0,0,0,0.2)] flex flex-col items-center pt-[20px] relative border-[1.5px] border-[#c0c0c0]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-[300px] h-[228px] bg-[#000] rounded-[10px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.6)] p-[6px] flex items-center justify-center relative overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 pointer-events-none z-20",
    style: {
      background: 'linear-gradient(155deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 48%, rgba(0,0,0,0) 48.1%, rgba(0,0,0,0) 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "w-full h-full bg-white relative overflow-hidden transition-opacity duration-300 flex flex-col rounded-[2px]",
    style: {
      opacity: isScreenOff ? 0 : 1,
      filter: `brightness(${brightness}%)`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: `bg-gradient-to-b from-[#f8f9fa] via-[#e9ecef] to-[#dee2e6] px-1 flex justify-between items-center text-[11px] font-bold text-black/80 z-10 shrink-0 transition-all duration-300 overflow-hidden ${showSplitView ? 'h-0 opacity-0 border-b-0' : 'h-[20px] opacity-100 border-b border-gray-300'}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-12 flex items-center pl-1 opacity-80 text-[#3B99D8]"
  }, isPlaying ? /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "9",
    viewBox: "0 0 10 10",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "2,1 9,5 2,9"
  })) : currentSong && /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "9",
    viewBox: "0 0 10 10",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "1",
    width: "2.5",
    height: "8"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "1",
    width: "2.5",
    height: "8"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "flex-1 text-center font-bold tracking-wider text-[12px]"
  }, time), /*#__PURE__*/React.createElement("div", {
    className: "w-12 flex justify-end items-center pr-[2px]"
  }, /*#__PURE__*/React.createElement(BatteryIcon, {
    level: battery
  }))), isMenuScreen ? /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex w-full h-full bg-white relative overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: `transition-all duration-300 ease-in-out ${showSplitView ? 'w-[52%] shadow-[2px_0_4px_rgba(0,0,0,0.15)] border-r border-[#B3B3B3]' : 'w-full border-r-0 border-transparent'} h-full flex flex-col z-10 bg-white relative`
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-gradient-to-b from-[#f8f9fa] via-[#e9ecef] to-[#dee2e6] border-b border-gray-300 flex items-center z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)] shrink-0 transition-all duration-300 h-[22px] relative overflow-hidden"
  }, /*#__PURE__*/React.createElement("span", {
    className: `absolute w-full text-center font-extrabold text-[12px] tracking-wide transition-opacity duration-300 ${showSplitView ? 'opacity-0' : 'opacity-100'}`
  }, currentMenu.title), /*#__PURE__*/React.createElement("div", {
    className: `absolute w-full px-[6px] flex justify-between items-center transition-opacity duration-300 ${showSplitView ? 'opacity-100' : 'opacity-0'}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-extrabold text-[12px] tracking-tight truncate"
  }, currentMenu.title), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-[2px] shrink-0"
  }, /*#__PURE__*/React.createElement("span", {
    className: "opacity-100 flex items-center text-[#3B99D8]"
  }, isPlaying ? /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "9",
    viewBox: "0 0 10 10",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "2,1 9,5 2,9"
  })) : currentSong && /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "9",
    viewBox: "0 0 10 10",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "1",
    width: "2.5",
    height: "8"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "1",
    width: "2.5",
    height: "8"
  }))), /*#__PURE__*/React.createElement(BatteryIcon, {
    level: battery
  })))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 bg-white relative overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full absolute left-0 top-0 transition-transform duration-75",
    style: {
      transform: `translateY(-${scrollOffset * ITEM_HEIGHT}px)`
    }
  }, currentMenu.items?.map((item, index) => {
    const isSelected = isSelectionActive && selectedIndex === index;
    return /*#__PURE__*/React.createElement("div", {
      key: index,
      style: {
        height: `${ITEM_HEIGHT}px`
      },
      className: `px-[6px] flex justify-between items-center text-[14px] font-bold ${isSelected ? 'bg-gradient-to-b from-[#55A4EE] via-[#3283DE] to-[#1663C9] text-white shadow-sm' : 'text-black'}`
    }, /*#__PURE__*/React.createElement("span", {
      className: "truncate pr-1 flex-1"
    }, item.label), (item.target || item.type === 'sub' || item.type === 'dynamic' || item.type === 'shuffle') && /*#__PURE__*/React.createElement("span", {
      className: "opacity-100 mr-1 flex items-center"
    }, /*#__PURE__*/React.createElement(ChevronIcon, {
      className: isSelected ? 'text-white' : 'text-[#888]'
    })));
  })))), /*#__PURE__*/React.createElement("div", {
    className: `absolute right-0 top-0 h-full bg-black flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${showSplitView ? 'w-[48%] translate-x-0 opacity-100' : 'w-[48%] translate-x-[30%] opacity-0 pointer-events-none'}`
  }, /*#__PURE__*/React.createElement("img", {
    src: currentMenu.items?.[selectedIndex]?.image || coverImages.music,
    alt: "Cover Art",
    className: "w-full h-full object-cover transition-opacity duration-200"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 shadow-[inset_4px_0_15px_rgba(0,0,0,0.6)] pointer-events-none"
  }))) : currentMenu.id === 'nowplaying' ? /*#__PURE__*/React.createElement("div", {
    className: "flex-1 bg-white flex flex-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center font-bold text-[12px] py-1 border-b border-gray-300 bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef]"
  }, currentSong ? '지금 재생 중' : '재생 중인 곡 없음'), currentSong ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-1 p-2 items-center mt-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-24 h-24 bg-gradient-to-br from-blue-300 to-purple-400 shadow-md border border-gray-200 flex items-center justify-center shrink-0 ml-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-3xl opacity-50"
  }, "\uD83C\uDFB5")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 ml-4 flex flex-col justify-center gap-1 overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-extrabold truncate text-[15px]"
  }, currentSong.title), /*#__PURE__*/React.createElement("div", {
    className: "text-gray-700 font-bold truncate text-[13px]"
  }, currentSong.artist), /*#__PURE__*/React.createElement("div", {
    className: "text-gray-500 font-bold truncate text-[12px]"
  }, currentSong.album), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-[#3B99D8] font-bold mt-1"
  }, currentPlaylist.findIndex(s => s.id === currentSong.id) + 1, " \uC758 ", currentPlaylist.length))), /*#__PURE__*/React.createElement("div", {
    className: "px-3 pb-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-[11px] text-gray-500 font-bold mb-1"
  }, nowPlayingMode === 'scrub' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, formatTime(progress)), /*#__PURE__*/React.createElement("span", {
    className: "text-[#3B99D8]"
  }, "\uD0D0\uC0C9 \uC911"), /*#__PURE__*/React.createElement("span", null, "-", formatTime(currentSong.duration - progress))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", {
    className: "text-gray-600"
  }, "\uBCFC\uB968"), /*#__PURE__*/React.createElement("span", null))), /*#__PURE__*/React.createElement("div", {
    className: "w-full h-[10px] bg-gray-300 border border-gray-400 overflow-hidden relative shadow-inner"
  }, nowPlayingMode === 'scrub' ? /*#__PURE__*/React.createElement("div", {
    className: "h-full bg-gradient-to-b from-[#6cbaf8] to-[#3B99D8]",
    style: {
      width: `${progress / currentSong.duration * 100}%`
    }
  }) : /*#__PURE__*/React.createElement("div", {
    className: "h-full bg-gradient-to-b from-[#888] to-[#555]",
    style: {
      width: `${volume}%`
    }
  })))) : /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex items-center justify-center text-sm font-bold text-gray-500"
  }, "\uC74C\uC545\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694")) : currentMenu.id === 'about' ? /*#__PURE__*/React.createElement("div", {
    className: "flex-1 bg-white flex flex-col text-[13px]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center font-bold text-[12px] py-1 border-b border-gray-300 bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef] shadow-sm"
  }, "\uC815\uBCF4"), /*#__PURE__*/React.createElement("div", {
    className: "p-4 flex flex-col gap-2 font-bold"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between border-b border-gray-200 pb-1"
  }, /*#__PURE__*/React.createElement("span", null, "\uC774\uB984"), /*#__PURE__*/React.createElement("span", {
    className: "text-[#3B99D8]"
  }, "My iPod")), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between border-b border-gray-200 pb-1"
  }, /*#__PURE__*/React.createElement("span", null, "\uC6A9\uB7C9"), /*#__PURE__*/React.createElement("span", {
    className: "text-gray-600"
  }, "64 GB")), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between border-b border-gray-200 pb-1"
  }, /*#__PURE__*/React.createElement("span", null, "\uC0AC\uC6A9 \uAC00\uB2A5"), /*#__PURE__*/React.createElement("span", {
    className: "text-gray-600"
  }, "51.2 GB")), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between border-b border-gray-200 pb-1"
  }, /*#__PURE__*/React.createElement("span", null, "\uBC84\uC804"), /*#__PURE__*/React.createElement("span", {
    className: "text-gray-600"
  }, "1.0.3 PC")), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between border-b border-gray-200 pb-1"
  }, /*#__PURE__*/React.createElement("span", null, "\uBAA8\uB378"), /*#__PURE__*/React.createElement("span", {
    className: "text-gray-600"
  }, "MA446KH")))) : currentMenu.id === 'brightness' ? /*#__PURE__*/React.createElement("div", {
    className: "flex-1 bg-white flex flex-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center font-bold text-[12px] py-1 border-b border-gray-300 bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef] shadow-sm"
  }, "\uD654\uBA74 \uBC1D\uAE30"), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex flex-col items-center justify-center px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full h-4 bg-gray-200 border border-gray-400 overflow-hidden flex shadow-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-full bg-gradient-to-b from-[#6cbaf8] to-[#3B99D8]",
    style: {
      width: `${brightness}%`
    }
  })))) : null)), /*#__PURE__*/React.createElement("div", {
    className: "w-[210px] h-[210px] mt-[51px] relative"
  }, /*#__PURE__*/React.createElement("div", {
    ref: wheelRef,
    className: `w-full h-full bg-[#FFFFFF] rounded-full relative shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_4px_8px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05)] touch-none select-none ${isInteracting ? 'cursor-grabbing' : 'cursor-grab'}`,
    onPointerDown: handleStart,
    onPointerMove: handleMove,
    onPointerUp: handleEnd,
    onPointerLeave: handleEnd,
    onWheel: handleNativeWheel
  }, /*#__PURE__*/React.createElement("div", {
    className: `absolute top-[12px] left-1/2 -translate-x-1/2 w-16 h-8 flex items-center justify-center font-bold text-[#959595] text-[12px] tracking-[0.15em] cursor-pointer wheel-btn ${activeButton === 'menu' ? 'text-[#3B99D8]' : ''}`,
    onPointerDown: e => handleWheelButtonDown(e, 'menu'),
    onPointerUp: e => handleWheelButtonUp(e, 'menu'),
    onPointerLeave: clearActiveButton
  }, "MENU"), /*#__PURE__*/React.createElement("div", {
    className: `absolute bottom-[14px] left-1/2 -translate-x-1/2 w-16 h-8 flex items-center justify-center text-[#959595] cursor-pointer wheel-btn gap-1 ${activeButton === 'playpause' ? 'text-[#3B99D8]' : ''}`,
    onPointerDown: e => handleWheelButtonDown(e, 'playpause'),
    onPointerUp: e => handleWheelButtonUp(e, 'playpause'),
    onPointerLeave: clearActiveButton
  }, /*#__PURE__*/React.createElement(PlayPauseIcon, {
    className: "opacity-90"
  })), /*#__PURE__*/React.createElement("div", {
    className: `absolute left-[14px] top-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center text-[#959595] cursor-pointer wheel-btn ${activeButton === 'prev' ? 'text-[#3B99D8]' : ''}`,
    onPointerDown: e => handleWheelButtonDown(e, 'prev'),
    onPointerUp: e => handleWheelButtonUp(e, 'prev'),
    onPointerLeave: clearActiveButton
  }, /*#__PURE__*/React.createElement(PrevIcon, {
    className: "opacity-90"
  })), /*#__PURE__*/React.createElement("div", {
    className: `absolute right-[14px] top-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center text-[#959595] cursor-pointer wheel-btn ${activeButton === 'next' ? 'text-[#3B99D8]' : ''}`,
    onPointerDown: e => handleWheelButtonDown(e, 'next'),
    onPointerUp: e => handleWheelButtonUp(e, 'next'),
    onPointerLeave: clearActiveButton
  }, /*#__PURE__*/React.createElement(NextIcon, {
    className: "opacity-90"
  })), /*#__PURE__*/React.createElement("div", {
    id: "center-btn",
    className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70px] h-[70px] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(255,255,255,0.8)] flex items-center justify-center cursor-pointer border border-[#c4c4c4]",
    style: {
      backgroundColor: activeButton === 'center' ? '#b5b5b5' : '#D1D1D1'
    },
    onPointerDown: e => handleWheelButtonDown(e, 'center'),
    onPointerUp: e => handleWheelButtonUp(e, 'center'),
    onPointerLeave: clearActiveButton
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full h-full rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
  }))))));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));
