// WEBAUDIO API SYNTHESISER & SOUND EFFECTS
let audioCtx = null;
let activeSongTimeouts = [];
let isPlayingSong = false;
let currentTempo = 140; // BPM

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Retro Music Box Note Synthesis
function playChimeNote(freq, startTime, duration) {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const delayNode = audioCtx.createDelay();
    const delayFeedback = audioCtx.createGain();

    osc.type = 'triangle'; // Smooth chime tone
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Add subtle pitch vibrato (wobble) for retro vibe
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 6; // LFO speed
    lfoGain.gain.value = freq * 0.008; // Vibrato depth
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    // Delay effect (Soft echo)
    delayNode.delayTime.value = 0.25;
    delayFeedback.gain.value = 0.35; // echo feedback

    // Chime Envelope (rapid attack, long decay)
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.05);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Connect to echo delay line
    gainNode.connect(delayNode);
    delayNode.connect(delayFeedback);
    delayFeedback.connect(delayNode);
    delayNode.connect(audioCtx.destination);

    lfo.start(startTime);
    osc.start(startTime);
    osc.stop(startTime + duration);
    
    lfo.stop(startTime + duration);
}

// Noise-based puff sound for blowing candles
function playPuffSound() {
    initAudioContext();
    if (!audioCtx) return;

    const bufferSize = audioCtx.sampleRate * 0.35; // 0.35 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill buffer with white noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400; // wind frequency range
    filter.Q.value = 1.0;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noiseNode.start();
}

// Popping sound effect for balloons
function playPopSound() {
    initAudioContext();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    // Rapidly drop frequency (Pitch sweep)
    osc.frequency.setValueAtTime(320, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
}

// Happy Birthday Notes Frequencies
const NOTES = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, Bb4: 466.16,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00
};

// Happy Birthday melody sequence: [note, duration_beats]
const MELODY = [
    ['C4', 0.75], ['C4', 0.25], ['D4', 1], ['C4', 1], ['F4', 1], ['E4', 2],
    ['C4', 0.75], ['C4', 0.25], ['D4', 1], ['C4', 1], ['G4', 1], ['F4', 2],
    ['C4', 0.75], ['C4', 0.25], ['C5', 1], ['A4', 1], ['F4', 1], ['E4', 1], ['D4', 2],
    ['Bb4', 0.75], ['Bb4', 0.25], ['A4', 1], ['F4', 1], ['G4', 1], ['F4', 2]
];

function playBirthdayMelody() {
    if (isPlayingSong) return;
    initAudioContext();
    isPlayingSong = true;
    
    // Toggle class on visualizer widget
    document.getElementById('visualizer').classList.add('playing');
    document.getElementById('music-icon').className = 'fas fa-pause';
    
    let timeAccumulator = audioCtx.currentTime + 0.1;
    const beatDuration = 60 / currentTempo; // Beat length in seconds

    MELODY.forEach((noteData, idx) => {
        const noteName = noteData[0];
        const durationBeats = noteData[1];
        const durationSecs = durationBeats * beatDuration;
        const noteFreq = NOTES[noteName];
        
        const t = setTimeout(() => {
            if (isPlayingSong) {
                playChimeNote(noteFreq, audioCtx.currentTime, durationSecs);
            }
        }, (timeAccumulator - audioCtx.currentTime) * 1000);
        
        activeSongTimeouts.push(t);
        timeAccumulator += durationSecs;
    });

    // Handle end of song
    const endTimeout = setTimeout(() => {
        stopBirthdayMelody();
    }, (timeAccumulator - audioCtx.currentTime) * 1000);
    activeSongTimeouts.push(endTimeout);
}

function stopBirthdayMelody() {
    isPlayingSong = false;
    activeSongTimeouts.forEach(clearTimeout);
    activeSongTimeouts = [];
    document.getElementById('visualizer').classList.remove('playing');
    document.getElementById('music-icon').className = 'fas fa-play';
}

// Toggle background music
function toggleSong() {
    if (isPlayingSong) {
        stopBirthdayMelody();
    } else {
        playBirthdayMelody();
    }
}


// BACKGROUND SPARKS PARTICLES
function createBgSparks() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    const colors = ['#ff4f87', '#c586ff', '#9ad9ff', '#ffd6e7', '#ffffff'];
    const maxParticles = 35;
    
    for (let i = 0; i < maxParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'bg-particle';
        
        // Random dimensions and vectors
        const size = Math.random() * 8 + 4;
        const startX = Math.random() * 100;
        const scale = Math.random() * 1.5 + 0.5;
        const driftX = (Math.random() * 200 - 100) + 'px';
        const delay = Math.random() * 8;
        const duration = Math.random() * 6 + 6;
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '20%';
        particle.style.left = startX + '%';
        particle.style.setProperty('--drift-x', driftX);
        particle.style.setProperty('--scale', scale);
        particle.style.animationDelay = delay + 's';
        particle.style.animationDuration = duration + 's';
        
        container.appendChild(particle);
    }
}


// BALLOON POP GAME LOGIC
let popScore = 0;
let popGameActive = false;

function launchBalloon() {
    if (!popGameActive) return;
    
    const balloonColors = ['#ff6b6b', '#ff85a1', '#f72585', '#b5179e', '#7209b7', '#4895ef', '#4cc9f0', '#ffb703', '#80ed99'];
    const balloon = document.createElement('div');
    const string = document.createElement('div');
    
    balloon.className = 'floating-balloon';
    string.className = 'balloon-string';
    balloon.appendChild(string);
    
    const leftPos = Math.random() * 80 + 10; // offset edges
    const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    const speed = Math.random() * 6 + 7; // speed in seconds to cross viewport
    
    balloon.style.left = leftPos + '%';
    balloon.style.bottom = '-150px';
    balloon.style.color = color;
    balloon.style.backgroundColor = color;
    
    // Set custom speed for vertical floating translation
    balloon.style.transition = `bottom ${speed}s linear, opacity 0.5s ease`;
    
    document.body.appendChild(balloon);
    
    // Float upwards
    setTimeout(() => {
        balloon.style.bottom = '110vh';
    }, 50);
    
    // Click pop action
    balloon.addEventListener('mousedown', (e) => {
        popBalloon(balloon, color, e.clientX, e.clientY);
    });
    balloon.addEventListener('touchstart', (e) => {
        popBalloon(balloon, color, e.touches[0].clientX, e.touches[0].clientY);
    });
    
    // Remove if floated away
    setTimeout(() => {
        if (balloon.parentNode) {
            balloon.parentNode.removeChild(balloon);
        }
    }, speed * 1000 + 100);
}

function popBalloon(balloon, color, clickX, clickY) {
    playPopSound();
    
    // Create pop dust particles
    createPopDust(clickX, clickY, color);
    
    // Confetti blast on pop
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 20,
            angle: 90,
            spread: 50,
            origin: { x: clickX / window.innerWidth, y: clickY / window.innerHeight },
            colors: [color, '#ffffff']
        });
    }
    
    // Update score card
    popScore++;
    document.getElementById('pop-score').innerText = popScore;
    
    // Remove element
    balloon.style.opacity = '0';
    balloon.style.transform = 'scale(0.2)';
    setTimeout(() => {
        if (balloon.parentNode) {
            balloon.parentNode.removeChild(balloon);
        }
    }, 150);
}

function createPopDust(x, y, color) {
    const totalParticles = 10;
    for (let i = 0; i < totalParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'pop-particle';
        particle.style.background = color;
        particle.style.top = y + window.scrollY - 4 + 'px';
        particle.style.left = x - 4 + 'px';
        
        // Random destination offsets
        const tx = (Math.random() * 120 - 60) + 'px';
        const ty = (Math.random() * 120 - 60) + 'px';
        particle.style.setProperty('--tx', tx);
        particle.style.setProperty('--ty', ty);
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 800);
    }
}

// Start balloon generator loop
function startBalloonGenerator() {
    popGameActive = true;
    document.getElementById('pop-score-widget').classList.add('active');
    setInterval(launchBalloon, 3500); // launch balloon every 3.5s
}


// INTERACTIVE CAKE & CANDLE BLOWING
let candlesLit = true;

function blowCandles() {
    if (!candlesLit) return;
    candlesLit = false;
    
    // Blow sound
    playPuffSound();
    
    // Extinguish flames
    const flames = document.querySelectorAll('.flame');
    flames.forEach(flame => {
        flame.classList.add('blown-out');
    });
    
    // Trigger giant Confetti Burst!
    if (typeof confetti === 'function') {
        const cakeRect = document.getElementById('birthday-cake').getBoundingClientRect();
        const originX = (cakeRect.left + cakeRect.width/2) / window.innerWidth;
        const originY = (cakeRect.top + cakeRect.height/2) / window.innerHeight;
        
        // Burst 1
        confetti({
            particleCount: 150,
            spread: 90,
            origin: { x: originX, y: originY }
        });
        
        // Continuous burst cascade
        setTimeout(() => {
            confetti({
                particleCount: 80,
                spread: 120,
                origin: { x: originX - 0.1, y: originY }
            });
            confetti({
                particleCount: 80,
                spread: 120,
                origin: { x: originX + 0.1, y: originY }
            });
        }, 200);
    }
    
    // Autoplay birthday music
    setTimeout(() => {
        playBirthdayMelody();
    }, 800);
    
    // Update button text
    const blowBtn = document.getElementById('blow-btn');
    blowBtn.innerHTML = '<i class="fa-solid fa-cake-candles"></i> Blew out! 🌟';
    blowBtn.style.background = 'linear-gradient(135deg, #7b2cbf, #9d4edd)';
    blowBtn.style.boxShadow = '0 6px 15px rgba(157, 78, 221, 0.25)';
}


// SCRATCH-TO-REVEAL MESSAGES
function initScratchCards() {
    const canvases = document.querySelectorAll('.scratch-canvas');
    
    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const cardWidth = canvas.parentElement.clientWidth;
        const cardHeight = canvas.parentElement.clientHeight;
        
        canvas.width = cardWidth;
        canvas.height = cardHeight;
        
        // Retrieve dynamic secret message
        const secretText = canvas.getAttribute('data-text');
        canvas.parentElement.parentElement.setAttribute('data-content', secretText);
        
        // Draw metallic scratch off layer
        const gradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
        gradient.addColorStop(0, '#ff7fa9');
        gradient.addColorStop(0.5, '#ffd6e7');
        gradient.addColorStop(1, '#c586ff');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, cardWidth, cardHeight);
        
        // Draw scratch icons / patterns on canvas overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.font = '28px sans-serif';
        ctx.fillText('✨', 30, 45);
        ctx.fillText('💖', cardWidth - 55, cardHeight - 30);
        ctx.fillText('✨', cardWidth - 50, 45);
        ctx.fillText('💖', 30, cardHeight - 30);
        
        // Centered call to action label
        ctx.fillStyle = '#fff';
        ctx.font = '700 16px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(224, 59, 113, 0.4)';
        ctx.shadowBlur = 6;
        ctx.fillText('SCRATCH TO REVEAL 💖', cardWidth / 2, cardHeight / 2);
        
        // Scratch action listeners
        let isDrawing = false;
        ctx.shadowBlur = 0; // reset shadow for transparent drawing operations
        
        function scratch(e) {
            if (!isDrawing) return;
            initAudioContext();
            
            // Get coordinates
            const rect = canvas.getBoundingClientRect();
            let x, y;
            if (e.touches) {
                x = e.touches[0].clientX - rect.left;
                y = e.touches[0].clientY - rect.top;
            } else {
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }
            
            // Draw clearing circles
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 22, 0, Math.PI * 2);
            ctx.fill();
            
            // Check completed percentage
            checkScratchPercentage(canvas, ctx);
        }
        
        // Mouse Listeners
        canvas.addEventListener('mousedown', () => isDrawing = true);
        canvas.addEventListener('mousemove', scratch);
        window.addEventListener('mouseup', () => isDrawing = false);
        
        // Touch Listeners
        canvas.addEventListener('touchstart', (e) => {
            isDrawing = true;
            scratch(e);
        });
        canvas.addEventListener('touchmove', scratch);
        window.addEventListener('touchend', () => isDrawing = false);
    });
}

function checkScratchPercentage(canvas, ctx) {
    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    let clearedCount = 0;
    
    // Count transparent pixels (cleared content check)
    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) {
            clearedCount++;
        }
    }
    
    const percentage = (clearedCount / (width * height)) * 100;
    
    // If scratched more than 45%, auto fadeout overlay canvas entirely
    if (percentage > 45) {
        canvas.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        canvas.style.opacity = '0';
        canvas.style.transform = 'scale(0.95)';
        
        // Trigger small micro-celebration
        if (typeof confetti === 'function' && !canvas.classList.contains('revealed')) {
            canvas.classList.add('revealed');
            
            const rect = canvas.getBoundingClientRect();
            confetti({
                particleCount: 15,
                spread: 40,
                origin: { x: (rect.left + rect.width/2)/window.innerWidth, y: (rect.top + rect.height/2)/window.innerHeight }
            });
        }
        
        setTimeout(() => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        }, 600);
    }
}


// FRIENDSHIP QUIZ / TRIVIA ENGINE
function initQuizEngine() {
    const optionButtons = document.querySelectorAll('.option-btn');
    
    optionButtons.forEach(button => {
        button.addEventListener('click', () => {
            initAudioContext();
            const isCorrect = button.getAttribute('data-correct') === 'true';
            
            if (isCorrect) {
                button.classList.add('correct');
                
                // Fire congrats confetti burst on button location
                if (typeof confetti === 'function') {
                    const btnRect = button.getBoundingClientRect();
                    confetti({
                        particleCount: 30,
                        spread: 50,
                        origin: { x: (btnRect.left + btnRect.width/2)/window.innerWidth, y: (btnRect.top + btnRect.height/2)/window.innerHeight }
                    });
                }
                
                // Proceed to next question step after delay
                const activeCard = button.parentElement.parentElement;
                const currentStep = parseInt(activeCard.getAttribute('data-step'));
                const nextCard = document.getElementById(`q${currentStep + 1}`);
                
                setTimeout(() => {
                    activeCard.classList.remove('active');
                    if (nextCard) {
                        nextCard.classList.add('active');
                    } else {
                        // All questions correct - show victory card
                        document.getElementById('quiz-success-card').classList.add('active');
                    }
                }, 1000);
                
            } else {
                button.classList.add('wrong');
                // Shake card animation
                const card = button.parentElement.parentElement;
                card.style.animation = 'shake 0.4s ease';
                
                setTimeout(() => {
                    card.style.animation = '';
                    button.classList.remove('wrong');
                }, 400);
            }
        });
    });
}

// Add shake keyframe dynamically to style
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
}
`;
document.head.appendChild(styleSheet);


// POLAROID GALLERY LIGHTBOX ENGINE
function initPolaroidLightbox() {
    const polaroids = document.querySelectorAll('.polaroid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close-btn');
    
    polaroids.forEach(card => {
        card.addEventListener('click', () => {
            const imgEl = card.querySelector('img');
            const capEl = card.querySelector('.caption');
            
            // Check if standard picture or fallback is shown
            if (imgEl && imgEl.style.display !== 'none') {
                lightboxImg.src = imgEl.src;
                lightboxImg.style.display = 'inline-block';
            } else {
                // Image missing - use a gradient representation in lightbox
                lightboxImg.style.display = 'none';
            }
            
            lightboxCaption.innerText = capEl ? capEl.innerText : 'Memories';
            lightbox.classList.add('active');
            
            // Small polaroid pop confetti
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 25,
                    spread: 60
                });
            }
        });
    });
    
    // Close Lightbox
    const closeLightbox = () => lightbox.classList.remove('active');
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}


// POPUP LETTER Surprise box
function initLetterPopups() {
    const claimBtn = document.getElementById('claim-gift-btn');
    const giftBox = document.getElementById('interact-gift-box');
    const overlay = document.getElementById('letter-modal-overlay');
    const closeBtn = document.getElementById('letter-close-btn');
    
    const openLetter = () => {
        initAudioContext();
        overlay.classList.add('active');
        
        // Massive screen celebration shower
        if (typeof confetti === 'function') {
            const end = Date.now() + (2 * 1000);
            const interval = setInterval(() => {
                if (Date.now() > end) return clearInterval(interval);
                confetti({
                    startVelocity: 30,
                    spread: 360,
                    ticks: 60,
                    origin: { x: Math.random(), y: Math.random() - 0.2 }
                });
            }, 200);
        }
    };
    
    claimBtn.addEventListener('click', openLetter);
    
    // Lid opening animation on giftbox click
    if (giftBox) {
        giftBox.addEventListener('click', () => {
            const lid = giftBox.querySelector('.gift-lid');
            lid.style.transform = 'translateY(-30px) rotate(-15deg)';
            lid.style.opacity = '0.5';
            
            setTimeout(() => {
                openLetter();
                // reset lid
                setTimeout(() => {
                    lid.style.transform = '';
                    lid.style.opacity = '';
                }, 2000);
            }, 450);
        });
    }
    
    const closeLetter = () => overlay.classList.remove('active');
    closeBtn.addEventListener('click', closeLetter);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeLetter();
    });
}


// GSAP SCROLL-TRIGGERED ENTRANCE EFFECTS
function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    // Register trigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero Card Pop entrance
    gsap.from('#hero-left-card', {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out'
    });
    
    gsap.from('#hero-photo-box', {
        rotation: 10,
        x: 80,
        opacity: 0,
        duration: 1.4,
        ease: 'power3.out'
    });
    
    // Scroll reveals
    // Message section
    gsap.from('.message-box', {
        scrollTrigger: {
            trigger: '.message-section',
            start: 'top 80%',
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });
    
    // Cascade load cards in message box
    gsap.from('.reason-card', {
        scrollTrigger: {
            trigger: '.reasons',
            start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'back.out(1.7)'
    });
    
    // Quiz Box
    gsap.from('.quiz-box', {
        scrollTrigger: {
            trigger: '.quiz-section',
            start: 'top 80%',
        },
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
    });
    
    // Couple photo box
    gsap.from('.couple-box', {
        scrollTrigger: {
            trigger: '.couple-section',
            start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });
    
    // Polaroid cards staggered float in
    gsap.from('.polaroid', {
        scrollTrigger: {
            trigger: '.gallery',
            start: 'top 85%',
        },
        y: 80,
        rotation: () => Math.random() * 20 - 10,
        opacity: 0,
        stagger: 0.2,
        duration: 1.2,
        ease: 'back.out(1.4)'
    });
    
    // Scratch Cards staggered drift in
    gsap.from('.love-card-wrapper', {
        scrollTrigger: {
            trigger: '.love-container',
            start: 'top 85%',
        },
        y: 40,
        rotationX: 20,
        opacity: 0,
        stagger: 0.18,
        duration: 1,
        ease: 'power3.out'
    });
    
    // Final Box
    gsap.from('#final-wish-box', {
        scrollTrigger: {
            trigger: '.final-page',
            start: 'top 80%',
        },
        scale: 0.95,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.2)'
    });
}

// 3D Tilt Hover effect on interactive elements
function init3dTilt() {
    // Select interactive cards
    const cards = document.querySelectorAll('.left-card, .frame, .reason-card, .polaroid, .love-card, .quiz-box, .couple-box');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Limit tilt angles to max 12 degrees
            const rotateX = ((centerY - y) / centerY) * 12;
            const rotateY = ((x - centerX) / centerX) * 12;
            
            // Apply 3D rotate style with perspectived container
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Restore default values smoothly
            card.style.transform = '';
            card.style.transition = 'transform 0.5s ease';
        });
        
        card.addEventListener('mouseenter', () => {
            // Instant tracking without delays when hover initiates
            card.style.transition = 'none';
        });
    });
}


// LOAD EVENT BINDINGS
window.addEventListener('DOMContentLoaded', () => {
    // 1. Initialise background particle canvas effects
    createBgSparks();
    
    // 2. Play controls for audio
    document.getElementById('music-play-btn').addEventListener('click', toggleSong);
    
    // 3. Candle blow action bindings
    document.getElementById('blow-btn').addEventListener('click', blowCandles);
    document.getElementById('birthday-cake').addEventListener('click', blowCandles);
    
    // 4. Initialise custom components
    initScratchCards();
    initQuizEngine();
    initPolaroidLightbox();
    initLetterPopups();
    
    // 5. Scroll Reveals
    initScrollAnimations();
    
    // 6. Interactive 3D Tilt effect
    init3dTilt();
    
    // 7. Start popping balloons
    startBalloonGenerator();
});
