// ==/== AIRUX PRO - VERSÃO PRONTA PARA DEVTOOLS ==/==
// ==/== AIRUX PRO - VERSÃO OTIMIZADA PARA DEVTOOLS ==/==
if (window.airuxLoaded) {
    console.log('Airux já está carregado. Ignorando nova instância.');
} else {
    window.airuxLoaded = true;
    
    // Solução alternativa para CORS no DevTools
    window.GM_xmlhttpRequest = function(options) {
        return fetch(options.url, {
            method: options.method,
            headers: options.headers,
            body: options.data,
            mode: 'cors'
        })
        .then(response => response.arrayBuffer())
        .then(data => {
            const responseText = new TextDecoder().decode(data);
            options.onload({
                response: data,
                status: 200,
                responseText: responseText
            });
        })
        .catch(error => options.onerror(error));
    };

    window.GM_notification = function(options) {
        console.log(`[NOTIFICAÇÃO] ${options.text}`);
        if (window.Notification && Notification.permission === 'granted') {
            new Notification(options.title, {body: options.text});
        }
    };

    // Carregar jQuery apenas se necessário
    if (!window.jQuery) {
        const jqScript = document.createElement('script');
        jqScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        jqScript.onload = initAirux;
        document.head.appendChild(jqScript);
    } else {
        setTimeout(initAirux, 100);
    }

    function initAirux() {
        (function() {
            'use strict';
            // ... O RESTO DO SEU CÓDIGO AQUI (CONFIG, STATE, ETC)
       
        })();
    }
    
    if (window.Notification && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}
            })


            .then(response => response.arrayBuffer())
            .then(data => {
                const responseText = new TextDecoder().decode(data);
                options.onload({
                    response: data,
                    status: 200,
                    responseText: responseText
                });
            })
            .catch(error => options.onerror(error));
        };

        window.GM_notification = function(options) {
            console.log(`[NOTIFICAÇÃO] ${options.text}`);
            if (window.Notification && Notification.permission === 'granted') {
                new Notification(options.title, {body: options.text});
            }
        };

        const jqScript = document.createElement('script');
        jqScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        jqScript.onload = () => {
            (function() {
                'use strict';

                // Configuração principal
                const CONFIG = {
                    name: "Airux Pro",
                    version: "2.0",
                    theme: {
                        colors: {
                            primary: "#1A1A1D",
                            secondary: "#2D2D32",
                            tertiary: "#3E3E44",
                            accent: "#BB86FC",
                            text: "#E0E0E0",
                            textSecondary: "#9E9E9E",
                            error: "#CF6679",
                            success: "#03DAC6",
                            warning: "#FFC107",
                            border: "#4A4A4F",
                            notificationBg: "rgba(45, 45, 50, 0.9)"
                        },
                        shadows: {
                            container: "0 8px 32px rgba(0, 0, 0, 0.5)",
                            button: "0 4px 8px rgba(0, 0, 0, 0.3)"
                        },
                        radius: "12px"
                    },
                    apiEndpoints: {
                        blackbox: "https://www.blackbox.ai/api/chat",
                        openai: "https://api.openai.com/v1/chat/completions",
                        deepseek: "https://api.deepseek.com/v1/chat/completions",
                        gemini: "https://generativelanguage.googleapis.com/v1beta/models/"
                    },
                    models: [
                        { id: "blackbox", name: "Blackbox Default", type: "blackbox", requiresKey: false },
                        { id: "meta-llama/Llama-3.1-70B-Instruct-Turbo", name: "Llama 3.1 Turbo", type: "blackbox", requiresKey: false },
                        { id: "deepseek-chat", name: "Deepseek Chat", type: "deepseek", requiresKey: true },
                        { id: "gpt-4o", name: "GPT-4o", type: "openai", requiresKey: true },
                        { id: "gemini-1.5-pro-latest", name: "Gemini Pro 1.5", type: "gemini", requiresKey: true },
                        { id: "gemini-1.5-flash-latest", name: "Gemini Flash 1.5", type: "gemini", requiresKey: true }
                    ],
                    API_KEYS_GEMINI: [
                        'AIzaSyBDdSZkgQphf5BORTDLcEUbJWcIAIo0Yr8',
                        'AIzaSyANp5yxdrdGL7RtOXy0LdIdkoKZ7cVPIsc'
                    ],
                    defaultModel: "blackbox",
                    timeout: 30000,
                    maxRetries: 3,
                    temperature: 0.7,
                    maxTokens: 2000,
                    notificationDuration: 5000,
                    SAFETY_SETTINGS_THRESHOLD: "BLOCK_MEDIUM_AND_ABOVE",
                    MAX_OUTPUT_TOKENS: 10
                };

                const IMAGE_FILTERS = {
                    blocked: [ /edusp-static\.ip\.tv\/sala-do-futuro\/(?:assets|icons?|logos?|buttons?|banners?)\//i, /s3\.sa-east-1\.amazonaws\.com\/edusp-static\.ip\.tv\/sala-do-futuro\/(?:assets|icons?|logos?|buttons?|banners?)\//i, /s3\.sa-east-1\.amazonaws\.com\/edusp-static\.ip\.tv\/room\/cards\//i, /conteudo_logo\.png$/i, /_thumb(?:nail)?\./i, /\.svg$/i ],
                    allowed: [ /edusp-static\.ip\.tv\/(?:tms|tarefas|exercicios)\//i, /\/atividade\/\d+\?eExame=true/i, /\.(?:jpg|png|jpeg|gif|webp)$/i, /lh[0-9]+(?:- G*)*\.googleusercontent\.com/i, /\/media\//i, /\/questao_\d+/i, /image\?/i ],
                    verify(src) {
                        if (!src || typeof src !== 'string' || !src.startsWith('http')) return false;
                        if (this.blocked.some(r => r.test(src))) return false;
                        return this.allowed.some(r => r.test(src));
                    }
                };

                const STATE = {
                    isActive: false,
                    isAnalyzing: false,
                    selectedModel: CONFIG.defaultModel,
                    apiKey: null,
                    lastResponse: null,
                    retryCount: 0,
                    images: [],
                    imageCache: {},
                    logMessages: [],
                    currentApiKeyIndex: 0,
                    rateLimitActive: false,
                    rateLimitTimeoutId: null
                };

                const elements = {
                    container: null,
                    input: null,
                    responseDiv: null,
                    submitBtn: null,
                    modelSelect: null,
                    apiKeyInput: null,
                    toggleBtn: null,
                    analyzeBtn: null,
                    updateImagesBtn: null,
                    clearBtn: null,
                    logsBtn: null,
                    imagesContainer: null
                };

                function logMessage(level, ...args) {
                    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    const message = args.map(arg => {
                        try { return typeof arg === 'object' ? JSON.stringify(arg) : String(arg); }
                        catch { return '[Object]'; }
                    }).join(' ');
                    STATE.logMessages.push({ timestamp, level, message });
                    if (STATE.logMessages.length > 300) STATE.logMessages.shift();
                    if (level === 'ERROR') console.error(`[Airux ${timestamp}]`, ...args);
                    else if (level === 'WARN') console.warn(`[Airux ${timestamp}]`, ...args);
                }

                function tryParseJSON(jsonString) {
                    try {
                        return JSON.parse(jsonString);
                    } catch (e) {
                        return null;
                    }
                }

                function calculateRetryDelay(retryCount) {
                    return Math.min(1000 * Math.pow(2, retryCount), 10000);
                }

                function generateUUID() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        const r = Math.random() * 16 | 0;
                        const v = c === 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                }

                function sanitizeInput(input) {
                    const div = document.createElement('div');
                    div.textContent = input;
                    return div.innerHTML.replace(/\n/g, '<br>');
                }

                function formatResponse(answer) {
                    if (typeof answer !== 'string') return null;
                    const trimmed = answer.trim();
                    if (/^[A-E]$/.test(trimmed)) return trimmed;
                    const bracketMatch = trimmed.match(/^[\[("']?([A-E])[\])"']?$/i);
                    if (bracketMatch) return bracketMatch[1].toUpperCase();
                    const startMatch = trimmed.match(/^([A-E])[\s.]*$/i);
                    if (startMatch && trimmed.length <= 3) return startMatch[1].toUpperCase();
                    return null;
                }

                function toggleUI() {
                    STATE.isActive = !STATE.isActive;
                    if (elements.container) {
                        elements.container.style.display = STATE.isActive ? 'flex' : 'none';
                        elements.container.style.opacity = STATE.isActive ? '1' : '0';
                        elements.container.style.transform = STATE.isActive ? 'translateY(0)' : 'translateY(10px)';
                        elements.toggleBtn.style.display = STATE.isActive ? 'none' : 'flex';
                    }
                }

                function showResponse(message, type = 'info') {
                    if (!elements.responseDiv) return;

                    const colors = {
                        success: CONFIG.theme.colors.success,
                        error: CONFIG.theme.colors.error,
                        warning: CONFIG.theme.colors.warning,
                        info: CONFIG.theme.colors.accent
                    };

                    const sanitizedMessage = sanitizeInput(message);
                    elements.responseDiv.innerHTML = sanitizedMessage;
                    elements.responseDiv.style.display = 'block';
                    elements.responseDiv.style.color = CONFIG.theme.colors.text;
                    elements.responseDiv.style.borderLeft = `4px solid ${colors[type] || colors.info}`;
                    elements.responseDiv.scrollTop = elements.responseDiv.scrollHeight;
                }

                function showLoader(show) {
                    if (!elements.submitBtn) return;

                    if (show) {
                        elements.submitBtn.innerHTML = `
                            <div class="spinner" style="
                                width: 16px;
                                height: 16px;
                                border: 3px solid rgba(255,255,255,0.3);
                                border-radius: 50%;
                                border-top-color: ${CONFIG.theme.colors.accent};
                                animation: spin 1s ease-in-out infinite;
                            "></div>
                            Processando...
                        `;
                        elements.submitBtn.disabled = true;
                        if (elements.analyzeBtn) elements.analyzeBtn.disabled = true;
                    } else {
                        elements.submitBtn.innerHTML = 'Enviar';
                        elements.submitBtn.disabled = false;
                        if (elements.analyzeBtn) elements.analyzeBtn.disabled = false;
                    }
                }

                function showNotification(message, type = 'info') {
                    if (typeof GM_notification === 'function') {
                        const colors = {
                            success: CONFIG.theme.colors.success,
                            error: CONFIG.theme.colors.error,
                            warning: CONFIG.theme.colors.warning,
                            info: CONFIG.theme.colors.accent
                        };

                        GM_notification({
                            text: message,
                            title: `${CONFIG.name} Notification`,
                            highlight: colors[type] || colors.info,
                            timeout: CONFIG.notificationDuration
                        });
                    } else {
                        console.log(`[${type.toUpperCase()}] ${message}`);
                    }
                }

                function createMainContainer() {
                    elements.container = document.createElement('div');
                    elements.container.id = 'airux-container';
                    elements.container.style.cssText = `
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        z-index: 9999;
                        font-family: 'Inter', sans-serif;
                        background: ${CONFIG.theme.colors.primary};
                        color: ${CONFIG.theme.colors.text};
                        border-radius: ${CONFIG.theme.radius};
                        padding: 15px;
                        box-shadow: ${CONFIG.theme.shadows.container};
                        width: 350px;
                        max-height: 80vh;
                        display: ${STATE.isActive ? 'flex' : 'none'};
                        flex-direction: column;
                        transition: all 0.3s ease;
                        transform: ${STATE.isActive ? 'translateY(0)' : 'translateY(10px)'};
                        opacity: ${STATE.isActive ? '1' : '0'};
                        border: 1px solid ${CONFIG.theme.colors.border};
                    `;
                    document.body.appendChild(elements.container);
                }

                function createHeader() {
                    const header = document.createElement('div');
                    header.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid ${CONFIG.theme.colors.border};
                    `;

                    const title = document.createElement('h3');
                    title.textContent = `${CONFIG.name} v${CONFIG.version}`;
                    title.style.cssText = `
                        margin: 0;
                        color: ${CONFIG.theme.colors.accent};
                        font-size: 18px;
                        font-weight: 600;
                    `;

                    const closeBtn = document.createElement('button');
                    closeBtn.innerHTML = '&times;';
                    closeBtn.style.cssText = `
                        background: ${CONFIG.theme.colors.secondary};
                        border: none;
                        color: ${CONFIG.theme.colors.textSecondary};
                        font-size: 24px;
                        cursor: pointer;
                        padding: 0 8px;
                        line-height: 1;
                        transition: all 0.2s;
                        border-radius: 50%;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    `;
                    closeBtn.addEventListener('mouseover', () => {
                        closeBtn.style.color = CONFIG.theme.colors.error;
                        closeBtn.style.transform = 'scale(1.1)';
                    });
                    closeBtn.addEventListener('mouseout', () => {
                        closeBtn.style.color = CONFIG.theme.colors.textSecondary;
                        closeBtn.style.transform = 'scale(1)';
                    });
                    closeBtn.addEventListener('click', toggleUI);

                    header.appendChild(title);
                    header.appendChild(closeBtn);
                    elements.container.appendChild(header);
                }

                function createModelSelector() {
                    const modelLabel = document.createElement('label');
                    modelLabel.textContent = 'Modelo:';
                    modelLabel.style.cssText = `
                        display: block;
                        margin-bottom: 8px;
                        font-size: 14px;
                        color: ${CONFIG.theme.colors.textSecondary};
                    `;

                    elements.modelSelect = document.createElement('select');
                    elements.modelSelect.id = 'airux-model-select';
                    elements.modelSelect.style.cssText = `
                        width: 100%;
                        padding: 10px 12px;
                        border-radius: 6px;
                        border: 1px solid ${CONFIG.theme.colors.border};
                        background: ${CONFIG.theme.colors.secondary};
                        color: ${CONFIG.theme.colors.text};
                        margin-bottom: 15px;
                        font-size: 14px;
                        transition: all 0.2s;
                        appearance: none;
                        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${encodeURIComponent(CONFIG.theme.colors.textSecondary)}'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
                        background-repeat: no-repeat;
                        background-position: right 10px center;
                        background-size: 16px;
                    `;

                    CONFIG.models.forEach(model => {
                        const option = document.createElement('option');
                        option.value = model.id;
                        option.textContent = model.name;
                        if (model.id === STATE.selectedModel) {
                            option.selected = true;
                        }
                        elements.modelSelect.appendChild(option);
                    });

                    elements.modelSelect.addEventListener('change', (e) => {
                        STATE.selectedModel = e.target.value;
                        const selectedModel = CONFIG.models.find(m => m.id === STATE.selectedModel);
                        if (selectedModel && selectedModel.requiresKey) {
                            elements.apiKeyInput.style.display = 'block';
                        } else {
                            elements.apiKeyInput.style.display = 'none';
                        }
                    });

                    elements.modelSelect.addEventListener('focus', () => {
                        elements.modelSelect.style.borderColor = CONFIG.theme.colors.accent;
                        elements.modelSelect.style.boxShadow = `0 0 0 2px ${CONFIG.theme.colors.accent}30`;
                    });

                    elements.modelSelect.addEventListener('blur', () => {
                        elements.modelSelect.style.borderColor = CONFIG.theme.colors.border;
                        elements.modelSelect.style.boxShadow = 'none';
                    });

                    elements.container.appendChild(modelLabel);
                    elements.container.appendChild(elements.modelSelect);
                }

                function createAPIKeyInput() {
                    const apiKeyLabel = document.createElement('label');
                    apiKeyLabel.textContent = 'API Key:';
                    apiKeyLabel.style.cssText = `
                        display: block;
                        margin-bottom: 8px;
                        font-size: 14px;
                        color: ${CONFIG.theme.colors.textSecondary};
                    `;

                    elements.apiKeyInput = document.createElement('input');
                    elements.apiKeyInput.type = 'password';
                    elements.apiKeyInput.placeholder = 'Insira sua API key (se necessário)';
                    elements.apiKeyInput.style.cssText = `
                        width: 100%;
                        padding: 10px;
                        border-radius: 6px;
                        border: 1px solid ${CONFIG.theme.colors.border};
                        background: ${CONFIG.theme.colors.secondary};
                        color: ${CONFIG.theme.colors.text};
                        margin-bottom: 15px;
                        font-size: 14px;
                        transition: all 0.2s;
                        display: none;
                    `;

                    elements.apiKeyInput.addEventListener('focus', () => {
                        elements.apiKeyInput.style.borderColor = CONFIG.theme.colors.accent;
                        elements.apiKeyInput.style.boxShadow = `0 0 0 2px ${CONFIG.theme.colors.accent}30`;
                    });

                    elements.apiKeyInput.addEventListener('blur', () => {
                        elements.apiKeyInput.style.borderColor = CONFIG.theme.colors.border;
                        elements.apiKeyInput.style.boxShadow = 'none';
                        STATE.apiKey = elements.apiKeyInput.value.trim();
                    });

                    const selectedModel = CONFIG.models.find(m => m.id === STATE.selectedModel);
                    if (selectedModel && selectedModel.requiresKey) {
                        elements.apiKeyInput.style.display = 'block';
                    }

                    elements.container.appendChild(apiKeyLabel);
                    elements.container.appendChild(elements.apiKeyInput);
                }

                function createInputArea() {
                    const inputLabel = document.createElement('label');
                    inputLabel.textContent = 'Sua pergunta:';
                    inputLabel.style.cssText = `
                        display: block;
                        margin-bottom: 8px;
                        font-size: 14px;
                        color: ${CONFIG.theme.colors.textSecondary};
                    `;

                    elements.input = document.createElement('textarea');
                    elements.input.id = 'airux-input';
                    elements.input.placeholder = 'Digite sua pergunta ou cole a questão aqui...';
                    elements.input.style.cssText = `
                        width: 100%;
                        min-height: 120px;
                        padding: 12px;
                        border-radius: 6px;
                        border: 1px solid ${CONFIG.theme.colors.border};
                        background: ${CONFIG.theme.colors.secondary};
                        color: ${CONFIG.theme.colors.text};
                        margin-bottom: 15px;
                        resize: vertical;
                        font-size: 14px;
                        line-height: 1.5;
                        transition: all 0.2s;
                    `;

                    elements.input.addEventListener('focus', () => {
                        elements.input.style.borderColor = CONFIG.theme.colors.accent;
                        elements.input.style.boxShadow = `0 0 0 2px ${CONFIG.theme.colors.accent}30`;
                    });

                    elements.input.addEventListener('blur', () => {
                        elements.input.style.borderColor = CONFIG.theme.colors.border;
                        elements.input.style.boxShadow = 'none';
                    });

                    elements.container.appendChild(inputLabel);
                    elements.container.appendChild(elements.input);
                }

                function createImagesContainer() {
                    const imagesLabel = document.createElement('label');
                    imagesLabel.textContent = 'Imagens da questão:';
                    imagesLabel.style.cssText = `
                        display: block;
                        margin-bottom: 8px;
                        font-size: 14px;
                        color: ${CONFIG.theme.colors.textSecondary};
                    `;

                    elements.imagesContainer = document.createElement('div');
                    elements.imagesContainer.id = 'airux-images-container';
                    elements.imagesContainer.style.cssText = `
                        max-height: 60px;
                        overflow-y: auto;
                        margin-bottom: 15px;
                        font-size: 12px;
                        border: 1px solid ${CONFIG.theme.colors.border};
                        border-radius: 6px;
                        padding: 6px 8px;
                        background: ${CONFIG.theme.colors.secondary};
                        color: ${CONFIG.theme.colors.textSecondary};
                        scrollbar-width: none;
                    `;
                    elements.imagesContainer.innerHTML = `<div style="text-align: center; padding: 1px; font-size: 0.9em;">Nenhuma imagem detectada</div>`;

                    elements.container.appendChild(imagesLabel);
                    elements.container.appendChild(elements.imagesContainer);
                }

                function createActionButtons() {
                    const buttonsContainer = document.createElement('div');
                    buttonsContainer.style.cssText = `
                        display: flex;
                        gap: 10px;
                        margin-bottom: 15px;
                    `;

                    elements.updateImagesBtn = document.createElement('button');
                    elements.updateImagesBtn.textContent = 'Atualizar Imagens';
                    elements.updateImagesBtn.style.cssText = `
                        flex: 1;
                        padding: 10px;
                        border-radius: 6px;
                        border: 1px solid ${CONFIG.theme.colors.border};
                        background: ${CONFIG.theme.colors.tertiary};
                        color: ${CONFIG.theme.colors.text};
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s;
                    `;
                    elements.updateImagesBtn.addEventListener('mouseover', () => {
                        elements.updateImagesBtn.style.background = CONFIG.theme.colors.secondary;
                    });
                    elements.updateImagesBtn.addEventListener('mouseout', () => {
                        elements.updateImagesBtn.style.background = CONFIG.theme.colors.tertiary;
                    });
                    elements.updateImagesBtn.addEventListener('click', () => {
                        logMessage('INFO', "Atualizando imagens...");
                        extractImages();
                        updateImageButtons(STATE.images);
                        showNotification('Imagens atualizadas', 'info');
                    });

                    elements.analyzeBtn = document.createElement('button');
                    elements.analyzeBtn.textContent = 'Analisar Questão';
                    elements.analyzeBtn.style.cssText = `
                        flex: 1;
                        padding: 10px;
                        border-radius: 6px;
                        border: none;
                        background: ${CONFIG.theme.colors.accent};
                        color: ${CONFIG.theme.colors.primary};
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        transition: all 0.2s;
                    `;
                    elements.analyzeBtn.addEventListener('mouseover', () => {
                        elements.analyzeBtn.style.opacity = '0.9';
                    });
                    elements.analyzeBtn.addEventListener('mouseout', () => {
                        elements.analyzeBtn.style.opacity = '1';
                    });
                    elements.analyzeBtn.addEventListener('click', analyzeQuestion);

                    buttonsContainer.appendChild(elements.updateImagesBtn);
                    buttonsContainer.appendChild(elements.analyzeBtn);
                    elements.container.appendChild(buttonsContainer);
                }

                function createSubmitButton() {
                    elements.submitBtn = document.createElement('button');
                    elements.submitBtn.id = 'airux-submit';
                    elements.submitBtn.textContent = 'Enviar';
                    elements.submitBtn.style.cssText = `
                        width: 100%;
                        padding: 12px;
                        border-radius: 6px;
                        border: none;
                        background: ${CONFIG.theme.colors.accent};
                        color: ${CONFIG.theme.colors.primary};
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-size: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        margin-bottom: 15px;
                    `;

                    elements.submitBtn.addEventListener('mouseover', () => {
                        elements.submitBtn.style.opacity = '0.9';
                    });

                    elements.submitBtn.addEventListener('mouseout', () => {
                        elements.submitBtn.style.opacity = '1';
                    });

                    elements.submitBtn.addEventListener('click', processRequest);

                    elements.container.appendChild(elements.submitBtn);
                }

                function createResponseArea() {
                    const responseLabel = document.createElement('label');
                    responseLabel.textContent = 'Resposta:';
                    responseLabel.style.cssText = `
                        display: block;
                        margin-bottom: 8px;
                        font-size: 14px;
                        color: ${CONFIG.theme.colors.textSecondary};
                    `;

                    elements.responseDiv = document.createElement('div');
                    elements.responseDiv.id = 'airux-response';
                    elements.responseDiv.style.cssText = `
                        flex-grow: 1;
                        padding: 12px;
                        border-radius: 6px;
                        background: ${CONFIG.theme.colors.secondary};
                        border: 1px solid ${CONFIG.theme.colors.border};
                        min-height: 100px;
                        max-height: 300px;
                        overflow-y: auto;
                        display: none;
                        font-size: 14px;
                        line-height: 1.5;
                    `;

                    elements.container.appendChild(responseLabel);
                    elements.container.appendChild(elements.responseDiv);
                }

                function createToggleButton() {
                    elements.toggleBtn = document.createElement('button');
                    elements.toggleBtn.id = 'airux-toggle-btn';
                    elements.toggleBtn.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.theme.colors.text}" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>${CONFIG.name}</span>
                    `;
                    elements.toggleBtn.style.cssText = `
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        z-index: 9998;
                        padding: 10px 16px;
                        border-radius: 50px;
                        border: none;
                        background: ${CONFIG.theme.colors.primary};
                        color: ${CONFIG.theme.colors.text};
                        font-weight: bold;
                        cursor: pointer;
                        box-shadow: ${CONFIG.theme.shadows.button};
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        transition: all 0.2s;
                        border: 1px solid ${CONFIG.theme.colors.border};
                    `;
                    elements.toggleBtn.addEventListener('mouseover', () => {
                        elements.toggleBtn.style.background = CONFIG.theme.colors.secondary;
                    });
                    elements.toggleBtn.addEventListener('mouseout', () => {
                        elements.toggleBtn.style.background = CONFIG.theme.colors.primary;
                    });
                    elements.toggleBtn.addEventListener('click', toggleUI);
                    document.body.appendChild(elements.toggleBtn);
                }

                function addGlobalStyles() {
                    const style = document.createElement('style');
                    style.textContent = `
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        #airux-container {
                            animation: fadeIn 0.3s ease-out;
                        }
                        #airux-response::-webkit-scrollbar {
                            width: 6px;
                        }
                        #airux-response::-webkit-scrollbar-track {
                            background: ${CONFIG.theme.colors.secondary};
                        }
                        #airux-response::-webkit-scrollbar-thumb {
                            background-color: ${CONFIG.theme.colors.border};
                            border-radius: 3px;
                        }
                        #airux-images-container::-webkit-scrollbar {
                            height: 4px;
                        }
                        #airux-images-container::-webkit-scrollbar-track {
                            background: ${CONFIG.theme.colors.secondary};
                        }
                        #airux-images-container::-webkit-scrollbar-thumb {
                            background-color: ${CONFIG.theme.colors.border};
                            border-radius: 2px;
                        }
                    `;
                    document.head.appendChild(style);
                }

                function extractImages() {
                    logMessage('DEBUG', "Extraindo imagens relevantes...");
                    const urls = new Set();
                    document.querySelectorAll('img[src], [style*="background-image"], [data-image]').forEach(el => {
                        let src = null;
                        try {
                            if (el.tagName === 'IMG' && el.src) src = el.src;
                            else if (el.dataset.image) src = el.dataset.image;
                            else if (el.style.backgroundImage) {
                                const m = el.style.backgroundImage.match(/url\("?(.+?)"?\)/);
                                if (m && m[1]) src = m[1];
                            }
                            if (src) {
                                const absUrl = new URL(src, window.location.href).toString();
                                if (IMAGE_FILTERS.verify(absUrl)) urls.add(absUrl);
                            }
                        } catch (e) {
                            logMessage('WARN', `Erro ao analisar URL: ${src || 'unknown'}. ${e.message}`);
                        }
                    });
                    STATE.images = Array.from(urls).slice(0, 10);
                    logMessage('INFO', `Extração concluída. ${STATE.images.length} imagens relevantes encontradas.`);
                    return STATE.images;
                }

                async function fetchImageAsBase64(url) {
                    if (STATE.imageCache[url]) {
                        logMessage('DEBUG', `Usando imagem em cache: ${url.substring(0, 60)}...`);
                        return STATE.imageCache[url];
                    }
                    logMessage('INFO', `Buscando imagem: ${url.substring(0, 80)}...`);
                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: url,
                            responseType: 'arraybuffer',
                            timeout: CONFIG.timeout,
                            onload: function(response) {
                                if (response.status >= 200 && response.status < 300) {
                                    try {
                                        const bytes = new Uint8Array(response.response);
                                        if (bytes.length === 0) throw new Error("Buffer de imagem vazio");
                                        const base64 = window.btoa(bytes.reduce((a, b) => a + String.fromCharCode(b), ''));
                                        if (bytes.length < 5 * 1024 * 1024) {
                                            STATE.imageCache[url] = base64;
                                            logMessage('DEBUG', `Imagem em cache: ${url.substring(0, 60)}... Tamanho: ${Math.round(bytes.length / 1024)}KB`);
                                        } else {
                                            logMessage('WARN', `Imagem não armazenada em cache (tamanho > 5MB): ${url.substring(0, 60)}...`);
                                        }
                                        resolve(base64);
                                    } catch (e) {
                                        logMessage('ERROR', `Erro na conversão para Base64 (${url}):`, e);
                                        reject(new Error(`Falha na conversão da imagem: ${e.message}`));
                                    }
                                } else {
                                    logMessage('ERROR', `Erro HTTP ${response.status} ao buscar imagem: ${url}`);
                                    reject(new Error(`Erro HTTP ${response.status}`));
                                }
                            },
                            onerror: function(e) {
                                logMessage('ERROR', `Erro de rede ao buscar imagem ${url}:`, e);
                                reject(new Error(`Erro de rede`));
                            },
                            ontimeout: function() {
                                logMessage('ERROR', `Timeout ao buscar imagem: ${url}`);
                                reject(new Error(`Timeout`));
                            }
                        });
                    });
                }

                function updateImageButtons(images) {
                    if (!elements.imagesContainer) return;
                    if (images.length === 0) {
                        elements.imagesContainer.innerHTML = `<div style="text-align: center; padding: 1px; font-size: 0.9em; color: ${CONFIG.theme.colors.textSecondary};">Nenhuma imagem relevante</div>`;
                        return;
                    }

                    elements.imagesContainer.innerHTML = images.map((img, i) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 0; border-bottom: 1px solid ${CONFIG.theme.colors.border}; gap: 4px;">
                            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%; color: ${CONFIG.theme.colors.text}; font-size:0.9em;" title="${img}">Imagem ${i + 1}</span>
                            <button data-url="${img}" title="Copiar URL" style="background: ${CONFIG.theme.colors.tertiary}; color: ${CONFIG.theme.colors.textSecondary}; border: none; border-radius: 4px; padding: 1px 4px; font-size: 9px; cursor: pointer; white-space: nowrap; transition: all 0.2s ease; font-weight: 500;">Copiar</button>
                        </div>
                    `).join('');

                    elements.imagesContainer.querySelectorAll('button[data-url]').forEach(b => {
                        b.addEventListener('mouseenter', () => b.style.backgroundColor = CONFIG.theme.colors.border);
                        b.addEventListener('mouseleave', () => b.style.backgroundColor = CONFIG.theme.colors.tertiary);
                        b.addEventListener('click', (e) => {
                            navigator.clipboard.writeText(e.target.dataset.url).then(() => {
                                e.target.textContent = 'Copiado!';
                                setTimeout(() => { e.target.textContent = 'Copiar'; }, 1200);
                            }).catch(err => {
                                logMessage('ERROR', 'Falha ao copiar:', err);
                                e.target.textContent = 'Falha!';
                                setTimeout(() => { e.target.textContent = 'Copiar'; }, 1500);
                            });
                        });
                    });
                }

                async function queryAPI(prompt, model) {
                    return new Promise((resolve, reject) => {
                        const modelConfig = CONFIG.models.find(m => m.id === model.id);
                        if (!modelConfig) {
                            reject(new Error('Configuração do modelo não encontrada'));
                            return;
                        }

                        let payload;
                        let endpoint;
                        let headers = {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        };

                        switch(modelConfig.type) {
                            case 'blackbox':
                                endpoint = CONFIG.apiEndpoints.blackbox;
                                payload = {
                                    messages: [{
                                        id: generateUUID(),
                                        content: prompt,
                                        role: "user"
                                    }],
                                    id: generateUUID(),
                                    model: model.id,
                                    stream: false,
                                    temperature: CONFIG.temperature
                                };
                                headers["Origin"] = "https://www.blackbox.ai";
                                headers["Referer"] = "https://www.blackbox.ai/";
                                break;

                            case 'openai':
                                endpoint = CONFIG.apiEndpoints.openai;
                                payload = {
                                    model: model.id,
                                    messages: [{
                                        role: "user",
                                        content: prompt
                                    }],
                                    temperature: CONFIG.temperature,
                                    max_tokens: CONFIG.maxTokens
                                };
                                if (STATE.apiKey) {
                                    headers["Authorization"] = `Bearer ${STATE.apiKey}`;
                                }
                                break;

                            case 'deepseek':
                                endpoint = CONFIG.apiEndpoints.deepseek;
                                payload = {
                                    model: model.id,
                                    messages: [{
                                        role: "user",
                                        content: prompt
                                    }],
                                    temperature: CONFIG.temperature,
                                    max_tokens: CONFIG.maxTokens
                                };
                                if (STATE.apiKey) {
                                    headers["Authorization"] = `Bearer ${STATE.apiKey}`;
                                }
                                break;

                            case 'gemini':
                                endpoint = `${CONFIG.apiEndpoints.gemini}${model.id}:generateContent?key=${getNextApiKey()}`;
                                payload = prompt;
                                break;

                            default:
                                reject(new Error('Tipo de modelo não suportado'));
                                return;
                        }

                        const attemptRequest = () => {
                            GM_xmlhttpRequest({
                                method: "POST",
                                url: endpoint,
                                headers: headers,
                                data: JSON.stringify(payload),
                                timeout: CONFIG.timeout,
                                onload: function(response) {
                                    try {
                                        const data = tryParseJSON(response.responseText) || {};
                                        let result;

                                        if (response.status === 200) {
                                            switch(modelConfig.type) {
                                                case 'blackbox':
                                                    const answerMatch = response.responseText.match(/\$ANSWER\$([\s\S]*?)(\$END\$|$)/);
                                                    result = answerMatch?.[1]?.trim() || data?.response ||
                                                           response.responseText.trim().split('$ANSWER$').pop();
                                                    break;

                                                case 'openai':
                                                case 'deepseek':
                                                    result = data.choices?.[0]?.message?.content ||
                                                            data.choices?.[0]?.text ||
                                                            data?.response ||
                                                            'Resposta não reconhecida';
                                                    break;

                                                case 'gemini':
                                                    const candidate = data.candidates?.[0];
                                                    result = candidate?.content?.parts?.[0]?.text ||
                                                            data?.response ||
                                                            'Resposta não reconhecida';
                                                    break;

                                                default:
                                                    result = response.responseText;
                                            }

                                            if (!result || /(error|sorry)/i.test(result) || data.error) {
                                                if (STATE.retryCount < CONFIG.maxRetries) {
                                                    STATE.retryCount++;
                                                    setTimeout(attemptRequest, calculateRetryDelay(STATE.retryCount));
                                                    return;
                                                }
                                                reject(new Error(data.error?.message || 'Resposta inválida da API'));
                                            } else {
                                                resolve(result);
                                            }
                                        } else {
                                            reject(new Error(data.error?.message || `Erro ${response.status}: ${response.statusText}`));
                                        }
                                    } catch (e) {
                                        reject(new Error("Falha ao processar resposta da API"));
                                    }
                                },
                                onerror: function(error) {
                                    if (STATE.retryCount < CONFIG.maxRetries) {
                                        STATE.retryCount++;
                                        setTimeout(attemptRequest, calculateRetryDelay(STATE.retryCount));
                                    } else {
                                        reject(new Error(`Falha na conexão: ${error}`));
                                    }
                                },
                                ontimeout: function() {
                                    if (STATE.retryCount < CONFIG.maxRetries) {
                                        STATE.retryCount++;
                                        setTimeout(attemptRequest, calculateRetryDelay(STATE.retryCount));
                                    } else {
                                        reject(new Error(`Tempo limite (${CONFIG.timeout}ms) excedido`));
                                    }
                                }
                            });
                        };

                        attemptRequest();
                    });
                }

                async function buildPromptForQuestion(question, imageUrls) {
                    logMessage('INFO', `Construindo prompt para análise de questão (${imageUrls.length} imagens)...`);
                    const imageParts = [];
                    const imageFetchPromises = imageUrls.map(url =>
                        fetchImageAsBase64(url)
                            .then(base64 => {
                                let mime = 'image/jpeg';
                                if (/\.png$/i.test(url)) mime = 'image/png';
                                else if (/\.webp$/i.test(url)) mime = 'image/webp';
                                else if (/\.gif$/i.test(url)) mime = 'image/gif';
                                imageParts.push({ inlineData: { mimeType: mime, data: base64 } });
                            })
                            .catch(e => logMessage('WARN', `Ignorando imagem devido a erro: ${url.substring(0,60)}... (${e.message})`))
                    );
                    await Promise.allSettled(imageFetchPromises);
                    logMessage('DEBUG', `${imageParts.length} imagens incluídas no prompt.`);

                    const promptText = `CONTEXTO: Questão de múltipla escolha (Alternativas A, B, C, D, E).
OBJETIVO: Identificar a ÚNICA alternativa CORRETA.
INSTRUÇÕES MUITO IMPORTANTES:
1. ANÁLISE INTERNA: Pense passo a passo para encontrar a resposta (NÃO MOSTRE ESTE RACIOCÍNIO NA SAÍDA). Analise o texto da questão E TODAS as imagens fornecidas.
2. RESPOSTA FINAL: Retorne APENAS e SOMENTE a LETRA MAIÚSCULA da alternativa correta.
3. FORMATO ESTRITO: A resposta DEVE ser UMA ÚNICA LETRA: A, B, C, D ou E.
4. NÃO INCLUA NADA MAIS: Sem texto adicional, sem explicações, sem pontuação (sem ".", ",", etc.), sem markdown, sem numeração, sem frases como "A resposta é:". APENAS A LETRA.
5. SE INCERTO: Mesmo se não tiver 100% de certeza, escolha a alternativa MAIS PROVÁVEL e retorne apenas a letra correspondente.

QUESTÃO:
${question}
${imageParts.length > 0 ? '\nIMAGENS (Analise cuidadosamente):\n' : ''}`;

                    const safetySettings = [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: CONFIG.SAFETY_SETTINGS_THRESHOLD },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: CONFIG.SAFETY_SETTINGS_THRESHOLD },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: CONFIG.SAFETY_SETTINGS_THRESHOLD },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: CONFIG.SAFETY_SETTINGS_THRESHOLD },
                    ];

                    return {
                        contents: [{ parts: [{ text: promptText }, ...imageParts] }],
                        generationConfig: {
                            temperature: CONFIG.temperature,
                            maxOutputTokens: CONFIG.MAX_OUTPUT_TOKENS,
                        },
                        safetySettings: safetySettings
                    };
                }

                function getNextApiKey() {
                    if (!CONFIG.API_KEYS_GEMINI || CONFIG.API_KEYS_GEMINI.length === 0) {
                        logMessage('ERROR', 'CRÍTICO: Nenhuma chave de API configurada em CONFIG.API_KEYS_GEMINI!');
                        throw new Error('Nenhuma chave de API disponível');
                    }
                    const key = CONFIG.API_KEYS_GEMINI[STATE.currentApiKeyIndex];
                    STATE.currentApiKeyIndex = (STATE.currentApiKeyIndex + 1) % CONFIG.API_KEYS_GEMINI.length;
                    return key;
                }

                async function analyzeQuestion() {
                    logMessage('INFO', "----- Iniciando análise de questão -----");
                    const question = elements.input.value.trim();

                    if (STATE.isAnalyzing) {
                        logMessage('WARN', `Análise ignorada: Já em progresso.`);
                        showResponse("Aguarde, análise em progresso...", 'warning');
                        return;
                    }

                    if (!question) {
                        logMessage('WARN', `Análise ignorada: Campo de questão vazio.`);
                        showResponse("Por favor, insira ou cole a questão.", 'error');
                        elements.input.focus();
                        return;
                    }

                    STATE.isAnalyzing = true;
                    showLoader(true);
                    elements.responseDiv.style.display = 'block';
                    elements.responseDiv.textContent = 'Analisando questão...';
                    STATE.retryCount = 0;

                    try {
                        const images = extractImages();
                        updateImageButtons(images);

                        const geminiModels = CONFIG.models.filter(m => m.type === 'gemini');
                        if (geminiModels.length === 0) {
                            throw new Error("Nenhum modelo Gemini configurado");
                        }

                        const prompt = await buildPromptForQuestion(question, images);
                        logMessage('INFO', `Consultando ${geminiModels.length} modelos Gemini...`);

                        const promises = geminiModels.map(modelInfo =>
                            queryAPI(prompt, modelInfo)
                                .catch(e => {
                                    logMessage('ERROR', `[${modelInfo.name}] FALHA FINAL: ${e.message}`);
                                    return Promise.reject(e);
                                })
                        );

                        const results = await Promise.allSettled(promises);

                        const validAnswers = {};
                        let errors = 0;

                        results.forEach((result, index) => {
                            const modelName = geminiModels[index]?.name || `Modelo ${index + 1}`;
                            if (result.status === 'fulfilled') {
                                const formatted = formatResponse(result.value);
                                if (formatted) {
                                    validAnswers[formatted] = (validAnswers[formatted] || 0) + 1;
                                    logMessage('INFO', `[${modelName}] Votou: ${formatted}`);
                                } else {
                                    logMessage('WARN', `[${modelName}] Formato inválido: "${result.value}"`);
                                    errors++;
                                }
                            } else {
                                const reason = result.reason?.message || result.reason?.toString() || 'Erro desconhecido';
                                logMessage('ERROR', `[${modelName}] Requisição falhou: ${reason}`);
                                errors++;
                            }
                        });

                        const numModelsQueried = results.length;
                        const numValidVotes = Object.values(validAnswers).reduce((sum, count) => sum + count, 0);

                        if (numValidVotes === 0) {
                            throw new Error("Nenhuma resposta válida recebida dos modelos");
                        }

                        const sortedVotes = Object.entries(validAnswers).sort(([, v1], [, v2]) => v2 - v1);
                        const topAnswer = sortedVotes[0][0];
                        const topVotes = sortedVotes[0][1];

                        let detailMessage;
                        if (topVotes === numModelsQueried) {
                            detailMessage = `(Consenso total ${topVotes}/${numModelsQueried})`;
                        } else {
                            detailMessage = `(Maioria ${topVotes}/${numModelsQueried})`;
                        }

                        showResponse(`Resposta: ${topAnswer} ${detailMessage}`, 'success');
                        showNotification('Análise concluída', 'success');

                    } catch (error) {
                        logMessage('ERROR', "Erro durante a análise:", error);
                        showResponse(`Erro: ${error.message}`, 'error');
                        showNotification('Falha na análise', 'error');
                    } finally {
                        STATE.isAnalyzing = false;
                        showLoader(false);
                    }
                }

                async function processRequest() {
                    if (STATE.isProcessing) return;

                    const question = elements.input.value.trim();
                    if (!question) {
                        showResponse('Por favor, digite uma pergunta.', 'error');
                        showNotification('Digite uma pergunta antes de enviar', 'error');
                        elements.input.focus();
                        return;
                    }

                    const selectedModel = CONFIG.models.find(m => m.id === STATE.selectedModel);
                    if (!selectedModel) {
                        showResponse('Modelo selecionado não encontrado.', 'error');
                        return;
                    }

                    if (selectedModel.requiresKey && !STATE.apiKey) {
                        showResponse('Este modelo requer uma API Key. Insira-a no campo acima.', 'error');
                        showNotification('API Key necessária para este modelo', 'error');
                        elements.apiKeyInput.focus();
                        return;
                    }

                    STATE.isProcessing = true;
                    showLoader(true);
                    elements.responseDiv.style.display = 'block';
                    elements.responseDiv.textContent = 'Processando sua solicitação...';
                    STATE.retryCount = 0;

                    try {
                        const response = await queryAPI(question, selectedModel);
                        STATE.lastResponse = response;
                        showResponse(response, 'success');
                        showNotification('Resposta recebida com sucesso', 'success');
                    } catch (error) {
                        console.error('Erro ao processar requisição:', error);
                        showResponse(`Erro: ${error.message}`, 'error');
                        showNotification(`Erro: ${error.message}`, 'error');
                    } finally {
                        STATE.isProcessing = false;
                        showLoader(false);
                    }
                }

                function initializeUI() {
                    if (document.getElementById('airux-container')) {
                        return;
                    }

                    const fontLink = document.createElement('link');
                    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
                    fontLink.rel = 'stylesheet';
                    document.head.appendChild(fontLink);

                    createMainContainer();
                    createHeader();
                    createModelSelector();
                    createAPIKeyInput();
                    createInputArea();
                    createImagesContainer();
                    createActionButtons();
                    createSubmitButton();
                    createResponseArea();
                    createToggleButton();
                    addGlobalStyles();

                    setTimeout(() => {
                        extractImages();
                        updateImageButtons(STATE.images);
                    }, 2000);
                }

                async function init() {
                    logMessage('INFO', `----- ${CONFIG.name} v${CONFIG.version} Inicializando -----`);

                    try {
                        initializeUI();
                        logMessage('INFO', 'UI inicializada com sucesso');
                        showNotification(`${CONFIG.name} pronto para uso`, 'success');
                    } catch (error) {
                        logMessage('ERROR', 'Erro ao inicializar:', error);
                        showNotification('Erro ao inicializar Airux', 'error');
                    }
                }

                if (!window.airuxLoaded) {
                    window.airuxLoaded = true;
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', init);
                    } else {
                        setTimeout(init, 1000);
                    }
                }
            })();
            
            console.log('Airux Pro carregado com sucesso no DevTools!');
        };
        document.head.appendChild(jqScript);
    };

    if (window.Notification && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}
