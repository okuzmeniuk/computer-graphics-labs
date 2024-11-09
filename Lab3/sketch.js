class Point {
	strokeWeight = 5;
	innerDiameter = 15;

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	draw() {
		fill('#d9480f');
		strokeWeight(this.strokeWeight);
		stroke('#fcc419');
		circle(this.x, this.y, this.innerDiameter);
	}

	isHovered(point) {
		const d = dist(point.x, point.y, this.x, this.y);
		return d < (this.innerDiameter + this.strokeWeight) / 2;
	}
}

class LineSegment {
	constructor(start, end) {
		this.start = start;
		this.end = end;
	}

	draw() {
		stroke('#fcc419');
		strokeWeight(2);
		line(this.start.x, this.start.y, this.end.x, this.end.y);
	}
}

class ClippingWindow {
	constructor(points) {
		this.points = points;
	}

	draw() {
		stroke('#a61e4d');
		strokeWeight(2);
		noFill();
		beginShape();
		this.points.forEach(point => vertex(point.x, point.y));
		endShape(CLOSE);
		this.points.forEach(point => point.draw());
	}

	static isConvex(points) {
		const crossProductSign = (v1, v2) => v1.x * v2.y - v1.y * v2.x;

		let prevSign = null;
		for (let i = 0; i < points.length; i++) {
			const curr = points[i];
			const next = points[(i + 1) % points.length];
			const afterNext = points[(i + 2) % points.length];

			const v1 = createVector(next.x - curr.x, next.y - curr.y);
			const v2 = createVector(afterNext.x - next.x, afterNext.y - next.y);

			const sign = crossProductSign(v1, v2);
			if (prevSign === null) {
				prevSign = sign > 0;
			} else if (sign > 0 !== prevSign) {
				return false;
			}
		}
		return true;
	}

	static orderPoints(points) {
		const centroid = points.reduce(
			(acc, p) =>
				new Point(acc.x + p.x / points.length, acc.y + p.y / points.length),
			new Point(0, 0)
		);

		points.sort((a, b) => {
			const angleA = atan2(a.y - centroid.y, a.x - centroid.x);
			const angleB = atan2(b.y - centroid.y, b.x - centroid.x);
			return angleA - angleB;
		});
	}
}

let lineSegments = [];
let currentLine = null;
let clippingWindow = null;
let clippingPoints = [];
let clippedSegments = [];
let showClipped = false;
let mode = 'outer';

function cyrusBeckClip(lineSegment) {
	const vertices = clippingWindow.points;
	const n = vertices.length;

	const direction = [
		lineSegment.end.x - lineSegment.start.x,
		lineSegment.end.y - lineSegment.start.y,
	];

	const normals = vertices.map((v, i) => {
		const next = vertices[(i + 1) % n];
		return [v.y - next.y, next.x - v.x];
	});

	const startToEdgesVectors = vertices.map(v => [
		v.x - lineSegment.start.x,
		v.y - lineSegment.start.y,
	]);

	const numerators = normals.map((normal, i) =>
		dotProduct(normal, startToEdgesVectors[i])
	);
	const denominators = normals.map(normal => dotProduct(normal, direction));

	const tValues = denominators.map((d, i) => (d !== 0 ? numerators[i] / d : 0));
	const tEnter = Math.max(0, ...tValues.filter((t, i) => denominators[i] > 0));
	const tLeave = Math.min(1, ...tValues.filter((t, i) => denominators[i] < 0));

	if (tEnter > tLeave) {
		return mode == 'inner' ? null : [lineSegment];
	}

	const clippedStart = new Point(
		lineSegment.start.x + direction[0] * tEnter,
		lineSegment.start.y + direction[1] * tEnter
	);
	const clippedEnd = new Point(
		lineSegment.start.x + direction[0] * tLeave,
		lineSegment.start.y + direction[1] * tLeave
	);

	if (mode === 'inner') {
		return [new LineSegment(clippedStart, clippedEnd)];
	} else {
		return [
			new LineSegment(lineSegment.start, clippedStart),
			new LineSegment(clippedEnd, lineSegment.end),
		];
	}
}

function dotProduct(vecA, vecB) {
	return vecA[0] * vecB[0] + vecA[1] * vecB[1];
}

function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
	background('#dbe4ff');

	if (showClipped) {
		clippedSegments.forEach(line => line.draw());
	} else {
		lineSegments.forEach(line => line.draw());
	}

	if (!showClipped && currentLine && currentLine.end === null) {
		strokeWeight(4);
		line(currentLine.start.x, currentLine.start.y, mouseX, mouseY);
	}

	if (clippingWindow) {
		clippingWindow.draw();
	}

	if (clippingPoints.length > 0) {
		stroke('#a61e4d');
		strokeWeight(2);
		noFill();
		beginShape();
		clippingPoints.forEach(p => vertex(p.x, p.y));
		if (clippingPoints.length < 4) {
			vertex(mouseX, mouseY);
		}
		endShape(CLOSE);
		clippingPoints.forEach(p => p.draw());
	}
}

function mousePressed() {
	if (showClipped) return;
	const point = new Point(mouseX, mouseY);

	if (!clippingWindow && clippingPoints.length < 4) {
		clippingPoints.push(point);
		if (clippingPoints.length === 4) {
			ClippingWindow.orderPoints(clippingPoints);
			if (ClippingWindow.isConvex(clippingPoints)) {
				clippingWindow = new ClippingWindow(clippingPoints);
			} else {
				alert('The points do not form a convex quadrilateral. Try again.');
				clippingPoints = [];
			}
		}
	} else if (clippingWindow && !currentLine) {
		currentLine = { start: point, end: null };
	} else if (currentLine && currentLine.end === null) {
		currentLine.end = point;
		lineSegments.push(new LineSegment(currentLine.start, currentLine.end));
		currentLine = null;
	}
}

function keyPressed() {
	if (keyCode === DELETE) {
		showClipped = false;
		lineSegments = [];
		clippingWindow = null;
		clippingPoints = [];
		currentLine = null;
		mode = 'outer';
	}

	if (keyCode === ENTER && clippingWindow && lineSegments.length > 0) {
		mode = mode === 'inner' ? 'outer' : 'inner';
		clippedSegments = lineSegments
			.map(line => cyrusBeckClip(line))
			.filter(line => line !== null)
			.flat();

		showClipped = true;
	}

	if (keyCode === ESCAPE) {
		mode = mode === 'inner' ? 'outer' : 'inner';
		showClipped = false;
		clippedSegments = [];
	}
}
