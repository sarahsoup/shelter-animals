import * as d3 from 'd3';
import './style.css';

// map angle values for path locations
const startMap = new Map();
const diffMap = new Map();
const iMap = new Map();
const valMap = new Map();

const hmhlRadianAdj = .01;
const rtfRadianAdj = -.03;

// function for creating curve of path
const curve = d3.line()
  .x(function(d){ return d.fx})
  .y(function(d){ return d.fy})
  .curve(d3.curveBundle.beta(0.85));

export const drawFlow = (data,intake,outcome) => {
  console.log('drawFlow runs');
  // d3.select('#supplemental')
  //   .transition()
  //   .delay(35 * dayDuration)
  //   .duration(4000)
  //   .style('opacity',1);
  //
  // d3.select('#btn-group-views')
  //   .transition()
  //   .delay(35 * dayDuration)
  //   .duration(4000)
  //   .style('opacity',1);
  //
  // d3.select('#timeCount')
  //   .transition()
  //   .delay(dayDuration*2)
  //   .style('opacity',1);
  //
  // // functions for creating arc dimensions
  // const arc = d3.arc()
  //     .outerRadius(radius - outer)
  //     .innerRadius(radius - inner);
  // const pieI = d3.pie()
  //   .sort(function(a,b){ return b.value-a.value; })
  //   .value(function(d){ return d.value; })
  //   .startAngle(-160 * (pi / 180))
  //   .endAngle(-20 * (pi / 180));
  // const pieO = d3.pie()
  //   .sort(function(a,b){
  //     if(a.key == 'SHELTER' && b.key == 'ADOPTION'){ return a.value-b.value; }
  //     else{ return b.value-a.value; }
  //     // return b.value-a.value;
  //   })
  //   .value(function(d){ return d.value; })
  //   .startAngle(160 * (pi / 180))
  //   .endAngle(20 * (pi / 180));
  //
  // // create mappings
  // pieI(intake).forEach(function(d){
  //   startAdeg = (d.startAngle * 180 / Math.PI)-90;
  //   diffAdeg = (d.startAngle * 180 / Math.PI)-(d.endAngle * 180 / Math.PI);
  //   diffA = d.startAngle-d.endAngle;
  //   incre = diffA/(d.value+3);
  //   startMap.set(d.data.key, d.startAngle);
  //   diffMap.set(d.data.key, diffA);
  //   valMap.set(d.data.key, d.value);
  //   iMap.set(d.data.key, incre);
  // })
  // pieO(outcome).forEach(function(d){
  //   startAdeg = (d.startAngle * 180 / Math.PI)-90;
  //   diffAdeg = (d.startAngle * 180 / Math.PI)-(d.endAngle * 180 / Math.PI);
  //   diffA = d.startAngle-d.endAngle;
  //   incre = diffA/(d.value+3);
  //   startMap.set(d.data.key, d.startAngle);
  //   diffMap.set(d.data.key, diffA);
  //   valMap.set(d.data.key, d.value);
  //   iMap.set(d.data.key, incre);
  // })
  //
  // // draw arcs
  // svg.selectAll('.arc-intake')
  //   .data(pieI(intake))
  //   .enter()
  //   .append('g')
  //   .attr('class','arc arc-intake')
  //   .attr('id',function(d){ return 'arc-' + d.data.key; })
  //   .append('path')
  //   .attr('d', arc);
  //
  // svg.selectAll('.arc-outcome')
  //   .data(pieO(outcome))
  //   .enter()
  //   .append('g')
  //   .attr('class','arc arc-outcome')
  //   .attr('id',function(d){ return 'arc-' + d.data.key; })
  //   .append('path')
  //   .attr('d', arc);
  //
  // // draw labels
  // svg.append('g')
  //   .attr('id','label-group')
  //   .selectAll('.label-intake')
  //   .data(pieI(intake))
  //   .enter()
  //   .append('text')
  //   .attr('class','label label-intake')
  //   .attr('id',function(d){ return 'label-' + d.data.key; })
  //   .text(function(d){ return labelMap.get(d.data.key); })
  //   .style('text-anchor','end')
  //   .attr('x',0)
  //   .attr('y',0)
  //   .attr('transform',function(d){
  //     if(d.data.key == 'HMHL'){
  //       theta = d.startAngle - ((d.startAngle-(d.endAngle+hmhlRadianAdj))/2) - (Math.PI/2);
  //     }else{
  //       theta = d.startAngle - ((d.startAngle-d.endAngle)/2) - (Math.PI/2);
  //     }
  //     x = (radius-labelStart) * Math.cos(theta);
  //     y = (radius-labelStart) * Math.sin(theta);
  //     angle = (theta * 180) / Math.PI;
  //     return 'translate(' + x + ',' + y + ') rotate(' + (angle-180) + ')';
  //   });
  //
  // svg.select('#label-group')
  //   .selectAll('.label-outcome')
  //   .data(pieO(outcome))
  //   .enter()
  //   .append('text')
  //   .attr('class','label label-outcome')
  //   .attr('id',function(d){ return 'label-' + d.data.key; })
  //   .text(function(d){ return labelMap.get(d.data.key); })
  //   .attr('x',0)
  //   .attr('y',0)
  //   .attr('transform',function(d){
  //     if(d.data.key == 'RTF'){
  //       theta = d.startAngle - ((d.startAngle-(d.endAngle+rtfRadianAdj))/2) - (Math.PI/2);
  //     }else{
  //       theta = d.startAngle - ((d.startAngle-d.endAngle)/2) - (Math.PI/2);
  //     }
  //     x = (radius-labelStart) * Math.cos(theta);
  //     y = (radius-labelStart) * Math.sin(theta);
  //     angle = (theta * 180) / Math.PI;
  //     return 'translate(' + x + ',' + y + ') rotate(' + angle + ')';
  //   });
  //
  // // draw paths
  // const paths = svg.selectAll('.paths')
  //   .data(makePath(data))
  //   .enter()
  //   .append('g')
  //   .datum(function(d){ return d.path; })
  //   .append('path')
  //   .attr('class','paths')
  //   .attr('id',function(d){ return 'path-' + d[0].data.id})
  //   .attr('d',curve)
  //   .style('stroke-width', 1)
  //   .style('stroke', function(d){ return scaleColor(d[0].data.type); })
  //   .style('fill','none')
  //   .style('opacity',pathOpacity+0.2);
  //
  // // animate paths
  // paths
  //   .attr('stroke-dasharray', function(d){
  //     return (this.getTotalLength()/**2*/) + ' ' + (this.getTotalLength()/**2*/);
  //   })
  //   .attr('stroke-dashoffset', function(d){
  //     return this.getTotalLength()/**2*/;
  //   })
  //   .transition()
  //     .delay(function(d){
  //       return (d[0].data.intake_delay*dayDuration)+(dayDuration*4);
  //     })
  //     .duration(function(d){
  //       return (d[0].data.los_new-d[0].data.los_offset)*dayDuration;
  //     })
  //     .ease(d3.easeLinear)
  //     .attr('stroke-dashoffset', 0)
  //   .transition()
  //   .attr('stroke-dasharray', 'none')
  //   .style('opacity',pathOpacity-0.1);
  //
  // paths
  //   .transition()
  //   .delay((34 * dayDuration) + (dayDuration * 2))
  //   .duration(2000)
  //   .style('opacity',pathOpacity);
  //
  //   // date counter for initial load
  //   i = -3;
  //   const timeInterval = setInterval(function(){
  //     if(i >= 0 && i < 31){
  //       d3.select('#timeCount')
  //         .html(months[timeCount.getMonth()]+' '+ (timeCount.getDate() + i));
  //     }
  //     if(i == 30){
  //       d3.select('#timeCount')
  //         .transition()
  //         .style('opacity',0);
  //     }else if(i == 32){
  //       d3.select('#timeCount')
  //         .html('flow');
  //     }else if(i == 33){
  //       clearInterval(timeInterval);
  //       d3.select('#timeCount')
  //         .transition()
  //         .style('opacity',1);
  //       // functionality
  //       svg.selectAll('.arc')
  //         .on('mouseenter', function(d){ dispatch.call('highlight:flow',null,d.data.key); })
  //         .on('mouseleave', function(){ dispatch.call('unhighlight'); });
  //
  //       svg.selectAll('.label')
  //         .on('mouseenter', function(d){ dispatch.call('highlight:flow',null,d.data.key); })
  //         .on('mouseleave', function(){ dispatch.call('unhighlight'); });
  //     }
  //     i++;
  //   }, dayDuration);
  //
  //   // duration view elements
  //   const gradient = svg.append('linearGradient')
  //     .attr('id','gradient')
  //     .attr("x1", "0%")
  //     .attr("y1", "0%")
  //     .attr("x2", "0%")
  //     .attr("y2", "100%");
  //   gradient.append('stop')
  //     .attr('offset','75%')
  //     .attr('stop-color','white')
  //     .attr('stop-opacity', 1);
  //   gradient.append('stop')
  //     .attr('offset','90%')
  //     .attr('stop-color','white')
  //     .attr('stop-opacity', .4);
  //   gradient.append('stop')
  //     .attr('offset','100%')
  //     .attr('stop-color','white')
  //     .attr('stop-opacity',0);
  //
  //   svg.append('g')
  //     .attr('class','axis')
  //     .attr('id','axis-time')
  //     .attr('transform','translate('+ ((-w/2)+100) +',0)')
  //     .call(d3.axisLeft(scaleTime).tickFormat(d3.timeFormat("%b %d")).ticks(d3.timeDay.every(7)).tickSize(-w))
  //     .style('opacity',0);
  //   svg.append('rect')
  //     .attr('id','rect-gradient')
  //     .attr('x',(-w/2)+50)
  //     .attr('y',-h/2)
  //     //.attr('y',(h/2)-200)
  //     .attr('width',w)
  //     .attr('height',150)
  //     //.attr('height',((h/2) - 20)-((h/2)-200))
  //     .style('fill','url(#gradient)')
  //     .style('opacity',0);
  //
  //   svg.append('g')
  //     .attr('class','axis')
  //     .attr('id','axis-duration')
  //     .style('font-size','10px')
  //     .style('opacity',0);
  //   svg.select('#axis-duration')
  //     .append('text')
  //     .text('longest length of stay')
  //     .attr('x',(-w/2)+110)
  //     .attr('y',(-h/2)+100)
  //     .style('text-anchor','start');
  //   svg.select('#axis-duration')
  //     .append('text')
  //     .text('shortest length of stay')
  //     .attr('x',(w/2)+15)
  //     .attr('y',(-h/2)+100)
  //     .style('text-anchor','end');

};



const makePath = (data) => {

  let outX,outY,intakeOffset;

  // for each row in data, make path array
  data.forEach(function(i){

    const incrIntake = iMap.get(i.intake_type) * (i.intake_index+1);
    const thetaIntake = startMap.get(i.intake_type) - incrIntake - (Math.PI/2);
    const inX = (radius-inner) * Math.cos(thetaIntake);
    const inY = (radius-inner) * Math.sin(thetaIntake);

    if(i.outcome_type != ''){
      const incrOutcome = iMap.get(i.outcome_type) * (i.outcome_index+1);
      const thetaOutcome = startMap.get(i.outcome_type) - incrOutcome - (Math.PI/2);
      outX = (radius-inner) * Math.cos(thetaOutcome);
      outY = (radius-inner) * Math.sin(thetaOutcome);
    }
    else{
      outX = 0;
      outY = 0;
    }

    if(i.los_new < 1){
      intakeOffset = i.intake_date.getTime() - (i.los_new*oneDay);
      i.intake_date = new Date(intakeOffset);
    }

    // generate path
    i.path = [{'fx': inX, 'fy': inY, 'dy': i.intake_date, 'dx': i.los_rank, 'data': i},
    {'fx': 0, 'fy': 0, 'dy': i.intake_date, 'dx': i.los_rank},
    {'fx': outX, 'fy': outY, 'dy': i.outcome_date, 'dx': i.los_rank}];

  })

  return data;

};

export const redrawFlow = () => {

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
      var previous = d3.select(this).attr('d');
      var current = curve(d);
      return d3.interpolatePath(previous, current);
    })
    .style('opacity',pathOpacity);

  d3.selectAll('.arc')
    .on('mouseenter', function(d){ dispatch.call('highlight:flow',null,d.data.key); })
    .on('mouseleave', function(){ dispatch.call('unhighlight'); })
    .transition()
    .delay(4000)
    .duration(2000)
    .style('opacity',1);

  d3.selectAll('.label')
    .on('mouseenter', function(d){ dispatch.call('highlight:flow',null,d.data.key); })
    .on('mouseleave', function(){ dispatch.call('unhighlight'); })
    .transition()
    .delay(4000)
    .duration(2000)
    .style('opacity',1);

  // transition out sidebar bars for duration
  d3.selectAll('.bars-duration')
    .transition()
    .duration(1000)
    .attr('y',barH*2)
    .attr('height',0);

  // transition in sidebar bars for intake and outcome
  d3.selectAll('.bars-intake')
    .transition()
    .delay(4000)
    .duration(2000)
    .attr('y',function(d){ return barH-scaleCount(d.value); })
    .attr('height',function(d){ return scaleCount(d.value); });

  d3.selectAll('.bars-outcome')
    .transition()
    .delay(4000)
    .duration(2000)
    .attr('height',function(d){ return scaleCount(d.value); });

  d3.select('#title-bars')
    .transition()
    .delay(5000)
    .text('daily counts');

  d3.select('#bar-context')
    .transition()
    .delay(5000)
    .style('opacity',1);

}

function animateFlow(){

  // hide all duration view elements
  svg.selectAll('.axis')
    .style('opacity',0);
  svg.select('#rect-gradient')
    .style('opacity',0);
  d3.selectAll('.bars-duration')
    .attr('y',barH*2)
    .attr('height',0);

  //bring in flow elements
  d3.selectAll('.bars-intake')
    .attr('y',function(d){ return barH-scaleCount(d.value); })
    .attr('height',function(d){ return scaleCount(d.value); });
  d3.selectAll('.bars-outcome')
    .attr('height',function(d){ return scaleCount(d.value); });

  barSvg.selectAll('.bars-outcome')
    .data(aggOutcome)
    .enter()
    .append('rect')
    .attr('class','bars-outcome')
    .attr('id',function(d){ return 'bar-outcome-'+d.key; })
    .attr('x',function(d){ return scaleTimeBar(d.key)-(barW/2); })
    .attr('y',barH+1)
    .attr('width',(colW*.8)/32)
    .attr('height',function(d){ return barH-scaleCount(d.value); });

  d3.select('#title-bars')
    .text('daily counts');

  d3.select('#bar-context')
    .style('opacity',1);

  d3.selectAll('.paths')
    .attr('d',curve)
    .style('opacity',pathOpacity+0.2);

  d3.selectAll('.arc')
    .style('opacity',0)
    .on('mouseenter', function(d){ dispatch.call('highlight:flow',null,d.data.key); })
    .on('mouseleave', function(){ dispatch.call('unhighlight'); })
    .transition()
    .delay(dayDuration*1.5)
    .style('opacity',1);

  d3.selectAll('.label')
    .style('opacity',0)
    .on('mouseenter', function(d){ dispatch.call('highlight:flow',null,d.data.key); })
    .on('mouseleave', function(){ dispatch.call('unhighlight'); })
    .transition()
    .delay(dayDuration*1.5)
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
        return (d[0].data.intake_delay*dayDuration)+(dayDuration*4);
      })
      .duration(function(d){
        return (d[0].data.los_new-d[0].data.los_offset)*dayDuration;
      })
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0)
    .transition()
    .attr('stroke-dasharray', 'none')
    .style('opacity',pathOpacity-0.1);

  d3.selectAll('.paths')
    .transition()
    .delay((34 * dayDuration) + (dayDuration * 2))
    .duration(2000)
    .style('opacity',pathOpacity);

  //add timeCount
  d3.select('#timeCount')
    .html(null)
    .transition()
    .delay(dayDuration*1.5)
    .style('opacity',1);

    // date counter for initial load
    i = -3;
    const timeInterval = setInterval(function(){
      if(i >= 0 && i < 31){
        d3.select('#timeCount')
          .html(months[timeCount.getMonth()]+' '+ (timeCount.getDate() + i));
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
          .on('mouseenter', function(d){ dispatch.call('highlight:flow',null,d.data.key); })
          .on('mouseleave', function(){ dispatch.call('unhighlight'); });

        svg.selectAll('.label')
          .on('mouseenter', function(d){ dispatch.call('highlight:flow',null,d.data.key); })
          .on('mouseleave', function(){ dispatch.call('unhighlight'); });
      }
      i++;
    }, dayDuration);

  //add fade in view toggle and side bar
  d3.select('#btn-views-flow')
    .classed('btn-clicked',true);
  d3.select('#btn-views-duration')
    .classed('btn-clicked',false);
  generateSummary('flow');

  d3.select('#supplemental')
    .transition()
    .delay(35 * dayDuration)
    .duration(4000)
    .style('opacity',1);

  d3.select('#btn-group-views')
    .transition()
    .delay(35 * dayDuration)
    .duration(4000)
    .style('opacity',1);

}
