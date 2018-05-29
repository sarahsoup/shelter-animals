import * as d3 from 'd3';
import sideFunctions from './sidebar';
import objects from './index';

let intakeSet, outcomeSet, intakeDateSet, outcomeDateSet, losSet;
let svg;

function highlightFlow(type){

  svg = d3.select('#viz-svg-g');
  const animalSet = new Set();
  intakeSet = new Set();
  outcomeSet = new Set();

  // unhighlight bars
  if(d3.select('#btn-views-flow').classed('btn-clicked')){
    objects.interactVarObj.scaleCount.domain([0,objects.interactVarObj.maxCount]);
    d3.selectAll('.bars-intake')
      .transition()
      .attr('height',function(d){ return objects.interactVarObj.scaleCount(d.values.length); })
      .attr('y',function(d){ return sideFunctions.barH-objects.interactVarObj.scaleCount(d.values.length); })
      .style('opacity',1)
      .style('fill','#A9A9A9');
    d3.selectAll('.bars-outcome')
      .transition()
      .attr('height',function(d){ return objects.interactVarObj.scaleCount(d.values.length); })
      .style('opacity',1)
      .style('fill','#A9A9A9');
  }
  if(d3.select('#btn-views-duration').classed('btn-clicked')){
    objects.interactVarObj.scaleHistCount.domain([0,objects.interactVarObj.maxBin]);
    d3.selectAll('.bars-duration')
      .transition()
      .attr('y',function(d){ return (sideFunctions.barH*1.5)-objects.interactVarObj.scaleHistCount(d.length); })
      .attr('height',function(d){ return objects.interactVarObj.scaleHistCount(d.length); })
      .style('opacity',1)
      .style('fill','#A9A9A9');
  }

  if(type=='HMHL'){
    d3.select('#timeCount')
      .html('happy moms healthy litters');
  }else{
    d3.select('#timeCount')
      .html(objects.summaryVarObj.labelMap.get(type));
  }

  sideFunctions.highlightFlow(type,objects.flowSummaryObj);

  // highlight paths
  svg.selectAll('.paths')
    .transition()
    .style('opacity',function(d){
      if(d[0].data.intake_type == type || d[0].data.outcome_type == type){
        intakeSet.add(d[0].data.intake_type);
        outcomeSet.add(d[0].data.outcome_type);
        animalSet.add(d[0].data.type);
        if(d3.select('#btn-views-flow').classed('btn-clicked')){
          return objects.interactVarObj.pathOpacity + 0.2;
        }
        else if(d3.select('#btn-views-duration').classed('btn-clicked')){
          return objects.interactVarObj.pathOpacityDur;
        }
      }
      else{ return 0.02 /*0.05*/; }
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
      if(animalSet.has(d.key)){ return objects.interactVarObj.scaleColor(d.key); }
      else{ return 'white'; }
    });
};

function highlightType(type, aggIntake, aggOutcome, bins){
  intakeSet = new Set();
  outcomeSet = new Set();
  intakeDateSet = new Set();
  outcomeDateSet = new Set();
  losSet = new Set();

  d3.select('#timeCount')
    .html(function(d){
      if(type == 'CAT'){ return 'cats'; }
      else if(type == 'DOG'){ return 'dogs'; }
      else if(type == 'OTHER'){ return 'small & furry animals'; }
      else if(type == 'BIRD'){ return 'birds'; }
      else{ return 'barnyard animals'; }
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
      if(type == d.key){ return objects.interactVarObj.scaleColor(d.key); }
      else{ return 'white'; }
    })

  d3.selectAll('.paths')
    .transition()
    .style('opacity',function(d){
      if(type == d[0].data.type){
        intakeSet.add(d[0].data.intake_type);
        outcomeSet.add(d[0].data.outcome_type);
        intakeDateSet.add(d[0].data.intake_date.getTime());
        if(d[0].outcome_type != 'SHELTER'){
          outcomeDateSet.add(d[0].data.outcome_date.getTime());
        }
        losSet.add(d[0].data.los_new);
        if(d3.select('#btn-views-flow').classed('btn-clicked')){
          return objects.interactVarObj.pathOpacity + 0.2;
        }
        else if(d3.select('#btn-views-duration').classed('btn-clicked')){
          return objects.interactVarObj.pathOpacityDur;
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

    // bar chart
    const typeMax = Math.max(d3.max(aggIntake.filter(function(d){ return d.key.getTime() >= objects.timeCount.getTime(); }).map(function(d){return d.values[type]})), d3.max(aggOutcome.map(function(d){return d.values[type]})))*1.2;
    objects.interactVarObj.scaleCount.domain([0,typeMax]);

    d3.selectAll('.bars-intake')
      .transition()
      .attr('height',function(d){
        if(intakeDateSet.has(d.key.getTime())){
          return objects.interactVarObj.scaleCount(d.values[type]);
        }else{
          return objects.interactVarObj.scaleCount(0);
        }
      })
      .attr('y',function(d){
        if(intakeDateSet.has(d.key.getTime())){
          return sideFunctions.barH-objects.interactVarObj.scaleCount(d.values[type]);
        }else{
          return sideFunctions.barH-objects.interactVarObj.scaleCount(0);
        }
      })
      .style('fill', objects.interactVarObj.scaleColor(type));

    d3.selectAll('.bars-outcome')
    .transition()
    .attr('height',function(d){
      if(outcomeDateSet.has(d.key.getTime())){
        return objects.interactVarObj.scaleCount(d.values[type]);
      }else{
        return objects.interactVarObj.scaleCount(0);
      }
    })
    .style('fill', objects.interactVarObj.scaleColor(type));

    d3.selectAll('.counts-intake')
      .text(function(d){ return d.values[type]; })
      .attr('y',function(d){
        if(intakeDateSet.has(d.key.getTime())){
          return sideFunctions.barH-objects.interactVarObj.scaleCount(d.values[type])-3;
        }else{
          return sideFunctions.barH-objects.interactVarObj.scaleCount(0)-3;
        }
      });
    d3.selectAll('.counts-outcome')
      .text(function(d){ return d.values[type]; })
      .attr('y',function(d){
        if(outcomeDateSet.has(d.key.getTime())){
          return sideFunctions.barH+9+objects.interactVarObj.scaleCount(d.values[type]);
        }else{
          return sideFunctions.barH+9+objects.interactVarObj.scaleCount(0);
        }
      });

  }

  if(d3.select('#btn-views-duration').classed('btn-clicked')){
    const typeMaxDur = (d3.max(bins, function(d) { return d[type] }))*1.2;
    objects.interactVarObj.scaleHistCount.domain([0,typeMaxDur]);

    d3.selectAll('.bars-duration')
      .transition()
      .attr('y',function(d){
        if(typeof d[type] === 'undefined'){
          return (sideFunctions.barH*1.5)-objects.interactVarObj.scaleHistCount(0);
        }else {
          return (sideFunctions.barH*1.5)-objects.interactVarObj.scaleHistCount(d[type]);
        }
      })
      .attr('height',function(d){
        if(typeof d[type] === 'undefined'){
          return objects.interactVarObj.scaleHistCount(0);
        }else {
          return objects.interactVarObj.scaleHistCount(d[type]);
        }
      })
      .style('fill', objects.interactVarObj.scaleColor(type));

    d3.selectAll('.counts-duration')
      .text(function(d){ return d[type]; })
      .attr('y',function(d){
        if(typeof d[type] === 'undefined'){
          return (sideFunctions.barH*1.5)-objects.interactVarObj.scaleHistCount(0)-3;
        }else {
          return (sideFunctions.barH*1.5)-objects.interactVarObj.scaleHistCount(d[type])-3;
        }
      });
  }
};

function highlightId(id,type,name){
  intakeSet = new Set();
  outcomeSet = new Set();

  // unhighlight bars
  if(d3.select('#btn-views-flow').classed('btn-clicked')){
    objects.interactVarObj.scaleCount.domain([0,objects.interactVarObj.maxCount]);
    d3.selectAll('.bars-intake')
      .transition()
      .attr('height',function(d){ return objects.interactVarObj.scaleCount(d.values.length); })
      .attr('y',function(d){ return sideFunctions.barH-objects.interactVarObj.scaleCount(d.values.length); })
      .style('opacity',1)
      .style('fill','#A9A9A9');
    d3.selectAll('.bars-outcome')
      .transition()
      .attr('height',function(d){ return objects.interactVarObj.scaleCount(d.values.length); })
      .style('opacity',1)
      .style('fill','#A9A9A9');
  }
  if(d3.select('#btn-views-duration').classed('btn-clicked')){
    objects.interactVarObj.scaleHistCount.domain([0,objects.interactVarObj.maxBin]);
    d3.selectAll('.bars-duration')
      .transition()
      .attr('y',function(d){ return (sideFunctions.barH*1.5)-objects.interactVarObj.scaleHistCount(d.length); })
      .attr('height',function(d){ return objects.interactVarObj.scaleHistCount(d.length); })
      .style('opacity',1)
      .style('fill','#A9A9A9');
  }

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
      if(type == d.key){ return objects.interactVarObj.scaleColor(d.key); }
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
          return objects.interactVarObj.pathOpacity + 0.2;
        }
        else if(d3.select('#btn-views-duration').classed('btn-clicked')){
          return objects.interactVarObj.pathOpacityDur;
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
};

function highlightDate(date){
  d3.selectAll('.bars-intake')
    .style('opacity',function(d){
      if(d.key.getTime() == date.getTime()){
        return 1;
      }else{
        return .5;
      }
    });

  d3.select('#counts-intake-' + date.getMonth() + '-' + date.getDate())
    .style('opacity',1);

  d3.selectAll('.bars-outcome')
    .style('opacity',function(d){
      if(d.key.getTime() == date.getTime()){
        return 1;
      }else{
        return .5;
      }
    });

  d3.select('#counts-outcome-' + date.getMonth() + '-' + date.getDate())
    .style('opacity',1);
};

function highlightBin(x1){
  d3.selectAll('.bars-duration')
    .style('opacity',function(d){
      if(d.x1 == x1){
        return 1;
      }else{
        return .5;
      }
    });

  d3.select('#counts-duration-' + x1)
    .style('opacity',1);
}

function unhighlightBars(){
  d3.selectAll('.bars-intake')
    .style('opacity',1);
  d3.selectAll('.bars-outcome')
    .style('opacity',1);
  d3.selectAll('.bars-duration')
    .style('opacity',1);
  d3.selectAll('.counts-intake').style('opacity',0);
  d3.selectAll('.counts-outcome').style('opacity',0);
  d3.selectAll('.counts-duration').style('opacity',0);
}

function unhighlight(){
  svg = d3.select('#viz-svg-g');
  if(d3.select('#btn-views-flow').classed('btn-clicked')){
    d3.select('#timeCount').html('flow');
    sideFunctions.generateSummary('flow',objects.summaryVarObj);
    svg.selectAll('.arc').transition().style('opacity',1);
    svg.selectAll('.label').transition().style('opacity',1);
    svg.selectAll('.paths').transition().style('opacity',objects.interactVarObj.pathOpacity).style('stroke-width',1);

    objects.interactVarObj.scaleCount.domain([0,objects.interactVarObj.maxCount]);
    d3.selectAll('.bars-intake')
      .transition()
      .attr('height',function(d){ return objects.interactVarObj.scaleCount(d.values.length); })
      .attr('y',function(d){ return sideFunctions.barH-objects.interactVarObj.scaleCount(d.values.length); })
      .style('opacity',1)
      .style('fill','#A9A9A9');
    d3.selectAll('.bars-outcome')
      .transition()
      .attr('height',function(d){ return objects.interactVarObj.scaleCount(d.values.length); })
      .style('opacity',1)
      .style('fill','#A9A9A9');
  }
  if(d3.select('#btn-views-duration').classed('btn-clicked')){
    d3.select('#timeCount').html('duration');
    sideFunctions.generateSummary('duration',objects.summaryVarObj);
    svg.selectAll('.paths').transition().style('opacity',objects.interactVarObj.pathOpacityDur).style('stroke-width',1);

    objects.interactVarObj.scaleHistCount.domain([0,objects.interactVarObj.maxBin]);
    d3.selectAll('.bars-duration')
      .transition()
      .attr('y',function(d){ return (sideFunctions.barH*1.5)-objects.interactVarObj.scaleHistCount(d.length); })
      .attr('height',function(d){ return objects.interactVarObj.scaleHistCount(d.length); })
      .style('opacity',1)
      .style('fill','#A9A9A9');
  }
  d3.selectAll('.animal-btn-group').transition().style('opacity',1);
  d3.selectAll('.icon-labels').transition().style('fill','white');
  d3.selectAll('.btn-stories').classed('btn-clicked',false);
  d3.selectAll('.counts-intake')
    .text(function(d){ return d.values.length; })
    .attr('x',function(d){ return objects.interactVarObj.scaleTimeBar(d.key); })
    .attr('y',function(d){ return sideFunctions.barH-objects.interactVarObj.scaleCount(d.values.length)-3; })
    .style('opacity',0);
  d3.selectAll('.counts-outcome')
    .text(function(d){ return d.values.length; })
    .attr('x',function(d){ return objects.interactVarObj.scaleTimeBar(d.key); })
    .attr('y',function(d){ return sideFunctions.barH+9+objects.interactVarObj.scaleCount(d.values.length); })
    .style('opacity',0);
  d3.selectAll('.counts-duration')
    .text(function(d){ return d.length; })
    .attr('x',function(d){ return objects.interactVarObj.scaleLosHist(d.x0); })
    .attr('y',function(d){ return (sideFunctions.barH*1.5)-objects.interactVarObj.scaleHistCount(d.length)-3; })
    .style('opacity',0);
};

function unhighlightOnTransition(){
  // if(d3.select('#btn-views-flow').classed('btn-clicked')){
  // }else if(d3.select('#btn-views-duration').classed('btn-clicked')){
  // }
  d3.selectAll('.animal-btn-group').transition().style('opacity',1);
  d3.selectAll('.icon-labels').transition().style('fill','white');
  d3.selectAll('.btn-stories').classed('btn-clicked',false);

  objects.interactVarObj.scaleCount.domain([0,objects.interactVarObj.maxCount]);
  d3.selectAll('.bars-intake')
    .transition()
    .style('opacity',1)
    .style('fill','#A9A9A9');
  d3.selectAll('.bars-outcome')
    .transition()
    .style('opacity',1)
    .style('fill','#A9A9A9');

  objects.interactVarObj.scaleHistCount.domain([0,objects.interactVarObj.maxBin]);
  d3.selectAll('.bars-duration')
    .transition()
    .style('opacity',1)
    .style('fill','#A9A9A9');
  d3.selectAll('.counts-intake').style('opacity',0);
  d3.selectAll('.counts-outcome').style('opacity',0);
  d3.selectAll('.counts-duration').style('opacity',0);
}


export default{
  highlightFlow,
  highlightType,
  highlightId,
  highlightDate,
  highlightBin,
  unhighlightBars,
  unhighlight,
  unhighlightOnTransition
}
