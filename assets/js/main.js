const tank = document.getElementById("tank"),
    toggle = document.getElementById("toggle"),
    toggleIcon = document.getElementById("toggle-icon"),
    feed = document.getElementById("feed"),
    flip = { ">": "<", "<": ">", "(": ")", ")": "(" },
    mirror = (s) => [...s].reverse().map((c) => flip[c] || c).join("");

// Fish start where the HTML puts them (so the tank reads without JS), then move by transform.
const fish = [...tank.querySelectorAll(".fish")].map((el, i) => {
    const f = {
        el,
        right: el.textContent,
        x: el.offsetLeft,
        y: el.offsetTop,
        vx: (0.015 + Math.random() * 0.03) * (i % 2 ? -1 : 1),
        phase: Math.random() * 6,
    };
    f.left = mirror(f.right);
    if (f.vx < 0) el.textContent = f.left;
    el.style.left = el.style.top = "0";
    el.style.transform = `translate(${f.x}px, ${f.y}px)`;
    return f;
});

let bubbles = [],
    food = [],
    running = false,
    last = 0,
    nextBubble = 0;

function face(f, dir) {
    if (Math.sign(f.vx) === dir) return;
    f.vx = -f.vx;
    f.el.textContent = f.vx < 0 ? f.left : f.right;
}

function drop(x, y) {
    for (let i = 0; i < 5; i++) {
        const el = document.createElement("span");
        el.className = "food";
        el.textContent = "·";
        tank.appendChild(el);
        const p = { el, x: x + (Math.random() - 0.5) * 60, y: y + Math.random() * 20, born: performance.now() };
        el.style.transform = `translate(${p.x}px, ${p.y}px)`;
        food.push(p);
    }
}

function step(t) {
    if (!running) return;
    const dt = Math.min(t - (last || t), 50),
        w = tank.clientWidth,
        h = tank.clientHeight,
        floor = h - 44;
    last = t;

    food = food.filter((p) => {
        p.y = Math.min(p.y + 0.03 * dt, floor);
        p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
        if (t - p.born > 20000) return p.el.remove(), false;
        return true;
    });

    for (const f of fish) {
        const fw = f.el.offsetWidth;
        let target = null,
            best = Infinity;
        for (const p of food) {
            const d = Math.hypot(p.x - f.x, p.y - f.y);
            if (d < best) (best = d), (target = p);
        }
        if (target) {
            const mouth = f.x + (f.vx > 0 ? fw : 0),
                dx = target.x - mouth,
                dy = target.y - f.y;
            face(f, Math.sign(dx) || 1);
            f.x += Math.sign(dx) * Math.min(Math.abs(dx), 0.09 * dt);
            f.y += Math.sign(dy) * Math.min(Math.abs(dy), 0.05 * dt);
            if (Math.abs(dx) < 10 && Math.abs(dy) < 14) {
                target.el.remove();
                food.splice(food.indexOf(target), 1);
            }
        } else {
            f.x += f.vx * dt;
            if ((f.x < 0 && f.vx < 0) || (f.x > w - fw && f.vx > 0) || Math.random() < dt / 9000)
                face(f, -Math.sign(f.vx));
        }
        f.x = Math.max(0, Math.min(f.x, w - fw));
        f.y = Math.max(24, Math.min(f.y, floor));
        const y = f.y + Math.sin(t / 900 + f.phase) * 4;
        f.el.style.transform = `translate(${f.x}px, ${y}px)`;
    }

    if (t > nextBubble) {
        const f = fish[Math.floor(Math.random() * fish.length)],
            b = document.createElement("span");
        b.className = "bubble";
        b.textContent = Math.random() < 0.5 ? "o" : "°";
        tank.appendChild(b);
        bubbles.push({
            el: b,
            x: f.vx > 0 ? f.x + f.el.offsetWidth : f.x - 6,
            y: f.y - 4,
            phase: Math.random() * 6,
        });
        nextBubble = t + 600 + Math.random() * 900;
    }
    bubbles = bubbles.filter((b) => {
        b.y -= 0.035 * dt;
        if (b.y < -12) return b.el.remove(), false;
        const x = b.x + Math.sin(t / 300 + b.phase) * 2;
        b.el.style.transform = `translate(${x}px, ${b.y}px)`;
        return true;
    });
    requestAnimationFrame(step);
}

function setRunning(on) {
    running = on;
    last = 0;
    toggleIcon.textContent = on ? "|| " : " > ";
    toggle.title = on ? "Pause (2)" : "Play (2)";
    toggle.setAttribute("aria-label", on ? "Pause the fish" : "Let the fish swim");
    if (on) requestAnimationFrame(step);
}

const feedNow = () => drop(Math.random() * tank.clientWidth, 30);
feed.addEventListener("click", feedNow);
toggle.addEventListener("click", () => setRunning(!running));
tank.addEventListener("click", (e) => drop(e.clientX, e.clientY));
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "1") feedNow();
    if (e.key === "2") setRunning(!running);
});

setRunning(!matchMedia("(prefers-reduced-motion: reduce)").matches);
