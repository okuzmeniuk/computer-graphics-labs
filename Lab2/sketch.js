class Point {
	strokeWeight = 5;
	innerDiameter = 10;

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

	isClicked(point) {
		// ?
		const d = dist(point.x, point.y, this.x, this.y);
		return d < (this.innerDiameter + this.strokeWeight) / 2;
	}

	addPoint(point) {
		return new Point(this.x + point.x, this.y + point.y);
	}

	multiply(factor) {
		return new Point(this.x * factor, this.y * factor);
	}
}

class BezierCurve {
	constructor(points) {
		this.points = points;
	}

	addPoint(point) {
		this.points.push(point);
		this.buildPolynomial();
	}

	buildPolynomial() {
		const n = this.points.length - 1;
		const cArr = [];
		for (let j = 0; j <= n; j++) {
			const c = factorial(n) / factorial(n - j);
			let sum = new Point(0, 0);
			for (let i = 0; i <= j; i++) {
				sum = sum.addPoint(
					points[i].multiply(
						(-1) ** (i + j) / (factorial(i) * factorial(j - i))
					)
				);
			}
			cArr.push(sum.multiply(c));
		}

		this.polynomial = function (t) {
			let sum = new Point(0, 0);
			for (let i = 0; i <= n; i++) {
				sum = sum.addPoint(cArr[i].multiply(t ** i));
			}
			return sum;
		};
	}

	draw() {
		this.buildPolynomial();
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

const points = [
	new Point(100, 300),
	new Point(200, 100),
	new Point(300, 250),
	new Point(400, 150),
	new Point(500, 200),
	new Point(400, 250),
];

const bezierCurve = new BezierCurve(points);

function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
	background('#dbe4ff');
	bezierCurve.draw();
}
