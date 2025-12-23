/* Lightweight overlay launcher script */
(function(){
  function createOverlay(url){
    if(!url) return;
    const existing = document.getElementById('app-overlay');
    if(existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'app-overlay';
    overlay.className = 'overlay';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'overlay-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', ()=> overlay.remove());

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.className = 'overlay-iframe';
    iframe.style.visibility = 'hidden';

    const fallbackBar = document.createElement('div');
    fallbackBar.style.position = 'absolute';
    fallbackBar.style.top = '18px';
    fallbackBar.style.left = '18px';
    fallbackBar.style.zIndex = '10001';
    fallbackBar.style.display = 'none';
    fallbackBar.innerHTML = `<button class="overlay-open-new">Open in new tab</button>`;
    fallbackBar.querySelector('button').addEventListener('click', ()=> window.open(url, '_blank'));

    overlay.appendChild(closeBtn);
    overlay.appendChild(fallbackBar);
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    // If iframe loads successfully (not blocked), show it. If embedding is blocked (X-Frame-Options/CSP), show fallback.
    let handled = false;
    iframe.addEventListener('load', ()=>{
      // try to detect blocked embedding by attempting to access contentDocument — will throw for blocked/cross-origin in some cases
      try{
        // accessing contentDocument may be blocked cross-origin; if accessible and has body, assume loaded
        const doc = iframe.contentDocument;
        if(doc && doc.body){
          iframe.style.visibility = 'visible';
          fallbackBar.style.display = 'none';
          handled = true;
        }
      }catch(e){
        // cross-origin access blocked — still may be embedded; show iframe but also provide fallback
        iframe.style.visibility = 'visible';
        fallbackBar.style.display = 'block';
        handled = true;
      }
    });

    // after short timeout, if not handled, show fallback
    setTimeout(()=>{
      if(handled) return;
      // likely blocked — hide iframe and show fallback
      try{ iframe.remove(); }catch(e){}
      fallbackBar.style.display = 'block';
    }, 1200);
  }

  document.addEventListener('click', function(e){
    const t = e.target.closest('[data-app]');
    if(!t) return;
    e.preventDefault();
    const url = t.getAttribute('data-app');
    if(!url) return;
    // If the target is an external URL, open in a new tab (embedding often blocked).
    try{
      const u = new URL(url, location.origin);
      if(u.protocol === 'http:' || u.protocol === 'https:'){
        // external — open in new tab
        window.open(u.toString(), '_blank', 'noopener');
        return;
      }
    }catch(e){
      // not an absolute URL — fall through to overlay
    }
    createOverlay(url);
  });

  // expose in case needed
  window.createOverlay = createOverlay;
  // Snow generator
  function makeSnow(count){
    const chars = ['❅','✻','✤','✦','✺'];
    for(let i=0;i<count;i++){
      const s = document.createElement('div');
      s.className = 'snowflake';
      s.textContent = chars[Math.floor(Math.random()*chars.length)];
      const size = 8 + Math.random()*18;
      s.style.fontSize = size+'px';
      s.style.left = (Math.random()*100)+'vw';
      const delay = Math.random()*-20;
      const duration = 6 + Math.random()*14;
      s.style.animation = `fall ${duration}s linear ${delay}s infinite`;
      s.style.opacity = (0.5 + Math.random()*0.6).toString();
      document.body.appendChild(s);
    }
  }
  // start a gentle snowfall
  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(()=>makeSnow(30),200);
  }else{
    window.addEventListener('DOMContentLoaded', ()=> setTimeout(()=>makeSnow(30),200));
  }
})();
