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
                let blocked = false;
                try {
                    blocked = iframe.contentDocument && iframe.contentDocument.body && iframe.contentDocument.body.innerHTML === '';
                } catch (e) {
                    // Cross-origin or blocked
                    blocked = true;
                }
                if (blocked) {
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
                    msgP.textContent = 'This site does not allow itself to be displayed in iframes. Please open it in a new tab.';

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

    let layout = 1;
    let urls = ['', '', '', ''];
    if (hasSplit) {
        layout = numPanels;
        urls = [leftUrl || '', rightUrl || '', panel3Url || '', panel4Url || ''];
    }

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

    // Add click event for the Alt+A button
    const altABtn = document.getElementById('alt-a-btn');
    if (altABtn) {
        altABtn.addEventListener('click', function () {
            window.open(
                'popup.html',
                'Active Tab Split',
                'width=400,height=600,resizable=no'
            );
        });
    }
};

function openLayoutPicker() {
    if (chrome && chrome.windows && chrome.runtime && chrome.runtime.getURL) {
        chrome.windows.create({
            url: chrome.runtime.getURL('popup.html'),
            type: 'popup',
            width: 420,
            height: 600
        });
    }
}

window.addEventListener('keydown', function (e) {
    if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        // Open the popup window (mini-app)
        openLayoutPicker();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const layoutPicker = document.getElementById('layout-picker');
    const panelsContainer = document.getElementById('panels');
    const widthSlider = document.getElementById('width-slider');
    const heightSlider = document.getElementById('height-slider');
    const widthValue = document.getElementById('width-value');
    const heightValue = document.getElementById('height-value');

    // Control mode elements
    const noControlsBtn = document.getElementById('no-controls-btn');
    const globalOnlyBtn = document.getElementById('global-only-btn');
    const individualOnlyBtn = document.getElementById('individual-only-btn');
    const bothControlsBtn = document.getElementById('both-controls-btn');
    const globalControls = document.getElementById('global-controls');
    const individualControls = document.getElementById('individual-controls');

    // Store individual panel dimensions
    let individualPanelSizes = [];
    let currentLayout = '';
    let individualControlsActive = false;
    let controlMode = 'global-only'; // 'no-controls', 'global-only', 'individual-only', 'both'

    // Initialize individual panel sizes
    function initializeIndividualSizes() {
        const panels = document.querySelectorAll('.panel');
        individualPanelSizes = Array.from(panels).map(() => ({
            width: 100, // percentage
            height: 100 // percentage
        }));
        console.log('Initialized individual panel sizes:', individualPanelSizes);
    }

    // Control mode switching functions
    function switchControlMode(mode) {
        controlMode = mode;

        // Update button states
        document.querySelectorAll('.control-mode-btn').forEach(btn => btn.classList.remove('active'));

        switch (mode) {
            case 'no-controls':
                noControlsBtn.classList.add('active');
                globalControls.style.display = 'none';
                if (individualControls) individualControls.style.display = 'none';
                switchToIndividualMode(false);
                // Ensure 4-panel layout stays in 2x2 grid for clean view
                if (currentLayout === 'four-panel') {
                    setTimeout(() => ensure4PanelGrid(), 50);
                }
                break;

            case 'global-only':
                globalOnlyBtn.classList.add('active');
                globalControls.style.display = 'flex';
                if (individualControls) individualControls.style.display = 'none';
                switchToIndividualMode(false);
                // Ensure 4-panel layout stays in 2x2 grid
                if (currentLayout === 'four-panel') {
                    setTimeout(() => ensure4PanelGrid(), 50);
                }
                break;

            case 'individual-only':
                individualOnlyBtn.classList.add('active');
                globalControls.style.display = 'none';
                if (individualControls) individualControls.style.display = 'block';
                // Force setup individual controls
                setTimeout(setupIndividualControls, 100);
                break;

            case 'both':
                bothControlsBtn.classList.add('active');
                globalControls.style.display = 'flex';
                if (individualControls) individualControls.style.display = 'block';
                // Force setup individual controls
                setTimeout(setupIndividualControls, 100);
                break;
        }

        console.log('Switched to control mode:', mode);
    }

    // Ensure 4-panel layout maintains 2x2 grid structure
    function ensure4PanelGrid() {
        if (currentLayout !== 'four-panel') return;

        const panelsContainer = document.getElementById('panels');
        const panels = document.querySelectorAll('.panel');

        // Force 2x2 grid setup
        panelsContainer.style.display = 'grid';
        panelsContainer.style.gridTemplateColumns = '1fr 1fr';
        panelsContainer.style.gridTemplateRows = '1fr 1fr';
        panelsContainer.style.gap = '1rem';

        // Ensure each panel is in correct grid position
        panels.forEach((panel, index) => {
            const row = Math.floor(index / 2) + 1; // Row 1 or 2
            const col = (index % 2) + 1;           // Column 1 or 2
            panel.style.gridRow = `${row}`;
            panel.style.gridColumn = `${col}`;
            panel.style.width = '100%';
            panel.style.justifySelf = 'stretch';
            panel.style.alignSelf = 'stretch';

            // Clear any interfering flexbox styles
            panel.style.flexBasis = '';
            panel.style.flexGrow = '';
            panel.style.flexShrink = '';
        });

        console.log('Enforced 4-panel 2x2 grid structure');
    }

    // Control mode button event listeners
    if (noControlsBtn) {
        noControlsBtn.addEventListener('click', () => switchControlMode('no-controls'));
    }
    if (globalOnlyBtn) {
        globalOnlyBtn.addEventListener('click', () => switchControlMode('global-only'));
    }
    if (individualOnlyBtn) {
        individualOnlyBtn.addEventListener('click', () => switchControlMode('individual-only'));
    }
    if (bothControlsBtn) {
        bothControlsBtn.addEventListener('click', () => switchControlMode('both'));
    }

    // Handle width slider
    widthSlider.addEventListener('input', function () {
        const width = this.value;
        widthValue.textContent = width + '%';
        panelsContainer.style.maxWidth = width + 'vw';
    });

    // Handle height slider
    heightSlider.addEventListener('input', function () {
        const height = this.value;
        heightValue.textContent = height + 'vh';
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            panel.style.height = height + 'vh';
        });
    });

    // Switch between grid and individual layout modes
    function switchToIndividualMode(enable = true) {
        const panelsContainer = document.getElementById('panels');
        const panels = document.querySelectorAll('.panel');

        if (enable && !individualControlsActive) {
            individualControlsActive = true;
            console.log('Switching to individual control mode');

            if (currentLayout === 'four-panel') {
                // For 4-panel, ALWAYS maintain 2x2 grid structure
                panelsContainer.style.display = 'grid';
                panelsContainer.style.gridTemplateColumns = '1fr 1fr'; // Always 2 columns
                panelsContainer.style.gridTemplateRows = '1fr 1fr';    // Always 2 rows
                panelsContainer.style.gap = '1rem'; // Maintain gap

                // Explicitly position each panel in the 2x2 grid
                panels.forEach((panel, index) => {
                    // Force explicit grid positioning for 2x2 matrix
                    const row = Math.floor(index / 2) + 1; // Row 1 or 2
                    const col = (index % 2) + 1;           // Column 1 or 2
                    panel.style.gridRow = `${row}`;
                    panel.style.gridColumn = `${col}`;

                    // Ensure panels fill their grid cells
                    panel.style.width = '100%';
                    panel.style.justifySelf = 'stretch';
                    panel.style.alignSelf = 'stretch';

                    // Reset any interfering styles
                    panel.style.flexBasis = '';
                    panel.style.flexGrow = '';
                    panel.style.flexShrink = '';
                });

            } else {
                // For 2-panel and 3-panel, use flexbox
                panelsContainer.style.display = 'flex';
                panelsContainer.style.flexWrap = 'nowrap';
                panelsContainer.style.flexDirection = 'row';
                panelsContainer.style.gap = '1rem';

                // Reset grid styles that might interfere
                panelsContainer.style.gridTemplateColumns = '';
                panelsContainer.style.gridTemplateRows = '';

                // Apply flexbox layout
                panels.forEach((panel, index) => {
                    const size = individualPanelSizes[index] || { width: 100, height: 100 };
                    panel.style.flexBasis = size.width + '%';
                    panel.style.width = size.width + '%';
                    panel.style.flexGrow = '0';
                    panel.style.flexShrink = '1';

                    // Reset grid styles
                    panel.style.gridRow = '';
                    panel.style.gridColumn = '';
                    panel.style.justifySelf = '';
                    panel.style.alignSelf = '';

                    // Apply height with base height consideration
                    const baseHeight = parseInt(document.getElementById('height-value').textContent) || 70;
                    const actualHeight = (baseHeight * size.height / 100);
                    panel.style.height = actualHeight + 'vh';
                });
            }

        } else if (!enable && individualControlsActive) {
            individualControlsActive = false;
            console.log('Switching back to grid mode');

            if (currentLayout === 'four-panel') {
                // For 4-panel, maintain 2x2 grid structure even in global mode
                panelsContainer.style.display = 'grid';
                panelsContainer.style.gridTemplateColumns = '1fr 1fr';
                panelsContainer.style.gridTemplateRows = '1fr 1fr';
                panelsContainer.style.gap = '1rem';

                // Ensure 2x2 positioning
                panels.forEach((panel, index) => {
                    const row = Math.floor(index / 2) + 1;
                    const col = (index % 2) + 1;
                    panel.style.gridRow = `${row}`;
                    panel.style.gridColumn = `${col}`;
                    panel.style.width = '100%';
                    panel.style.justifySelf = 'stretch';
                    panel.style.alignSelf = 'stretch';
                });
            } else if (currentLayout === 'three-panel') {
                // For 3-panel, maintain side-by-side horizontal layout
                panelsContainer.style.display = 'grid';
                panelsContainer.style.gridTemplateColumns = '1fr 1fr 1fr';
                panelsContainer.style.gridTemplateRows = '';
                panelsContainer.style.gap = '1rem';

                // Reset any individual panel positioning
                panels.forEach((panel, index) => {
                    panel.style.gridRow = '';
                    panel.style.gridColumn = '';
                    panel.style.width = '';
                    panel.style.justifySelf = '';
                    panel.style.alignSelf = '';
                });

                // Restore original grid class
                panelsContainer.className = 'panels three-panel';
            } else if (currentLayout === 'two-panel') {
                // For 2-panel, maintain side-by-side horizontal layout
                panelsContainer.style.display = 'grid';
                panelsContainer.style.gridTemplateColumns = '1fr 1fr';
                panelsContainer.style.gridTemplateRows = '';
                panelsContainer.style.gap = '1rem';

                // Reset any individual panel positioning
                panels.forEach((panel, index) => {
                    panel.style.gridRow = '';
                    panel.style.gridColumn = '';
                    panel.style.width = '';
                    panel.style.justifySelf = '';
                    panel.style.alignSelf = '';
                });

                // Restore original grid class
                panelsContainer.className = 'panels two-panel';
            } else {
                // Reset to original grid layout for other layouts
                panelsContainer.style.display = 'grid';
                panelsContainer.style.gridTemplateColumns = '';
                panelsContainer.style.gridTemplateRows = '';
                panelsContainer.style.gap = '';

                // Restore original grid classes
                const originalClass = getGridClass(parseInt(currentLayout.replace('-panel', '')));
                panelsContainer.className = 'panels ' + originalClass;
            }

            // Reset flexbox styles
            panelsContainer.style.flexWrap = '';
            panelsContainer.style.flexDirection = '';
            panelsContainer.style.alignContent = '';

            // Reset individual panel styles
            panels.forEach(panel => {
                if (currentLayout !== 'four-panel') {
                    panel.style.width = '';
                    panel.style.height = '';
                    panel.style.gridRow = '';
                    panel.style.gridColumn = '';
                    panel.style.justifySelf = '';
                    panel.style.alignSelf = '';
                }
                panel.style.flexBasis = '';
                panel.style.flexGrow = '';
                panel.style.flexShrink = '';
            });
        }
    }

    // Update individual panel size with responsive grid
    function updateIndividualPanelSize(panelIndex, newSize, isWidth = true) {
        if (!individualControlsActive) return;

        const panels = document.querySelectorAll('.panel');
        const panelsContainer = document.getElementById('panels');
        const panel = panels[panelIndex];

        if (!panel) return;

        // Update stored size
        if (isWidth) {
            individualPanelSizes[panelIndex].width = newSize;
        } else {
            individualPanelSizes[panelIndex].height = newSize;
        }

        if (currentLayout === 'four-panel') {
            // Get individual panel width preferences
            const panel1Width = individualPanelSizes[0].width; // Top-left
            const panel2Width = individualPanelSizes[1].width; // Top-right
            const panel3Width = individualPanelSizes[2].width; // Bottom-left
            const panel4Width = individualPanelSizes[3].width; // Bottom-right

            // Calculate column weights based on the larger panel in each column
            const leftColumnWeight = Math.max(panel1Width, panel3Width);
            const rightColumnWeight = Math.max(panel2Width, panel4Width);

            // Calculate fractional units to fill all space
            const totalWeight = leftColumnWeight + rightColumnWeight;
            const leftFraction = totalWeight > 0 ? leftColumnWeight / totalWeight : 0.5;
            const rightFraction = totalWeight > 0 ? rightColumnWeight / totalWeight : 0.5;

            // Apply responsive grid that fills all available space
            panelsContainer.style.display = 'grid';
            panelsContainer.style.gridTemplateColumns = `${leftFraction}fr ${rightFraction}fr`;
            panelsContainer.style.gridTemplateRows = '1fr 1fr';
            panelsContainer.style.gap = '1rem';

            // Make each panel fill its grid cell completely (like CSS Grid reference)
            panels.forEach((p, index) => {
                const size = individualPanelSizes[index];

                // Grid positioning
                const row = Math.floor(index / 2) + 1; // Row 1 or 2
                const col = (index % 2) + 1;           // Column 1 or 2
                p.style.gridRow = `${row}`;
                p.style.gridColumn = `${col}`;

                // Fill grid cell completely - no empty space
                p.style.width = '100%';
                p.style.justifySelf = 'stretch';

                // Apply individual height control
                const baseHeight = parseInt(document.getElementById('height-value').textContent) || 70;
                const actualHeight = (baseHeight * size.height / 100);
                p.style.height = actualHeight + 'vh';
                p.style.alignSelf = 'start';
            });

            console.log('Grid columns:', `${(leftFraction * 100).toFixed(1)}% | ${(rightFraction * 100).toFixed(1)}%`);

        } else {
            // For 2-panel and 3-panel flexbox layouts
            if (isWidth) {
                const totalPanels = panels.length;
                const targetTotalWidth = 100 * totalPanels;

                // Calculate current total width
                const currentTotalWidth = individualPanelSizes.reduce((sum, size) => sum + size.width, 0);

                // If total exceeds target, redistribute the excess
                if (currentTotalWidth > targetTotalWidth) {
                    const excess = currentTotalWidth - targetTotalWidth;
                    const otherPanelCount = totalPanels - 1;

                    if (otherPanelCount > 0) {
                        const reductionPerPanel = excess / otherPanelCount;
                        individualPanelSizes.forEach((size, index) => {
                            if (index !== panelIndex) {
                                size.width = Math.max(10, size.width - reductionPerPanel);
                            }
                        });
                    }
                }
            }

            // Apply the new sizes to all panels
            panels.forEach((p, index) => {
                const size = individualPanelSizes[index];
                p.style.width = size.width + '%';
                p.style.flexBasis = size.width + '%';

                // Apply height (with base height consideration)
                const baseHeight = parseInt(document.getElementById('height-value').textContent) || 70;
                const actualHeight = (baseHeight * size.height / 100);
                p.style.height = actualHeight + 'vh';
            });
        }

        console.log('Updated individual panel sizes:', individualPanelSizes);
    }

    // Handle individual panel controls
    function setupIndividualControls() {
        const panels = document.querySelectorAll('.panel');
        const individualControls = document.getElementById('individual-controls');
        const panelControlsGrid = document.getElementById('panel-controls-grid');
        const panelsContainer = document.getElementById('panels');

        if (!individualControls || !panelControlsGrid) return;

        if (panels.length > 1 && (controlMode === 'individual-only' || controlMode === 'both')) {
            // Detect current layout
            const layoutClass = [...panelsContainer.classList].find(cls => cls.includes('-panel'));
            currentLayout = layoutClass;

            // For 4-panel, ensure it's detected correctly even if panels are stacked
            if (panels.length === 4 && !currentLayout) {
                currentLayout = 'four-panel';
            }

            individualControls.style.display = 'block';
            panelControlsGrid.innerHTML = '';

            // Initialize individual panel sizes and switch to individual mode
            initializeIndividualSizes();
            switchToIndividualMode(true);

            // Extra enforcement for 4-panel layout
            if (currentLayout === 'four-panel') {
                setTimeout(() => ensure4PanelGrid(), 50);
            }

            panels.forEach((panel, index) => {
                const panelNum = index + 1;
                panel.id = `panel-${panelNum}`;

                const controlDiv = document.createElement('div');
                controlDiv.className = 'individual-panel-control';
                controlDiv.innerHTML = `
                    <h4>Panel ${panelNum}</h4>
                    <div class="panel-control-row">
                        <label>Width:</label>
                        <input type="range" class="panel-width-slider" data-panel="${panelNum}" data-index="${index}" min="10" max="200" value="100" step="5">
                        <span class="panel-width-value">100%</span>
                    </div>
                    <div class="panel-control-row">
                        <label>Height:</label>
                        <input type="range" class="panel-height-slider" data-panel="${panelNum}" data-index="${index}" min="20" max="200" value="100" step="5">
                        <span class="panel-height-value">100%</span>
                    </div>
                `;
                panelControlsGrid.appendChild(controlDiv);
            });

            // Add event listeners to all panel control sliders
            document.querySelectorAll('.panel-width-slider').forEach(slider => {
                slider.addEventListener('input', function () {
                    const panelIndex = parseInt(this.dataset.index);
                    const percentage = parseInt(this.value);
                    const valueSpan = this.parentElement.querySelector('.panel-width-value');

                    if (valueSpan) {
                        valueSpan.textContent = percentage + '%';
                        updateIndividualPanelSize(panelIndex, percentage, true);
                    }
                });
            });

            document.querySelectorAll('.panel-height-slider').forEach(slider => {
                slider.addEventListener('input', function () {
                    const panelIndex = parseInt(this.dataset.index);
                    const percentage = parseInt(this.value);
                    const valueSpan = this.parentElement.querySelector('.panel-height-value');

                    if (valueSpan) {
                        valueSpan.textContent = percentage + '%';
                        updateIndividualPanelSize(panelIndex, percentage, false);
                    }
                });
            });

            console.log('Individual controls setup complete for layout:', currentLayout);
        } else {
            if (controlMode !== 'individual-only') {
                individualControls.style.display = 'none';
            }
            // Switch back to grid mode when no individual controls or in global-only/no-controls mode
            if (controlMode === 'global-only' || controlMode === 'no-controls') {
                switchToIndividualMode(false);
            }
        }
    }

    // Watch for panel changes and setup controls
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                console.log('Panel changes detected, reinitializing controls');
                setTimeout(setupIndividualControls, 100);
            }
        });
    });

    observer.observe(panelsContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });

    // Initial setup
    setTimeout(() => {
        setupIndividualControls();
        // Set initial control mode
        switchControlMode('global-only');
    }, 500);

    // ... existing code ...
}); 