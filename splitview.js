// splitview.js - Vanilla JS split view logic

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function getGridClass(layout) {
    switch (layout) {
        case 1: return 'one-panel';
        case 2: return 'two-panel';
        case 3: return 'three-panel';
        case 4: return 'four-panel';
        default: return '';
    }
}

function toYouTubeEmbed(url) {
    if (!url) return url;
    const match = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
    if (match) {
        const videoId = match[1];
        try {
            const urlObj = new URL(url);
            let embedUrl = `https://www.youtube.com/embed/${videoId}`;
            // Handle start time
            const t = urlObj.searchParams.get('t');
            if (t) {
                // Convert t to seconds if needed (e.g., t=1h2m3s or t=25131s)
                let seconds = 0;
                if (/^\d+$/.test(t)) {
                    seconds = parseInt(t, 10);
                } else {
                    // Convert formats like 1h2m3s to seconds
                    const regex = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/;
                    const parts = t.match(regex);
                    if (parts) {
                        seconds += parts[1] ? parseInt(parts[1], 10) * 3600 : 0;
                        seconds += parts[2] ? parseInt(parts[2], 10) * 60 : 0;
                        seconds += parts[3] ? parseInt(parts[3], 10) : 0;
                    }
                }
                embedUrl += `?start=${seconds}`;
            }
            return embedUrl;
        } catch (e) {
            // If URL parsing fails, fallback to basic embed
            return `https://www.youtube.com/embed/${videoId}`;
        }
    }
    return url;
}

function renderPanels(layout, urls, hasSplit) {
    const panelsDiv = document.getElementById('panels');
    panelsDiv.className = 'panels ' + getGridClass(layout);
    panelsDiv.innerHTML = '';
    for (let idx = 0; idx < layout; idx++) {
        const panel = document.createElement('div');
        panel.className = 'panel';
        if (!hasSplit) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Enter URL for panel ${idx + 1}`;
            input.value = urls[idx] || '';
            input.oninput = e => {
                urls[idx] = e.target.value;
                renderPanels(layout, urls, hasSplit);
            };
            panel.appendChild(input);
        }
        // Convert YouTube watch URLs to embed URLs
        const urlToLoad = toYouTubeEmbed(urls[idx] || '');
        const iframe = document.createElement('iframe');
        iframe.src = urlToLoad || 'about:blank';
        iframe.title = `Panel ${idx + 1}`;
        iframe.className = 'panel-iframe';
        panel.appendChild(iframe);

        // Add a timeout to detect if the iframe is blocked
        if (urls[idx] && !iframe.src.startsWith('https://www.youtube.com/embed/')) {
            setTimeout(() => {
                // Only check for blank iframe (if accessible)
                let isBlank = false;
                try {
                    isBlank = iframe.contentDocument && iframe.contentDocument.body && iframe.contentDocument.body.innerHTML === '';
                } catch (e) {
                    // Cross-origin, can't check, so assume it's fine!
                    isBlank = false;
                }
                if (isBlank) {
                    panel.innerHTML = '';
                    const warningDiv = document.createElement('div');
                    warningDiv.style.display = 'flex';
                    warningDiv.style.flexDirection = 'column';
                    warningDiv.style.alignItems = 'center';
                    warningDiv.style.justifyContent = 'center';
                    warningDiv.style.height = '100%';
                    warningDiv.style.color = '#b00';

                    const iconDiv = document.createElement('div');
                    iconDiv.style.fontSize = '2rem';
                    iconDiv.textContent = '⚠️';

                    const msgP = document.createElement('p');
                    msgP.style.margin = '0.5rem 0';
                    msgP.textContent = 'This site cannot be displayed here.';

                    const openBtn = document.createElement('button');
                    openBtn.textContent = 'Open in new tab';
                    openBtn.addEventListener('click', () => window.open(urls[idx], '_blank'));

                    warningDiv.appendChild(iconDiv);
                    warningDiv.appendChild(msgP);
                    warningDiv.appendChild(openBtn);
                    panel.appendChild(warningDiv);
                }
            }, 1500);
        }
        panelsDiv.appendChild(panel);
    }
}

window.onload = function () {
    // Read up to 4 panel URLs from query params
    const leftUrl = getQueryParam('left');
    const rightUrl = getQueryParam('right');
    const panel3Url = getQueryParam('panel3');
    const panel4Url = getQueryParam('panel4');
    const urlParams = [leftUrl, rightUrl, panel3Url, panel4Url];
    const numPanels = urlParams.filter(Boolean).length;
    const hasSplit = numPanels > 0;

    let layout = hasSplit ? numPanels : 1;
    let urls = hasSplit ? [leftUrl || '', rightUrl || '', panel3Url || '', panel4Url || ''] : ['', '', '', ''];

    // If not split, show a simple layout picker and update on change
    if (!hasSplit) {
        const picker = document.getElementById('layout-picker');
        picker.style.display = 'block';
        picker.onchange = function (e) {
            layout = parseInt(e.target.value, 10);
            renderPanels(layout, urls, false);
        };
    }

    renderPanels(layout, urls, hasSplit);
}; 