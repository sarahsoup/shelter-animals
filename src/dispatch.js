import * as d3 from 'd3';
import sideFunctions from './sidebar';

let intakeSet, outcomeSet;
let svg;
const dispatch = d3.dispatch(
  'highlight:flow',
  'highlight:type',
  'highlight:id',
  'highlight:date',
  'unhighlight'
);

dispatch.on('highlight:flow',function(type){
  svg = d3.select('#viz-svg-g');
  const animalSet = new Set();
  intakeSet = new Set();
  outcomeSet = new Set();

  sideFunctions.generateSummary('flow');

  // highlight paths
  svg.selectAll('.paths')
    .transition()
    .style('opacity',function(d){
      if(d[0].data.intake_type == type || d[0].data.outcome_type == type){
        intakeSet.add(d[0].data.intake_type);
        outcomeSet.add(d[0].data.outcome_type);
        animalSet.add(d[0].data.type);
        if(d3.select('#btn-views-flow').classed('btn-clicked')){
          return pathOpacity + 0.2;
        }
        else if(d3.select('#btn-views-duration').classed('btn-clicked')){
          return pathOpacityDur;
        }
      }
      else{ return 0.02; }
    });

  // highlight arc and label
  svg.selectAll('.arc')
    .transition()
    .style('opacity',function(d){
      if(d.data.key == type){ return 1; }
      else if(intakeSet.has(d.data.key) && outcomeSet.has(type)){ return 1; }
      else if(outcomeSet.has(d.data.key) && intakeSet.has(type)){ return 1; }
      else{ return 0.2; }
    });
  svg.selectAll('.label')
    .transition()
    .style('opacity',function(d){
      if(d.data.key == type){ return 1; }
      else if(intakeSet.has(d.data.key) && outcomeSet.has(type)){ return 1; }
      else if(outcomeSet.has(d.data.key) && intakeSet.has(type)){ return 1; }
      else{ return 0.2; }
    });

  // highlight buttons
  d3.selectAll('.animal-btn-group')
    .transition()
    .style('opacity',function(d){
      if(animalSet.has(d.key)){ return 1; }
      else{ return 0.3; }
    });

  d3.selectAll('.icon-labels')
    .transition()
    .style('fill',function(d){
      if(animalSet.has(d.key)){ return scaleColor(d.key); }
      else{ return 'white'; }
    });
});

dispatch.on('highlight:type',function(type){
  intakeSet = new Set();
  outcomeSet = new Set();

  d3.select('#timeCount')
    .html(function(d){
      if(type == 'CAT'){ return 'cats'; }
      else if(type == 'DOG'){ return 'dogs'; }
      else if(type == 'OTHER'){ return 'furries'; }
      else if(type == 'BIRD'){ return 'birds'; }
      else{ return 'livestock'; }
    });

  d3.selectAll('.btn-stories').classed('btn-clicked',false);

  d3.selectAll('.animal-btn-group')
    .transition()
    .style('opacity',function(d){
      if(type == d.key){ return 1; }
      else{ return 0.2; }
    });

  d3.selectAll('.icon-labels')
    .transition()
    .style('fill',function(d){
      if(type == d.key){ return scaleColor(d.key); }
      else{ return 'white'; }
    })

  d3.selectAll('.paths')
    .transition()
    .style('opacity',function(d){
      if(type == d[0].data.type){
        intakeSet.add(d[0].data.intake_type);
        outcomeSet.add(d[0].data.outcome_type);
        if(d3.select('#btn-views-flow').classed('btn-clicked')){
          return pathOpacity + 0.2;
        }
        else if(d3.select('#btn-views-duration').classed('btn-clicked')){
          return pathOpacityDur;
        }
      }
      else{ return 0.02; }
    });

  if(d3.select('#btn-views-flow').classed('btn-clicked')){
    d3.selectAll('.arc')
      .transition()
      .style('opacity',function(d){
        if(intakeSet.has(d.data.key) || outcomeSet.has(d.data.key)){ return 1; }
        else{ return 0.1; }
      });
    d3.selectAll('.label')
      .transition()
      .style('opacity',function(d){
        if(intakeSet.has(d.data.key) || outcomeSet.has(d.data.key)){ return 1; }
        else{ return 0.1; }
      });
  }
});

dispatch.on('highlight:id',function(id,type,name){
  intakeSet = new Set();
  outcomeSet = new Set();

  d3.select('#timeCount')
    .html(name);

  d3.selectAll('.animal-btn-group')
    .transition()
    .style('opacity',function(d){
      if(type == d.key){ return 1; }
      else{ return 0.2; }
    });

  d3.selectAll('.icon-labels')
    .transition()
    .style('fill',function(d){
      if(type == d.key){ return scaleColor(d.key); }
      else{ return 'white'; }
    })

  d3.selectAll('.paths')
    .transition()
    .style('stroke-width',function(d){
      if(id == d[0].data.id){
        return 2;
      }
      else{ return 1; }
    })
    .style('opacity',function(d){
      if(id == d[0].data.id){
        intakeSet.add(d[0].data.intake_type);
        outcomeSet.add(d[0].data.outcome_type);
        if(d3.select('#btn-views-flow').classed('btn-clicked')){
          return pathOpacity + 0.2;
        }
        else if(d3.select('#btn-views-duration').classed('btn-clicked')){
          return pathOpacityDur;
        }
      }
      else{ return 0.02; }
    });

  if(d3.select('#btn-views-flow').classed('btn-clicked')){
    d3.selectAll('.arc')
      .transition()
      .style('opacity',function(d){
        if(intakeSet.has(d.data.key) || outcomeSet.has(d.data.key)){ return 1; }
        else{ return 0.1; }
      });
    d3.selectAll('.label')
      .transition()
      .style('opacity',function(d){
        if(intakeSet.has(d.data.key) || outcomeSet.has(d.data.key)){ return 1; }
        else{ return 0.1; }
      });
  }
});

dispatch.on('highlight:date',function(date){
  d3.selectAll('.bars-intake')
    .classed('bars-highlighted',function(d){
      if(d.key.getTime() == date.getTime()){
        return true;
      }else{
        return false;
      }
    });
  // d3.select('#counts-intake-' + date.getMonth() + '-' + date.getDate())
  //   .style('opacity',1);

  d3.selectAll('.bars-outcome')
    .classed('bars-highlighted',function(d){
      if(d.key.getTime() == date.getTime()){
        return true;
      }else{
        return false;
      }
    });
  // d3.select('#counts-outcome-' + date.getMonth() + '-' + date.getDate())
  //   .style('opacity',1);
});

dispatch.on('unhighlight',function(){
  svg = d3.select('#viz-svg-g');
  if(d3.select('#btn-views-flow').classed('btn-clicked')){
    d3.select('#timeCount').html('flow');
    sideFunctions.generateSummary('flow');
    svg.selectAll('.arc').transition().style('opacity',1);
    svg.selectAll('.label').transition().style('opacity',1);
    svg.selectAll('.paths').transition().style('opacity',pathOpacity).style('stroke-width',1);
  }
  if(d3.select('#btn-views-duration').classed('btn-clicked')){
    d3.select('#timeCount').html('duration');
    sideFunctions.generateSummary('duration');
    svg.selectAll('.paths').transition().style('opacity',pathOpacityDur).style('stroke-width',1);
  }
  d3.selectAll('.animal-btn-group').transition().style('opacity',1);
  d3.selectAll('.icon-labels').transition().style('fill','white');
  d3.selectAll('.btn-stories').classed('btn-clicked',false);
  d3.selectAll('.bars-highlighted').classed('bars-highlighted',false);
  // d3.selectAll('.counts-intake').style('opacity',0);
  // d3.selectAll('.counts-outcome').style('opacity',0);
});
