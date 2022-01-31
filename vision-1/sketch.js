/// <reference path="../TSDef/p5.global-mode.d.ts" />

"use strict";

Array.prototype.sample = function(){
  return this[Math.floor(Math.random()*this.length)];
}

let palette = [];

var particles = [];
var num_particles = 1000;
var fps = 100;
let bg = 0;

class Particle{
  constructor(x, y, vx, vy, col, size, speed, trail_len){
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.col = col;
    this.size = size;
    this.speed = speed;
    this.trail_len = trail_len;

    this.old_x = [];
    this.old_y = [];
  }

  move(){
    this.save_trail();
    let angle = (noise(this.x/100, this.y/500, frameCount/500)) * 360;
    this.vx = (cos(angle) * this.speed + this.vx) / 2;
    this.vy = (sin(angle) * this.speed + this.vy) / 2;
    this.x = this.x + this.vx;
    this.y = this.y + this.vy;
    this.respawn();
  }

  render(){

    noStroke();
    this.old_x.forEach((element,  index) => {
      let alpha = (index + 1) * (150 / this.old_x.length);
      let size = (index + 1) * (this.size / this.old_x.length);
      let temp_col = this.col;
      temp_col.setAlpha(alpha);
      fill(temp_col, 2);
      ellipse(element, this.old_y[index], size);
    });

    /*
    noFill();
    stroke(this.col);
    strokeWeight(this.size);
    beginShape();
    this.old_x.forEach((element,  index) => {
      curveVertex(element, this.old_y[index]);
    });
    endShape();
    */
    
  }

  save_trail(){
    this.old_x.push(this.x);
    this.old_y.push(this.y);
    if (this.old_x.length > this.trail_len)
    {
      this.old_x.shift();
      this.old_y.shift();
    }
  }

  respawn(){
    if (this.x > width || this.x < 0 || this.y > height || this.y < 0){
      this.old_x = [];
      this.old_y = [];
      this.set_random_pos();
    }
  }

  set_random_pos(){
    this.x = random(200, width - 200);
    this.y = random(200, height - 200);
  }
}

function setup() {
  createCanvas(1260, 1230, P2D);
  frameRate(fps);

  palette = [color("#073673"), color("#80A6A2"), color("#F2C572"), color("#8C2F1B")];

  bg = color("#F2D6B3");
  palette.splice(palette.indexOf(bg), 1);
  background(bg);
  //bg.setAlpha(10);

  angleMode(DEGREES);

  let r = 300;
  let cx = 500, cy = 500;
  for (let i = 0; i < num_particles; i++)
  {
    particles[i] = new Particle(0, 0, random(0, 1), random(0, 1), palette.sample(), 5, 1, 30);
    particles[i].set_random_pos();
  }
}

function draw() {
  background(bg);
  for (let i = 0; i < num_particles; i++)
  {
    let p = particles[i];
    p.move();
    p.render();
  }

  if (frameCount > 30) {
    //save("image.png");
    //noLoop();
  }

  //display_fps(frameRate());
}

let paused = true;

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
  if (mouseButton === RIGHT){
    saveCanvas("image.png");
  }
}

function display_fps(fps) {
  noStroke();
  fill(0);
  textSize(32);
  text(str(round(fps)), 10, 35);
}