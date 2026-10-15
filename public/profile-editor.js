(()=>{
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function imageUrl(value){if(typeof value==='string'&&value.length<280000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))return value;try{const u=new URL(value);return u.protocol==='https:'&&/^[a-z0-9-]+\.googleusercontent\.com$/i.test(u.hostname)&&!u.username&&!u.password&&!u.port?u.href:''}catch{return ''}}
 function avatar(container,value){const url=imageUrl(value);container.querySelectorAll('img').forEach(img=>img.remove());if(url){const img=document.createElement('img');img.src=url;img.alt='';img.referrerPolicy='no-referrer';img.onerror=()=>img.remove();container.append(img)}}
 window.mountProfileEditor=user=>{
  const aside=document.querySelector('.journal-aside');if(!aside)return;
  const identity=document.querySelector('.journal-identity');const largeAvatar=identity.querySelector('.journal-avatar');largeAvatar.classList.add('editable-journal-avatar');avatar(largeAvatar,user.avatar);
  const context=document.createElement('div');context.className='journal-personal-info';
  for(const key of ['location','bio'])if(user[key]){const p=document.createElement('p');p.textContent=user[key];context.append(p)}identity.querySelector('div:last-child').append(context);
  const panel=document.createElement('details');panel.className='journal-panel profile-editor';panel.id='edit-profile';
  panel.innerHTML=`<summary>Edit profile</summary><p>Make your travel journal your own. These details are shown in your account; your display name is used on new reviews.</p><form id="profileEditForm"><div class="profile-photo-preview"><span aria-hidden="true">${esc(String(user.name||'Traveler').trim().split(/\s+/).slice(0,2).map(p=>Array.from(p)[0]).join(''))}</span></div><label for="profilePhoto">Profile photo</label><input type="file" id="profilePhoto" accept="image/jpeg,image/png,image/webp"><p class="profile-photo-hint">JPEG, PNG or WebP · up to 10 MB. Cropped to a square and resized before saving.</p><button type="button" class="outline" id="removeProfilePhoto">Remove photo</button><label for="profileName">Display name</label><input id="profileName" autocomplete="nickname" required maxlength="40" value="${esc(user.name)}"><label for="profileLocation">Location <span>optional</span></label><input id="profileLocation" autocomplete="address-level2" maxlength="80" placeholder="City or region" value="${esc(user.location)}"><label for="profileBio">A little about you <span>optional</span></label><textarea id="profileBio" maxlength="240" rows="4" placeholder="Your kind of journey…">${esc(user.bio)}</textarea><p class="profile-photo-hint">Your Google sign-in email is managed by Google and cannot be changed here.</p><div class="profile-editor-actions"><button type="submit" class="primary" id="saveProfile">Save changes</button><button type="button" class="outline" id="cancelProfileEdit">Cancel</button></div><p id="profileEditStatus" role="status" aria-live="polite"></p></form>`;
  aside.prepend(panel);
  const preview=panel.querySelector('.profile-photo-preview'),file=panel.querySelector('#profilePhoto'),remove=panel.querySelector('#removeProfilePhoto'),save=panel.querySelector('#saveProfile'),note=panel.querySelector('#profileEditStatus'),cancel=panel.querySelector('#cancelProfileEdit');
  let photo,processing=false,saving=false;
  avatar(preview,user.avatar);
  const initials=()=>{preview.querySelector('span').textContent=String(user.name||'Traveler').trim().split(/\s+/).slice(0,2).map(p=>Array.from(p)[0]||'').join('')};
  const reset=()=>{photo=undefined;file.value='';panel.querySelector('#profileName').value=user.name||'';panel.querySelector('#profileLocation').value=user.location||'';panel.querySelector('#profileBio').value=user.bio||'';initials();avatar(preview,user.avatar);note.textContent=''};
  cancel.onclick=()=>{if(processing||saving)return;reset();panel.open=false;panel.querySelector('summary').focus()};
  remove.onclick=()=>{photo='';avatar(preview,'');file.value='';note.textContent='Photo will be removed when you save.'};
  file.onchange=async()=>{
   const chosen=file.files[0];if(!chosen)return;
   processing=true;file.disabled=true;save.disabled=true;remove.disabled=true;cancel.disabled=true;note.textContent='Preparing your profile photo…';
   try{
    if(!['image/jpeg','image/png','image/webp'].includes(chosen.type)||chosen.size>10*1024*1024)throw Error('Choose a JPEG, PNG or WebP image under 10 MB.');
    const bitmap=await createImageBitmap(chosen),side=Math.min(bitmap.width,bitmap.height),canvas=document.createElement('canvas');canvas.width=canvas.height=384;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,384,384);ctx.drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,384,384);bitmap.close();
    const result=canvas.toDataURL('image/jpeg',.85);if(result.length>270000)throw Error('This photo could not be resized. Choose another image.');photo=result;avatar(preview,photo);note.textContent='Photo ready. Save changes to apply it.';
   }catch(error){note.textContent=error.message}finally{processing=false;file.disabled=false;save.disabled=false;remove.disabled=false;cancel.disabled=false;file.value=''}
  };
  panel.querySelector('form').onsubmit=async event=>{
   event.preventDefault();if(processing||saving)return;
   saving=true;save.disabled=true;file.disabled=true;remove.disabled=true;cancel.disabled=true;save.textContent='Saving…';note.textContent='';
   try{
    const body={name:panel.querySelector('#profileName').value.trim(),location:panel.querySelector('#profileLocation').value.trim(),bio:panel.querySelector('#profileBio').value.trim(),...(photo!==undefined?{avatar:photo}:{})};
    const response=await fetch('/api/me',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to save your profile.');
    Object.assign(user,result);photo=undefined;initials();avatar(preview,user.avatar);largeAvatar.textContent=String(user.name||'Traveler').trim().split(/\s+/).slice(0,2).map(p=>Array.from(p)[0]||'').join('');avatar(largeAvatar,user.avatar);identity.querySelector('h2').textContent=user.name;context.replaceChildren();for(const key of ['location','bio'])if(user[key]){const p=document.createElement('p');p.textContent=user[key];context.append(p)}
    window.refreshNavigation?.();note.textContent='Profile updated.';
   }catch(error){note.textContent=error.message}finally{saving=false;save.disabled=false;file.disabled=false;remove.disabled=false;cancel.disabled=false;save.textContent='Save changes'}
  };
  if(new URLSearchParams(location.search).get('edit')==='1'){panel.open=true;panel.scrollIntoView({block:'start',behavior:'smooth'});panel.querySelector('#profileName').focus({preventScroll:true})}
 };
})();
