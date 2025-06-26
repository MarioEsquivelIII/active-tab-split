let numPanels = 2;
let allTabs = [];

function renderTabSelectors() {
    const container = document.getElementById('tabSelectors');
    container.innerHTML = '';
    for (let i = 0; i < numPanels; i++) {
        const select = document.createElement('select');
        select.name = `panel${i + 1}`;
        select.required = true;
        allTabs.forEach(tab => {
            if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
                const option = document.createElement('option');
                option.value = tab.id;
                option.textContent = tab.title || tab.url;
                select.appendChild(option);
            }
        });
        container.appendChild(document.createTextNode(`Panel ${i + 1}: `));
        container.appendChild(select);
        container.appendChild(document.createElement('br'));
    }
}

function setLayoutButtons() {
    document.querySelectorAll('.layout-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.panels == numPanels);
        btn.onclick = () => {
            numPanels = parseInt(btn.dataset.panels, 10);
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
    let url = `splitview.html?left=${encodeURIComponent(tabUrls[0])}&right=${encodeURIComponent(tabUrls[1])}`;
    if (numPanels > 2) url += `&panel3=${encodeURIComponent(tabUrls[2])}`;
    if (numPanels > 3) url += `&panel4=${encodeURIComponent(tabUrls[3])}`;
    // Update the current tab to the splitview page
    chrome.tabs.update(window.activeTabId, { url });
}; 