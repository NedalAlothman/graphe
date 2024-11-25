const activities = [];

function addActivity() {
    const name = document.getElementById('activity-name').value;
    const startNode = parseInt(document.getElementById('start-node').value);
    const endNode = parseInt(document.getElementById('end-node').value);
    const duration = parseInt(document.getElementById('duration').value);

    activities.push({
        name,
        startNode,
        endNode,
        duration
    });
    updateActivityList();
}

function updateActivityList() {
    const list = document.getElementById('activities-list');
    list.innerHTML = ''; // قم بتفريغ القائمة السابقة

    activities.forEach((activity, index) => {
        const li = document.createElement('li'); // أنشئ عنصر جديد للقائمة
        li.textContent = `Activity: ${activity.name}, Start: ${activity.startNode}, End: ${activity.endNode}, Duration: ${activity.duration}`; // ضع النص داخل العنصر
        list.appendChild(li); // أضف العنصر إلى القائمة
    });
}


function drawDiagram() {
    const nodes = [];
    const links = [];

    // Generate nodes and links based on activities
    activities.forEach(activity => {
        if (!nodes.find(node => node.id === activity.startNode)) {
            nodes.push({
                id: activity.startNode,
                label: activity.startNode,
            });
        }
        if (!nodes.find(node => node.id === activity.endNode)) {
            nodes.push({
                id: activity.endNode,
                label: activity.endNode,
            });
        }
        links.push({
            source: activity.startNode,
            target: activity.endNode,
            label: `${activity.name} (${activity.duration})`,
            duration: activity.duration,
        });
    });

    // Clear previous SVG content
    const svg = d3.select('#chart');
    svg.selectAll('*').remove();

    // Set up dimensions and force simulation
    const width = 800;
    const height = 600;

    // Create a simulation for the nodes
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(150)) // Distance between nodes
        .force('charge', d3.forceManyBody().strength(-800)) // Node repulsion strength
        .force('center', d3.forceCenter(width / 2, height / 2)) // Centering force
        .force('y', d3.forceY().strength(0.1)) // Balances nodes vertically
        .force('x', d3.forceX().strength(0.1)) // Spreads nodes horizontally
        .on('tick', ticked);

    // Define arrow markers for the links
    const defs = svg.append("defs");
    defs.append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 10)
        .attr("refY", 5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 Z")
        .attr("fill", "#333");

    // Draw the links
    const linkGroup = svg.append('g').attr('class', 'links');
    const link = linkGroup.selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow)');

    // Draw the nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    const node = nodeGroup.selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .call(d3.drag() // Make nodes draggable
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended)
        );

    node.append('circle')
        .attr('r', 25)
        .attr('fill', '#69b3a2')
        .attr('stroke', '#555')
        .attr('stroke-width', 2);

    // Add node labels
    node.append('text')
        .attr('dy', 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#34495E')
        .text(d => d.label);

    // Draw link labels (Activity names and duration)
    linkGroup.selectAll('.link-label')
        .data(links)
        .enter()
        .append('text')
        .attr('class', 'link-label')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#333');

    // Update positions dynamically
    function ticked() {
        link.attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node.attr('transform', d => `translate(${d.x},${d.y})`);

        linkGroup.selectAll('.link-label')
            .data(links)
            .attr('x', d => (d.source.x + d.target.x) / 2)
            .attr('y', d => (d.source.y + d.target.y) / 2)
            .text(d => d.label);
    }

    // Drag functions for better interaction
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}