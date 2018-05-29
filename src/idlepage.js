import * as d3 from 'd3';
import objects from './index';
import interactions from './interact';
import './style.css';

let animationIntervalObj = {};
let iterationsObj = {};
let timeoutIteration = 0;

function inactivityTime() {
    let t;
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;

    function resetTimer() {
        clearTimeout(t);
        // t = setTimeout(idle, 30000) //30 sec... for testing
        t = setTimeout(idle, 300000) //5 minutes...
    }

    function idle() {
        console.log('timed out!');
        // check if idle page has already been created
        if(document.getElementById('dog-g') == null){
          showIdlePage();
        }else{
          console.log('idle page is already shown');
        }
    }
};

function showIdlePage(){

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

  //create idle page
  createIdlePage();
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
  let y1, y2;
  if(animal == 'dog' || animal == 'cat'){
    y1 = svgW/2;
    y2 = 0;
  }else{
    y1 = 0;
    y2 = svgW/2;
  }

  const line = group.append('line')
    .attr('class','prints-line')
    .attr('x1',x1)
    .attr('x2',x2)
    .attr('y1',y1)
    .attr('y2',y2);

  let set = 0;
  let printW, printH;
  if(animal == 'dog'){
    set = 140;
    printW = 35;
    printH = 35;
  }else if(animal == 'bird'){
    set = 40;
    printW = 20;
    printH = 20;
  }else if(animal == 'cat'){
    set = 80;
    printW = 20;
    printH = 20;
  }else if(animal == 'horse'){
    set = 180;
    printW = 45;
    printH = 45;
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
      .attr('x',x1-printW)
      .attr('y',function(){
        if(animal == 'dog' || animal == 'cat'){
          return y1-printH;
        }else{
          return y1-printH;
        }
      })
      .attr('width',printW)
      .attr('height',printH)
      .style('opacity',0)
      .attr('transform',function(){
        const angle = getAngle(y1,y2,x1,x2);
        return `translate(${changeX},${changeY})rotate(${angle+90},${x1},${y1})`;
      })
    group.append('svg:image')
      .attr('xlink:href','./SVG/'+animal+'-right.svg')
      .attr('class','prints prints-'+animal)
      .attr('id','prints-'+animal+'-right-'+i)
      .attr('x',x1+printW)
      .attr('y',function(){
        if(animal == 'dog' || animal == 'cat'){
          return y1-(printH*3);
        }else if(animal == 'horse'){
          return y1-(printH*3);
        }else{
          return y1-(printH*2);
        }
      })
      .attr('width',printW)
      .attr('height',printH)
      .style('opacity',0)
      .attr('transform',function(){
        const angle = getAngle(y1,y2,x1,x2);
        return `translate(${changeX},${changeY})rotate(${angle+90},${x1},${y1})`;
      })
  }
  return iterations+1;
}

function animateIdlePage(dogIterations,birdIterations,catIterations,horseIterations){

  let counter = 0
  const animationDelay = setInterval(function(){
    if(counter == 0){
      dogRepeat();
    }else if(counter == 1){
      birdRepeat();
    }else if(counter == 2){
      catRepeat();
    }else if(counter == 3){
      horseRepeat();
      clearInterval(animationDelay);
    }
    counter++;
  }, (((dogIterations+birdIterations+catIterations+horseIterations)*500)/5))

  function dogRepeat(){
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
      .delay(500)
      .duration(4000)
      .style('opacity',0)
      .transition()
      .delay((dogIterations*1000)/2)
      .on('end',dogRepeat);
  }

  function birdRepeat(){
    d3.selectAll('.prints-bird')
      .transition()
      .delay(function(){
        const printDelay = parseInt(this.id.match(/\d+/));
        if(this.id.includes('left')){
          return printDelay*250;
        }else{
          return printDelay*250+125;
        }
      })
      .style('opacity',1)
      .transition()
      .delay(500)
      .duration(4000)
      .style('opacity',0)
      .transition()
      .delay((birdIterations*500)/2)
      .on('end',birdRepeat);
  }
  function catRepeat(){
    d3.selectAll('.prints-cat')
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
      .delay(500)
      .duration(4000)
      .style('opacity',0)
      .transition()
      .delay((catIterations*1000)/2)
      .on('end',catRepeat);
  }
  function horseRepeat(){
    d3.selectAll('.prints-horse')
      .transition()
      .delay(function(){
        const printDelay = parseInt(this.id.match(/\d+/));
        if(this.id.includes('left')){
          return printDelay*1000;
        }else{
          return printDelay*1000+500;
        }
      })
      .style('opacity',1)
      .transition()
      .delay(500)
      .duration(4000)
      .style('opacity',0)
      .transition()
      .delay((horseIterations*2000)/2)
      .on('end',horseRepeat);
  }
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
  animateIdlePage
}
