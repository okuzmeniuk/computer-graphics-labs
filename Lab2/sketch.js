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
	}

	addPoint(point) {
		return new Point(this.x + point.x, this.y + point.y);
	}

	multiply(factor) {
		return new Point(this.x * factor, this.y * factor);
	}

	isHovered(point) {
		const d = dist(point.x, point.y, this.x, this.y);
		return d < (this.innerDiameter + this.strokeWeight) / 2;
	}
}

class BezierCurve {
	constructor(points) {
		this.points = points;
	}

	addPoint(point) {
		this.points.push(point);
	}

	polynomial(t) {
		const n = this.points.length - 1;
		let result = new Point(0, 0);
		for (let i = 0; i <= n; i++) {
			const coefficient =
				(factorial(n) / (factorial(i) * factorial(n - i))) *
				Math.pow(t, i) *
				Math.pow(1 - t, n - i);

			result = result.addPoint(this.points[i].multiply(coefficient));
		}

		return result;
	}

	draw() {
		strokeWeight(2);
		noFill();
		stroke('#ffd8a8');
		beginShape();
		this.points.forEach(point => vertex(point.x, point.y));
		endShape();

		this.points.forEach(point => point.draw());

		strokeWeight(3);
		noFill();
		stroke('#e8590c');
		beginShape();
		for (let t = 0; t < 1.01; t += 0.01) {
			const point = this.polynomial(t);
			vertex(point.x, point.y);
		}
		endShape();
	}
}

function factorial(n) {
	if (n === 0) return 1;
	return n * factorial(n - 1);
}

const bezierCurve = new BezierCurve([]);

function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
	background('#dbe4ff');
	bezierCurve.draw();
}

function mousePressed() {
	const point = new Point(mouseX, mouseY);
	if (bezierCurve.points.some(p => p.isHovered(point))) return;
	bezierCurve.addPoint(point);
}
