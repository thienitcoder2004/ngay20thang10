const {spawn} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--in-process-gpu', '--disable-software-rasterizer', '--no-first-run', '--remote-debugging-port=9336',
  '--user-data-dir=' + path.resolve('.preview/test-profile'), 'about:blank'
], {windowsHide:true, stdio:'ignore'});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const deadline = setTimeout(()=>{console.error('Browser check timed out');edge.kill();process.exit(1);},25000);
(async () => {
  let targets;
  for(let i=0;i<50;i++) {
    try {targets = await (await fetch('http://127.0.0.1:9336/json')).json();break;} catch {await sleep(200);}
  }
  if(!targets) throw Error('Headless browser did not start');
  const ws = new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  let id=0;const pending=new Map();const errors=[];
  ws.addEventListener('message', e=>{
    const msg=JSON.parse(e.data);
    if(msg.method==='Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text);
    if(pending.has(msg.id)){const {resolve,reject}=pending.get(msg.id);pending.delete(msg.id);msg.error?reject(msg.error):resolve(msg.result);}
  });
  const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
  const evaluate=async expression=>{
    const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});
    if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;
  };
  await send('Runtime.enable');await send('Page.enable');
  await send('Page.navigate',{url:pathToFileURL(path.resolve('index.html')).href});
  for(let i=0;i<80;i++) {
    if(await evaluate(`!!document.querySelector('.tiny-body') && getComputedStyle(document.querySelector('.tiny-body')).width==='140px' && typeof musicBtn!=='undefined'`)) break;
    await sleep(200);
  }
  await evaluate(`document.querySelectorAll('*').forEach(el=>el.style.animation='none')`);
  for(const [width,height] of [[1420,812],[390,844],[320,640]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await sleep(200);
    const result=await evaluate(`(() => {
      const rect=s=>document.querySelector(s).getBoundingClientRect();
      const wrap=rect('#scene0 .mascot-wrap'), body=rect('#scene0 .tiny-body'), cloud=rect('#scene0 .cloud');
      const top=rect('.topbar'), title=rect('#scene0 .eyebrow');
      return {width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,
        centered:Math.abs((body.left+body.width/2)-(wrap.left+wrap.width/2))<3,
        cloudCentered:Math.abs((cloud.left+cloud.width/2)-(wrap.left+wrap.width/2))<2,
        bodyWidth:body.width,headerClear:title.top>=top.bottom,
        musicDisabled:document.getElementById('musicBtn').disabled};
    })()`);
    assert.equal(result.overflow,false);assert.equal(result.centered,true);assert.equal(result.cloudCentered,true);
    assert.equal(result.bodyWidth,140);assert.equal(result.headerClear,true);assert.equal(result.musicDisabled,true);
    console.log('Layout:',JSON.stringify(result));
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
    fs.writeFileSync(`.preview/home-${width}.png`,Buffer.from(shot.data,'base64'));
  }
  await evaluate(`document.querySelector('[data-next="1"]').click()`);
  assert.equal(await evaluate(`document.querySelector('#scene1').classList.contains('active') && getComputedStyle(document.querySelector('#scene1 .tiny')).position==='absolute'`),true);
  await evaluate(`document.querySelector('[data-next="2"]').click();document.querySelectorAll('.flower').forEach(b=>b.click())`);
  assert.equal(await evaluate(`document.getElementById('flowerCount').textContent==='5/5' && !document.getElementById('gardenNext').disabled`),true);
  await evaluate(`document.getElementById('gardenNext').click();document.getElementById('envelope').click()`);
  assert.equal(await evaluate(`document.getElementById('letter').classList.contains('visible')`),true);
  await evaluate(`document.querySelector('[data-next="4"]').click();document.getElementById('replay').click()`);
  assert.equal(await evaluate(`document.querySelector('#scene0').classList.contains('active') && document.getElementById('flowerCount').textContent==='0/5'`),true);
  // A short local WAV exercises actual HTMLAudioElement playback, pause and loop.
  const wav=Buffer.alloc(44+8000);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);
  wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);
  wav.writeUInt32LE(8000,28);wav.writeUInt16LE(1,32);wav.writeUInt16LE(8,34);wav.write('data',36);wav.writeUInt32LE(8000,40);wav.fill(128,44);
  await evaluate(`music.src='data:audio/wav;base64,${wav.toString('base64')}';musicBtn.disabled=false;musicBtn.click()`);
  await sleep(500);
  assert.equal(await evaluate(`!music.paused && musicBtn.getAttribute('aria-pressed')==='true' && music.loop`),true);
  await evaluate(`musicBtn.click()`);await sleep(100);
  assert.equal(await evaluate(`music.paused && musicBtn.getAttribute('aria-pressed')==='false'`),true);
  await evaluate(`music.src='data:audio/wav;base64,aW52YWxpZA==';musicBtn.click()`);await sleep(300);
  assert.equal(await evaluate(`!musicBtn.disabled && musicBtn.getAttribute('aria-pressed')==='false'`),true);
  assert.deepEqual(errors,[]);
  console.log('PASS: scenes, garden, letter, replay, real audio play/pause, invalid audio recovery, no runtime errors.');
  ws.close();
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{clearTimeout(deadline);edge.kill();});
