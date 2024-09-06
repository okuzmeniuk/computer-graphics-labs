class Point {
	strokeWeight = 5;
	innerDiameter = 15;

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	draw() {
		fill('#e8590c');
		strokeWeight(this.strokeWeight);
		stroke('#ffd8a8');
		circle(this.x, this.y, this.innerDiameter);

		fill('#343a40');
		noStroke();
		text(`(${this.x}, ${this.y})`, this.x + 10, this.y + 10);
	}

	isClicked(point) {
		const d = dist(point.x, point.y, this.x, this.y);
		return d < (this.innerDiameter + this.strokeWeight) / 2;
	}
}

const topInfoBarHeight = 30;
const points = [];

function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
	background('#dbe4ff');
	drawMainLine();
	points.forEach(point => point.draw());
}

function mouseClicked(event) {
	const clickedPoint = new Point(event.clientX, event.clientY);

	if (
		clickedPoint.y <
		topInfoBarHeight +
			(clickedPoint.innerDiameter + clickedPoint.strokeWeight) / 2
	) {
		return;
	}

	const idx = points.findIndex(p => p.isClicked(clickedPoint));

	if (idx === -1) {
		points.push(clickedPoint);
	} else {
		points.splice(idx, 1);
	}
}

function drawTopInfoBar(textString) {
	noStroke();
	fill('#bac8ff');
	rect(0, 0, width, topInfoBarHeight);

	fill('#343a40');
	noStroke();
	text(textString, 10, topInfoBarHeight / 1.5);
}

function drawLineByParams(k, b) {
	line(0, b, width, k * width + b);
	drawTopInfoBar(`y = ${k}x + ${b}`);
}

function drawMainLine() {
	strokeWeight(2);
	stroke('#ffa94d');
	if (points.length == 0) {
		drawTopInfoBar('No points');
	} else if (points.length == 1) {
		drawLineByParams(0, points[0].y);
	} else if (points.length == 2 && points[0].x == points[1].x) {
		line(points[0].x, 0, points[0].x, height);
		drawTopInfoBar(`x = ${points[0].x}`);
	} else if (points.length == 2) {
		const k = (points[0].y - points[1].y) / (points[0].x - points[1].x);
		const b = points[0].y - k * points[0].x;
		drawLineByParams(k, b);
	} else {
		const xMean = points.reduce((acc, p) => acc + p.x, 0) / points.length;
		const yMean = points.reduce((acc, p) => acc + p.y, 0) / points.length;

		const k =
			points.reduce((acc, p) => acc + (p.x - xMean) * (p.y - yMean), 0) /
			points.reduce((acc, p) => acc + (p.x - xMean) ** 2, 0);

		const b = yMean - k * xMean;
		drawLineByParams(k, b);
	}
}
