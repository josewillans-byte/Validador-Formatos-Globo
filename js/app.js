let formatoAtual = "frameAd";
let ultimoResultado = null;
let imagemAtual = null;
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const kb = b => b / 1024;
const ext = n => n.split('.').pop().toLowerCase();
const formatKB = v => `${v.toFixed(0)} KB`;
function check(ok,label,detail,required=true){return {ok,label,detail,required};}
function detectarTransparencia(img){
  const c=document.createElement('canvas'); c.width=img.naturalWidth;c.height=img.naturalHeight;
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
  const d=ctx.getImageData(0,0,c.width,c.height).data;
  for(let i=3;i<d.length;i+=4) if(d[i]<255) return true; return false;
}
function validar(file,img,formatKey=formatoAtual){
 const f=FORMATOS[formatKey], e=ext(file.name), checks=[];
 checks.push(check(img.naturalWidth===f.largura&&img.naturalHeight===f.altura,'Dimensão',`${img.naturalWidth} × ${img.naturalHeight} px — esperado ${f.largura} × ${f.altura} px`));
 if(f.pesoMaxKB!==null) checks.push(check(kb(file.size)<=f.pesoMaxKB,'Peso',`${formatKB(kb(file.size))} — máximo ${f.pesoMaxKB} KB`));
 checks.push(check(f.extensoes.includes(e),'Extensão',`.${e.toUpperCase()} — permitido: ${f.extensoes.map(x=>'.'+x.toUpperCase()).join(', ')}`));
 checks.push(check(f.mime.includes(file.type),'Tipo MIME',`${file.type||'desconhecido'} — esperado: ${f.mime.join(', ')}`));
 if(f.transparencia==='obrigatória'){
   let t=false;try{t=detectarTransparencia(img)}catch(_){ }
   checks.push(check(t,'Transparência',t?'Foram encontrados pixels com alpha < 255.':'Não foi detectada transparência.'));
 }
 return {checks,aprovado:checks.every(c=>c.ok),formato:f,formatKey};
}
function renderRules(){
 const f=FORMATOS[formatoAtual];
 $('#rules').innerHTML=`<div class="rule-box"><strong>${f.nome}</strong><ul>
 <li>Dimensão: <b>${f.largura} × ${f.altura} px</b></li>
 ${f.pesoMaxKB!==null?`<li>Peso máximo: <b>${f.pesoMaxKB} KB</b></li>`:'<li>Peso: <b>não informado no cadastro desta versão</b></li>'}
 <li>Arquivos: <b>${f.extensoes.map(x=>'.'+x.toUpperCase()).join(' / ')}</b></li>
 ${f.transparencia!=='não aplicável'?`<li>Transparência: <b>${f.transparencia}</b></li>`:''}
 ${f.areaSegura?`<li>Área segura: <b>${f.areaSegura}</b></li>`:''}${f.areaCorte?`<li>Área de corte: <b>${f.areaCorte}</b></li>`:''}
 </ul>${f.observacoes.map(x=>`<p>• ${x}</p>`).join('')}</div>`;
}
function loadImage(file){return new Promise((resolve,reject)=>{const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Não foi possível ler a imagem.'))};img.src=url;});}
async function processFiles(files){
 const arr=[...files].filter(f=>f.type.startsWith('image/')); if(!arr.length){alert('Selecione arquivos de imagem.');return;}
 const results=[];
 for(const file of arr){try{const img=await loadImage(file);results.push({file,img,result:validar(file,img)});}catch(e){results.push({file,img:null,result:{aprovado:false,formato:FORMATOS[formatoAtual],checks:[check(false,'Leitura do arquivo',e.message)]}})}}
 renderBatch(results); if(results.length===1) renderResult(results[0].file,results[0].img,results[0].result);
}
function renderBatch(results){
 $('#batchCard').classList.remove('hidden'); const ok=results.filter(x=>x.result.aprovado).length;
 $('#batchSummary').textContent=`${ok} aprovado(s) de ${results.length} arquivo(s) — formato selecionado: ${FORMATOS[formatoAtual].nome}`;
 $('#batchResults').innerHTML=results.map((x,i)=>`<button class="batch-row ${x.result.aprovado?'pass':'fail'}" data-index="${i}"><span class="check-icon">${x.result.aprovado?'✓':'✕'}</span><span><b>${escapeHtml(x.file.name)}</b><small>${x.img?`${x.img.naturalWidth} × ${x.img.naturalHeight} px • ${formatKB(kb(x.file.size))}`:'arquivo não lido'}</small></span><strong>${x.result.aprovado?'APROVADO':'REPROVADO'}</strong></button>`).join('');
 [...$$('.batch-row')].forEach((b,i)=>b.addEventListener('click',()=>{const x=results[i];if(x.img)renderResult(x.file,x.img,x.result)}));
}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function renderResult(file,img,result){
 ultimoResultado={file,result};$('#resultCard').classList.remove('hidden');$('#fileName').textContent=file.name;
 const badge=$('#overallBadge');badge.textContent=result.aprovado?'✓ APROVADO':'✕ REPROVADO';badge.className='badge '+(result.aprovado?'ok':'error');
 $('#summary').innerHTML=`<div class="summary-grid"><div><span>Formato</span><b>${result.formato.nome}</b></div><div><span>Arquivo</span><b>${formatKB(kb(file.size))}</b></div><div><span>Dimensão</span><b>${img?`${img.naturalWidth} × ${img.naturalHeight}`:'—'}</b></div><div><span>Extensão</span><b>.${ext(file.name).toUpperCase()}</b></div></div>`;
 $('#checks').innerHTML=result.checks.map(c=>`<div class="check ${c.ok?'pass':'fail'}"><span class="check-icon">${c.ok?'✓':'✕'}</span><div><strong>${c.label}</strong><small>${c.detail}</small></div></div>`).join('');
 const hasOverlay=['frameAd','touchpointDesktop','touchpointMobile','pauseAdsTakeover'].includes(result.formatKey);$('#overlayTools').classList.toggle('hidden',!hasOverlay);drawPreview(img,result.formatKey);
}
function drawPreview(img,key){if(!img)return;imagemAtual=img;const canvas=$('#canvas'),maxW=1000,scale=Math.min(1,maxW/img.naturalWidth);canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);const f=FORMATOS[key];
 const sx=canvas.width/f.largura,sy=canvas.height/f.altura;
 const rect=z=>({x:z.x*sx,y:z.y*sy,w:z.w*sx,h:z.h*sy});
 function stroke(z,style){const r=rect(z);ctx.save();ctx.strokeStyle=style;ctx.lineWidth=Math.max(2,4*sx);ctx.setLineDash([10,8]);ctx.strokeRect(r.x,r.y,r.w,r.h);ctx.restore()}
 function label(text,x,y){ctx.save();ctx.font=`${Math.max(10,18*sx)}px Arial`;const pad=6*sx,w=ctx.measureText(text).width;ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(x,y-20*sy,w+pad*2,26*sy);ctx.fillStyle='#fff';ctx.fillText(text,x+pad,y);ctx.restore()}
 if($('#showCut').checked){ctx.save();ctx.strokeStyle='rgba(220,40,40,.95)';ctx.lineWidth=4;ctx.setLineDash([12,9]);ctx.strokeRect(0,0,canvas.width,canvas.height);ctx.restore();}
 if(key==='touchpointDesktop'&&$('#showSafe').checked){stroke({x:0,y:0,w:740,h:100},'rgba(0,190,100,.95)');stroke({x:740,y:0,w:1180,h:100},'rgba(255,165,0,.95)');label('ÁREA SEGURA — 740 px',8*sx,25*sy);label('ÁREA DE CORTE — 1180 px',750*sx,25*sy)}
 if(key==='touchpointMobile'&&$('#showSafe').checked){stroke({x:0,y:0,w:280,h:140},'rgba(0,190,100,.95)');stroke({x:280,y:0,w:150,h:140},'rgba(255,165,0,.95)');label('SEGURA — 280 px',8*sx,25*sy);label('CORTE — 150 px',290*sx,25*sy)}
 if(key==='frameAd'&&$('#showSafe').checked){const x=(1920-1280)/2,y=(1080-720)/2;stroke({x,y,w:1280,h:720},'rgba(0,190,100,.95)');label('ESPAÇO LIVRE / REFERÊNCIA — 1280 × 720',x*sx+8*sx,y*sy+28*sy)}
 if(key==='pauseAdsTakeover'){
   const zones={attention:{x:45,y:45,w:1830,h:990},thumb:{x:105,y:500,w:700,h:420},qr:{x:1510,y:650,w:315,h:350},safe:{x:820,y:170,w:650,h:650}};
   if($('#showAttention').checked){stroke(zones.attention,'rgba(255,165,0,.95)');label('ÁREA DE ATENÇÃO',55*sx,72*sy)}
   if($('#showSafe').checked){stroke(zones.safe,'rgba(0,190,100,.95)');const t=rect(zones.thumb),q=rect(zones.qr);ctx.save();ctx.fillStyle='rgba(190,40,55,.18)';ctx.strokeStyle='rgba(255,170,0,.95)';ctx.lineWidth=4;ctx.fillRect(t.x,t.y,t.w,t.h);ctx.strokeRect(t.x,t.y,t.w,t.h);ctx.fillRect(q.x,q.y,q.w,q.h);ctx.strokeRect(q.x,q.y,q.w,q.h);ctx.restore();label('THUMBNAIL / VÍDEO',t.x+8*sx,t.y+27*sy);label('QR CODE — PRODUTO',q.x+8*sx,q.y+27*sy)}
   if($('#showTv').checked){const t=rect(zones.thumb),q=rect(zones.qr);ctx.save();ctx.fillStyle='rgba(0,0,0,.8)';ctx.fillRect(t.x,t.y,t.w,t.h);ctx.fillRect(q.x,q.y,q.w,q.h);ctx.fillStyle='#fff';ctx.font=`${Math.max(12,22*sx)}px Arial`;ctx.fillText('THUMBNAIL / VÍDEO',t.x+12*sx,t.y+t.h/2);ctx.fillText('QR CODE',q.x+20*sx,q.y+q.h/2);ctx.restore();}
 }
 ctx.save();ctx.font=`${Math.max(10,14*sx)}px Arial`;ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillText('Gabarito visual / áreas de referência',12*sx,canvas.height-12*sy);ctx.restore();
}
function copyResult(){if(!ultimoResultado)return;const {file,result}=ultimoResultado;const text=[`VALIDADOR GLOBO — ${result.formato.nome}`,`Arquivo: ${file.name}`,`Resultado: ${result.aprovado?'APROVADO':'REPROVADO'}`,...result.checks.map(c=>`${c.ok?'✓':'✕'} ${c.label}: ${c.detail}`)].join('\n');navigator.clipboard.writeText(text).then(()=>{ $('#copyBtn').textContent='✓ Resultado copiado';setTimeout(()=>$('#copyBtn').textContent='📋 Copiar resultado',1600);});}
function sugerirFormatos(){const file=$('#fileInput').files[0];if(!file){alert('Selecione uma imagem primeiro para sugerir o formato pela dimensão.');return;}loadImage(file).then(img=>{const matches=Object.entries(FORMATOS).filter(([_,f])=>f.largura===img.naturalWidth&&f.altura===img.naturalHeight);if(!matches.length){alert(`Nenhum formato cadastrado corresponde a ${img.naturalWidth} × ${img.naturalHeight} px.`);return;}const key=matches[0][0];$$('.format-card').forEach(x=>x.classList.toggle('active',x.dataset.format===key));formatoAtual=key;renderRules();alert(`Formato sugerido: ${FORMATOS[key].nome}`);});}
$$('.format-card').forEach(btn=>btn.addEventListener('click',()=>{$$('.format-card').forEach(x=>x.classList.remove('active'));btn.classList.add('active');formatoAtual=btn.dataset.format;renderRules();$('#resultCard').classList.add('hidden')}));
$('#fileInput').addEventListener('change',e=>processFiles(e.target.files));
const dz=$('#dropzone');['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag')}));['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag')}));dz.addEventListener('drop',e=>processFiles(e.dataTransfer.files));
$('#copyBtn').addEventListener('click',copyResult);$('#autoBtn').addEventListener('click',sugerirFormatos);$('#clearBatch').addEventListener('click',()=>{$('#batchCard').classList.add('hidden');$('#resultCard').classList.add('hidden');$('#fileInput').value=''});$('#resetBtn').addEventListener('click',()=>{$('#resultCard').classList.add('hidden');$('#fileInput').value=''});
['showSafe','showAttention','showCut','showTv'].forEach(id=>$('#'+id).addEventListener('change',()=>imagemAtual&&drawPreview(imagemAtual,formatoAtual)));
$('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('light');$('#themeBtn').textContent=document.body.classList.contains('light')?'🌙 Modo escuro':'☀️ Modo claro'});
renderRules();
