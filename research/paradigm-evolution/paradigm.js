/* ========================================================================
   Paradigm Evolution — interactive engine (vanilla JS)
   Works for both EN and ZH pages by passing { lang: 'en' | 'zh' }.
   ======================================================================== */

(function () {
    'use strict';

    const I18N = {
        en: {
            problem: 'What it solved',
            insight: 'Key insight',
            shift: 'Shift it produced',
            clickHint: 'Click to expand →',
            close: 'Close (Esc)'
        },
        zh: {
            problem: '解决了什么',
            insight: '关键洞察',
            shift: '带来的思维转变',
            clickHint: '点开看细节 →',
            close: '关闭 (Esc)'
        }
    };

    let state = {
        lang: 'en',
        data: null,
        text: I18N.en,
        index: {}    // id → paradigm object
    };

    async function loadData(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load paradigm data');
        return res.json();
    }

    function v(obj, base) {
        return obj[base + '_' + state.lang] || obj[base + '_en'] || '';
    }

    function escapeHTML(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function renderCard(p) {
        return `
            <a class="para-card" href="#${escapeHTML(p.id)}" data-id="${escapeHTML(p.id)}">
                <div class="para-card-row">
                    <h3 class="para-card-name">${escapeHTML(v(p, 'name'))}</h3>
                    <span class="para-card-year">${escapeHTML(p.year || '')}</span>
                    ${p.by ? `<span class="para-card-by">${escapeHTML(p.by)}</span>` : ''}
                </div>
                <p class="para-card-summary">${escapeHTML(v(p, 'summary'))}</p>
                <span class="para-card-hint">${escapeHTML(state.text.clickHint)}</span>
            </a>
        `;
    }

    function renderEra(era) {
        const cards = era.paradigms.map(renderCard).join('');
        return `
            <section class="para-era" id="era-${escapeHTML(era.id)}">
                <header class="para-era-header">
                    <h2 class="para-era-name">${escapeHTML(v(era, 'name'))}</h2>
                    <p class="para-era-sub">${escapeHTML(v(era, 'sub'))}</p>
                </header>
                ${cards}
            </section>
        `;
    }

    function buildIndex(data) {
        const idx = {};
        for (const era of data.eras) {
            for (const p of era.paradigms) {
                idx[p.id] = p;
            }
        }
        return idx;
    }

    function openDetail(id) {
        const p = state.index[id];
        if (!p) return;
        const panel = document.getElementById('para-detail');
        if (!panel) return;
        const body = panel.querySelector('.para-detail-body');
        const t = state.text;
        body.innerHTML = `
            <h3>${escapeHTML(v(p, 'name'))}</h3>
            <p class="para-detail-meta">
                ${p.year ? `<span><strong>${escapeHTML(p.year)}</strong></span>` : ''}
                ${p.by ? `<span>${escapeHTML(p.by)}</span>` : ''}
            </p>
            <p class="para-detail-summary">${escapeHTML(v(p, 'summary'))}</p>
            <div class="para-detail-section">
                <h4>${escapeHTML(t.problem)}</h4>
                <p>${escapeHTML(v(p, 'problem'))}</p>
            </div>
            <div class="para-detail-section">
                <h4>${escapeHTML(t.insight)}</h4>
                <p>${escapeHTML(v(p, 'insight'))}</p>
            </div>
            <div class="para-detail-section">
                <h4>${escapeHTML(t.shift)}</h4>
                <p>${escapeHTML(v(p, 'shift'))}</p>
            </div>
        `;
        panel.setAttribute('data-open', 'true');
    }

    function closeDetail() {
        const panel = document.getElementById('para-detail');
        if (panel) panel.setAttribute('data-open', 'false');
    }

    function attachHandlers() {
        document.body.addEventListener('click', (e) => {
            const card = e.target.closest('.para-card');
            if (card) {
                e.preventDefault();
                openDetail(card.getAttribute('data-id'));
                return;
            }
            if (e.target.closest('.para-detail-close')) {
                closeDetail();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeDetail();
        });
    }

    async function init(opts) {
        state.lang = opts.lang || 'en';
        state.text = I18N[state.lang] || I18N.en;
        state.data = await loadData(opts.dataUrl || 'data.json');
        state.index = buildIndex(state.data);
        const root = document.getElementById('para-timeline');
        if (root) root.innerHTML = state.data.eras.map(renderEra).join('');
        attachHandlers();
    }

    window.ParadigmEvolution = { init };
})();
