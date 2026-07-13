/* ========================================================================
   Classic Insights — data-driven table renderer.
   ======================================================================== */

(function () {
    'use strict';

    const I18N = {
        en: {
            search: 'Search',
            searchPlaceholder: 'book, author, insight, problem...',
            category: 'Category',
            allCategories: 'All categories',
            type: 'Type',
            allTypes: 'All types',
            result: 'result',
            results: 'results',
            work: 'Work',
            problem: 'Problem it answered',
            insight: 'Defining insight',
            reversal: 'Reversal',
            why: 'Why it travelled',
            access: 'Access',
            empty: 'No matching works. Try a broader search.',
            source: 'source',
            secondary: 'extra'
        },
        zh: {
            search: '搜索',
            searchPlaceholder: '书名、作者、洞见、问题...',
            category: '类别',
            allCategories: '全部类别',
            type: '类型',
            allTypes: '全部类型',
            result: '条结果',
            results: '条结果',
            work: '作品',
            problem: '它回答的问题',
            insight: '定义性洞见',
            reversal: '反转',
            why: '为什么能传播',
            access: '学习入口',
            empty: '没有匹配的作品，试试放宽搜索。',
            source: '来源',
            secondary: '补充'
        }
    };

    let state = {
        lang: 'en',
        data: { principles: [], items: [] },
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
        if (!res.ok) throw new Error('Failed to load classic insights data');
        return res.json();
    }

    function renderPrinciples() {
        const root = document.getElementById('classic-principles');
        if (!root) return;
        root.innerHTML = state.data.principles.map(p => `
            <div class="classic-principle">
                <strong>${escapeHTML(v(p, 'label'))}</strong>
                <span>${escapeHTML(v(p, 'text'))}</span>
            </div>
        `).join('');
    }

    function uniqueBy(items, getter) {
        return Array.from(new Set(items.map(getter).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    }

    function populateFilters() {
        const categorySelect = document.getElementById('classic-category');
        const typeSelect = document.getElementById('classic-type');
        if (!categorySelect || !typeSelect) return;

        const categories = uniqueBy(state.data.items, item => v(item, 'category'));
        categorySelect.innerHTML = `<option value="">${escapeHTML(state.text.allCategories)}</option>` +
            categories.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('');

        const types = uniqueBy(state.data.items, item => item.type);
        typeSelect.innerHTML = `<option value="">${escapeHTML(state.text.allTypes)}</option>` +
            types.map(t => `<option value="${escapeHTML(t)}">${escapeHTML(t)}</option>`).join('');
    }

    function itemMatches(item, query, category, type) {
        if (category && v(item, 'category') !== category) return false;
        if (type && item.type !== type) return false;
        if (!query) return true;
        const haystack = [
            item.title, item.title_zh, item.author, item.year, item.type,
            v(item, 'category'), v(item, 'problem'), v(item, 'insight'),
            v(item, 'reversal'), v(item, 'why')
        ].map(normalize).join(' ');
        return haystack.includes(query);
    }

    function renderRow(item) {
        const title = state.lang === 'zh' ? (item.title_zh || item.title) : item.title;
        const secondaryTitle = state.lang === 'zh' && item.title ? item.title : item.title_zh;
        const secondaryLink = item.secondary_link
            ? `<a href="${escapeHTML(item.secondary_link)}" target="_blank" rel="noopener">${escapeHTML(state.text.secondary)}</a>`
            : '';
        return `
            <tr>
                <td>
                    <a class="classic-work-title" href="${escapeHTML(item.link)}" target="_blank" rel="noopener">${escapeHTML(title)}</a>
                    ${secondaryTitle ? `<span class="classic-small">${escapeHTML(secondaryTitle)}</span>` : ''}
                    <span class="classic-author">${escapeHTML(item.author)}</span>
                    <div class="classic-badges">
                        <span class="classic-badge">${escapeHTML(item.year)}</span>
                        <span class="classic-badge secondary">${escapeHTML(item.type)}</span>
                    </div>
                </td>
                <td>${escapeHTML(v(item, 'problem'))}</td>
                <td><strong>${escapeHTML(v(item, 'insight'))}</strong></td>
                <td>${escapeHTML(v(item, 'reversal'))}</td>
                <td>${escapeHTML(v(item, 'why'))}</td>
                <td>
                    <a href="${escapeHTML(item.link)}" target="_blank" rel="noopener">${escapeHTML(v(item, 'access') || state.text.source)}</a>
                    ${secondaryLink ? `<span class="classic-small">${secondaryLink}</span>` : ''}
                    <span class="classic-small">${escapeHTML(v(item, 'category'))}</span>
                </td>
            </tr>
        `;
    }

    function applyFilters() {
        const q = normalize(document.getElementById('classic-search')?.value);
        const category = document.getElementById('classic-category')?.value || '';
        const type = document.getElementById('classic-type')?.value || '';
        state.items = state.data.items.filter(item => itemMatches(item, q, category, type));
        renderTable();
    }

    function renderTable() {
        const tableRoot = document.getElementById('classic-table-root');
        const countRoot = document.getElementById('classic-count');
        if (!tableRoot) return;

        if (countRoot) {
            const n = state.items.length;
            countRoot.textContent = `${n} ${n === 1 ? state.text.result : state.text.results}`;
        }

        if (!state.items.length) {
            tableRoot.innerHTML = `<div class="classic-empty">${escapeHTML(state.text.empty)}</div>`;
            return;
        }

        tableRoot.innerHTML = `
            <div class="classic-table-wrap">
                <table class="classic-table">
                    <thead>
                        <tr>
                            <th>${escapeHTML(state.text.work)}</th>
                            <th>${escapeHTML(state.text.problem)}</th>
                            <th>${escapeHTML(state.text.insight)}</th>
                            <th>${escapeHTML(state.text.reversal)}</th>
                            <th>${escapeHTML(state.text.why)}</th>
                            <th>${escapeHTML(state.text.access)}</th>
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
        ['classic-search', 'classic-category', 'classic-type'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', applyFilters);
        });
    }

    async function init(opts) {
        state.lang = opts.lang || 'en';
        state.text = I18N[state.lang] || I18N.en;
        state.data = await loadData(opts.dataUrl || 'data.json');
        state.items = state.data.items.slice();
        renderPrinciples();
        populateFilters();
        renderTable();
        attachHandlers();
    }

    window.ClassicInsights = { init };
})();

