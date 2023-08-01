class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(point) {
    return this.x == point.x && this.y == point.y;
  }
  
  toString() {
  	return `Point(${this.x}, ${this.y})`;
  }
}

class Toothpick {
  constructor(parent, x, y, dx, dy) {
    this.parent = parent;
    this.midPoint = new Point(x, y);
    this.pointA = new Point(x + dx, y + dy);
    this.pointB = new Point(x - dx, y - dy);
    this.childA = null;
    this.childB = null;
    this.intersectA = false;
    this.intersectB = false;
    this.points = [this.midPoint, this.pointA, this.pointB];
  }

  intersects(toothpick) {
    return this.points.some(i => toothpick.points.some(j => i.equals(j)));
  }

  extendAt(trueForA) {
    let newChild = new Toothpick(
      this,
      (trueForA ? this.pointA : this.pointB).x,
      (trueForA ? this.pointA : this.pointB).y,
      this.pointA.x == this.midPoint.x ? 1 : 0,
      this.pointA.y == this.midPoint.y ? 1 : 0
    );
    newChild.close();
    if (trueForA) {
      this.childA = newChild;
      this.intersectA = true;
    } else {
      this.childB = newChild;
      this.intersectB = true;
    }
  }

  extend() {
    if (!this.intersectA) this.extendAt(true);
    else if (this.childA) this.childA.extend();
    if (!this.intersectB) this.extendAt(false);
    else if (this.childB) this.childB.extend();
  }

  getExtents(extents = null) {
    if (extents === null) {
      extents = {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0
      };
    }
    extents.minX = Math.min(extents.minX, this.pointA.x, this.pointB.x);
    extents.maxX = Math.max(extents.maxX, this.pointA.x, this.pointB.x);
    extents.minY = Math.min(extents.minY, this.pointA.y, this.pointB.y);
    extents.maxY = Math.max(extents.maxY, this.pointA.y, this.pointB.y);
    if (this.childA) extents = this.childA.getExtents(extents);
    if (this.childB) extents = this.childB.getExtents(extents);
    return extents;
  }
  
  traverse(func, goingDown=true) {
  	if (goingDown) {
    	if (this.parent != null) this.parent.traverse(func, true);
      else goingDown = false;
    }
    if (!goingDown) {
    	func(this);
      if (this.childA) this.childA.traverse(func, false);
      if (this.childB) this.childB.traverse(func, false);
    }
  }
  
  close() {
  	let func = other => {
    	if (this.pointA.equals(other.pointA)) {
      	this.intersectA = true;
        other.intersectA = true;
      }
      if (this.pointA.equals(other.midPoint)) {
      	this.intersectA = true;
      }
      if (this.pointA.equals(other.pointB)) {
      	this.intersectA = true;
        other.intersectB = true;
      }
      if (this.pointB.equals(other.pointA)) {
      	this.intersectB = true;
        other.intersectA = true;
      }
      if (this.pointB.equals(other.midPoint)) {
      	this.intersectB = true;
      }
      if (this.pointB.equals(other.pointB)) {
      	this.intersectB = true;
        other.intersectB = true;
      }
    }
    
    this.traverse(func);
  }
}

let draw = (root, context, scale) => {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	let extents = root.getExtents();
  let paddingPx = 10;
  let [rangeX, rangeY] = [
  	extents.maxX - extents.minX, 
    extents.maxY - extents.minY
  ];
  let [scaleX, scaleY] = [
  	(context.canvas.width - (2 * paddingPx)) / rangeX,
    (context.canvas.height - (2 * paddingPx)) / rangeY
  ];
  [scaleX, scaleY] = [
  	Math.max(scaleX, scaleY),
    Math.min(scaleX, scaleY)
  ];
  let [offsetX, offsetY] = [
  	rangeX*scaleX/2, 
    rangeY*scaleY/2
  ];
  let pointToCoords = point => [
  	Math.round((point.x * scaleX) + offsetX + paddingPx), 
    Math.round((point.y * scaleY) + offsetY + paddingPx)
  ];
  let recursor = node => {
  	context.beginPath();
    context.moveTo(...pointToCoords(node.pointA));
    context.lineTo(...pointToCoords(node.pointB));
    context.stroke();
    if (node.childA) recursor(node.childA);
    if (node.childB) recursor(node.childB);
  }
  recursor(root);
}

let root = new Toothpick(null, 0, 0, 0, 1);
let accumulator = {value: 0};
let delay = 100;
let drawOneMore = () => {
	root.extend();
  draw(root, context);
  setTimeout(drawOneMore, delay);
}
let context = document.getElementById('myCanvas').getContext('2d');
let maxDimension = Math.min(
  document.body.clientWidth,
  document.body.clientHeight
);
context.canvas.width = maxDimension;
context.canvas.height = maxDimension;
drawOneMore();
