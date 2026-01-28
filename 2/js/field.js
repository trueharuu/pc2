const BOARD_WIDTH = 10;

class Field {
    constructor(hash = 0) {
        this.cells = [];
        let x = BOARD_WIDTH - 1;
        let y = 0;
        this.cleared = {};
        while (hash != 0) {
            if (hash % 2) {
                this.set(x, y, 8);
            }

            x--;
            if (x == -1) {
                x = BOARD_WIDTH - 1;
                y++;
            }
            hash = Math.floor(hash / 2);
        }
    }

    clear_lines() {
        let shift = 0;
        let m = -1;
        for (let row = 0; row < this.cells.length; row++) {
            for (let i = row; i < 4; i++) {
                if (!this.cleared.hasOwnProperty(i) || i <= m) {
                    break;
                }
                shift += 1;
                m = i;
            }
            if (this.cells[row].some((cell) => cell == 0)) {
                continue;
            }
            if (this.cleared.hasOwnProperty(row + shift)) {
                throw new Error("???");
            }
            this.cleared[row + shift] = this.cells[row];
            if (m < row + shift) {
                m = row + shift;
                for (let i = row + shift + 1; i < 4; i++) {
                    if (!this.cleared.hasOwnProperty(i)) {
                        break;
                    }
                    shift += 1;
                    m = i;
                }
            }
        }
        this.cells = this.cells.filter((row) => row.some((cell) => cell === 0));
    }

    is_set(x, y) {
        if (this.cells.length <= y) {
            return false;
        }
        return this.cells[y][x] != 0;
    }

    set(x, y, piece) {
        while (this.cells.length <= y) {
            this.cells.push(Array(BOARD_WIDTH).fill(0));
        }
        if (x < 0 || x >= BOARD_WIDTH || y < 0) {
            return;
        }
        this.cells[y][x] = piece;
    }

    collides(piece) {
        for (const [x, y] of piece.get_cells()) {
            if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= 4) {
                return true;
            }
            if (this.is_set(x, y)) {
                return true;
            }
        }
        return false;
    }

    place(piece) {
        let l = Object.keys(this.cleared).length;
        for (const [x, y] of piece.get_cells()) {
            this.set(x, y - l, piece.type);
        }
        if (this.cells.length + Object.keys(this.cleared).length > 4) {
            throw new Error("placement above 5");
        }
    }

    #html_from_cells(cells) {
        return `<table class="field" cellspacing="0">` +
            cells.map(
                (row) =>
                    `<tr>` + row.map(
                        (cell) =>
                            `<td style="background:${get_colour(cell)}"></td>`,
                    ).join("") + `</tr>`,
            ).join("") +
            `</table>`;
    }

    html() {
        let cells = Array(4).fill().map(
            () => Array(BOARD_WIDTH).fill(0),
        );
        for (let y = 0; y < this.cells.length; y++) {
            cells[y] = this.cells[y];
        }

        cells.reverse();
        return this.#html_from_cells(cells);
    }

    full_html() {
        let cells = Array(4);
        let i = 0;
        for (let y = 0; y < 4; y++) {
            if (this.cleared.hasOwnProperty(y)) {
                cells[y] = this.cleared[y];
            } else if (i < this.cells.length) {
                cells[y] = this.cells[i];
                i++;
            } else {
                cells[i] = Array(BOARD_WIDTH).fill(0);
            }
        }

        cells.reverse();
        return this.#html_from_cells(cells);
    }

    get_hash() {
        let h = 0;
        for (let y = this.cells.length - 1; y >= 0; y--) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                h *= 2;
                h += this.is_set(x, y) ? 1 : 0;
            }
        }
        let l = Object.keys(this.cleared).length;
        h *= Math.pow(2, BOARD_WIDTH * l);
        h += Math.pow(2, BOARD_WIDTH * l) - 1;
        return h;
    }
}
