class Piece {
    constructor(type, rot, x, y) {
        this.rotation = rot;
        this.type = type;
        this.x = x;
        this.y = y;
    }

    get_minos() {
        let minos = [];
        for (let [off_x, off_y] of get_offsets(this.type, this.rotation)) {
            minos.push([this.x + off_x, this.y + off_y]);
        }
        return minos;
    }

    get_cells() {
        return get_offsets(this.type, this.rotation).map((
            [x, y],
        ) => [x + this.x, y + this.y]);
    }
}
