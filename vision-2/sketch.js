/// <reference path="../TSDef/p5.global-mode.d.ts" />

"use strict";

Array.prototype.sample = function(){
  return this[Math.floor(Math.random()*this.length)];
}

let Array2D = (r,c) => [...Array(r)].map(x=>Array(c).fill(0));

let palette = [];

var particles = [];
var num_particles = 500;
let bg = 0;
var field;


class FlowField {
  constructor(resolution) {
    this.resolution = resolution;
    this.rows = floor(height / resolution);
    this.cols = floor(width / resolution);
    this.field = Array2D(this.rows, this.cols);
    this.init();
  }

  init() {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        var noiseScale = 0.1;
        var value = noise(i * noiseScale, j * noiseScale, frameCount * noiseScale);
        var angle = map(value, 0, 1, 0, TWO_PI);
        this.field[i][j] = p5.Vector.fromAngle(angle).normalize();
      }
    }
  }

  render() {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        var x = i * this.resolution;
        var y = j * this.resolution;
        push();
        translate(x + 0.5 * this.resolution, y + 0.5 * this.resolution);
        rotate(this.field[i][j].heading());
        stroke(0, 100);
        line(0, 0, this.resolution / 2, 0);
        translate(this.resolution / 2, 0);
        push();
        rotate(0.75 * PI);
        line(0, 0, this.resolution / 4, 0);
        pop();
        push();
        rotate(- 0.75 * PI);
        line(0, 0, this.resolution / 4, 0);
        pop();
        pop();
      }
    }
  }

  get_field_at_pixel(vec) {
    var i = floor(constrain(vec.x / this.resolution, 0, this.cols - 1));
    var j = floor(constrain(vec.y / this.resolution, 0, this.rows - 1));
    return this.field[i][j];
  }
}

class Particle {
  constructor(pos, speed, color, size) {
    this.pos = pos.copy();
    this.speed = speed;
    this.color = color;
    this.size = size;

    this.last_pos = pos.copy();
  }

  move(field) {
    this.last_pos = this.pos.copy();
    var dir = field.get_field_at_pixel(this.pos).copy();
    this.pos = this.pos.add(dir.mult(this.speed));
    this.wrap();
  }

  render() {
    stroke(this.color);
    strokeWeight(this.size);
    line(this.pos.x, this.pos.y, this.last_pos.x, this.last_pos.y);
    //ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }

  wrap() {
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.last_pos = this.pos.copy();
    }
    if (this.pos.x > width) {
      this.pos.x = 0;
      this.last_pos = this.pos.copy();
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.last_pos = this.pos.copy();
    }
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.last_pos = this.pos.copy();
    }
  }
}

function setup() {
  createCanvas(800, 800, P2D);

  palette = [color("#073673"), color("#80A6A2"), color("#F2C572"), color("#8C2F1B")];
  bg = color("#F2D6B3");
  palette.splice(palette.indexOf(bg), 1);
  background(bg);
  field = new FlowField(20);

  for (let i = 0; i < num_particles; i++) {
    let pos = createVector(random(0, width), random(0, height));
    particles[i] = new Particle(pos, 5, palette.sample(), 2);
  }
  field.init();
  field.render();
}

function draw() {
  //background(bg);
  //field.init();

  particles.forEach(p => {
    p.move(field);
    p.render();
  });

  //display_fps(frameRate());
}

let paused = false;

function mousePressed() {
  if (mouseButton === LEFT){
    if (paused)
    {
      loop();
      paused = false;
    }
    else
    {
      noLoop();
      paused = true;
    }
  }
  //if (mouseButton === RIGHT){
  //  saveCanvas("image.png");
  //  noLoop();
  //}
}

function display_fps(fps) {
  noStroke();
  fill(0);
  textSize(32);
  text(str(round(fps)), 10, 35);
}

function get_points_on_circle(x, y, r, n_points){
  let points = [];
  let angle = 0;
  for(let i = 0; i < n_points; i++){
    angle = angle + 360 / n_points;
    points[i] = new Point(
      x + r * cos(angle),
      y + r * sin(angle)
    );
  }
  return points;
}