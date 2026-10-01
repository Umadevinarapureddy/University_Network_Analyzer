// SANDIP UNIVERSITY NETWORK CONNECTIVITY ANALYZER

// 1. VERTICES ARRANGED IN A CIRCLE
// O Building is the central vertex.

const vertices = [
    { id: 0, name: "University Gate", x: 400, y: 85 },
    { id: 1, name: "O Building", x: 400, y: 275 },
    { id: 2, name: "S Building", x: 650, y: 260 },
    { id: 3, name: "Saffron Canteen", x: 400, y: 465 },
    { id: 4, name: "Y Building (Library)", x: 150, y: 260 }
];

// 2. EDGES
// Central O Building connects to all other vertices.
// Additional edges preserve the specified campus sequence.

const edges = [
    [0, 1], // Gate to O Building
    [1, 2], // O Building to S Building
    [2, 3], // S Building to Saffron Canteen
    [3, 4], // Saffron Canteen to Y Building
    [1, 3], // O Building to Saffron Canteen
    [1, 4]  // O Building to Y Building
];

// 3. ADJACENCY LIST

const adjacency = vertices.map(() => []);

edges.forEach(([a, b]) => {
    adjacency[a].push(b);
    adjacency[b].push(a);
});

// 4. DRAW THE CIRCULAR NETWORK GRAPH

function drawNetwork(edgeId, vertexId, path = null) {
    const edgeLayer = document.getElementById(edgeId);
    const vertexLayer = document.getElementById(vertexId);

    if (!edgeLayer || !vertexLayer) {
        console.error("Graph SVG elements are missing.");
        return;
    }

    const pathEdges = new Set();

    if (path) {
        for (let i = 0; i < path.length - 1; i++) {
            const a = Math.min(path[i], path[i + 1]);
            const b = Math.max(path[i], path[i + 1]);
            pathEdges.add(`${a}-${b}`);
        }
    }

    // Draw all edges
    edgeLayer.innerHTML = edges.map(([a, b]) => {
        const p = vertices[a];
        const q = vertices[b];
        const key = `${Math.min(a,b)}-${Math.max(a,b)}`;

        const isPath = path === null || pathEdges.has(key);
        const edgeColor = isPath ? "#facc15" : "#e8d985";
        const edgeWidth = isPath ? 6 : 3;

        return `
            <line
                x1="${p.x}" y1="${p.y}"
                x2="${q.x}" y2="${q.y}"
                stroke="${edgeColor}"
                stroke-width="${edgeWidth}"
                stroke-linecap="round"
            />
        `;
    }).join("");

    // Draw all vertices as black circles
    vertexLayer.innerHTML = vertices.map(v => `
        <g>
            <circle
                class="vertex-circle"
                cx="${v.x}"
                cy="${v.y}"
                r="28"
            />
            <text
                class="vertex-number"
                x="${v.x}"
                y="${v.y}"
            >V${v.id + 1}</text>
            <text
                class="vertex-label"
                x="${v.x}"
                y="${v.y + 49}"
            >${v.name}</text>
        </g>
    `).join("");
}

// 5. BREADTH-FIRST SEARCH

function bfs(start, destination) {
    const queue = [[start]];
    const visited = new Set([start]);

    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];

        if (current === destination) {
            return path;
        }

        for (const neighbour of adjacency[current]) {
            if (!visited.has(neighbour)) {
                visited.add(neighbour);
                queue.push([...path, neighbour]);
            }
        }
    }

    return null;
}

// 6. PATH ANALYZER

function findSelectedRoute() {
    const startSelect = document.getElementById("pathStart");
    const endSelect = document.getElementById("pathEnd");
    const result = document.getElementById("routeResult");

    const start = Number(startSelect.value);
    const end = Number(endSelect.value);

    if (start === end) {
        drawNetwork("routeEdges", "routeVertices", [start]);

        result.innerHTML = `
            <strong>Same Location</strong><br>
            You selected ${vertices[start].name}.
            <br>Total Edges: 0
        `;
        return;
    }

    const path = bfs(start, end);

    if (!path) {
        result.textContent = "No route found.";
        return;
    }

    drawNetwork("routeEdges", "routeVertices", path);

    const routeNames = path.map(id => vertices[id].name);

    result.innerHTML = `
        <strong>Route Found!</strong><br>
        <strong>Starting Point:</strong> ${vertices[start].name}<br>
        <strong>Destination:</strong> ${vertices[end].name}<br>
        <strong>Shortest Route:</strong>
        ${routeNames.join(" → ")}<br>
        <strong>Total Vertices:</strong> ${path.length}<br>
        <strong>Total Edges:</strong> ${path.length - 1}
    `;
}

// 7. CLEAR PATH ANALYZER

function clearSelectedRoute() {
    document.getElementById("pathStart").value = "0";
    document.getElementById("pathEnd").value = "4";

    document.getElementById("routeResult").textContent =
        "Select two locations and click Find Route.";

    drawNetwork("routeEdges", "routeVertices");
}

// 8. BFS DEMONSTRATION

function showBFS() {
    const start = Number(document.getElementById("pathStart").value);
    const end = Number(document.getElementById("pathEnd").value);

    // BFS traversal from the selected starting vertex
    const queue = [start];
    const visited = new Set([start]);
    const traversal = [];

    while (queue.length > 0) {
        const current = queue.shift();
        traversal.push(current);

        for (const neighbour of adjacency[current]) {
            if (!visited.has(neighbour)) {
                visited.add(neighbour);
                queue.push(neighbour);
            }
        }
    }

    // Shortest path to selected destination
    const path = bfs(start, end);

    document.getElementById("bfsResult").innerHTML = `
        <strong>BFS Traversal:</strong><br>
        ${traversal.map(id => vertices[id].name).join(" → ")}
        <br><br>
        <strong>Shortest Path:</strong><br>
        ${path ? path.map(id => vertices[id].name).join(" → ") : "No route found"}
        <br><br>
        <strong>Total Edges:</strong> ${path ? path.length - 1 : "N/A"}
    `;
}

// 9. INITIALIZE THE WEBSITE

document.addEventListener("DOMContentLoaded", () => {
    drawNetwork("edges", "vertices");

    document.getElementById("vertexCount").textContent =
        vertices.length;

    document.getElementById("edgeCount").textContent =
        edges.length;

    const totalDegree = adjacency.reduce(
        (sum, list) => sum + list.length, 0
    );

    document.getElementById("averageDegree").textContent =
        (totalDegree / vertices.length).toFixed(1);

    document.getElementById("findRoute")
        .addEventListener("click", findSelectedRoute);

    document.getElementById("clearRoute")
        .addEventListener("click", clearSelectedRoute);

    document.getElementById("bfsButton")
        .addEventListener("click", showBFS);

    document.getElementById("pathStart")
        .addEventListener("change", findSelectedRoute);

    document.getElementById("pathEnd")
        .addEventListener("change", findSelectedRoute);

    // Initial route
    document.getElementById("pathStart").value = "0";
    document.getElementById("pathEnd").value = "4";

    findSelectedRoute();
});