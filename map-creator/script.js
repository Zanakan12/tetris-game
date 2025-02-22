document.addEventListener("DOMContentLoaded", () => {
    const rows = 20;
    const cols = 10;
    const grid = document.getElementById("grid");
    const previewGrid = document.getElementById("preview-grid");
    const exportBtn = document.getElementById("export");
    const copyBtn = document.getElementById("copy");
    
    let map = Array.from({ length: rows }, () => Array(cols).fill(0));

    function renderGrid(targetGrid, data) {
        targetGrid.innerHTML = "";
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                if (data[r][c] === 1) {
                    cell.classList.add("filled");
                }
                
                if (targetGrid === grid) {
                    cell.addEventListener("click", toggleCell);
                }
                targetGrid.appendChild(cell);
            }
        }
    }

    function toggleCell(event) {
        let r = event.target.dataset.row;
        let c = event.target.dataset.col;
        map[r][c] = map[r][c] === 1 ? 0 : 1;
        renderGrid(grid, map);
        renderGrid(previewGrid, map);
    }

    exportBtn.addEventListener("click", () => {
        let mapString = map.map(row => `[${row.join(",")}]`).join(",\n");
        console.log(`[
${mapString}
]`);
        alert("Map exported! Check the console.");
    });

    copyBtn.addEventListener("click", () => {
        let mapString = map.map(row => `${row.join(",")}`).join(",\n");
        navigator.clipboard.writeText(`[
${mapString}
]`).then(() => {
            alert("Map copied to clipboard!");
        }).catch(err => {
            alert("Failed to copy map: " + err);
        });
    });

    renderGrid(grid, map);
    renderGrid(previewGrid, map);
});
