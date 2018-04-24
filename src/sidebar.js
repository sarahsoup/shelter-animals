import * as d3 from 'd3';
import './style.css';

import flowFunctions from './flow';
import durFunctions from './duration';
import interactions from './interact';

const barH = 30;
const barW = 4;
let colW;

d3.select('#visualization')
  .append('g')
  .attr('id','btn-group-views');

function createViewBtns(sumObj,scalesObj,viewsObj){

  colW = d3.select('#bar-div').node().clientWidth;

  d3.select('#btn-group-views')
    .append('button')
    .attr('class','btn-views')
    .attr('id','btn-views-flow')
    .html('flow')
    .classed('btn-clicked',true)
    .on('click',function(d){
      d3.selectAll('.btn-views').classed('btn-clicked',false);
      d3.select(this).classed('btn-clicked',true);
      // dispatch.call('unhighlight'); //causes arcs and labels to immediately reappear
      flowFunctions.redrawFlow(scalesObj,viewsObj,barH);
      generateSummary('flow',sumObj);
    });

  d3.select('#btn-group-views')
    .append('button')
    .attr('class','btn-views')
    .attr('id','btn-views-duration')
    .html('duration')
    .on('click',function(d){
      d3.selectAll('.btn-views').classed('btn-clicked',false);
      d3.select(this).classed('btn-clicked',true);
      //dispatch.call('unhighlight');
      interactions.unhighlight();
      durFunctions.drawDuration(scalesObj,barH,viewsObj.pathOpacityDur);
      generateSummary('duration',sumObj);
    });
}

function addDataInfo(sideW){
  d3.select('#data-info')
    .attr('width',sideW)
    .attr('height',50)
    .html('data graciously provided by Animal Rescue League, representing the animal population at their three shelters collectively for January 2018');
}

function makeBarChart(aggIntake,aggOutcome,bins,obj,months,timeCount,maxDate){

  d3.select('#bar-div')
    .style('margin','20px 0px 20px 0px')
    .style('font-size','10px');

  d3.select('#bar-div')
    .append('text')
    .attr('id','title-bars')
    .text('daily counts')
    .style('font-size','10px')
    .style('display','block')
    .style('margin','20px 0px 10px 0px')
    .style('padding-left','10px');

  d3.select('#bar-div')
    .append('svg')
    .attr('id','bar-svg')
    .attr('width',function(d){
      colW = d3.select('#bar-div').node().clientWidth;
      return colW;
    })
    .attr('height',(barH*2.5));

  const barSvg = d3.select('#bar-svg')
    .append('g')
    .attr('id','bar-group')
    .attr('transform','translate(0,'+(barH/4)+')');

  obj.scaleTimeBar
    .range([(colW*.1),(colW*.9)]);
  obj.scaleLosHist
    .range([(colW*.1),(colW*.75)]);
  obj.scaleCount
    .range([0,barH]);
  obj.scaleHistCount
    .range([0,barH*2]);

  const context = barSvg.append('g')
    .attr('id','bar-context');

  context.append('text')
    .attr('class','context-text')
    .attr('id','context-minX')
    .text(months[timeCount.getMonth()]/*+timeCount.getDate()*/)
    .attr('x',colW*.1)
    .attr('y',barH+4)
    .style('text-anchor','end');

  context.append('text')
    .attr('class','context-text')
    .attr('id','context-maxX')
    .text(months[maxDate.getMonth()]/*+maxDate.getDate()*/)
    .attr('x',colW*.9)
    .attr('y',barH+4);

  context.append('text')
    .attr('class','context-text')
    .attr('id','context-intake')
    .text('intake')
    .attr('x',colW/2)
    .attr('y',0)
    .style('font-weight','bold')
    .style('text-anchor','middle')
    .style('opacity',0.2);

  context.append('text')
    .attr('class','context-text')
    .attr('id','context-outcome')
    .text('outcomes')
    .attr('x',colW/2)
    .attr('y',barH*2.25)
    .style('font-weight','bold')
    .style('text-anchor','middle')
    .style('opacity',0.2);

  barSvg.selectAll('.bars-intake')
    .data(aggIntake.filter(function(d){ return d.key.getTime() >= timeCount.getTime(); }))
    .enter()
    .append('rect')
    .attr('class','bars-intake')
    .attr('id',function(d){ return 'bar-intake-'+d.key; })
    .attr('x',function(d){ return obj.scaleTimeBar(d.key)-(barW/2); })
    .attr('y',function(d){ return barH-obj.scaleCount(d.value); })
    .attr('width',(colW*.8)/32)
    .attr('height',function(d){ return obj.scaleCount(d.value); })
    .style('cursor','pointer')
    .on('mouseenter',function(d){
      // dispatch.call('highlight:date', null, d.key);
      interactions.highlightDate(d.key);
    })
    .on('mouseleave',function(d){
      // dispatch.call('unhighlight');
      interactions.unhighlight();
    });

  barSvg.selectAll('.bars-outcome')
    .data(aggOutcome)
    .enter()
    .append('rect')
    .attr('class','bars-outcome')
    .attr('id',function(d){ return 'bar-outcome-'+d.key; })
    .attr('x',function(d){ return obj.scaleTimeBar(d.key)-(barW/2); })
    .attr('y',barH+1)
    .attr('width',(colW*.8)/32)
    .attr('height',function(d){ return barH-obj.scaleCount(d.value); })
    .style('cursor','pointer')
    .on('mouseenter',function(d){
      // dispatch.call('highlight:date', null, d.key);
      interactions.highlightDate(d.key);
    })
    .on('mouseleave',function(d){
      // dispatch.call('unhighlight');
      interactions.unhighlight();
    });

  barSvg.selectAll('.bars-duration')
    .data(bins)
    .enter()
    .append('rect')
    .attr('class','bars-duration')
    .attr('x',function(d){ return obj.scaleLosHist(d.x0)/*-(barW/2)*/; })
    .attr('y',barH*2)
    .attr('width',(colW*.6)/bins.length)
    .attr('height',0);

  // tooltip = barSvg.append('g')
  //   .attr('id','bar-counts');

  // barSvg.append('g')
  //   .attr('class','axis-bars')
  //   .attr('id','axis-count')
  //   .attr('transform','translate('+ (colW*.1) +',0)')
  //   .call(d3.axisLeft(scaleHistCount)/*.tickFormat(d3.timeFormat("%b %d")).ticks(d3.timeDay.every(7)).tickSize(-w)*/)
  //   .style('opacity',0);

  // tooltip.selectAll('.counts-intake')
  //   .data(aggIntake.filter(function(d){ return d.key.getTime() >= timeCount.getTime(); }))
  //   .enter()
  //   .append('text')
  //   .attr('class','counts-intake')
  //   .attr('id',function(d){ return 'counts-intake-' + d.key.getMonth() + '-' + d.key.getDate(); })
  //   .text(function(d){ return d.value; })
  //   .attr('x',function(d){ return scaleTimeBar(d.key); })
  //   .attr('y',function(d){ return barH-scaleCount(d.value)-3; })
  //   .style('font-size','8px')
  //   .style('text-anchor','middle')
  //   .style('opacity',0);
  //
  // tooltip.selectAll('.counts-outcome')
  //   .data(aggOutcome)
  //   .enter()
  //   .append('text')
  //   .attr('class','counts-outcome')
  //   .attr('id',function(d){ return 'counts-outcome-' + d.key.getMonth() + '-' + d.key.getDate(); })
  //   .text(function(d){ return d.value; })
  //   .attr('x',function(d){ return scaleTimeBar(d.key); })
  //   .attr('y',function(d){ return barH+1+scaleCount(d.value)+8; })
  //   .style('font-size','8px')
  //   .style('text-anchor','middle')
  //   .style('opacity',0);

};

function createAnimalBtns(type,sideW,scaleColor){
  let intakeSet = new Set();
  let outcomeSet = new Set();

  d3.select('#supplemental')
    .append('text')
    .text('animal types')
    .style('font-size','10px')
    .style('display','block')
    .style('margin','20px 0px 10px 0px')
    .style('padding-left','10px');

  const btnSvg = d3.select('#supplemental')
    .append('svg')
    .attr('width',sideW)
    .attr('height',70)
    .selectAll('.animal-btn-group')
    .data(type)
    .enter()
    .append('g')
    .attr('class','animal-btn-group');

  d3.selectAll('.animal-btn-group')
    .attr('transform',function(d,i){
      return 'translate(' + i*50 + ',0)';
    });

  d3.selectAll('.animal-btn-group')
    .append('circle')
    .attr('cx',20)
    .attr('cy',20)
    .attr('r',20)
    .style('fill',function(d){ return scaleColor(d.key); });

  d3.selectAll('.animal-btn-group')
    .append('svg:image')
    .attr('xlink:href',function(d){
      if(d.key == 'CAT'){ return './SVG/white-cat.svg'; }
      else if(d.key == 'DOG'){ return './SVG/white-dog.svg'; }
      else if(d.key == 'OTHER'){ return './SVG/white-rabbit.svg'; }
      else if(d.key == 'BIRD'){ return './SVG/white-bird.svg'; }
      else{ return './SVG/white-pig.svg'; }
    })
    .attr('class','icons')
    .attr('x',0)
    .attr('y',0)
    .attr('width',40)
    .attr('height',40);

  d3.selectAll('.animal-btn-group')
    .append('text')
    .attr('class','icon-labels')
    .attr('y',60)
    .attr('x',20)
    .style('fill','white')
    .style('text-anchor','middle')
    .text(function(d){
      if(d.key == 'CAT'){ return 'cats'; }
      else if(d.key == 'DOG'){ return 'dogs'; }
      else if(d.key == 'OTHER'){ return 'furries'; }
      else if(d.key == 'BIRD'){ return 'birds'; }
      else{ return 'livestock'; }
    });

  d3.selectAll('.animal-btn-group')
    .style('cursor','pointer')
    .on('click',function(d){
      if(d3.select(this).classed('btn-animal-clicked')){
        d3.select(this).classed('btn-animal-clicked',false);
        // dispatch.call('unhighlight');
        interactions.unhighlight();
      }else{
        d3.select(this).classed('btn-animal-clicked',true);
        // dispatch.call('highlight:type', null, d.key);
        interactions.highlightType(d.key);
        highlightType(d.key);
      }
    });

  createStories();
}

function createStories(){
  d3.select('#supplemental')
    .append('text')
    .text('animal stories')
    .style('font-size','10px')
    .style('display','block')
    .style('margin','20px 0px 10px 0px')
    .style('padding-left','10px');

  const stories = d3.select('#supplemental')
    .append('g')
    .attr('id','btn-stories');

  stories.append('button')
    .attr('class','btn-stories')
    .attr('id','bella')
    .html('bella');
  stories.append('button')
    .attr('class','btn-stories')
    .attr('id','hoppy')
    .html('hoppy');
  stories.append('button')
    .attr('class','btn-stories')
    .attr('id','kringle')
    .html('kringle');
  stories.append('button')
    .attr('class','btn-stories')
    .attr('id','rowan')
    .html('rowan');
  stories.append('button')
    .attr('class','btn-stories')
    .attr('id','mischa')
    .html('mischa');
  stories.append('button')
    .attr('class','btn-stories')
    .attr('id','bufu')
    .html('bufu');
  stories.append('button')
    .attr('class','btn-stories')
    .attr('id','thalia')
    .html('thalia');

  d3.selectAll('.btn-stories')
    .on('click',function(d){
      if(d3.select(this).classed('btn-clicked')){
        d3.select(this).classed('btn-clicked',false);
        // dispatch.call('unhighlight');
        interactions.unhighlight();
      }else{
        d3.selectAll('.btn-stories').classed('btn-clicked',false);
        d3.select(this).classed('btn-clicked',true);
        highlightStory(d3.select(this).attr('id'));
      }
    });

}

function summaryInformation(sideW,obj){

  summary = d3.select('#summary')
    .attr('width',sideW)
    .style('padding','10px 10px')
    // .style('margin','20px 0px')
    .style('font-size','10px');

  summary.append('g')
    .attr('id','summary-img')
    .append('img')
    .attr('class','centered')
    .attr('id','animal-img')
    .attr('height',100);

  // summary.append('p')
  //   .attr('id','summary-title')
  //   // .style('margin-top','10px')
  //   .style('font-size','12px')
  //   .style('font-weight','bolder');

  summary.append('p')
    .attr('id','summary-text')
    .style('font-size','10px')
    .style('padding-top','10px')
    .style('margin-bottom',0);

  generateSummary('flow',obj);

}

function generateSummary(view,obj){
  d3.select('#animal-img')
    // .attr('height',0)
    .attr('src',null);

  if(view == 'flow'){
    // d3.select('#summary-title')
    //   .style('text-align','left')
    //   .html('summary of flow');
    d3.select('#summary-text')
      .style('margin-left','0%')
      .style('margin-right','5%')
      .html(obj.totalCount + ' total animals<br/>'+
        obj.intakePrior + ' in shelter at beginning of month<br/>'+
        obj.intakeDuring + ' entered shelter during month<br/>'+
        obj.outcomeDuring + ' left shelter during month<br/>'+
        obj.typeMost + ' were the most common animal<br/>'+
        'most animals were ' + obj.labelMap.get(obj.intakeMost) + '<br/>'+
        'and most were ' + obj.labelMap.get(obj.outcomeMost));
  }else if(view == 'duration'){
    // d3.select('#summary-title')
    //   .style('text-align','left')
    //   .html('summary of duration');
    d3.select('#summary-text')
      .style('margin-left','0%')
      .style('margin-right','5%')
      .html(obj.totalCount + ' total animals<br/>'+
        obj.intakePrior + ' in shelter at beginning of month<br/>'+
        obj.intakeDuring + ' entered shelter during month<br/>'+
        obj.outcomeDuring + ' left shelter during month<br/>'+
        obj.typeMost + ' were the most common animal<br/>'+
        'the shortest length of stay was ' + obj.losExtent[0] + ' days<br/>'+
        'the longest length of stay was ' + obj.losExtent[1] + ' days');
  }else{
    d3.select('#summary-text').html(null);
  }
}

function highlightType(type){
  let typeName;
  if(type == 'CAT'){ typeName = 'cats'; }
  else if(type == 'DOG'){ typeName = 'dogs'; }
  else if(type == 'OTHER'){ typeName = 'furries'; }
  else if(type == 'BIRD'){ typeName = 'birds'; }
  else{ typeName = 'livestock'; }

  d3.select('#animal-img')
    // .attr('height',0)
    .attr('src',null);
  // d3.select('#summary-title')
  //   .style('text-align','left')
  //   .html(typeName);
  d3.select('#summary-text')
    .style('margin-left','0%')
    .style('margin-right','5%')
    .html('this will have information for ' + typeName);

}

function highlightStory(name){
  let id, type;
  if(name == 'bella'){
    id = 'A215688';
    type = 'DOG';
  }else if(name == 'hoppy'){
    id = 'A259681';
    type = 'BIRD';
  }else if(name == 'kringle'){
    id = 'A259513';
    type = 'CAT';
  }else if(name == 'bufu'){
    id = 'A259546';
    type = 'LIVESTOCK';
  }else if(name == 'mischa'){
    id = 'A259912';
    type = 'DOG';
  }else if(name == 'rowan'){
    id = 'A260293';
    type = 'OTHER';
  }else if(name == 'thalia'){
    id = 'A260348';
    type = 'CAT';
  }

  // dispatch.call('highlight:id', null, id, type, name);
  interactions.highlightId(id,type,name);

  d3.select('#animal-img')
    .attr('src',function(){
      if(name == 'bella'){
        return './images/Bella-btn.jpg'
      }
      else if(name == 'hoppy'){
        return './images/Hoppy-btn.jpg'
      }
      else if(name == 'kringle'){
        return './images/Kringle-btn.jpg'
      }
      else if(name == 'bufu'){
        return './images/Bufu-btn.jpg'
      }
      else if(name == 'mischa'){
        return './images/Mischa-btn.jpg'
      }
      else if(name == 'rowan'){
        return './images/Rowan-btn.jpg'
      }
      else if(name == 'thalia'){
        return './images/Thalia-btn.jpg'
      }
    })
    .attr('x',0)
    .attr('y',0)
    .attr('height',100);
  // d3.select('#summary-title')
  //   .style('text-align','center')
  //   .html(name);
  d3.select('#summary-text')
    .style('margin-left','15%')
    .style('margin-right','15%')
    .html(function(){
      if(name == 'bella'){
        return 'This is her third time back at the shelter. Bella was surrendered by her owner over multiple behavior concerns, but they are predictable and manageable.'
      }
      else if(name == 'hoppy'){
         return 'Hoppy is a 40-year-old parrot with an injured left foot, most likely from being caught in the wild. He was adopted on January 13th!'
      }
      else if(name == 'kringle'){
        return 'Kringle is a 5-year-old siamese cat whose owner passed away in November, so he was taken to the shelter. He was adopted into a new home on January 6th.'
      }
      else if(name == 'rowan'){
        return 'Rowan is a 9-month-old short-haired rabbit that was transferred from another organization. He was taken in towards the end of the month.'
      }
      else if(name == 'mischa'){
        return 'Mischa is a 5-year-old Akita mix who has been in a shelter since the summer of 2015. He was treated for heartworm before being transferred to the shelter in December. He was adopted January 12!'
      }
      else if(name == 'bufu'){
        return 'Bufu is a pot-bellied pig less than 2 years old. She was surrendered by her ownder in November.'
      }
      else if(name == 'thalia'){
        return 'Thalia is a 6-month-old cat surrended through the Healthy Moms Happy Litters program, where an owner gets their dog or cat spayed/neutered and surrenders their litter for adoption.'
      }
    })
}


export default{
  createViewBtns,
  addDataInfo,
  makeBarChart,
  createAnimalBtns,
  summaryInformation,
  generateSummary,
  highlightType,
  barH,
  barW,
  colW
}
