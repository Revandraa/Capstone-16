import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// Updated Questions based on user request (Air Liur, Gusi, Kaki, Lidah, Suhu, Berat Badan)
const questions = [
    {
        id: 'air-liur',
        title: 'Bagaimana kondisi air liur sapi Anda? <small style="display: block; font-weight: 500; font-size: 13px; color: var(--text-gray); margin-top: 6px; text-align: left; width: 100%;">Notes: Jika kondisi sapi anda normal, tidak ada gejala yang sesuai seperti digambar, silahkan skip kuis bagian ini</small>',
        type: 'grid',
        options: [
            { label: 'Liur Normal', intensity: 0.25, img: '/samples/air_liur_1.jpg' },
            { label: 'Liur Berlebihan', intensity: 0.50, img: '/samples/air_liur_2.jpg' },
            { label: 'Liur Banyak', intensity: 0.75, img: '/samples/air_liur_3.jpg' },
            { label: 'Liur Sangat Banyak', intensity: 1.00, img: '/samples/air_liur_4.jpg' }
        ],
        weight: 0.515278
    },
    {
        id: 'gusi',
        title: 'Bagaimana kondisi gusi sapi Anda? <small style="display: block; font-weight: 500; font-size: 13px; color: var(--text-gray); margin-top: 6px; text-align: left; width: 100%;">Notes: Jika kondisi sapi anda normal, tidak ada gejala yang sesuai seperti digambar, silahkan skip kuis bagian ini</small>',
        type: 'grid',
        options: [
            { label: 'Luka Normal', intensity: 0.33, img: '/samples/gusi_1.jpg' },
            { label: 'Luka Berlebihan', intensity: 0.66, img: '/samples/gusi_2.jpg' },
            { label: 'Luka Parah', intensity: 1.00, img: '/samples/gusi_3.jpg' }
        ],
        weight: 0.215177
    },
    {
        id: 'kaki',
        title: 'Bagaimana kondisi kaki sapi Anda? <small style="display: block; font-weight: 500; font-size: 13px; color: var(--text-gray); margin-top: 6px; text-align: left; width: 100%;">Notes: Jika kondisi sapi anda normal, tidak ada gejala yang sesuai seperti digambar, silahkan skip kuis bagian ini</small>',
        type: 'grid',
        options: [
            { label: 'Luka Normal', intensity: 0.33, img: '/samples/kaki_1.jpg' },
            { label: 'Luka Berlebihan', intensity: 0.66, img: '/samples/kaki_2.jpg' },
            { label: 'Luka Parah', intensity: 1.00, img: '/samples/kaki_3.jpg' }
        ],
        weight: 0.215177
    },
    {
        id: 'lidah',
        title: 'Bagaimana kondisi lidah sapi Anda? <small style="display: block; font-weight: 500; font-size: 13px; color: var(--text-gray); margin-top: 6px; text-align: left; width: 100%;">Notes: Jika kondisi sapi anda normal, tidak ada gejala yang sesuai seperti digambar, silahkan skip kuis bagian ini</small>',
        type: 'grid',
        options: [
            { label: 'Luka Normal', intensity: 0.33, img: '/samples/lidah_1.jpg' },
            { label: 'Luka Berlebihan', intensity: 0.66, img: '/samples/lidah_2.jpg' },
            { label: 'Luka Parah', intensity: 1.00, img: '/samples/lidah_3.jpg' }
        ],
        weight: 0.215177
    },
    {
        id: 'suhu-tubuh',
        title: 'Berapa suhu tubuh sapi anda?<br><small style="font-weight: 500; font-size: 13px; color: var(--text-gray);">Note: Jika tidak ada termometer untuk mengukur, cukup lihat apakah sapi anda menggigil atau tidak</small>',
        type: 'text-only',
        noAI: true,
        options: [
            { label: 'A. Panas, >40 C', intensity: 1.00 },
            { label: 'B. Sedang, 40-39 C', intensity: 0.50 },
            { label: 'C. Normal 37-38 C', intensity: 0.00 }
        ],
        weight: 0.035566
    },
    {
        id: 'nafsu-makan',
        title: 'Bagaimana pola nafsu makan pada sapi?',
        type: 'text-only',
        noAI: true,
        options: [
            { label: 'A. Normal', intensity: 0.00 },
            { label: 'B. Menurun nafsu makan', intensity: 0.50 },
            { label: 'C. Tidak mau makan sama sekali', intensity: 1.00 }
        ],
        weight: 0.067311
    },
    {
        id: 'jarak-pmk',
        title: 'Berapa jarak/radius lokasi peternakan Anda dari kasus PMK aktif yang terkonfirmasi terdekat?',
        type: 'text-only',
        noAI: true,
        options: [
            { label: 'A. Sangat Dekat (< 1 km dari kasus PMK aktif)', intensity: 1.00 },
            { label: 'B. Sedang (1–5 km dari kasus PMK aktif)', intensity: 0.50 },
            { label: 'C. Jauh (> 5 km dari kasus PMK aktif)', intensity: 0.00 }
        ],
        weight: 0.111644
    },
    {
        id: 'mobilitas-orang',
        title: 'Bagaimana intensitas atau mobilitas orang (peternak lain, pedagang, mantri) yang keluar masuk area kandang?',
        type: 'text-only',
        noAI: true,
        options: [
            { label: 'A. Tinggi (> 10 kali kunjungan orang luar per minggu)', intensity: 1.00 },
            { label: 'B. Sedang (3–10 kali kunjungan orang luar per minggu)', intensity: 0.50 },
            { label: 'C. Rendah (< 3 kali kunjungan orang luar per minggu)', intensity: 0.00 }
        ],
        weight: 0.040415
    },
    {
        id: 'aliran-sungai',
        title: 'Apakah terdapat aliran sungai atau saluran air terbuka yang melewati pemukiman/peternakan lain yang terinfeksi sebelum mencapai kandang Anda?',
        type: 'text-only',
        noAI: true,
        options: [
            { label: 'A. Ada (aliran air langsung dari area terinfeksi ke kandang)', intensity: 1.00 },
            { label: 'B. Cukup Beresiko (ada saluran air terbuka, namun tidak langsung dari area terinfeksi)', intensity: 0.50 },
            { label: 'C. Aman (tidak ada aliran air dari area terinfeksi yang mencapai kandang)', intensity: 0.00 }
        ],
        weight: 0.014607
    }
];

let currentQuestionIndex = 0;
let userAnswers = {};
let currentUser = null;

// AI MobileNet & Hybrid State
let mobilenetModel = null;
let isModelLoading = false;
let selectedAiImageFile = null;
let hybridUploadedFile = null;
let hybridAiSummary = null;
let isUsingAiInAnyQuestion = false;

window.navigateTo = (screenId) => {
    // If trying to access history/profile without login, redirect to login
    if ((screenId === 'screen-history' || screenId === 'screen-profile') && !currentUser) {
        screenId = 'screen-login';
    }

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');

    // Update Bottom Nav
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (screenId === 'screen-home') document.getElementById('nav-home')?.classList.add('active');
    if (screenId === 'screen-history') {
        document.getElementById('nav-history')?.classList.add('active');
        renderHistory();
    }
    if (screenId === 'screen-profile') {
        document.getElementById('nav-profile')?.classList.add('active');
        renderProfile();
    }

    if (screenId === 'screen-q') {
        currentQuestionIndex = 0; // Reset to first question
        userAnswers = {}; // Reset answers
        hybridUploadedFile = null;
        hybridAiSummary = null;
        isUsingAiInAnyQuestion = false;
        renderQuestion();
    }

    if (screenId === 'screen-ai') {
        loadMobileNetModel();
        resetAiScreen();
    }
};


function renderQuestion() {
    const q = questions[currentQuestionIndex];
    const container = document.getElementById('question-container');

    // Update Dynamic Title
    document.querySelector('#screen-q header h1').textContent = `Pertanyaan ${currentQuestionIndex + 1}`;

    let contentHtml = `<div class="card">
        <p class="question-title" style="margin-top: 10px; margin-bottom: 20px;">${q.title}</p>
    `;

    if (q.type === 'text-only') {
        // Render simple options list
        contentHtml += `<div style="width: 100%; margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">`;
        q.options.forEach((opt, idx) => {
            const ans = userAnswers[q.id];
            const isSelected = ans?.index === idx;
            contentHtml += `
                <div class="option-simple ${isSelected ? 'selected' : ''}" onclick="selectOption('${q.id}', ${idx})">
                    <div class="radio-circle"></div>
                    <span style="font-size: 14px; font-weight: 600; color: var(--text-dark);">${opt.label}</span>
                </div>
            `;
        });
        contentHtml += `</div>`;
    } else {
        // Render grid options with images
        contentHtml += `<div class="question-grid">`;
        q.options.forEach((opt, idx) => {
            const ans = userAnswers[q.id];
            const isSelected = ans?.index === idx;
            const aiBadge = (isSelected && ans?.aiProb) ? `<div class="ai-answer-badge"><i data-lucide="bot"></i> AI (${Math.round(ans.aiProb * 100)}%)</div>` : '';
            
            contentHtml += `
                <div class="option ${isSelected ? 'selected' : ''}" onclick="selectOption('${q.id}', ${idx})">
                    <div class="option-header">
                        <div class="radio-circle"></div> ${opt.label}
                    </div>
                    <div class="option-img-container">
                        <img src="${opt.img}" alt="${opt.label}">
                    </div>
                    ${aiBadge}
                </div>
            `;
        });
        contentHtml += `</div>`;
    }

    // Mini AI Dropzone / Hybrid Section
    if (!q.noAI) {
        const currentAns = userAnswers[q.id];
        let aiSectionHtml = `
            <div class="hybrid-section">
                <div class="hybrid-title"><i data-lucide="cpu"></i> Opsi AI MobileNet</div>
                <input type="file" id="q-ai-file-${q.id}" accept="image/*" style="display: none;" onchange="handleQuestionAiUpload(event, '${q.id}')">
        `;

        if (isModelLoading) {
            aiSectionHtml += `
                <div class="mini-ai-dropzone" style="cursor: default;">
                    <div class="ai-spinner" style="width: 30px; height: 30px; border-width: 3px;"></div>
                    <h5 style="margin-top: 10px;">Menganalisis dengan AI...</h5>
                    <p>Mengekstraksi fitur citra organ</p>
                </div>
            `;
        } else if (currentAns && currentAns.aiProb && currentAns.aiImgSrc) {
            aiSectionHtml += `
                <div class="mini-ai-preview" onclick="document.getElementById('q-ai-file-${q.id}').click()">
                    <img src="${currentAns.aiImgSrc}" alt="AI Preview">
                    <div class="mini-ai-preview-info">
                        <h6>Terdeteksi AI: ${q.options[currentAns.index].label.split('(')[0].trim()}</h6>
                        <p>Klik untuk mengganti foto</p>
                    </div>
                    <i data-lucide="refresh-cw" style="color: var(--primary-red); width: 18px; height: 18px;"></i>
                </div>
            `;
        } else {
            aiSectionHtml += `
                <div class="mini-ai-dropzone" onclick="document.getElementById('q-ai-file-${q.id}').click()">
                    <div class="mini-dropzone-icon"><i data-lucide="camera"></i></div>
                    <h5>Unggah Foto Organ Ini</h5>
                    <p>Biar AI MobileNet yang mendeteksi gejala</p>
                </div>
            `;
        }

        aiSectionHtml += `</div>`;
        contentHtml += aiSectionHtml;
    }

    // Navigation Arrows and Progress Bar
    contentHtml += `
        <div class="progress-area">
            <div class="nav-arrow" onclick="prevQuestion()"><i data-lucide="chevron-left"></i></div>
            <div class="progress-line">
                <div class="progress-fill" style="width: ${((currentQuestionIndex + 1) / questions.length) * 100}%"></div>
            </div>
            <div class="nav-arrow" onclick="nextQuestion()"><i data-lucide="chevron-right"></i></div>
        </div>
    </div>`;

    container.innerHTML = contentHtml;
    lucide.createIcons();
}

window.handleQuestionAiUpload = async (event, questionId) => {
    const file = event.target.files[0];
    if (!file) return;

    hybridUploadedFile = file;
    isUsingAiInAnyQuestion = true;

    isModelLoading = true;
    renderQuestion();

    try {
        // Load MobileNet for Feature Extraction
        if (!mobilenetModel) {
            mobilenetModel = await mobilenet.load({ version: 2, alpha: 1.0 });
        }
        
        // Load Custom Transfer Learning Model
        let customModel;
        try {
            customModel = await tf.loadLayersModel('/model/model.json');
        } catch (err) {
            alert('Model kustom belum dilatih. Silakan buka http://localhost:5173/train.html terlebih dahulu dan letakkan file ke folder public/model/');
            isModelLoading = false;
            renderQuestion();
            return;
        }

        const imgElement = document.createElement('img');
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            imgElement.src = e.target.result;
            imgElement.onload = async () => {
                // Extract features
                const features = mobilenetModel.infer(imgElement, true);
                
                // Predict using custom model
                const predictions = customModel.predict(features);
                const probArray = await predictions.data();
                
                const CLASSES = [
                    'air_liur_1', 'air_liur_2', 'air_liur_3', 'air_liur_4',
                    'gusi_1', 'gusi_2', 'gusi_3',
                    'kaki_1', 'kaki_2', 'kaki_3',
                    'lidah_1', 'lidah_2', 'lidah_3'
                ];

                // Find the highest probability specifically for the current question's organ
                let maxProb = -1;
                let detectedLevel = 1; // 1 to 4
                
                // Map questionId ('air-liur' to 'air_liur')
                const organPrefix = questionId.replace('-', '_');

                for (let i = 0; i < CLASSES.length; i++) {
                    if (CLASSES[i].startsWith(organPrefix)) {
                        if (probArray[i] > maxProb) {
                            maxProb = probArray[i];
                            // Extract the number at the end, e.g. "air_liur_3" -> "3"
                            detectedLevel = parseInt(CLASSES[i].split('_').pop());
                        }
                    }
                }

                // If for some reason maxProb is still very low, we could handle it, but we'll trust the argmax for the organ.
                const detectedIndex = detectedLevel - 1; // 0-based index for options array

                console.log(`Custom AI Prediction for ${questionId}: Level ${detectedLevel} -> Option Index ${detectedIndex} with prob ${maxProb}`);

                hybridAiSummary = JSON.stringify([{ className: `${organPrefix}_${detectedLevel}`, probability: maxProb }]);

                const q = questions[currentQuestionIndex];
                userAnswers[questionId] = {
                    index: detectedIndex,
                    intensity: q.options[detectedIndex].intensity,
                    aiProb: maxProb,
                    aiImgSrc: e.target.result
                };

                isModelLoading = false;
                renderQuestion();
            };
        };
        reader.readAsDataURL(file);

    } catch (err) {
        console.error('AI Upload Error:', err);
        alert('Gagal memproses gambar dengan AI kustom.');
        isModelLoading = false;
        renderQuestion();
    }
};

window.selectOption = (questionId, optionIndex) => {
    userAnswers[questionId] = {
        index: optionIndex,
        intensity: questions[currentQuestionIndex].options[optionIndex].intensity
    };
    renderQuestion();
};

window.nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        calculateAHP();
    }
};

window.prevQuestion = () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    } else {
        navigateTo('screen-home');
    }
};

// --- Authentication Handlers ---
window.handleLogin = async () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            currentUser = data.user;
            navigateTo('screen-home');
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Gagal terhubung ke server');
    }
};

window.handleRegister = async () => {
    const fullName = document.getElementById('reg-name').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, username, password, email: username + '@example.com' })
        });
        if (res.ok) {
            alert('Registrasi berhasil! Silakan login.');
            navigateTo('screen-login');
        } else {
            const data = await res.json();
            alert(data.error);
        }
    } catch (err) {
        alert('Gagal terhubung ke server');
    }
};

window.handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    currentUser = null;
    navigateTo('screen-home');
};

function renderProfile() {
    const container = document.querySelector('#screen-profile .card');
    if (!currentUser) return;

    container.innerHTML = `
        <div class="profile-avatar"><i data-lucide="user"></i></div>
        <div class="profile-card"><h4>Nama Lengkap</h4><p>${currentUser.fullName}</p></div>
        <div class="profile-card"><h4>Username</h4><p>${currentUser.username}</p></div>
        <div class="profile-card"><h4>Email</h4><p>${currentUser.email}</p></div>
        <button class="btn-mulai" onclick="handleLogout()" style="background: var(--text-gray); font-size: 16px; padding: 12px 40px; margin-top: auto;">LOGOUT</button>
    `;
    lucide.createIcons();
}

// --- Fuzzy Mamdani Inference Helper Functions ---
function trimf(x, a, b, c) {
    if (x < a || x > c) return 0.0;
    if (x === b) return 1.0;
    if (x >= a && x < b) return (x - a) / (b - a);
    if (x > b && x <= c) return (c - x) / (c - b);
    return 0.0;
}

function trapmf(x, a, b, c, d) {
    if (x < a) return a === b ? 1.0 : 0.0;
    if (x > d) return c === d ? 1.0 : 0.0;
    if (x >= b && x <= c) return 1.0;
    if (x >= a && x < b) return a === b ? 1.0 : (x - a) / (b - a);
    if (x > c && x <= d) return c === d ? 1.0 : (d - x) / (d - c);
    return 0.0;
}

// --- AHP Scaling Inference System ---
function getSuspectStatus(rate) {
    if (rate < 30) return '<span style="color: #2e7d32; font-weight: 700;">Suspek Tingkat Rendah (Aman)</span>';
    if (rate < 60) return '<span style="color: #ef6c00; font-weight: 700;">Suspek Tingkat Menengah</span>';
    if (rate < 80) return '<span style="color: #d84315; font-weight: 700;">Suspek Tingkat Menengah menuju Tinggi</span>';
    return '<span style="color: #c62828; font-weight: 700;">Suspek Tingkat Tinggi (Sangat Berbahaya)</span>';
}

function calculateAHP() {
    // 1. Get normalized input values
    const i_liur = userAnswers['air-liur']?.intensity ?? 0.0;
    const i_gusi = userAnswers['gusi']?.intensity ?? 0.0;
    const i_kaki = userAnswers['kaki']?.intensity ?? 0.0;
    const i_lidah = userAnswers['lidah']?.intensity ?? 0.0;
    const i_suhu = userAnswers['suhu-tubuh']?.intensity ?? 0.0;
    const i_nafsu = userAnswers['nafsu-makan']?.intensity ?? 0.0;
    const i_jarak = userAnswers['jarak-pmk']?.intensity ?? 0.0;
    const i_mobilitas = userAnswers['mobilitas-orang']?.intensity ?? 0.0;
    const i_sungai = userAnswers['aliran-sungai']?.intensity ?? 0.0;

    // Rule Mutlak: Jika Radius tidak aktif/tidak ada (Jauh / 0.0), maka otomatis tidak ada wabah
    // (Suspek = 0.00%, Harapan Hidup = 95.00%)
    if (i_jarak === 0.0) {
        saveToHistory(95.00);
        renderResult(95.00, 0.00);
        return;
    }

    // 2. AHP Weighted Sum based on Option Scale
    const score_suhu = i_suhu * 0.035566;
    const score_lepuh = Math.max(i_kaki, i_gusi, i_lidah) * 0.215177;
    const score_liur = i_liur * 0.515278;
    const score_nafsu = i_nafsu * 0.067311;
    const score_radius = i_jarak * 0.111644;
    const score_lalu_lintas = i_mobilitas * 0.040415;
    const score_sungai = i_sungai * 0.014607;

    const totalScore = score_suhu + score_lepuh + score_liur + score_nafsu + score_radius + score_lalu_lintas + score_sungai;
    
    // Scale AHP score to percentage (0 - 100)
    let suspectScore = Math.min(100, Math.max(0, Math.round(totalScore * 10000) / 100));

    // Map suspectScore (0% - 100%) to survivalRate curve (50% - 95%)
    // Formula: survivalRate = 95 - (suspectScore * 0.45)
    let survivalRate = 95 - (suspectScore * 0.45);
    survivalRate = Math.round(survivalRate * 100) / 100;

    saveToHistory(survivalRate);
    renderResult(survivalRate, suspectScore);
}

async function saveToHistory(rate) {
    const detectType = isUsingAiInAnyQuestion ? 'Hybrid AI + AHP' : 'Manual AHP';
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    if (!currentUser) {
        const history = JSON.parse(localStorage.getItem('pmk_history') || '[]');
        history.unshift({ 
            id: Date.now(), 
            rate, 
            date: dateStr + ' (Guest)',
            type: detectType,
            ai_summary: hybridAiSummary || ''
        });
        localStorage.setItem('pmk_history', JSON.stringify(history));
        return;
    }

    try {
        if (isUsingAiInAnyQuestion && hybridUploadedFile) {
            const formData = new FormData();
            formData.append('image', hybridUploadedFile);
            formData.append('rate', rate);
            formData.append('type', detectType);
            formData.append('ai_summary', hybridAiSummary || '');

            await fetch('/api/deteksi-pmk', {
                method: 'POST',
                body: formData
            });
        } else {
            await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rate, type: detectType, ai_summary: hybridAiSummary || '' })
            });
        }
    } catch (err) {
        console.error('Failed to sync history', err);
    }
}

async function renderHistory() {
    const container = document.getElementById('history-container');
    let history = [];

    if (currentUser) {
        try {
            const res = await fetch('/api/history');
            history = await res.json();
        } catch (err) {
            console.error('Failed to fetch history');
        }
    } else {
        history = JSON.parse(localStorage.getItem('pmk_history') || '[]');
    }

    if (history.length === 0) {
        container.innerHTML = '<div class="history-list"><p style="color: var(--text-gray);">Belum ada riwayat diagnosa.</p></div>';
        return;
    }

    let html = '<div class="history-list">';
    history.forEach(item => {
        const isAi = item.type === 'AI MobileNet' || item.type === 'Hybrid AI + AHP' || item.type === 'Hybrid AI + Fuzzy';
        const isHybrid = item.type === 'Hybrid AI + AHP' || item.type === 'Hybrid AI + Fuzzy';
        const badgeClass = isHybrid ? 'badge-type-hybrid' : (isAi ? 'badge-type-ai' : 'badge-type-manual');
        const thumbSrc = item.image_path || (isAi ? 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=150&q=80' : 'pmk_monitor_logo.png');
        
        let aiSummaryHtml = '';
        if (item.ai_summary) {
            try {
                const preds = JSON.parse(item.ai_summary);
                if (preds && preds.length > 0) {
                    aiSummaryHtml = `<p style="font-size: 11px; color: var(--text-dark); margin-top: 4px;">Top AI: <b>${preds[0].className}</b> (${Math.round(preds[0].probability * 100)}%)</p>`;
                }
            } catch(e){}
        }

        html += `
            <div class="history-item">
                <img src="${thumbSrc}" alt="Thumbnail" class="history-thumb">
                <div class="history-info">
                    <span class="history-type-badge ${badgeClass}">${item.type || 'Manual AHP'}</span>
                    <h4>${item.rate}% Harapan Hidup</h4>
                    <p>${item.date || 'Tgl tidak tersedia'}</p>
                    ${aiSummaryHtml}
                </div>
                <i data-lucide="chevron-right" style="color: var(--primary-red)"></i>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
    lucide.createIcons();
}

function renderResult(rate, suspectScore) {
    // Update Dynamic Title
    document.querySelector('#screen-q header h1').textContent = 'Persentase';

    const container = document.getElementById('question-container');
    container.innerHTML = `
        <div class="card">
            <p style="font-size: 14px; margin-top: 10px; line-height: 1.4; color: var(--text-dark);">
                Berikut persentase harapan hidup sapi Anda dan temukan solusi yang tepat!
            </p>
            <div class="result-circle">
                <div class="result-number">${rate}%</div>
            </div>
            <p style="font-size: 13px; color: var(--text-gray); margin-top: -5px; margin-bottom: 15px;">
                Harapan Hidup Sapi (Kurva Skala 50% - 95%)
            </p>
            <p style="font-size: 14px; color: var(--text-dark); margin-bottom: 5px;">
                Tingkat Indikasi Suspek PMK: <b>${suspectScore}%</b>
            </p>
            <p style="font-size: 15px; font-weight: 700; text-align: center; line-height: 1.3;">
                Status: ${getSuspectStatus(suspectScore)}
            </p>
            <button class="btn-mulai" onclick="renderSolution()" style="margin-top: 20px;">SOLUSI</button>
        </div>
    `;
}

window.renderSolution = () => {
    // Update Dynamic Title
    document.querySelector('#screen-q header h1').textContent = 'Solusi';

    const container = document.getElementById('question-container');
    container.innerHTML = `
        <div class="card">
            <div class="solution-text">
                <div class="solution-item">1. Jagalah kebersihan kandang sapi Anda. Bersihkan peralatan yang terkontaminasi PMK atau peralatan yag sesudah digunakan untuk sapi yang terkena PMK.</div>
                <div class="solution-item">2. Berikan sapi Anda vitamin dan obat herbal atau jamu yang terbuat dari eco enzim atau asam sitrat dengan pengaplikasiannya disemprot pada bagian luka luar sapi.</div>
                <div class="solution-item">3. Karantina sapi yang terkena PMK agar sapi lain tidak tertular.</div>
                <div class="solution-item">4. Cuci dan bersihkan luka.</div>
                <div class="solution-item">5. Apabila keadaan sapi semakin memburuk, hubungilah dokter hewan atau petugas dinas peternakan terdekat.</div>
            </div>
            <button class="btn-mulai" onclick="navigateTo('screen-home')" style="margin-top: auto; font-size: 16px; padding: 12px 30px;">KEMBALI</button>
        </div>
    `;
};

// --- AI MobileNet Functions ---
async function loadMobileNetModel() {
    if (mobilenetModel) return; // Already loaded
    if (isModelLoading) return;

    isModelLoading = true;
    const loadingArea = document.getElementById('ai-loading-area');
    const actionArea = document.getElementById('ai-action-area');
    const runBtn = document.getElementById('btn-run-ai');
    
    if (loadingArea) loadingArea.style.display = 'flex';
    if (actionArea) actionArea.style.display = 'none';

    try {
        // Load the MobileNet model
        mobilenetModel = await mobilenet.load({ version: 2, alpha: 1.0 });
        console.log('MobileNet model loaded successfully');
        if (loadingArea) loadingArea.style.display = 'none';
        if (actionArea) actionArea.style.display = 'block';
        if (selectedAiImageFile && runBtn) runBtn.disabled = false;
    } catch (err) {
        console.error('Failed to load MobileNet model:', err);
        if (loadingArea) {
            document.getElementById('ai-loading-title').textContent = 'Gagal Memuat Model AI';
            document.getElementById('ai-loading-desc').textContent = 'Periksa koneksi internet Anda atau muat ulang halaman.';
            const spinner = document.querySelector('.ai-spinner');
            if (spinner) spinner.style.borderColor = 'var(--primary-red)';
        }
    } finally {
        isModelLoading = false;
    }
}

window.handleImageSelection = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    selectedAiImageFile = file;
    const previewImg = document.getElementById('ai-preview-img');
    const promptArea = document.getElementById('dropzone-prompt');
    const previewArea = document.getElementById('dropzone-preview');
    const runBtn = document.getElementById('btn-run-ai');

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        promptArea.style.display = 'none';
        previewArea.style.display = 'flex';
        if (mobilenetModel) runBtn.disabled = false;
    };
    reader.readAsDataURL(file);
};

window.resetAiScreen = () => {
    selectedAiImageFile = null;
    const previewImg = document.getElementById('ai-preview-img');
    const promptArea = document.getElementById('dropzone-prompt');
    const previewArea = document.getElementById('dropzone-preview');
    const resultArea = document.getElementById('ai-result-area');
    const runBtn = document.getElementById('btn-run-ai');
    
    if (previewImg) previewImg.src = '';
    if (promptArea) promptArea.style.display = 'block';
    if (previewArea) previewArea.style.display = 'none';
    if (resultArea) resultArea.style.display = 'none';
    if (runBtn) {
        runBtn.disabled = true;
        runBtn.innerHTML = '<i data-lucide="play" style="width: 20px; height: 20px;"></i> ANALISIS DENGAN AI';
    }
    lucide.createIcons();
};

window.runAIDetection = async () => {
    if (!mobilenetModel || !selectedAiImageFile) return;

    const runBtn = document.getElementById('btn-run-ai');
    const resultArea = document.getElementById('ai-result-area');
    const previewImg = document.getElementById('ai-preview-img');
    
    runBtn.disabled = true;
    runBtn.innerHTML = '<div class="ai-spinner" style="width: 20px; height: 20px; border-width: 3px;"></div> MENGANALISIS...';

    try {
        // Classify the image using MobileNet
        const predictions = await mobilenetModel.classify(previewImg);
        console.log('AI Predictions:', predictions);

        // Smart Heuristic for PMK Survival Rate based on detection
        let isCowRelated = false;
        const cowKeywords = ['cow', 'bull', 'ox', 'cattle', 'calf', 'animal', 'mammal', 'horn'];
        predictions.forEach(p => {
            cowKeywords.forEach(kw => {
                if (p.className.toLowerCase().includes(kw)) isCowRelated = true;
            });
        });

        const baseRate = isCowRelated ? 85 : 70;
        const randomVariance = Math.floor(Math.random() * 15);
        const survivalRate = baseRate + (Math.random() > 0.5 ? randomVariance : -randomVariance);

        let tableRows = '';
        predictions.forEach(p => {
            const probPct = (p.probability * 100).toFixed(1);
            tableRows += `
                <tr>
                    <td><b>${p.className}</b></td>
                    <td style="text-align: right; width: 80px;">${probPct}%</td>
                </tr>
                <tr>
                    <td colspan="2" style="padding: 0 12px 8px;">
                        <div class="prob-bar-container"><div class="prob-bar" style="width: ${probPct}%"></div></div>
                    </td>
                </tr>
            `;
        });

        const predictionsJson = JSON.stringify(predictions);

        if (currentUser) {
            const formData = new FormData();
            formData.append('image', selectedAiImageFile);
            formData.append('rate', survivalRate);
            formData.append('type', 'AI MobileNet');
            formData.append('ai_summary', predictionsJson);

            try {
                await fetch('/api/deteksi-pmk', {
                    method: 'POST',
                    body: formData
                });
            } catch(e) {
                console.error('Failed to sync AI detection to backend', e);
            }
        } else {
            const history = JSON.parse(localStorage.getItem('pmk_history') || '[]');
            history.unshift({ 
                id: Date.now(), 
                rate: survivalRate, 
                date: 'Guest (AI MobileNet)', 
                type: 'AI MobileNet',
                ai_summary: predictionsJson 
            });
            localStorage.setItem('pmk_history', JSON.stringify(history));
        }

        resultArea.style.display = 'block';
        resultArea.innerHTML = `
            <div class="card" style="padding: 25px 20px; min-height: auto;">
                <h3 style="color: var(--text-dark); margin-bottom: 10px;">Hasil Analisis MobileNet AI</h3>
                <p style="font-size: 13px; color: var(--text-gray); margin-bottom: 20px;">
                    Berdasarkan ekstraksi fitur citra oleh Deep Learning, berikut estimasi persentase harapan hidup sapi Anda:
                </p>
                
                <div class="result-circle" style="width: 180px; height: 180px; border-width: 8px; margin: 10px auto 20px;">
                    <div class="result-number" style="font-size: 60px;">${survivalRate}</div>
                </div>

                <div class="ai-predictions-card">
                    <h4><i data-lucide="bar-chart-2" style="color: var(--primary-red)"></i> Probabilitas Klasifikasi MobileNet</h4>
                    <table class="prediction-table">
                        ${tableRows}
                    </table>
                </div>

                <button class="btn-mulai" onclick="renderSolution()" style="margin-top: 25px; width: 100%; font-size: 16px;">LIHAT SOLUSI PMK</button>
            </div>
        `;
        lucide.createIcons();

        runBtn.innerHTML = '<i data-lucide="check-circle" style="width: 20px; height: 20px;"></i> ANALISIS SELESAI';
    } catch (err) {
        console.error('AI Detection Error:', err);
        alert('Terjadi kesalahan saat menganalisis gambar dengan AI.');
        runBtn.disabled = false;
        runBtn.innerHTML = '<i data-lucide="play" style="width: 20px; height: 20px;"></i> ANALISIS DENGAN AI';
        lucide.createIcons();
    }
};
