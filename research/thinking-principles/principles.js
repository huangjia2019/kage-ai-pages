/* ========================================================================
   Thinking Principles — data-driven table renderer.
   ======================================================================== */

(function () {
    'use strict';

    const I18N = {
        en: {
            search: 'Search',
            searchPlaceholder: 'principle, thinker, problem, practice...',
            era: 'Era',
            allEras: 'All eras',
            domain: 'Domain',
            allDomains: 'All domains',
            result: 'principle',
            results: 'principles',
            name: 'Principle',
            problem: 'Problem it solved',
            principle: 'Core move',
            reversal: 'Reversal',
            practice: 'Practice question',
            source: 'Source',
            empty: 'No matching principles. Try a broader search.'
        },
        zh: {
            search: '搜索',
            searchPlaceholder: '原则、思想家、问题、练习...',
            era: '时代',
            allEras: '全部时代',
            domain: '领域',
            allDomains: '全部领域',
            result: '条原则',
            results: '条原则',
            name: '原则',
            problem: '它解决的问题',
            principle: '核心动作',
            reversal: '反转',
            practice: '练习问题',
            source: '来源',
            empty: '没有匹配的原则，试试放宽搜索。'
        }
    };

    let state = {
        lang: 'en',
        data: { criteria: [], items: [] },
        items: [],
        text: I18N.en
    };

    function escapeHTML(s) {
        return String(s || '').replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function v(obj, key) {
        if (state.lang === 'zh') {
            return obj[key + '_zh'] || obj[key] || obj[key + '_en'] || '';
        }
        return obj[key + '_en'] || obj[key] || '';
    }

    function normalize(s) {
        return String(s || '').toLowerCase();
    }

    async function loadData(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load thinking principles data');
        return res.json();
    }

    function renderCriteria() {
        const root = document.getElementById('tp-criteria');
        if (!root) return;
        root.innerHTML = state.data.criteria.map(p => `
            <div class="tp-criterion">
                <strong>${escapeHTML(v(p, 'label'))}</strong>
                <span>${escapeHTML(v(p, 'text'))}</span>
            </div>
        `).join('');
    }

    function uniqueBy(items, getter) {
        return Array.from(new Set(items.map(getter).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    }

    function populateFilters() {
        const eraSelect = document.getElementById('tp-era');
        const domainSelect = document.getElementById('tp-domain');
        if (!eraSelect || !domainSelect) return;

        const eras = uniqueBy(state.data.items, item => v(item, 'era'));
        eraSelect.innerHTML = `<option value="">${escapeHTML(state.text.allEras)}</option>` +
            eras.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('');

        const domains = uniqueBy(state.data.items, item => v(item, 'domain'));
        domainSelect.innerHTML = `<option value="">${escapeHTML(state.text.allDomains)}</option>` +
            domains.map(t => `<option value="${escapeHTML(t)}">${escapeHTML(t)}</option>`).join('');
    }

    function itemMatches(item, query, era, domain) {
        if (era && v(item, 'era') !== era) return false;
        if (domain && v(item, 'domain') !== domain) return false;
        if (!query) return true;
        const haystack = [
            v(item, 'name'), v(item, 'source'), v(item, 'era'), v(item, 'domain'),
            item.year, v(item, 'problem'), v(item, 'principle'), v(item, 'reversal'),
            v(item, 'practice')
        ].map(normalize).join(' ');
        return haystack.includes(query);
    }

    function renderRow(item) {
        return `
            <tr>
                <td>
                    <a class="tp-name" href="${escapeHTML(item.link)}" target="_blank" rel="noopener">${escapeHTML(v(item, 'name'))}</a>
                    <span class="tp-small">${escapeHTML(v(item, 'source'))}</span>
                    <div class="tp-badges">
                        <span class="tp-badge">${escapeHTML(item.year)}</span>
                        <span class="tp-badge secondary">${escapeHTML(v(item, 'era'))}</span>
                    </div>
                </td>
                <td>${escapeHTML(v(item, 'problem'))}</td>
                <td><strong>${escapeHTML(v(item, 'principle'))}</strong></td>
                <td>${escapeHTML(v(item, 'reversal'))}</td>
                <td>${escapeHTML(v(item, 'practice'))}</td>
                <td>
                    <a href="${escapeHTML(item.link)}" target="_blank" rel="noopener">${escapeHTML(state.text.source)}</a>
                    <span class="tp-small">${escapeHTML(v(item, 'domain'))}</span>
                </td>
            </tr>
        `;
    }

    function applyFilters() {
        const q = normalize(document.getElementById('tp-search')?.value);
        const era = document.getElementById('tp-era')?.value || '';
        const domain = document.getElementById('tp-domain')?.value || '';
        state.items = state.data.items.filter(item => itemMatches(item, q, era, domain));
        renderTable();
    }

    function renderTable() {
        const tableRoot = document.getElementById('tp-table-root');
        const countRoot = document.getElementById('tp-count');
        if (!tableRoot) return;

        if (countRoot) {
            const n = state.items.length;
            countRoot.textContent = `${n} ${n === 1 ? state.text.result : state.text.results}`;
        }

        if (!state.items.length) {
            tableRoot.innerHTML = `<div class="tp-empty">${escapeHTML(state.text.empty)}</div>`;
            return;
        }

        tableRoot.innerHTML = `
            <div class="tp-table-wrap">
                <table class="tp-table">
                    <thead>
                        <tr>
                            <th>${escapeHTML(state.text.name)}</th>
                            <th>${escapeHTML(state.text.problem)}</th>
                            <th>${escapeHTML(state.text.principle)}</th>
                            <th>${escapeHTML(state.text.reversal)}</th>
                            <th>${escapeHTML(state.text.practice)}</th>
                            <th>${escapeHTML(state.text.source)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.items.map(renderRow).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function attachHandlers() {
        ['tp-search', 'tp-era', 'tp-domain'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', applyFilters);
        });
    }

    async function init(opts) {
        state.lang = opts.lang || 'en';
        state.text = I18N[state.lang] || I18N.en;
        state.data = await loadData(opts.dataUrl || 'data.json');
        state.items = state.data.items.slice();
        renderCriteria();
        populateFilters();
        renderTable();
        attachHandlers();
    }

    window.ThinkingPrinciples = { init };
})();

