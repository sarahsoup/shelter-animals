import * as d3 from 'd3';
import * as interpolator from 'd3-interpolate-path';

import './style.css';

function drawDuration(scales,barH,pathOpacityDur){

  d3.select('#timeCount')
    .html('duration');

  // remove arcs and label visibility and functionality
  d3.selectAll('.arc')
    .on('mouseenter', null)
    .on('mouseleave', null)
    .transition()
    .duration(2000)
    .style('opacity',0);

  d3.selectAll('.label')
    .on('mouseenter', null)
    .on('mouseleave', null)
    .transition()
    .duration(2000)
    .style('opacity',0);

  // transition out sidebar bars
  d3.selectAll('.bars-intake')
    .transition()
    .duration(1000)
    .attr('y',barH)
    .attr('height',0);

  d3.selectAll('.bars-outcome')
    .transition()
    .duration(1000)
    .attr('height',0);

  d3.select('#title-bars')
    .text('duration histogram');

  d3.select('#bar-context-flow')
    .transition()
    .style('opacity',0);

  // d3.select('#context-minX')
  //   .transition()
  //   .style('opacity',0);
  //
  // d3.select('#context-maxX')
  //   .transition()
  //   .style('opacity',0);

  // new path function
  const line = d3.line()
    .y(function(d){ return scales.scaleTime(d.dy) })
    .x(function(d){ return scales.scaleLos(d.dx) })
    .curve(d3.curveBundle.beta(0.85));

  d3.selectAll('.paths')
    .transition()
    .duration(5000)
    .attrTween('d',function(d){
      const previous = d3.select(this).attr('d');
      const current = line(d);
      return interpolator.interpolatePath(previous, current);
    })
    .style('opacity',pathOpacityDur);

  // visible axis
  const svg = d3.select('#viz-svg-g');

  svg.selectAll('.axis')
    .transition()
    .delay(3000)
    .duration(2000)
    .style('opacity',1);

  // visible gradient
  svg.select('#rect-gradient')
    .transition()
    .duration(2000)
    .style('opacity',1);

  // transition in duration bars
  d3.selectAll('.bars-duration')
    .transition()
    .delay(2000)
    .duration(1000)
    .attr('y',function(d){ return (barH*1.5)-scales.scaleHistCount(d.length); })
    .attr('height',function(d){ return scales.scaleHistCount(d.length); })

  d3.select('#bar-context-duration')
    .transition()
    .delay(2000)
    .duration(1000)
    .style('opacity',1);

  // d3.select('#axis-count')
  //   .style('opacity',1);

  // d3.select('#bar-svg').append('g')
  //   .attr('transform', 'translate(0,' + (barH*2) + ')')
  //   .call(d3.axisBottom(scaleHistCount));

}

export default{
  drawDuration
}
