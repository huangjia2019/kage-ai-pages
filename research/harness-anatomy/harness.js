/* ========================================================================
   Harness Anatomy — render heatmap + 5-step + framework detail panel
   ======================================================================== */
(function () {
    'use strict';
    const I18N = {
        en: {
            framework: 'Framework',
            total: 'Σ',
            details: 'Click any framework or cell for details',
            mainLoop: 'Main loop',
            strengths: 'Where this harness goes deep',
            coverageLabel: 'Coverage (7 cognitive functions, 0–3 scale)',
            close: 'Close (Esc)'
        },
        zh: {
            framework: '框架',
            total: '合计',
            details: '点框架名或任何格子看细节',
            mainLoop: '主循环位置',
            strengths: '这个 harness 深的地方',
            coverageLabel: '覆盖度（7 个认知功能 · 0-3 分）',
            close: '关闭 (Esc)'
        }
    };

    let state = { lang: 'en', data: null, text: I18N.en };

    function v(obj, baseEn, baseZh) {
        return state.lang === 'zh' ? (obj[baseZh] || obj[baseEn] || '') : (obj[baseEn] || obj[baseZh] || '');
    }
    function localized(obj, base) {
        return obj[base + '_' + state.lang] || obj[base + '_en'] || obj[base] || '';
    }
    function esc(s) {
        return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    function renderHeatmap() {
        const t = state.text;
        const funcs = state.data.functions;
        const fws = state.data.frameworks;
        const labels = state.data.scale_labels[state.lang];

        const headerCells = funcs.map(f => `<th title="${esc(f.en)}">${esc(state.lang === 'zh' ? f.zh : f.en)}</th>`).join('');
        const rows = fws.map(fw => {
            const cells = funcs.map(f => {
                const score = fw.coverage[f.id] ?? 0;
                const lbl = labels[String(score)] || '';
                return `<td class="ha-cell ha-cell-${score}" data-fw="${esc(fw.id)}" data-func="${esc(f.id)}" title="${esc(fw.name)} · ${esc(state.lang === 'zh' ? f.zh : f.en)} · ${esc(lbl)}">${esc(lbl)}</td>`;
            }).join('');
            return `<tr>
                <th data-fw="${esc(fw.id)}">${esc(fw.name)}<span class="ha-fw-sub">${esc(fw.vendor)} · ${esc(fw.lang)}</span></th>
                ${cells}
                <td class="ha-cell-tot">${fw.total}</td>
            </tr>`;
        }).join('');

        const wrap = document.getElementById('ha-heatmap');
        if (!wrap) return;
        wrap.innerHTML = `
            <div class="ha-heatmap-wrap">
                <table class="ha-heatmap">
                    <thead>
                        <tr>
                            <th class="ha-corner">${esc(t.framework)}</th>
                            ${headerCells}
                            <th>${esc(t.total)}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div class="ha-legend">
                <span><span class="ha-legend-sw" style="background:#f7f1e4;"></span>${esc(labels['0'])}</span>
                <span><span class="ha-legend-sw" style="background:#ecd9b8;"></span>${esc(labels['1'])}</span>
                <span><span class="ha-legend-sw" style="background:#d49f6a;"></span>${esc(labels['2'])}</span>
                <span><span class="ha-legend-sw" style="background:#a85a1e;"></span>${esc(labels['3'])}</span>
            </div>
        `;
    }

    function renderSteps() {
        const root = document.getElementById('ha-steps');
        if (!root) return;
        root.innerHTML = state.data.five_step.map(s => `
            <div class="ha-step">
                <h4>${esc(localized(s, 'title'))}</h4>
                <p>${esc(localized(s, 'body'))}</p>
            </div>
        `).join('');
    }

    function renderAncestors() {
        const root = document.getElementById('ha-ancestors');
        if (!root) return;
        root.innerHTML = state.data.common_ancestors.map(a => `
            <li><strong>${esc(a.name)}</strong><span class="ha-anc-year">${esc(a.year)}</span> — ${esc(localized(a, 'summary'))}</li>
        `).join('');
    }

    function openDetail(fwId) {
        const fw = state.data.frameworks.find(f => f.id === fwId);
        if (!fw) return;
        const t = state.text;
        const funcs = state.data.functions;
        const labels = state.data.scale_labels[state.lang];
        const mini = funcs.map(f => {
            const score = fw.coverage[f.id] ?? 0;
            return `<div class="ha-cell-${score}" style="${score>=2 ? 'color:#fff;' : ''}">
                ${esc(labels[String(score)])}
                <span class="ha-mini-label">${esc(state.lang === 'zh' ? f.zh : f.en)}</span>
            </div>`;
        }).join('');
        const body = document.querySelector('#ha-detail .ha-detail-body');
        body.innerHTML = `
            <h3>${esc(fw.name)}</h3>
            <p class="ha-detail-meta">
                ${esc(fw.vendor)} &middot; ${esc(fw.lang)}<br>
                ${esc(state.lang === 'zh' ? fw.battlefield_zh : fw.battlefield_en)}<br>
                <span style="color: var(--color-text-faint); font-size:0.78rem; text-transform:uppercase; letter-spacing:0.06em;">${esc(t.mainLoop)}</span>
                <code>${esc(state.lang === 'zh' ? fw.main_loop_zh : fw.main_loop_en)}</code>
            </p>
            <p class="ha-detail-summary">${esc(state.lang === 'zh' ? fw.summary_zh : fw.summary_en)}</p>
            <p class="ha-detail-strengths"><strong>${esc(t.strengths)}</strong>${esc(state.lang === 'zh' ? fw.strengths_zh : fw.strengths_en)}</p>
            <div>
                <span style="color: var(--color-text-faint); font-size:0.78rem; text-transform:uppercase; letter-spacing:0.06em;">${esc(t.coverageLabel)}</span>
                <div class="ha-detail-mini-grid">${mini}</div>
            </div>
        `;
        document.getElementById('ha-detail').setAttribute('data-open', 'true');
    }

    function closeDetail() {
        const p = document.getElementById('ha-detail');
        if (p) p.setAttribute('data-open', 'false');
    }

    function attachHandlers() {
        document.body.addEventListener('click', (e) => {
            const cell = e.target.closest('[data-fw]');
            if (cell) {
                openDetail(cell.getAttribute('data-fw'));
                return;
            }
            if (e.target.closest('.ha-detail-close')) closeDetail();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeDetail();
        });
    }

    async function init(opts) {
        state.lang = opts.lang || 'en';
        state.text = I18N[state.lang] || I18N.en;
        const res = await fetch(opts.dataUrl || 'data.json');
        state.data = await res.json();
        renderHeatmap();
        renderSteps();
        renderAncestors();
        attachHandlers();
    }

    window.HarnessAnatomy = { init };
})();
