// Đặt file nhạc trong assets/musics rồi cập nhật đường dẫn tại đây.
const MUSIC = {
  url: 'assets/musics/LAVIEM.mp3',
  title: 'LAVIEM (Drill)',
};

// Thay đổi nội dung lời chúc trong thẻ .letter của index.html.
// Đây là bản dựng lấy cảm hứng từ chủ đề website, không phải mã nguồn gốc.
const scenes = Array.from(document.querySelectorAll('.scene'));
const progress = document.getElementById('progress');
const petals = document.getElementById('petals');
const flowerButtons = [...document.querySelectorAll('.flower')];
const notes = ['Cậu luôn xứng đáng với những điều tốt đẹp! 🌷','Hãy cười thật nhiều hôm nay nhé! ✨','Mong những ước mơ của cậu nở hoa! 🌸','Chúc cậu luôn bình an và hạnh phúc! 💗','Thật vui vì cậu có mặt trên đời! 🌼'];
let current=0, bloomed=0, petalTimer=null;
function showScene(index){
  current=index;
  scenes.forEach((scene,i)=>{scene.classList.toggle('active',i===index);});
  progress.textContent=String(index+1).padStart(2,'0')+' / 05';

  if(index===4) burst(70);
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('[data-next]').forEach(btn=>btn.addEventListener('click',()=>showScene(Number(btn.dataset.next))));
flowerButtons.forEach((btn,i)=>btn.addEventListener('click',()=>{
  if(btn.classList.contains('bloomed'))return;
  btn.classList.add('bloomed');bloomed++;
  document.getElementById('flowerCount').textContent=`${bloomed}/5`;
  document.getElementById('flowerNote').textContent=notes[i];

  burst(9);
  if(bloomed===flowerButtons.length){document.getElementById('gardenNext').disabled=false;document.getElementById('flowerNote').textContent='Khu vườn đã nở rộ rồi! Cảm ơn cậu ♡';burst(25);}
}));
document.getElementById('envelope').addEventListener('click',()=>{
  document.getElementById('envelope').classList.add('open');
  document.getElementById('letter').classList.add('visible');
  burst(22);
});
document.getElementById('replay').addEventListener('click',()=>{
  bloomed=0;flowerButtons.forEach(btn=>btn.classList.remove('bloomed'));
  document.getElementById('flowerCount').textContent='0/5';
  document.getElementById('flowerNote').textContent='Chờ những bông hoa thức giấc...';
  document.getElementById('gardenNext').disabled=true;
  document.getElementById('envelope').classList.remove('open');
  document.getElementById('letter').classList.remove('visible');
  showScene(0);
});
function burst(amount){
  const symbols=['🌸','✿','♡','✦','🌷'];
  for(let i=0;i<amount;i++){
    const el=document.createElement('span');el.className='petal';
    el.textContent=symbols[Math.floor(Math.random()*symbols.length)];
    el.style.left=Math.random()*100+'%';
    el.style.animationDuration=(3+Math.random()*4)+'s';
    el.style.animationDelay=Math.random()*.7+'s';
    el.style.setProperty('--dx',(Math.random()*180-90)+'px');
    petals.appendChild(el);
    el.addEventListener('animationend',()=>el.remove(),{once:true});
  }
}
const music = document.getElementById('backgroundMusic');
const musicBtn = document.getElementById('musicBtn');
const musicTitle = document.getElementById('musicTitle');
const musicStatus = document.getElementById('musicStatus');
const musicIcon = document.getElementById('musicIcon');
const musicUrl = MUSIC.url.trim();
musicTitle.textContent = MUSIC.title;
music.volume = 0.45;

function updateMusic(playing, status) {
  musicBtn.classList.toggle('is-playing', playing);
  musicBtn.setAttribute('aria-pressed', String(playing));
  musicBtn.setAttribute('aria-label', (playing ? 'Tắt âm: ' : 'Bật âm: ') + MUSIC.title);
  musicIcon.textContent = playing ? 'Ⅱ' : '▶';
  musicStatus.textContent = status;
}

if (musicUrl) {
  music.src = musicUrl;
  musicBtn.disabled = false;
  updateMusic(false, 'Bật âm · nghe cùng mình');
} else {
  musicBtn.title = 'Thêm link bài hát tại MUSIC.url trong script.js';
}

music.addEventListener('playing', () => updateMusic(true, 'Tắt âm · đang phát bài hát'));
music.addEventListener('pause', () => updateMusic(false, 'Bật âm · nghe tiếp bài hát'));
music.addEventListener('error', () => updateMusic(false, 'Chưa tải được · chạm để thử lại'));

musicBtn.addEventListener('click', async () => {
  if (!music.paused) {
    music.pause();
    return;
  }
  musicBtn.disabled = true;
  musicStatus.textContent = 'Đang mở giai điệu…';
  try {
    if (music.error) music.load();
    await music.play();
  } catch {
    updateMusic(false, 'Chưa phát được · chạm để thử lại');
  } finally {
    musicBtn.disabled = false;
  }
});
petalTimer=setInterval(()=>{if(document.visibilityState==='visible'&&Math.random()>.6)burst(1)},2500);
