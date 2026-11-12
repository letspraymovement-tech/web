import { writeFile } from 'node:fs/promises'
const tabs = await fetch('http://127.0.0.1:9222/json/list').then(r => r.json())
const tab = tabs.find(t => t.type === 'page' && t.url === 'about:blank') || tabs.find(t => t.type === 'page' && t.url.startsWith('http://127.0.0.1:5173'))
if (!tab) throw new Error('No preview tab available')
const socket = new WebSocket(tab.webSocketDebuggerUrl)
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
let id = 0
const pending = new Map()
socket.addEventListener('message', e => { const data = JSON.parse(e.data); if (data.id) { const request = pending.get(data.id); pending.delete(data.id); data.error ? request.reject(data.error) : request.resolve(data.result) } })
function send(method, params = {}) { return new Promise((resolve,reject) => { pending.set(++id,{resolve,reject}); socket.send(JSON.stringify({id,method,params})) }) }
const pause = ms => new Promise(resolve => setTimeout(resolve,ms))
await send('Page.enable')
await send('Runtime.enable')
const evaluate = async expression => (await send('Runtime.evaluate', {expression,returnByValue:true,awaitPromise:true})).result.value
const reports = []
for (const width of [1440,390,768,320]) {
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<600})
  for (const path of ['/','/prayer-sessions','/ipc']) {
    await send('Page.navigate',{url:'http://127.0.0.1:5173'+path})
    await pause(650)
    await evaluate('Promise.all([...document.images].map(i => {i.loading="eager";return i.decode().catch(()=>{})}))')
    const report = await evaluate(`({width:innerWidth,documentWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,width:Math.round(i.getBoundingClientRect().width),height:Math.round(i.getBoundingClientRect().height)})),overflow:[...document.querySelectorAll('h1,h2,h3,p,a,button,input,textarea')].filter(e=>e.getBoundingClientRect().right>innerWidth+1||e.getBoundingClientRect().left < -1).map(e=>({tag:e.tagName,text:e.textContent.slice(0,70),width:Math.round(e.getBoundingClientRect().width)}))})`)
    reports.push({path,viewport:width,...report})
    if (width===1440||width===390) {
      const shot = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:report.height,scale:1}})
      await writeFile(`.design/${path==='/'?'home':path.slice(1)}-${width}.png`,Buffer.from(shot.data,'base64'))
    }
  }
}
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true})
await send('Page.navigate',{url:'http://127.0.0.1:5173/'})
await pause(500)
console.log('Menu:',await evaluate(`document.querySelector('.menu-toggle').click();new Promise(r=>setTimeout(()=>r({expanded:document.querySelector('.menu-toggle').getAttribute('aria-expanded'),visible:getComputedStyle(document.querySelector('.primary-navigation')).display}),100))`))
console.log('Dialog:',await evaluate(`document.querySelector('.header-join').click();new Promise(r=>setTimeout(()=>r({open:document.querySelector('dialog')?.open,focus:document.activeElement?.getAttribute('aria-label')}),100))`))
await evaluate(`document.querySelector('.dialog-close').click()`)
await send('Page.navigate',{url:'http://127.0.0.1:5173/ipc'})
await pause(500)
console.log('Form validation:',await evaluate(`({invalid:!document.querySelector('.registration-form').checkValidity(),required:document.querySelectorAll('.registration-form [required]').length})`))
await writeFile('.design/layout-report.json',JSON.stringify(reports,null,2))
console.log(JSON.stringify(reports.map(({path,viewport,documentWidth,height,images,overflow})=>({path,viewport,documentWidth,height,brokenImages:images.filter(i=>!i.loaded),overflow})),null,2))
socket.close()
