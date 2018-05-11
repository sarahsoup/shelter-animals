import * as d3 from 'd3';
import interactions from './interact';
import './style.css';

let animationIntervalObj = {};
let iterationsObj = {};

function inactivityTime() {
    let t;
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(idle, 240000) //4 minutes...
    }

    function idle() {
        showIdlePage();
    }
};

function showIdlePage(){

  console.log('timed out!');

  interactions.unhighlight();

  d3.select('#idle')
    .classed('hidden',false);
  d3.select('#content')
    .classed('hidden',true);

  d3.select('#supplemental')
    .style('opacity',0);
  d3.select('#btn-group-views')
    .style('opacity',0);
  d3.select('#timeCount')
    .style('opacity',0);

  //animate prints
  animateIdlePage(iterationsObj.dogIterations,iterationsObj.birdIterations,iterationsObj.catIterations,iterationsObj.horseIterations);

}

function createIdlePage(){
  const w = window.innerWidth;
  const svgW = d3.select('#idle-container').node().clientWidth;
  const textW = d3.select('#idle-text-g').node().clientWidth;

  d3.select('#idle-svg')
    .attr('height',svgW/2)
    .attr('width',svgW);

  d3.select('#idle-text-g')
    .style('top', '25%')
    .style('left', (w-textW)/2 + 'px');

  // append prints
  const dogIterations = appendPrints('dog',svgW);
  const birdIterations = appendPrints('bird',svgW);
  const catIterations = appendPrints('cat',svgW);
  const horseIterations = appendPrints('horse',svgW);

  iterationsObj.dogIterations = dogIterations;
  iterationsObj.birdIterations = birdIterations;
  iterationsObj.catIterations = catIterations;
  iterationsObj.horseIterations = horseIterations;

  // animate prints
  animateIdlePage(dogIterations,birdIterations,catIterations,horseIterations);
}

function appendPrints(animal,svgW){
  const group = d3.select('#idle-svg').append('g')
    .attr('id',animal+'-g');

  const x1 = getRandomInt(svgW);
  const x2 = getRandomInt(svgW);
  const y1 = svgW/2;
  const y2 = 0;

  const line = group.append('line')
    .attr('x1',x1)
    .attr('x2',x2)
    .attr('y1',y1)
    .attr('y2',y2);

  let set = 0;
  if(animal == 'dog'){
    set = 80;
  }else if(animal == 'bird'){
    set = 80;
  }else if(animal == 'cat'){
    set = 80;
  }else if(animal == 'horse'){
    set = 80;
  }

  const length = getLength(y1,y2,x1,x2);
  const iterations = length/set;

  let i;
  for(i = 1; i < iterations+1; i++){
    const distanceRatio = ((i-1)*set)/length;
    const changeX = (1-(distanceRatio)*x1 + distanceRatio*x2);
    const changeY = (1-(distanceRatio)*y1 + distanceRatio*y2);

    group.append('svg:image')
      .attr('xlink:href','./SVG/'+animal+'-left.svg')
      .attr('class','prints prints-'+animal)
      .attr('id','prints-'+animal+'-left-'+i)
      .attr('x',x1-40)
      .attr('y',y1-40)
      .attr('width',40)
      .attr('height',40)
      .style('opacity',0)
      .attr('transform',function(){
        const angle = getAngle(y1,y2,x1,x2);
        const centerX = this.getBBox().x + this.getBBox().width/2;
        const centerY = this.getBBox().y + this.getBBox().height/2;
        return `translate(${changeX},${changeY})rotate(${angle+90},${centerX},${centerY})`;
      })
    group.append('svg:image')
      .attr('xlink:href','./SVG/'+animal+'-right.svg')
      .attr('class','prints prints-'+animal)
      .attr('id','prints-'+animal+'-right-'+i)
      .attr('x',x1+40)
      .attr('y',y1-60)
      .attr('width',40)
      .attr('height',40)
      .style('opacity',0)
      .attr('transform',function(){
        const angle = getAngle(y1,y2,x1,x2);
        const centerX = this.getBBox().x + this.getBBox().width/2;
        const centerY = this.getBBox().y + this.getBBox().height/2;
        return `translate(${changeX},${changeY})rotate(${angle+90},${centerX},${centerY})`;
      })
  }
  return iterations+1;
}

function animateIdlePage(dogIterations,birdIterations,catIterations,horseIterations){
  d3.selectAll('.prints-dog')
    .transition()
    .delay(function(){
      const printDelay = parseInt(this.id.match(/\d+/));
      if(this.id.includes('left')){
        return printDelay*500;
      }else{
        return printDelay*500+250;
      }
    })
    .style('opacity',1)
    .transition()
    .delay(1000)
    .duration(4000)
    .style('opacity',0);

  d3.selectAll('.prints-bird')
    .transition()
    .delay(function(){
      const printDelay = parseInt(this.id.match(/\d+/));
      if(this.id.includes('left')){
        return (dogIterations*500)+(printDelay*500);
      }else{
        return (dogIterations*500)+(printDelay*500+250);
      }
    })
    .style('opacity',1)
    .transition()
    .delay(1000)
    .duration(4000)
    .style('opacity',0);

  d3.selectAll('.prints-cat')
    .transition()
    .delay(function(){
      const printDelay = parseInt(this.id.match(/\d+/));
      if(this.id.includes('left')){
        return (dogIterations*500)+(birdIterations*500)+(printDelay*500);
      }else{
        return (dogIterations*500)+(birdIterations*500)+(printDelay*500+250);
      }
    })
    .style('opacity',1)
    .transition()
    .delay(1000)
    .duration(4000)
    .style('opacity',0);

  d3.selectAll('.prints-horse')
    .transition()
    .delay(function(){
      const printDelay = parseInt(this.id.match(/\d+/));
      if(this.id.includes('left')){
        return (dogIterations*500)+(birdIterations*500)+(catIterations*500)+(printDelay*500);
      }else{
        return (dogIterations*500)+(birdIterations*500)+(catIterations*500)+(printDelay*500+250);
      }
    })
    .style('opacity',1)
    .transition()
    .delay(1000)
    .duration(4000)
    .style('opacity',0);

  const animationInterval = setInterval(function(){
    d3.selectAll('.prints-dog')
      .transition()
      .delay(function(){
        const printDelay = parseInt(this.id.match(/\d+/));
        if(this.id.includes('left')){
          return printDelay*500;
        }else{
          return printDelay*500+250;
        }
      })
      .style('opacity',1)
      .transition()
      .delay(1000)
      .duration(4000)
      .style('opacity',0);

    d3.selectAll('.prints-bird')
      .transition()
      .delay(function(){
        const printDelay = parseInt(this.id.match(/\d+/));
        if(this.id.includes('left')){
          return (dogIterations*500)+(printDelay*500);
        }else{
          return (dogIterations*500)+(printDelay*500+250);
        }
      })
      .style('opacity',1)
      .transition()
      .delay(1000)
      .duration(4000)
      .style('opacity',0);

    d3.selectAll('.prints-cat')
      .transition()
      .delay(function(){
        const printDelay = parseInt(this.id.match(/\d+/));
        if(this.id.includes('left')){
          return (dogIterations*500)+(birdIterations*500)+(printDelay*500);
        }else{
          return (dogIterations*500)+(birdIterations*500)+(printDelay*500+250);
        }
      })
      .style('opacity',1)
      .transition()
      .delay(1000)
      .duration(4000)
      .style('opacity',0);

    d3.selectAll('.prints-horse')
      .transition()
      .delay(function(){
        const printDelay = parseInt(this.id.match(/\d+/));
        if(this.id.includes('left')){
          return (dogIterations*500)+(birdIterations*500)+(catIterations*500)+(printDelay*500);
        }else{
          return (dogIterations*500)+(birdIterations*500)+(catIterations*500)+(printDelay*500+250);
        }
      })
      .style('opacity',1)
      .transition()
      .delay(1000)
      .duration(4000)
      .style('opacity',0);

  },(((dogIterations+birdIterations+catIterations+horseIterations)*500)+1000));
  animationIntervalObj.animationInterval = animationInterval;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getAngle(y1,y2,x1,x2){
  const radians = Math.atan2(y2 - y1, x2 - x1);
  return radians * 180 / Math.PI;
}

function getLength(y1,y2,x1,x2){
  return Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2));
}

export default{
  inactivityTime,
  createIdlePage,
  animateIdlePage,
  animationIntervalObj
}
