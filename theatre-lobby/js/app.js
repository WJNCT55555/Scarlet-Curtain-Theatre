"use strict";
const shellOptions = [{ id: 'proscenium', label: '歌剧院' }, { id: 'blackbox', label: '黑匣外壳' }, { id: 'electric', label: '电子台口' }];
let catalog = [];
let current = null;
let selectedShell = 'proscenium';
let selectedLanguage = 'zh';
let revision = 0;
let progress = 0;
function element(id) { const node = document.getElementById(id); if (!node)
    throw new Error(`Missing #${id}`); return node; }
const frame = element('theatreFrame');
const grid = element('productionGrid');
const shellSelector = element('shellSelector');
const languageSelector = element('languageSelector');
const progressSlider = element('progressSlider');
function setStatus(text, state = 'idle') { element('statusText').textContent = text; element('statusDot').className = state === 'running' ? 'running' : ''; }
function setProgress(value) { progress = Math.max(0, Math.min(1, value)); const percent = Math.round(progress * 100); progressSlider.value = String(Math.round(progress * 1000)); progressSlider.style.setProperty('--progress', `${percent}%`); element('progressPercent').textContent = `${percent}%`; }
function productionUrl(production, preview = false) { const query = new URLSearchParams({ embed: '1', set: selectedShell, lang: selectedLanguage, revision: String(revision) }); if (preview)
    query.set('preview', '1'); return `${production.entry}?${query}`; }
function buttonGroup(container, items, selected, onSelect) { container.replaceChildren(); items.forEach(item => { const button = document.createElement('button'); button.type = 'button'; button.textContent = item.label; button.dataset.value = item.id; button.setAttribute('aria-pressed', String(item.id === selected)); button.addEventListener('click', () => { if (item.id === selected)
    return; onSelect(item.id); }); container.append(button); }); }
function refreshControls() { buttonGroup(shellSelector, shellOptions, selectedShell, id => { selectedShell = id; loadCurrent(); }); if (current)
    buttonGroup(languageSelector, current.languages, selectedLanguage, id => { selectedLanguage = id; loadCurrent(); }); }
function loadCurrent() { if (!current)
    return; revision += 1; setProgress(0); element('timelineState').textContent = '装台中'; setStatus('装台中'); refreshControls(); frame.src = productionUrl(current); }
function openProduction(production) { current = production; selectedShell = 'proscenium'; selectedLanguage = production.defaultLanguage; document.body.dataset.view = 'player'; document.documentElement.style.setProperty('--red', production.accent); element('playerTitle').textContent = production.title; element('playerLatinTitle').textContent = production.latinTitle; element('playerSubtitle').textContent = production.subtitle; loadCurrent(); }
function showHome() { current = null; frame.src = 'about:blank'; document.body.dataset.view = 'home'; document.documentElement.style.setProperty('--red', '#c72540'); setStatus('剧目厅'); setProgress(0); }
function renderCatalog() { grid.replaceChildren(); element('productionCount').textContent = `${catalog.length} 部剧目`; const template = element('productionTemplate'); catalog.forEach((production, index) => { const fragment = template.content.cloneNode(true); const item = fragment.querySelector('.production-item'); item.style.setProperty('--production-accent', production.accent); const preview = fragment.querySelector('iframe'); preview.src = productionUrl(production, true); preview.title = `${production.title}舞台预览`; fragment.querySelector('.production-latin').textContent = production.latinTitle; fragment.querySelector('.production-title').textContent = production.title; fragment.querySelector('.production-subtitle').textContent = production.subtitle; fragment.querySelector('.production-description').textContent = production.description; fragment.querySelector('.enter-button').addEventListener('click', () => openProduction(production)); grid.append(fragment); if (index === 0)
    preview.dataset.first = 'true'; }); }
async function loadCatalog() { try {
    const list = await fetch('../productions.json').then(response => { if (!response.ok)
        throw new Error('Cannot load production list'); return response.json(); });
    catalog = await Promise.all(list.map(path => fetch(`../${path}`).then(response => { if (!response.ok)
        throw new Error(`Cannot load ${path}`); return response.json(); })));
    renderCatalog();
    setStatus('剧目厅');
}
catch (error) {
    console.error(error);
    grid.innerHTML = '<div class="empty-state">剧目清单加载失败</div>';
    setStatus('载入失败');
} }
element('homeButton').addEventListener('click', showHome);
element('brandLink').addEventListener('click', event => { event.preventDefault(); showHome(); });
element('reloadButton').addEventListener('click', loadCurrent);
progressSlider.addEventListener('input', () => { progressSlider.value = String(Math.round(progress * 1000)); });
frame.addEventListener('load', () => { if (current) {
    element('timelineState').textContent = '等待开演';
    setStatus('等待开演');
} });
window.addEventListener('message', event => { if (event.origin !== location.origin || event.source !== frame.contentWindow || !current)
    return; const message = event.data; if (message.play !== current.id || !message.type?.startsWith('pocket-theatre:'))
    return; if (typeof message.progress === 'number')
    setProgress(message.progress); if (message.type === 'pocket-theatre:ready') {
    element('timelineState').textContent = '等待开演';
    setStatus('等待开演');
}
else if (message.type === 'pocket-theatre:started') {
    element('timelineState').textContent = '演出中';
    setStatus('演出中', 'running');
}
else if (message.type === 'pocket-theatre:done') {
    element('timelineState').textContent = '演出结束';
    setStatus('演出结束');
} });
loadCatalog();
