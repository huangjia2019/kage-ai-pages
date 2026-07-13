/* ========================================================================
   Pattern Evolution — interactive engine
   Vanilla JS, no framework. Works for both EN and ZH pages by
   passing { lang: 'en' | 'zh' }.
   ======================================================================== */

(function () {
    'use strict';

    const I18N = {
        en: {
            origPro: 'Original problem',
            assumption: 'Default assumption',
            agentEra: 'Agent-era counterpart',
            agentTerm: 'Agent-era name',
            collapse: 'One-line collapse',
            erasGoF: 'GoF · Object-Oriented Era · 1994',
            erasDist: 'Distributed Systems Era · 2000s–2020s',
            patternsLabel: 'patterns',
            pendingTitle: 'Evolution analysis in progress',
            pendingBody: 'This pattern is part of the canonical 23 GoF set, but its full Agent-era lineage is still being written. The four detailed cards (Singleton, Factory Method, Observer, Strategy) show the template; the rest will follow the same four-section structure: original problem · default assumption · Agent-era counterpart · one-line collapse.',
            arrow: '↓ lifted one layer ↓',
            close: 'Close (Esc)'
        },
        zh: {
            origPro: '原问题',
            assumption: '默认前提',
            agentEra: 'Agent 时代的对应',
            agentTerm: 'Agent 时代命名',
            collapse: '一句话收口',
            erasGoF: 'GoF · 面向对象时代 · 1994',
            erasDist: '分布式系统时代 · 2000s–2020s',
            patternsLabel: '个模式',
            pendingTitle: '进化分析待补',
            pendingBody: '这个模式属于 GoF 经典 23 个之一，但它的 Agent 时代完整进化路径还在补写中。已经详细写完的 4 个（Singleton / Factory Method / Observer / Strategy）展示了模板格式，其余将按相同的四段结构补齐：原问题 · 默认前提 · Agent 时代的对应物 · 一句话收口。',
            arrow: '↓ 抬高一层 ↓',
            close: '关闭 (Esc)'
        }
    };

    let state = {
        lang: 'en',
        data: null,
        text: I18N.en
    };

    /* --------------------------------------------------------------
       Data loading
       -------------------------------------------------------------- */
    async function loadData(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load pattern data');
        return res.json();
    }

    /* --------------------------------------------------------------
       Render — build the matrices from data
       -------------------------------------------------------------- */
    function nameOf(obj, baseKey) {
        return obj[baseKey + '_' + state.lang] || obj[baseKey + '_en'] || '';
    }

    function renderGoF() {
        const container = document.getElementById('gof-matrix');
        if (!container) return;

        const html = state.data.gof_categories.map(cat => {
            const cells = cat.patterns.map(p => renderCell(p, 'gof', cat.id)).join('');
            const detailedCount = cat.patterns.filter(p => p.status === 'detailed').length;
            const totalCount = cat.patterns.length;
            return `
                <div class="evo-group">
                    <header class="evo-group-header">
                        <span class="evo-group-name">${nameOf(cat, 'name')}</span>
                        <span class="evo-group-count">${totalCount} ${state.text.patternsLabel} · ${detailedCount} ${state.lang === 'zh' ? '已详细展开' : 'detailed'}</span>
                    </header>
                    <div class="evo-cells">${cells}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    function renderDistributed() {
        const container = document.getElementById('dist-matrix');
        if (!container) return;

        const html = state.data.distributed_groups.map(group => {
            const cells = group.patterns.map(p => renderCell(p, 'dist', group.id)).join('');
            const summary = nameOf(group, 'summary') || '';
            return `
                <div class="evo-group">
                    <header class="evo-group-header">
                        <span class="evo-group-name">${nameOf(group, 'name')}</span>
                        <span class="evo-group-count">${group.patterns.length} ${state.text.patternsLabel}</span>
                        ${summary ? `<span class="evo-group-summary">${summary}</span>` : ''}
                    </header>
                    <div class="evo-cells">${cells}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    function renderCell(pattern, era, groupId) {
        const status = pattern.status || 'detailed';
        const dotClass = status === 'detailed' ? 'detailed' : 'pending';
        const cellClass = status === 'pending' ? 'evo-cell is-pending' : 'evo-cell';
        const enName = pattern.name_en || '';
        const zhName = pattern.name_zh || '';
        const primary = state.lang === 'zh' ? zhName : enName;
        const secondary = state.lang === 'zh' ? enName : zhName;

        return `
            <button
                class="${cellClass}"
                data-era="${era}"
                data-group="${groupId}"
                data-pattern-id="${pattern.id}"
                type="button"
            >
                <span class="evo-status-dot ${dotClass}"></span>
                <span class="evo-cell-name">
                    <strong>${primary}</strong>
                    ${secondary && secondary !== primary ? `<small>${secondary}</small>` : ''}
                </span>
            </button>
        `;
    }

    /* --------------------------------------------------------------
       Detail panel
       -------------------------------------------------------------- */
    function findPattern(era, groupId, patternId) {
        if (era === 'gof') {
            const cat = state.data.gof_categories.find(c => c.id === groupId);
            return cat ? cat.patterns.find(p => p.id === patternId) : null;
        } else {
            const group = state.data.distributed_groups.find(g => g.id === groupId);
            return group ? group.patterns.find(p => p.id === patternId) : null;
        }
    }

    function openDetail(era, groupId, patternId) {
        const pattern = findPattern(era, groupId, patternId);
        if (!pattern) return;

        const panel = document.getElementById('evo-detail');
        const body = panel.querySelector('.evo-detail-body');
        const closeBtn = panel.querySelector('.evo-detail-close');
        const eraLabel = era === 'gof' ? state.text.erasGoF : state.text.erasDist;

        const primary = state.lang === 'zh' ? pattern.name_zh : pattern.name_en;
        const secondary = state.lang === 'zh' ? pattern.name_en : pattern.name_zh;

        let inner = `
            <h3>${primary}</h3>
            ${secondary && secondary !== primary ? `<div style="font-size:0.95rem;color:var(--color-text-muted);margin-top:-0.3rem;margin-bottom:0.5rem;font-style:italic;">${secondary}</div>` : ''}
            <div class="evo-detail-era">${eraLabel}</div>
        `;

        if (pattern.status === 'pending') {
            inner += `
                <div class="evo-detail-pending">
                    <h4>${state.text.pendingTitle}</h4>
                    <p>${state.text.pendingBody}</p>
                </div>
            `;
        } else {
            const orig = nameOf(pattern, 'original_problem');
            const assumption = nameOf(pattern, 'default_assumption');
            const counterpart = nameOf(pattern, 'agent_counterpart');
            const oneLiner = nameOf(pattern, 'one_liner');
            const agentTerm = nameOf(pattern, 'agent_term');

            inner += `
                <div class="evo-detail-section">
                    <h4>${state.text.origPro}</h4>
                    <p>${orig}</p>
                </div>
                <div class="evo-detail-section">
                    <h4>${state.text.assumption}</h4>
                    <p>${assumption}</p>
                </div>
                <div class="evo-detail-arrow">${state.text.arrow}</div>
                <div class="evo-detail-section">
                    <h4>${state.text.agentEra}</h4>
                    ${agentTerm ? `<span class="evo-detail-agent-term">${agentTerm}</span>` : ''}
                    <p>${counterpart}</p>
                </div>
                <div class="evo-detail-collapse">
                    ${oneLiner}
                </div>
            `;
        }

        body.innerHTML = inner;
        closeBtn.setAttribute('aria-label', state.text.close);
        panel.hidden = false;
        showBackdrop();
        document.body.style.overflow = 'hidden';

        // Reset scroll inside the panel for repeat opens
        panel.scrollTop = 0;
    }

    function closeDetail() {
        const panel = document.getElementById('evo-detail');
        if (!panel || panel.hidden) return;
        panel.hidden = true;
        hideBackdrop();
        document.body.style.overflow = '';
    }

    /* --------------------------------------------------------------
       Backdrop
       -------------------------------------------------------------- */
    function showBackdrop() {
        let bd = document.querySelector('.evo-backdrop');
        if (!bd) {
            bd = document.createElement('div');
            bd.className = 'evo-backdrop';
            bd.addEventListener('click', closeDetail);
            document.body.appendChild(bd);
        }
        // force reflow before adding class so transition runs
        void bd.offsetWidth;
        bd.classList.add('is-visible');
    }

    function hideBackdrop() {
        const bd = document.querySelector('.evo-backdrop');
        if (bd) {
            bd.classList.remove('is-visible');
            setTimeout(() => bd.remove(), 200);
        }
    }

    /* --------------------------------------------------------------
       Wiring
       -------------------------------------------------------------- */
    function attachClickHandlers() {
        document.addEventListener('click', (e) => {
            const cell = e.target.closest('.evo-cell');
            if (cell) {
                const era = cell.dataset.era;
                const group = cell.dataset.group;
                const id = cell.dataset.patternId;
                openDetail(era, group, id);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeDetail();
        });

        const closeBtn = document.querySelector('.evo-detail-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeDetail);
        }
    }

    /* --------------------------------------------------------------
       Public API
       -------------------------------------------------------------- */
    async function init(opts) {
        state.lang = opts.lang || 'en';
        state.text = I18N[state.lang] || I18N.en;
        try {
            state.data = await loadData(opts.dataUrl || 'data.json');
            renderGoF();
            renderDistributed();
            attachClickHandlers();
        } catch (err) {
            console.error('Pattern Evolution init failed:', err);
            const main = document.querySelector('main');
            if (main) {
                const msg = document.createElement('div');
                msg.style.cssText = 'background:#fff8ee;border:1px solid #c8702a;padding:1rem;margin:2rem 0;border-radius:4px;';
                msg.textContent = state.lang === 'zh'
                    ? '数据加载失败。该页面需要通过 HTTP 服务器访问（本地直接打开 file:// 会被浏览器阻止 fetch）。'
                    : 'Data load failed. This page must be served over HTTP (browsers block fetch on file://).';
                main.appendChild(msg);
            }
        }
    }

    window.PatternEvolution = { init };
})();
