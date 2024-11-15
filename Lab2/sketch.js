class Point {
	strokeWeight = 5;
	innerDiameter = 15;

	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.selected = false;
	}

	draw() {
		fill(this.selected ? '#2b8a3e' : '#d9480f');
		strokeWeight(this.strokeWeight);
		stroke(this.selected ? '#a9e34b' : '#fcc419');
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
		stroke('#fcc419');
		beginShape();
		this.points.forEach(point => vertex(point.x, point.y));
		endShape();

		this.points.forEach(point => point.draw());

		strokeWeight(3);
		noFill();
		stroke('#d9480f');
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

function mouseClicked() {
	bezierCurve.points.forEach(p => (p.selected = false));
}

function doubleClicked() {
	bezierCurve.points.forEach(
		p => (p.selected = p.isHovered(new Point(mouseX, mouseY)))
	);
}

function mouseDragged() {
	bezierCurve.points.forEach(p => {
		if (p.selected) {
			p.x = mouseX;
			p.y = mouseY;
		}
	});
}

function keyPressed() {
	if (keyCode === 46) {
		bezierCurve.points = bezierCurve.points.filter(p => !p.selected);
	}
}
