let selectedLayout = '2-vertical';
let numPanels = 2;
let allTabs = [];

const layoutPanelCount = {
    '1-vertical': 1,
    '2-vertical': 2,
    '2-horizontal': 2,
    '3-vertical': 3,
    '3-horizontal': 3,
    '2x2-grid': 4
};

const knownBlockedSites = [
    'netflix.com',
    'google.com',
    'facebook.com',
    'instagram.com',
    'disneyplus.com',
    'hulu.com',
    'primevideo.com',
    'hbomax.com',
    'tiktok.com',
    'apple.com',
    'microsoft.com',
    'dropbox.com',
    'paypal.com',
    'bankofamerica.com',
    'chase.com',
    'wellsfargo.com',
    'twitter.com',
    'x.com',
    'linkedin.com',
    'outlook.com',
    'mail.google.com',
    'drive.google.com',
    'docs.google.com',
    'github.com'
];

function isLikelyBlocked(url) {
    try {
        const { hostname } = new URL(url);
        return knownBlockedSites.some(domain =>
            hostname === domain || hostname.endsWith('.' + domain)
        );
    } catch {
        return false;
    }
}

function warnIfBlocked(url) {
    if (isLikelyBlocked(url)) {
        alert('Warning: This site is known to block embedding in iframes and may not display.');
    }
}

function renderTabSelectors() {
    const container = document.getElementById('tabSelectors');
    container.innerHTML = '';
    for (let i = 0; i < numPanels; i++) {
        const select = document.createElement('select');
        select.name = `panel${i + 1}`;
        select.required = true;
        const blankOption = document.createElement('option');
        blankOption.value = '';
        blankOption.textContent = '-- Select a tab --';
        blankOption.disabled = false;
        blankOption.selected = true;
        select.appendChild(blankOption);
        allTabs.forEach(tab => {
            if (
                (tab.url.startsWith('http://') || tab.url.startsWith('https://')) &&
                !isLikelyBlocked(tab.url)
            ) {
                const option = document.createElement('option');
                option.value = tab.id;
                option.textContent = tab.title || tab.url;
                select.appendChild(option);
            }
        });
        select.addEventListener('change', (e) => {
            const tabId = parseInt(e.target.value, 10);
            const tab = allTabs.find(t => t.id === tabId);
            if (tab) warnIfBlocked(tab.url);
        });
        container.appendChild(document.createTextNode(`Panel ${i + 1}: `));
        container.appendChild(select);
        container.appendChild(document.createElement('br'));
    }
}

function setLayoutButtons() {
    document.querySelectorAll('.layout-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.layout === selectedLayout);
        btn.onclick = () => {
            selectedLayout = btn.dataset.layout;
            numPanels = layoutPanelCount[selectedLayout];
            setLayoutButtons();
            renderTabSelectors();
        };
    });
}

chrome.tabs.query({ currentWindow: true, active: true }, (activeTabs) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        allTabs = tabs;
        setLayoutButtons();
        renderTabSelectors();
        window.activeTabId = activeTabs[0].id;
    });
});

document.getElementById('splitForm').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const tabIds = Array.from(form.elements)
        .filter(el => el.tagName === 'SELECT')
        .map(el => parseInt(el.value, 10));
    const tabUrls = await Promise.all(tabIds.map(id => new Promise(resolve => {
        chrome.tabs.get(id, tab => resolve(tab.url));
    })));
    let url = `splitview.html?layout=${encodeURIComponent(selectedLayout)}`;
    if (tabUrls[0]) url += `&left=${encodeURIComponent(tabUrls[0])}`;
    if (tabUrls[1]) url += `&right=${encodeURIComponent(tabUrls[1])}`;
    if (tabUrls[2]) url += `&panel3=${encodeURIComponent(tabUrls[2])}`;
    if (tabUrls[3]) url += `&panel4=${encodeURIComponent(tabUrls[3])}`;
    // Open in current tab or new tab based on user selection
    const openMode = form.elements['openMode'].value;
    if (openMode === 'new') {
        chrome.tabs.create({ url });
    } else {
        chrome.tabs.update(window.activeTabId, { url });
    }
};

// Persist and restore popup state
function savePopupState() {
    chrome.storage.local.set({
        popupState: {
            selectedLayout,
            numPanels,
            tabIds: Array.from(document.getElementById('splitForm').elements)
                .filter(el => el.tagName === 'SELECT')
                .map(el => parseInt(el.value, 10))
        }
    });
}

function restorePopupState() {
    chrome.storage.local.get('popupState', (data) => {
        if (data.popupState) {
            selectedLayout = data.popupState.selectedLayout || selectedLayout;
            numPanels = data.popupState.numPanels || numPanels;
            setLayoutButtons();
            renderTabSelectors();
            // Restore tab selections
            const tabIds = data.popupState.tabIds || [];
            setTimeout(() => {
                const selects = document.querySelectorAll('#tabSelectors select');
                tabIds.forEach((id, i) => {
                    if (selects[i]) selects[i].value = id;
                });
            }, 100);
        }
    });
}

// Add close button logic
window.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closePopupBtn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            chrome.storage.local.set({ popupClosed: true });
            window.close();
        };
    }
});

// Save state on every change
const observer = new MutationObserver(savePopupState);
observer.observe(document.body, { childList: true, subtree: true });
document.body.addEventListener('change', savePopupState, true);

document.addEventListener('DOMContentLoaded', restorePopupState); 