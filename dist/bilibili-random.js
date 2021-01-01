(function () {
	'use strict';

	function createCommonjsModule(fn) {
	  var module = { exports: {} };
		return fn(module, module.exports), module.exports;
	}

	var dist = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Logger = exports.dateFormat = exports.sleep = void 0;
	const sleep = (ms) => {
	    return new Promise(resolve => {
	        setTimeout(resolve, ms);
	    });
	};
	exports.sleep = sleep;
	function dateFormat(date) {
	    const year = date.getFullYear();
	    const month = (date.getMonth() + 1).toString().padStart(2, '0');
	    const day = date.getDate().toString().padStart(2, '0');
	    const hour = date.getHours().toString().padStart(2, '0');
	    const minute = date.getMinutes().toString().padStart(2, '0');
	    const second = date.getSeconds().toString().padStart(2, '0');
	    const ms = date.getMilliseconds().toString().padStart(3, '0');
	    return `${year}-${month}-${day} ${hour}:${minute}:${second},${ms}`;
	}
	exports.dateFormat = dateFormat;
	class Logger {
	    constructor(prefix) {
	        this.silent = false;
	        this.level = 'debug';
	        this.prefix = prefix;
	    }
	    log(level, message, ...args) {
	        if (this.silent)
	            return;
	        if (Logger.levelEnum[this.level] > Logger.levelEnum[level])
	            return;
	        if (message && typeof message === 'string') {
	            console.info(`${dateFormat(new Date())} [${this.prefix}] [${level}] ${message}`, ...args);
	        }
	        else {
	            console.info(`${dateFormat(new Date())} [${this.prefix}] [${level}]`, message, ...args);
	        }
	    }
	    debug(message, ...args) {
	        this.log('debug', message, ...args);
	    }
	    info(message, ...args) {
	        this.log('info', message, ...args);
	    }
	    warn(message, ...args) {
	        this.log('warn', message, ...args);
	    }
	    error(message, ...args) {
	        this.log('error', message, ...args);
	    }
	}
	exports.Logger = Logger;
	Logger.levelEnum = {
	    debug: 0,
	    info: 1,
	    warn: 2,
	    error: 3,
	};

	});

	// ==UserScript==
	const logger = new dist.Logger('bilibili random');
	const isVideoPage = (pathname) => {
	    return pathname.startsWith('/video/BV') || pathname.startsWith('/bangumi/play/');
	};
	(async () => {
	    const url = window.location.href;
	    if (!url.startsWith('https://www.bilibili.com/'))
	        return;
	    const pathname = window.location.pathname;
	    if (pathname !== '/' && !isVideoPage(pathname))
	        return;
	    // 首页
	    if (pathname === '/') {
	        const targetNavs = ['动画', '音乐', '舞蹈', '游戏', '知识', '数码', '生活', '美食', '鬼畜', '时尚', '资讯', '娱乐', '影视', '纪录片'];
	        let navs;
	        while (!navs || !navs.length) {
	            navs = document.querySelectorAll('#elevator > div.list-box > div:nth-child(1) > div');
	            logger.info(`got navs: ${navs.length}`);
	            await dist.sleep(500);
	        }
	        for (let i = 0; i < navs.length; i++) {
	            const name = navs[i].innerText.trim();
	            if (targetNavs.includes(name)) {
	                logger.info(`click to ${name}`);
	                navs[i].click();
	                await dist.sleep(300);
	            }
	        }
	        const linkSet = new Set();
	        const allAnchors = document.querySelectorAll('a');
	        allAnchors.forEach(anchor => {
	            if (anchor.href.startsWith('https://www.bilibili.com/video/BV')) {
	                linkSet.add(anchor.href);
	            }
	        });
	        const links = Array.from(linkSet);
	        logger.info(`got ${links.length} videos`);
	        const index = Math.floor(Math.random() * links.length);
	        logger.info(`to index ${index}: ${links[index]}`);
	        window.location.href = links[index];
	    }
	    // 视频页
	    else if (isVideoPage(pathname)) {
	        let loaded = false;
	        while (true) {
	            const playBtn = document.querySelector('#bilibiliPlayer > div.bilibili-player-area.video-state-pause.video-state-blackside.video-control-show > div.bilibili-player-video-wrap > div.bilibili-player-video-control-wrap > div.bilibili-player-video-control > div.bilibili-player-video-control-bottom > div.bilibili-player-video-control-bottom-left > div.bilibili-player-video-btn.bilibili-player-video-btn-start.video-state-pause > button');
	            if (!playBtn && loaded) {
	                logger.info('video already play, break to monitor finish');
	                break;
	            }
	            if (!playBtn) {
	                logger.info('video loading...');
	                await dist.sleep(1000);
	                continue;
	            }
	            // 仅在第一次尝试全屏
	            if (!loaded) {
	                // 网页全屏
	                const fullPageBtn = document.querySelector('#bilibiliPlayer > div.bilibili-player-area.video-state-pause.video-state-blackside.video-control-show > div.bilibili-player-video-wrap > div.bilibili-player-video-control-wrap > div.bilibili-player-video-control > div.bilibili-player-video-control-bottom > div.bilibili-player-video-control-bottom-right > div.bilibili-player-video-btn.bilibili-player-video-web-fullscreen');
	                if (fullPageBtn) {
	                    logger.info('enter web full page');
	                    fullPageBtn.click();
	                }
	                else {
	                    logger.warn('can not find full page button');
	                }
	            }
	            loaded = true;
	            logger.info('trigger play click');
	            playBtn.click();
	            await dist.sleep(1000);
	        }
	        // 监测是否播放完了
	        while (true) {
	            const restartBtn = document.querySelector('#bilibiliPlayer > div.bilibili-player-area.video-state-pause.video-state-ending-panel-flag.progress-shadow-show > div.bilibili-player-video-wrap > div.bilibili-player-ending-panel > div.bilibili-player-ending-panel-box > div.bilibili-player-ending-panel-box-functions > div.bilibili-player-upinfo-spans.show > div.bilibili-player-upinfo-span.restart');
	            if (!restartBtn) {
	                logger.info('playing...');
	                await dist.sleep(3000);
	                continue;
	            }
	            logger.info('finished');
	            break;
	        }
	        window.location.href = 'https://www.bilibili.com/';
	    }
	})();

}());
