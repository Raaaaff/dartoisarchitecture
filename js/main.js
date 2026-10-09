/* Dartois Architecture — scripts */
(function(){
  const pages=[...document.querySelectorAll('[data-page]')];
  const ids=pages.map(p=>p.dataset.page);
  const navLinks=[...document.querySelectorAll('.nav a')];
  const nav=document.getElementById('nav');
  const menuBtn=document.getElementById('menuBtn');

  function show(id){
    if(!ids.includes(id)) id='accueil';
    pages.forEach(p=>{p.hidden=p.dataset.page!==id});
    navLinks.forEach(a=>{
      if(a.getAttribute('href')==='#'+id) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false');
    window.scrollTo(0,0);
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');
    if(!a) return;
    const id=a.getAttribute('href').slice(1);
    if(ids.includes(id)){e.preventDefault(); try{history.replaceState(null,'','#'+id)}catch(_){} show(id);}
  });
  window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
  show(location.hash.slice(1));

  menuBtn.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded',String(open));
  });

  // Copier téléphone / e-mail
  document.querySelectorAll('[data-copy]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const el=document.getElementById(btn.dataset.copy);
      const done=()=>{btn.textContent='Copié';setTimeout(()=>btn.textContent='Copier',1800)};
      const fallback=()=>{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);btn.textContent='Sélectionné';setTimeout(()=>btn.textContent='Copier',1800)};
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(el.textContent.trim()).then(done,fallback)}else fallback();
    });
  });

  // Filtres réalisations
  const filterBtns=[...document.querySelectorAll('[data-filter]')];
  filterBtns.forEach(b=>b.addEventListener('click',()=>{
    filterBtns.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    const f=b.dataset.filter;
    document.querySelectorAll('#works .work').forEach(w=>{w.hidden=!(f==='tous'||w.dataset.cat===f)});
  }));

  // Formulaire de contact : envoi par Web3Forms (https://web3forms.com)
  // 1. Créez une clé gratuite sur web3forms.com avec dartois.architecture@outlook.com
  // 2. Collez-la ci-dessous à la place de VOTRE_CLE_WEB3FORMS
  const WEB3FORMS_KEY='VOTRE_CLE_WEB3FORMS';
  const form=document.getElementById('form'), msg=document.getElementById('formMsg');
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const nom=form.nom.value.trim(), email=form.email.value.trim(), m=form.message.value.trim(), ok=document.getElementById('f-rgpd').checked;
    msg.hidden=false; msg.classList.remove('err');
    if(!nom||!email||!m){msg.classList.add('err');msg.textContent='Merci de renseigner votre nom, votre e-mail et votre message.';return}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){msg.classList.add('err');msg.textContent="L'adresse e-mail semble incomplète. Vérifiez-la puis réessayez.";return}
    if(!ok){msg.classList.add('err');msg.textContent='Cochez la case de consentement pour envoyer votre demande.';return}
    if(form.botcheck.checked) return;
    const btn=form.querySelector('button[type="submit"]');
    btn.disabled=true; msg.textContent='Envoi en cours…';
    const data=Object.fromEntries(new FormData(form));
    delete data.botcheck;
    data.access_key=WEB3FORMS_KEY;
    data.subject='Nouveau projet via le site : '+(data.type||'')+' – '+nom;
    data.from_name='Site Dartois Architecture';
    data.replyto=email;
    try{
      const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)});
      const j=await r.json();
      if(!j.success) throw new Error(j.message);
      msg.textContent='Merci '+nom.split(' ')[0]+', votre demande est bien envoyée. Je vous réponds sous 48 heures ouvrées.';
      form.reset();
    }catch(err){
      msg.classList.add('err');
      msg.textContent="L'envoi n'a pas abouti. Écrivez-moi directement à dartois.architecture@outlook.com ou appelez le 06 62 52 21 20.";
    }finally{btn.disabled=false}
  });
})();
