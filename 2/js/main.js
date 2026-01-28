const piece_name = ["I", "J", "L", "O", "S", "T", "Z"];
const pconv = [2, 3, 4, 5, 6, 1, 7, 0, 8];

function load_data(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        script.type = "text/javascript";

        script.onload = () => {
            resolve({
                init_hash: window.init_hash,
                data: window.data,
            });
        };

        script.onerror = () => {
            reject(new Error(`Failed to load: ${url}`));
        };

        document.head.appendChild(script);
    });
}

function interpolate(prev, cur, piece) {
    const pf = new Field(prev);
    const p = new Piece(piece);
    for (let x = 0; x < BOARD_WIDTH; x++) {
        p.x = x;
        for (let y = 0; y < 4; y++) {
            p.y = y;
            for (let r = 0; r < 4; r++) {
                p.rotation = r;
                if (pf.collides(p)) {
                    continue;
                }
                let f = new Field(prev);
                f.place(p);
                f.clear_lines();
                if (f.get_hash() == cur) {
                    return p;
                }
            }
        }
    }
    return null;
}

function add_content(container, rev, prev_hash, hash, piece, score) {
    if (hash == -1) {
        container.innerHTML = `<span class="${piece_name[rev]}">${
            piece_name[rev]
        }</span><br>💀`;
        return;
    }
    if (rev != -1) {
        container.innerHTML = `<span class="${piece_name[rev]}">${
            piece_name[rev]
        }</span><br>`;
    }
    let p = interpolate(prev_hash, hash, pconv[piece]);
    let field = new Field(prev_hash);
    if (p != null) {
        field.place(p);
    }
    container.insertAdjacentHTML(
        "beforeend",
        field.html(),
    );
    if (score != undefined) {
        container.append("\n" + -score);
    }
}

function add_solve(parent, rev, prev_hash, data) {
    let field = new Field(prev_hash);
    field.clear_lines();
    for (let i = 1; i < 7; i++) {
        let hash = data[i][0];
        let piece = data[i][1];
        if (field.get_hash() != prev_hash) {
            throw new Error("Hash mismatch");
        }
        let p = interpolate(prev_hash, hash, pconv[piece]);
        field.place(p);
        field.clear_lines();
        prev_hash = hash;
    }
    const node_li = document.createElement("li");

    const node_content = document.createElement("button");

    node_content.classList.add("node");
    node_content.innerHTML = `<span class="${piece_name[rev]}">${
        piece_name[rev]
    }</span><br>`;
    node_content.insertAdjacentHTML(
        "beforeend",
        field.full_html(),
    );

    node_li.appendChild(node_content);
    parent.appendChild(node_li);
}

function add(parent, rev, prev_hash, data) {
    if (data == null) {
        return;
    }
    if (data.length == 7) {
        add_solve(parent, rev, prev_hash, data);
        return;
    }
    let [hash, piece, score, next] = data;
    const node_li = document.createElement("li");

    const node_content = document.createElement("button");

    node_content.classList.add("node");
    add_content(node_content, rev, prev_hash, hash, piece, score);

    node_li.appendChild(node_content);
    parent.appendChild(node_li);

    if (hash == -1) {
        return;
    }

    const next_ul = document.createElement("ul");
    if (prev_hash != 0) {
        next_ul.classList.add("hidden");
    }

    node_content.onclick = (e) => {
        next_ul.classList.toggle("hidden");
        const elem = e.currentTarget;

        elem.scrollIntoView({
            inline: "center",
            block: "nearest",
            behavior: "smooth",
        });
    };

    node_li.appendChild(next_ul);
    for (let i = 0; i < 7; i++) {
        add(next_ul, i, hash, next[i]);
    }
}

async function main() {
    let queue = location.hash.substring(1).toUpperCase();
    const root = document.querySelector(".tree");
    let ih, da;
    try {
        if (queue.length != 7) {
            throw new Error("Invalid queue in hash");
        }
        console.log(`open ../data_2/${queue.slice(0,4)}/${queue.slice(4)}`);
        const { init_hash, data } = await load_data(`../data_2/${queue.slice(0,4)}/${queue.slice(4)}.js`);
        console.log(init_hash, data);
        ih = init_hash;
        da = data;
    } catch (error) {
        console.log(error);
        for (let i = 0; i < 100; i++) {
            try {
                queue = prompt("queue", "TIJLOSZ").toUpperCase();
                console.log(`open ../data_2/${queue.slice(0,4)}/${queue.slice(4)}`);
                const { init_hash, data } = await load_data(
                    `../data_2/${queue.slice(0,4)}/${queue.slice(4)}.js`,
                );
                ih = init_hash;
                da = data;
                break;
            } catch (error) {
                console.log(error);
            }
            return;
        }
    }
    document.title += " " + queue;
    add(root, -1, ih, da);
    document.addEventListener("keydown", (e) => {
        const active = document.activeElement;
        if (!active.classList.contains("node")) {
            return;
        }
        let key = e.key.toUpperCase();
        try {
            if (key == "BACKSPACE") {
                active.parentNode.parentNode.parentNode.children[0].focus();
                active.click();
            }
            for (let child of active.parentNode.children[1].children) {
                if (child.children[0].children[0].innerText == key) {
                    child.children[0].focus();
                    child.children[0].click();
                }
            }
        } catch (e) {
        }
    });
}

window.addEventListener("load", main);
