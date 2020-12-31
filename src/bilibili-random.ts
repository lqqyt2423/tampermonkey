// ==UserScript==
// @name         bilibili-random
// @namespace    https://github.com/lqqyt2423
// @version      0.1
// @description  random play bilibili video
// @author       lqqyt2423
// @match        https://www.bilibili.com/*
// @grant        none
// ==/UserScript==

import { sleep, Logger } from "@liqiqiang/utils";

const logger = new Logger('bilibili random');

const isVideoPage = (pathname: string) => {
  return pathname.startsWith('/video/BV') || pathname.startsWith('/bangumi/play/')
};

(async () => {
  const url = window.location.href
  if (!url.startsWith('https://www.bilibili.com/')) return

  const pathname = window.location.pathname
  if (pathname !== '/' && !isVideoPage(pathname)) return

  // 首页
  if (pathname === '/') {
    const targetNavs = ['动画', '音乐', '舞蹈', '游戏', '知识', '数码', '生活', '美食', '鬼畜', '时尚', '资讯', '娱乐', '影视', '纪录片'];
    let navs: NodeListOf<HTMLDivElement>;
    while (!navs || !navs.length) {
      navs = document.querySelectorAll('#elevator > div.list-box > div:nth-child(1) > div')
      logger.info(`got navs: ${navs.length}`)
      await sleep(500);
    }
    for (let i = 0; i < navs.length; i++) {
      const name = navs[i].innerText.trim()
      if (targetNavs.includes(name)) {
        logger.info(`click to ${name}`)
        navs[i].click();
        await sleep(300);
      }
    }

    const linkSet = new Set<string>()
    const allAnchors = document.querySelectorAll('a')
    allAnchors.forEach(anchor => {
      if (anchor.href.startsWith('https://www.bilibili.com/video/BV')) {
        linkSet.add(anchor.href)
      }
    })

    const links = Array.from(linkSet)
    logger.info(`got ${links.length} videos`)
    const index = Math.floor(Math.random() * links.length)
    logger.info(`to index ${index}: ${links[index]}`)
    window.location.href = links[index]
  }

  // 视频页
  else if (isVideoPage(pathname)) {
    let loaded = false;
    while (true) {
      const playBtn = document.querySelector('#bilibiliPlayer > div.bilibili-player-area.video-state-pause.video-state-blackside.video-control-show > div.bilibili-player-video-wrap > div.bilibili-player-video-control-wrap > div.bilibili-player-video-control > div.bilibili-player-video-control-bottom > div.bilibili-player-video-control-bottom-left > div.bilibili-player-video-btn.bilibili-player-video-btn-start.video-state-pause > button') as HTMLButtonElement
      if (!playBtn && loaded) {
        logger.info('video already play, break to monitor finish')
        break
      }

      if (!playBtn) {
        logger.info('video loading...')
        await sleep(1000)
        continue
      }

      loaded = true
      logger.info('trigger play click')
      playBtn.click()
      await sleep(1000)
    }

    // 监测是否播放完了
    while (true) {
      const restartBtn = document.querySelector('#bilibiliPlayer > div.bilibili-player-area.video-state-pause.video-state-ending-panel-flag.progress-shadow-show > div.bilibili-player-video-wrap > div.bilibili-player-ending-panel > div.bilibili-player-ending-panel-box.second-screen > div.bilibili-player-ending-panel-box-functions > div.bilibili-player-upinfo-spans.show > div.bilibili-player-upinfo-span.restart')
      if (!restartBtn) {
        logger.info('playing...')
        await sleep(3000)
        continue
      }

      logger.info('finished')
      break
    }
    window.location.href = 'https://www.bilibili.com/'
  }
})()
