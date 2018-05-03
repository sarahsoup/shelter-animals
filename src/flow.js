import * as d3 from 'd3';
import * as interpolator from 'd3-interpolate-path';
import interactions from './interact';
import './style.css';

// map angle values for path locations
const startMap = new Map();
const diffMap = new Map();
const iMap = new Map();
const valMap = new Map();

const hmhlRadianAdj = .01;
const rtfRadianAdj = -.03;

let startAdeg, diffAdeg, diffA, incre, theta, angle, x, y, svg, i;

// function for creating curve of path
const curve = d3.line()
  .x(function(d){ return d.fx})
  .y(function(d){ return d.fy})
  .curve(d3.curveBundle.beta(0.85));

function drawFlow(data,intake,outcome,obj){

  d3.select('#supplemental')
    .transition()
    .delay(35 * obj.dayDuration)
    .duration(4000)
    .style('opacity',1);

  d3.select('#btn-group-views')
    .transition()
    .delay(35 * obj.dayDuration)
    .duration(4000)
    .style('opacity',1);

  d3.select('#timeCount')
    .transition()
    .delay(obj.dayDuration*2)
    .style('opacity',1);

  // functions for creating arc dimensions
  const arc = d3.arc()
      .outerRadius(obj.radius - obj.outer)
      .innerRadius(obj.radius - obj.inner);
  const pieI = d3.pie()
    .sort(function(a,b){ return b.value-a.value; })
    .value(function(d){ return d.value; })
    .startAngle(-160 * (obj.pi / 180))
    .endAngle(-20 * (obj.pi / 180));
  const pieO = d3.pie()
    .sort(function(a,b){
      if(a.key == 'SHELTER' && b.key == 'ADOPTION' || b.key == 'SHELTER' && a.key == 'ADOPTION'){ return a.value-b.value; }
      else{ return b.value-a.value; }
    })
    .value(function(d){ return d.value; })
    .startAngle(160 * (obj.pi / 180))
    .endAngle(20 * (obj.pi / 180));

  // create mappings
  pieI(intake).forEach(function(d){
    startAdeg = (d.startAngle * 180 / obj.pi)-90;
    diffAdeg = (d.startAngle * 180 / obj.pi)-(d.endAngle * 180 / obj.pi);
    diffA = d.startAngle-d.endAngle;
    incre = diffA/(d.value+3);
    startMap.set(d.data.key, d.startAngle);
    diffMap.set(d.data.key, diffA);
    valMap.set(d.data.key, d.value);
    iMap.set(d.data.key, incre);
  })
  pieO(outcome).forEach(function(d){
    startAdeg = (d.startAngle * 180 / obj.pi)-90;
    diffAdeg = (d.startAngle * 180 / obj.pi)-(d.endAngle * 180 / obj.pi);
    diffA = d.startAngle-d.endAngle;
    incre = diffA/(d.value+3);
    startMap.set(d.data.key, d.startAngle);
    diffMap.set(d.data.key, diffA);
    valMap.set(d.data.key, d.value);
    iMap.set(d.data.key, incre);
  })

  // draw arcs
  const svg = d3.select('#viz-svg-g');

  svg.selectAll('.arc-intake')
    .data(pieI(intake))
    .enter()
    .append('g')
    .attr('class','arc arc-intake')
    .attr('id',function(d){ return 'arc-' + d.data.key; })
    .append('path')
    .attr('d', arc);

  svg.selectAll('.arc-outcome')
    .data(pieO(outcome))
    .enter()
    .append('g')
    .attr('class','arc arc-outcome')
    .attr('id',function(d){ return 'arc-' + d.data.key; })
    .append('path')
    .attr('d', arc);

  // draw labels
  svg.append('g')
    .attr('id','label-group')
    .selectAll('.label-intake')
    .data(pieI(intake))
    .enter()
    .append('text')
    .attr('class','label label-intake')
    .attr('id',function(d){ return 'label-' + d.data.key; })
    .text(function(d){ return obj.labelMap.get(d.data.key); })
    .style('text-anchor','end')
    .attr('x',0)
    .attr('y',0)
    .attr('transform',function(d){
      if(d.data.key == 'HMHL'){
        theta = d.startAngle - ((d.startAngle-(d.endAngle+hmhlRadianAdj))/2) - (Math.PI/2);
      }else{
        theta = d.startAngle - ((d.startAngle-d.endAngle)/2) - (Math.PI/2);
      }
      x = (obj.radius-obj.labelStart) * Math.cos(theta);
      y = (obj.radius-obj.labelStart) * Math.sin(theta);
      angle = (theta * 180) / Math.PI;
      return 'translate(' + x + ',' + y + ') rotate(' + (angle-180) + ')';
    });

  svg.select('#label-group')
    .selectAll('.label-outcome')
    .data(pieO(outcome))
    .enter()
    .append('text')
    .attr('class','label label-outcome')
    .attr('id',function(d){ return 'label-' + d.data.key; })
    .text(function(d){ return obj.labelMap.get(d.data.key); })
    .attr('x',0)
    .attr('y',0)
    .attr('transform',function(d){
      if(d.data.key == 'RTF'){
        theta = d.startAngle - ((d.startAngle-(d.endAngle+rtfRadianAdj))/2) - (obj.pi/2);
      }else{
        theta = d.startAngle - ((d.startAngle-d.endAngle)/2) - (obj.pi/2);
      }
      x = (obj.radius-obj.labelStart) * Math.cos(theta);
      y = (obj.radius-obj.labelStart) * Math.sin(theta);
      angle = (theta * 180) / Math.PI;
      return 'translate(' + x + ',' + y + ') rotate(' + angle + ')';
    });

  // draw paths
  const pathVarObj = {
    radius: obj.radius,
    inner: obj.inner,
    oneDay: obj.oneDay
  }

  const paths = svg.selectAll('.paths')
    .data(makePath(data, pathVarObj))
    .enter()
    .append('g')
    .datum(function(d){ return d.path; })
    .append('path')
    .attr('class','paths')
    .attr('id',function(d){ return 'path-' + d[0].data.id})
    .attr('d',curve)
    .style('stroke-width', 1)
    .style('stroke', function(d){ return obj.scaleColor(d[0].data.type); })
    .style('fill','none')
    .style('opacity',obj.pathOpacity+0.2);

  // animate paths
  paths
    .attr('stroke-dasharray', function(d){
      return (this.getTotalLength()/**2*/) + ' ' + (this.getTotalLength()/**2*/);
    })
    .attr('stroke-dashoffset', function(d){
      return this.getTotalLength()/**2*/;
    })
    .transition()
      .delay(function(d){
        return (d[0].data.intake_delay*obj.dayDuration)+(obj.dayDuration*4);
      })
      .duration(function(d){
        return (d[0].data.los_new-d[0].data.los_offset)*obj.dayDuration;
      })
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0)
    .transition()
    .attr('stroke-dasharray', 'none')
    .style('opacity',obj.pathOpacity-0.1);

  paths
    .transition()
    .delay((34 * obj.dayDuration) + (obj.dayDuration * 2))
    .duration(2000)
    .style('opacity',obj.pathOpacity);

    // date counter for initial load
    i = -3;
    const timeInterval = setInterval(function(){
      if(i >= 0 && i < 31){
        d3.select('#timeCount')
          .html(obj.months[obj.timeCount.getMonth()]+' '+ (obj.timeCount.getDate() + i));
      }
      if(i == 30){
        d3.select('#timeCount')
          .transition()
          .style('opacity',0);
      }else if(i == 32){
        d3.select('#timeCount')
          .html('flow');
      }else if(i == 33){
        clearInterval(timeInterval);
        d3.select('#timeCount')
          .transition()
          .style('opacity',1);
        // functionality
        svg.selectAll('.arc')
          .on('mouseenter', function(d){ interactions.highlightFlow(d.data.key); })
          .on('mouseleave', function(){ interactions.unhighlight(); });

        svg.selectAll('.label')
          .on('mouseenter', function(d){ interactions.highlightFlow(d.data.key); })
          .on('mouseleave', function(){ interactions.unhighlight(); });
      }
      i++;
    }, obj.dayDuration);

    // duration view elements
    const gradient = svg.append('linearGradient')
      .attr('id','gradient')
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    gradient.append('stop')
      .attr('offset','75%')
      .attr('stop-color','white')
      .attr('stop-opacity', 1);
    gradient.append('stop')
      .attr('offset','90%')
      .attr('stop-color','white')
      .attr('stop-opacity', .4);
    gradient.append('stop')
      .attr('offset','100%')
      .attr('stop-color','white')
      .attr('stop-opacity',0);

    svg.append('g')
      .attr('class','axis')
      .attr('id','axis-time')
      //.attr('transform','translate('+ ((-obj.w/2)+100) +',0)')
      .attr('transform','translate('+ (-(2*obj.w/5)-20) +',0)')
      .call(d3.axisLeft(obj.scaleTime).tickFormat(d3.timeFormat("%b %d")).ticks(d3.timeDay.every(7)).tickSize(-obj.w))
      .style('opacity',0);

    svg.append('rect')
      .attr('id','rect-gradient')
      .attr('x',-2*obj.w/4)
      .attr('y',-2*obj.h/5 - 10)
      .attr('width',obj.w)
      .attr('height',150)
      .style('fill','url(#gradient)')
      .style('opacity',0);

    svg.append('g')
      .attr('class','axis')
      .attr('id','axis-duration')
      .style('font-size','10px')
      .style('opacity',0);
    svg.select('#axis-duration')
      .append('text')
      .text('longest length of stay')
      .attr('x',-(2*obj.w/5))
      .attr('y',-(2*obj.h/5)+80)
      .style('text-anchor','start');
    svg.select('#axis-duration')
      .append('text')
      .text('shortest length of stay')
      .attr('x',(2*obj.w/5))
      .attr('y',-(2*obj.h/5)+80)
      .style('text-anchor','end');

};

function makePath(data, obj){

  let outX,outY,intakeOffset;

  // for each row in data, make path array
  data.forEach(function(i){

    const incrIntake = iMap.get(i.intake_type) * (i.intake_index+1);
    const thetaIntake = startMap.get(i.intake_type) - incrIntake - (Math.PI/2);
    const inX = (obj.radius-obj.inner) * Math.cos(thetaIntake);
    const inY = (obj.radius-obj.inner) * Math.sin(thetaIntake);

    if(i.outcome_type != ''){
      const incrOutcome = iMap.get(i.outcome_type) * (i.outcome_index+1);
      const thetaOutcome = startMap.get(i.outcome_type) - incrOutcome - (Math.PI/2);
      outX = (obj.radius-obj.inner) * Math.cos(thetaOutcome);
      outY = (obj.radius-obj.inner) * Math.sin(thetaOutcome);
    }
    else{
      outX = 0;
      outY = 0;
    }

    if(i.los_new < 1){
      intakeOffset = i.intake_date.getTime() - (i.los_new*obj.oneDay);
      i.intake_date = new Date(intakeOffset);
    }

    // generate path
    i.path = [{'fx': inX, 'fy': inY, 'dy': i.intake_date, 'dx': i.los_rank, 'data': i},
    {'fx': 0, 'fy': 0, 'dy': i.intake_date, 'dx': i.los_rank},
    {'fx': outX, 'fy': outY, 'dy': i.outcome_date, 'dx': i.los_rank}];

  })

  return data;

};

function redrawFlow(scales,views,barH){

  d3.select('#timeCount')
    .html('flow');

  const svg = d3.select('#viz-svg-g');

  svg.selectAll('.axis')
    .transition()
    .duration(2000)
    .style('opacity',0);

  svg.select('#rect-gradient')
    .transition()
    .duration(2000)
    .style('opacity',0);

  d3.selectAll('.paths')
    .transition()
    .duration(5000)
    .attrTween('d',function(d){
      const previous = d3.select(this).attr('d');
      const current = curve(d);
      return interpolator.interpolatePath(previous, current);
    })
    .style('opacity',views.pathOpacity);

  d3.selectAll('.arc')
    .on('mouseenter', function(d){ interactions.highlightFlow(d.data.key); /*dispatch.call('highlight:flow',null,d.data.key);*/ })
    .on('mouseleave', function(){ interactions.unhighlight(); /*dispatch.call('unhighlight');*/ })
    .transition()
    .delay(4000)
    .duration(2000)
    .style('opacity',1);

  d3.selectAll('.label')
    .on('mouseenter', function(d){ interactions.highlightFlow(d.data.key); })
    .on('mouseleave', function(){ interactions.unhighlight(); })
    .transition()
    .delay(4000)
    .duration(2000)
    .style('opacity',1);

  // transition out sidebar bars for duration
  d3.selectAll('.bars-duration')
    .transition()
    .duration(1000)
    .attr('y',barH*1.5)
    .attr('height',0);

  d3.select('#bar-context-duration')
    .transition()
    .duration(1000)
    .style('opacity',0);

  // transition in sidebar bars for intake and outcome
  d3.selectAll('.bars-intake')
    .transition()
    .delay(4000)
    .duration(2000)
    .attr('y',function(d){ return barH-scales.scaleCount(d.values.length); })
    .attr('height',function(d){ return scales.scaleCount(d.values.length); });

  d3.selectAll('.bars-outcome')
    .transition()
    .delay(4000)
    .duration(2000)
    .attr('height',function(d){ return scales.scaleCount(d.values.length); });

  d3.select('#title-bars')
    .transition()
    .delay(5000)
    .text('daily counts');

  d3.select('#bar-context-flow')
    .transition()
    .delay(5000)
    .style('opacity',1);

}

function animateFlow(obj, barH, barW, colW){

  const svg = d3.select('#viz-svg-g');

  // hide all duration view elements
  svg.selectAll('.axis')
    .style('opacity',0);
  svg.select('#rect-gradient')
    .style('opacity',0);
  d3.selectAll('.bars-duration')
    .style('fill','#A9A9A9')
    .style('opacity',1)
    .attr('y',barH*2)
    .attr('height',0);
  d3.select('#bar-context-duration')
    .style('opacity',0);

  //bring in flow elements
  obj.scaleCount.domain([0,obj.maxCount]);

  d3.selectAll('.bars-intake')
    .style('fill','#A9A9A9')
    .style('opacity',1)
    .attr('y',function(d){ return barH-obj.scaleCount(d.values.length); })
    .attr('height',function(d){ return obj.scaleCount(d.values.length); });
  d3.selectAll('.bars-outcome')
    .style('fill','#A9A9A9')
    .style('opacity',1)
    .attr('height',function(d){ return obj.scaleCount(d.values.length); });

  d3.select('#title-bars')
    .text('daily counts');

  d3.select('#bar-context-flow')
    .style('opacity',1);

  d3.selectAll('.paths')
    .attr('d',curve)
    .style('opacity',obj.pathOpacity+0.2);

  d3.selectAll('.arc')
    .style('opacity',0)
    .on('mouseenter', null)
    .on('mouseleave', null)
    .transition()
    .delay(obj.dayDuration*1.5)
    .style('opacity',1);

  d3.selectAll('.label')
    .style('opacity',0)
    .on('mouseenter', null)
    .on('mouseleave', null)
    .transition()
    .delay(obj.dayDuration*1.5)
    .style('opacity',1);

  // animate paths
  d3.selectAll('.paths')
    .attr('stroke-dasharray', function(d){
      return (this.getTotalLength()/**2*/) + ' ' + (this.getTotalLength()/**2*/);
    })
    .attr('stroke-dashoffset', function(d){
      return this.getTotalLength()/**2*/;
    })
    .transition()
      .delay(function(d){
        return (d[0].data.intake_delay*obj.dayDuration)+(obj.dayDuration*4);
      })
      .duration(function(d){
        return (d[0].data.los_new-d[0].data.los_offset)*obj.dayDuration;
      })
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0)
    .transition()
    .attr('stroke-dasharray', 'none')
    .style('opacity',obj.pathOpacity-0.1);

  d3.selectAll('.paths')
    .transition()
    .delay((34 * obj.dayDuration) + (obj.dayDuration * 2))
    .duration(2000)
    .style('opacity',obj.pathOpacity);

  //add timeCount
  d3.select('#timeCount')
    .html(null)
    .transition()
    .delay(obj.dayDuration*1.5)
    .style('opacity',1);

    // date counter for initial load
    i = -3;
    const timeInterval = setInterval(function(){
      if(i >= 0 && i < 31){
        d3.select('#timeCount')
          .html(obj.months[obj.timeCount.getMonth()]+' '+ (obj.timeCount.getDate() + i));
      }
      if(i == 30){
        d3.select('#timeCount')
          .transition()
          .style('opacity',0);
      }else if(i == 32){
        d3.select('#timeCount')
          .html('flow');
      }else if(i == 33){
        clearInterval(timeInterval);
        d3.select('#timeCount')
          .transition()
          .style('opacity',1);
        // functionality
        svg.selectAll('.arc')
        .on('mouseenter', function(d){ interactions.highlightFlow(d.data.key); })
        .on('mouseleave', function(){ interactions.unhighlight(); })

        svg.selectAll('.label')
        .on('mouseenter', function(d){ interactions.highlightFlow(d.data.key); })
        .on('mouseleave', function(){ interactions.unhighlight(); })
      }
      i++;
    }, obj.dayDuration);

  //add fade in view toggle and side bar
  d3.select('#btn-views-flow')
    .classed('btn-clicked',true);
  d3.select('#btn-views-duration')
    .classed('btn-clicked',false);

  d3.select('#supplemental')
    .transition()
    .delay(35 * obj.dayDuration)
    .duration(4000)
    .style('opacity',1);

  d3.select('#btn-group-views')
    .transition()
    .delay(35 * obj.dayDuration)
    .duration(4000)
    .style('opacity',1);

}

export default{
  drawFlow,
  redrawFlow,
  animateFlow
}
