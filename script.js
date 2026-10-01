// SANDIP UNIVERSITY NETWORK CONNECTIVITY ANALYZER
// Weighted Graph + BFS + Dijkstra's Algorithm

// 1. VERTICES

const vertices = [
    { id: 0, name: "University Gate", x: 400, y: 85 },
    { id: 1, name: "O Building", x: 400, y: 275 },
    { id: 2, name: "S Building", x: 650, y: 260 },
    { id: 3, name: "Saffron Canteen", x: 400, y: 465 },
    { id: 4, name: "Y Building (Library)", x: 150, y: 260 }
];

// 2. WEIGHTED EDGES
// Costs are illustrative distances in metres.
// Replace these with measured campus distances.

const edges = [
    { from: 0, to: 1, cost: 100 }, // Gate to O
    { from: 1, to: 2, cost: 150 }, // O to S
    { from: 2, to: 3, cost: 80 },  // S to Canteen
    { from: 3, to: 4, cost: 120 }, // Canteen to Y
    { from: 1, to: 3, cost: 110 }, // O to Canteen
    { from: 1, to: 4, cost: 130 }  // O to Y
];

// 3. WEIGHTED ADJACENCY LIST

const adjacency = vertices.map(() => []);

edges.forEach(edge => {
    adjacency[edge.from].push({
        to: edge.to,
        cost: edge.cost
    });

    adjacency[edge.to].push({
        to: edge.from,
        cost: edge.cost
    });
});

// 4. DRAW THE NETWORK GRAPH WITH COST LABELS

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

    // Draw edges and their costs
    edgeLayer.innerHTML = edges.map(edge => {
        const p = vertices[edge.from];
        const q = vertices[edge.to];

        const key =
            `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`;

        const isPath = path === null || pathEdges.has(key);
        const edgeColor = isPath ? "#facc15" : "#e8d985";
        const edgeWidth = isPath ? 6 : 3;

        // Position the cost label near the edge midpoint
        const midX = (p.x + q.x) / 2;
        const midY = (p.y + q.y) / 2;

        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const length = Math.hypot(dx, dy) || 1;

        // Small offset perpendicular to the edge
        const offset = 13;
        const labelX = midX - (dy / length) * offset;
        const labelY = midY + (dx / length) * offset;

        return `
            <g>
                <line
                    x1="${p.x}" y1="${p.y}"
                    x2="${q.x}" y2="${q.y}"
                    stroke="${edgeColor}"
                    stroke-width="${edgeWidth}"
                    stroke-linecap="round"
                />

                <text
                    x="${labelX}"
                    y="${labelY}"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-size="15"
                    font-weight="bold"
                    fill="#111111"
                    stroke="#fafbfe"
                    stroke-width="6"
                    stroke-linejoin="round"
                    paint-order="stroke"
                >${edge.cost} m</text>
            </g>
        `;
    }).join("");

    // Draw black vertices and location names
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

// 5. BREADTH-FIRST SEARCH (BFS)
// Finds a route with the fewest edges in an unweighted graph.

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
            if (!visited.has(neighbour.to)) {
                visited.add(neighbour.to);
                queue.push([...path, neighbour.to]);
            }
        }
    }

    return null;
}

// 6. DIJKSTRA'S SHORTEST PATH ALGORITHM
// Finds the minimum total cost in a non-negative weighted graph.

function dijkstra(start, destination) {
    const distances = vertices.map(() => Infinity);
    const previous = vertices.map(() => null);
    const visited = new Set();

    distances[start] = 0;

    while (visited.size < vertices.length) {
        let current = -1;
        let smallestDistance = Infinity;

        // Find the unvisited vertex with the lowest cost
        for (let i = 0; i < vertices.length; i++) {
            if (
                !visited.has(i) &&
                distances[i] < smallestDistance
            ) {
                smallestDistance = distances[i];
                current = i;
            }
        }

        if (current === -1) break;
        if (current === destination) break;

        visited.add(current);

        // Update the costs of neighbouring vertices
        for (const neighbour of adjacency[current]) {
            if (visited.has(neighbour.to)) continue;

            const newCost =
                distances[current] + neighbour.cost;

            if (newCost < distances[neighbour.to]) {
                distances[neighbour.to] = newCost;
                previous[neighbour.to] = current;
            }
        }
    }

    if (distances[destination] === Infinity) {
        return null;
    }

    // Reconstruct shortest path
    const path = [];
    let current = destination;

    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    return {
        path: path,
        totalCost: distances[destination]
    };
}

// 7. PATH ANALYZER USING DIJKSTRA

function findSelectedRoute() {
    const startSelect = document.getElementById("pathStart");
    const endSelect = document.getElementById("pathEnd");
    const result = document.getElementById("routeResult");

    if (!startSelect || !endSelect || !result) return;

    const start = Number(startSelect.value);
    const end = Number(endSelect.value);

    if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        !vertices[start] ||
        !vertices[end]
    ) {
        result.textContent = "Please select valid locations.";
        return;
    }

    const shortest = dijkstra(start, end);

    if (!shortest) {
        result.textContent = "No route found.";
        return;
    }

    const path = shortest.path;

    drawNetwork("routeEdges", "routeVertices", path);

    const routeNames = path.map(id => vertices[id].name);

    result.innerHTML = `
        <strong>Shortest Route Found!</strong><br>
        <strong>Starting Point:</strong>
        ${vertices[start].name}<br>

        <strong>Destination:</strong>
        ${vertices[end].name}<br>

        <strong>Shortest Route:</strong><br>
        ${routeNames.join(" → ")}<br>

        <strong>Total Vertices:</strong>
        ${path.length}<br>

        <strong>Total Edges:</strong>
        ${path.length - 1}<br>

        <strong>Total Distance:</strong>
        ${shortest.totalCost} metres
    `;
}

// 8. CLEAR PATH ANALYZER

function clearSelectedRoute() {
    const startSelect = document.getElementById("pathStart");
    const endSelect = document.getElementById("pathEnd");
    const result = document.getElementById("routeResult");

    startSelect.value = "0";
    endSelect.value = "4";

    result.textContent =
        "Select two locations and click Find Route.";

    drawNetwork("routeEdges", "routeVertices");
}

// 9. BFS DEMONSTRATION

function showBFS() {
    const start = Number(
        document.getElementById("pathStart").value
    );
    const end = Number(
        document.getElementById("pathEnd").value
    );
    const result = document.getElementById("bfsResult");

    if (!result || !vertices[start] || !vertices[end]) return;

    // BFS traversal order
    const queue = [start];
    const visited = new Set([start]);
    const traversal = [];

    while (queue.length > 0) {
        const current = queue.shift();
        traversal.push(current);

        for (const neighbour of adjacency[current]) {
            if (!visited.has(neighbour.to)) {
                visited.add(neighbour.to);
                queue.push(neighbour.to);
            }
        }
    }

    // Fewest-edge path using BFS
    const path = bfs(start, end);

    // Minimum-cost path using Dijkstra
    const weightedPath = dijkstra(start, end);

    result.innerHTML = `
        <strong>BFS Traversal:</strong><br>
        ${traversal.map(id => vertices[id].name).join(" → ")}

        <br><br>
        <strong>BFS Path (Fewest Edges):</strong><br>
        ${path
            ? path.map(id => vertices[id].name).join(" → ")
            : "No route found"}

        <br><br>
        <strong>Number of Edges in BFS Path:</strong>
        ${path ? path.length - 1 : "N/A"}

        <br><br>
        <strong>Dijkstra's Minimum-Cost Path:</strong><br>
        ${weightedPath
            ? weightedPath.path.map(id => vertices[id].name).join(" → ")
            : "No route found"}

        <br><br>
        <strong>Minimum Distance:</strong>
        ${weightedPath ? weightedPath.totalCost + " metres" : "N/A"}
    `;
}

// 10. INITIALIZE WEBSITE

document.addEventListener("DOMContentLoaded", () => {
    // Draw the main network
    drawNetwork("edges", "vertices");

    // Update graph statistics
    const vertexCount = document.getElementById("vertexCount");
    const edgeCount = document.getElementById("edgeCount");
    const averageDegree = document.getElementById("averageDegree");

    if (vertexCount) {
        vertexCount.textContent = vertices.length;
    }

    if (edgeCount) {
        edgeCount.textContent = edges.length;
    }

    const totalDegree = adjacency.reduce(
        (sum, list) => sum + list.length,
        0
    );

    if (averageDegree) {
        averageDegree.textContent =
            (totalDegree / vertices.length).toFixed(1);
    }

    // Connect buttons
    const findButton = document.getElementById("findRoute");
    const clearButton = document.getElementById("clearRoute");
    const bfsButton = document.getElementById("bfsButton");

    if (findButton) {
        findButton.addEventListener("click", findSelectedRoute);
    }

    if (clearButton) {
        clearButton.addEventListener("click", clearSelectedRoute);
    }

    if (bfsButton) {
        bfsButton.addEventListener("click", showBFS);
    }

    const startSelect = document.getElementById("pathStart");
    const endSelect = document.getElementById("pathEnd");

    if (startSelect && endSelect) {
        startSelect.value = "0";
        endSelect.value = "4";

        startSelect.addEventListener("change", findSelectedRoute);
        endSelect.addEventListener("change", findSelectedRoute);

        // Show initial shortest route
        findSelectedRoute();
    }
});
