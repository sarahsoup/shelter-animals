import * as d3 from 'd3';
import interactions from './interact';
import './style.css';

function inactivityTime() {
    let t;
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(idle, 240000) //four minutes...
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

}

function createIdlePage(){
  const w = window.innerWidth;
  const svgW = d3.select('#idle-container').node().clientWidth;
  const textW = d3.select('#idle-text-g').node().clientWidth;

  const svg = d3.select('#idle-svg')
    .attr('height',svgW/2)
    .attr('width',svgW);

  d3.select('#idle-text-g')
    .style('top', '25%')
    .style('left', (w-textW)/2 + 'px');

  const dog = svg.append('g')
    .attr('id','dog-g');

  const dogX1 = getRandomInt(svgW);
  const dogX2 = getRandomInt(svgW);
  const dogY1 = svgW/2;
  const dogY2 = 0;

  const line = dog.append('line')
    .attr('x1',dogX1)
    .attr('x2',dogX2)
    .attr('y1',dogY1)
    .attr('y2',dogY2);

  const pawSet = 80;
  const length = getLength(dogY1,dogY2,dogX1,dogX2);
  const pawIterations = length/pawSet;

  let i;
  for(i = 1; i < pawIterations+1; i++){
    const distanceRatio = ((i-1)*pawSet)/length;
    const changeX = (1-(distanceRatio)*dogX1 + distanceRatio*dogX2);
    const changeY = (1-(distanceRatio)*dogY1 + distanceRatio*dogY2);

    dog.append('svg:image')
      .attr('xlink:href','./SVG/dog-left.svg')
      .attr('class','prints')
      .attr('id','prints-dog-left-'+i)
      .attr('x',dogX1-40)
      .attr('y',dogY1-40)
      .attr('width',40)
      .attr('height',40)
      .style('opacity',0)
      .attr('transform',function(){
        const angle = getAngle(dogY1,dogY2,dogX1,dogX2);
        const centerX = this.getBBox().x + this.getBBox().width/2;
        const centerY = this.getBBox().y + this.getBBox().height/2;
        return `translate(${changeX},${changeY})rotate(${angle+90},${centerX},${centerY})`;
      })
    dog.append('svg:image')
      .attr('xlink:href','./SVG/dog-right.svg')
      .attr('class','prints')
      .attr('id','prints-dog-right-'+i)
      .attr('x',dogX1+40)
      .attr('y',dogY1-60)
      .attr('width',40)
      .attr('height',40)
      .style('opacity',0)
      .attr('transform',function(){
        const angle = getAngle(dogY1,dogY2,dogX1,dogX2);
        const centerX = this.getBBox().x + this.getBBox().width/2;
        const centerY = this.getBBox().y + this.getBBox().height/2;
        return `translate(${changeX},${changeY})rotate(${angle+90},${centerX},${centerY})`;
      })

    d3.selectAll('.prints')
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
  }

  //animate prints

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
  createIdlePage
}
