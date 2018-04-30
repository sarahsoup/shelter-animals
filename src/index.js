import * as d3 from 'd3';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

import idleFunctions from './idlepage';
import flowFunctions from './flow';
import sideFunctions from './sidebar';

let w, h, radius, svg, sideW;
const m = { t: 10, b: 10, l: 10, r: 10};
const labelStart = 30;
const outer = 40;
const inner = 46;
const pi = Math.PI;
const pathOpacity = 0.2;
const pathOpacityDur = 0.8;
let timeCount = new Date('1/1/2018');
const oneDay = 1000 * 60 * 60 * 24;
const dayDuration = 250;
const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
let type;
let exploreCount = 0;
let dayDelay, dayOffset, count, prevType, i;
let maxCount;
let summaryVarObj = {};
let flowSummaryObj = {};

// type to desc mapping
const labelMap = new Map();

// summary numbers
let totalCount = 0;
let intakePrior = 0;
let intakeDuring = 0;
let outcomeDuring = 0;
let typeMost;
let intakeMost;
let outcomeMost;
let losExtent;

d3.select('#timeCount')
  .style('opacity',0)
  .html(months[timeCount.getMonth()]);

//https://material.io/guidelines/style/color.html#color-color-palette
const scaleColor = d3.scaleOrdinal()
  .domain(['DOG','LIVESTOCK','BIRD','OTHER','CAT'])
  .range(['#4DD0E1','#9CCC65','#FFB74D','#F06292','#BA68C8']);
  //         cyan      green    orange     pink     purple

const scaleLos = d3.scaleLinear();
const scaleLosHist = d3.scaleLinear();
const scaleHistCount = d3.scaleSqrt();
const scaleTime = d3.scaleTime();
const scaleTimeBar = d3.scaleTime();
const scaleCount = d3.scaleLinear();
const scaleIntake = d3.scaleTime();
const interactVarObj = { pathOpacity, pathOpacityDur, scaleColor, scaleCount, scaleHistCount };

idleFunctions.createIdlePage();

d3.select('#btn-idle')
  .on('click',function(){
    idleFunctions.inactivityTime();
    d3.select('#idle')
      .classed('hidden',true);
    d3.select('#content')
      .classed('hidden',false);
    if(exploreCount == 0){
      runData();
    }else{
      const reanimateObj = {
        dayDuration,
        pathOpacity,
        months,
        timeCount,
        scaleCount,
        scaleTimeBar
      }
      flowFunctions.animateFlow(reanimateObj, sideFunctions.barH, sideFunctions.barW, sideFunctions.colW);
      sideFunctions.generateSummary('flow',summaryVarObj);
    }
    exploreCount++;
  });

function parse(d){
  // format dates for calculations
  d.intake_date = new Date(d.intake_date);
  d.outcome_date = new Date(d.outcome_date);

  // intake and outcome type label description
  // decipher transfers from intake and outcomes
  if(d.intake_type == 'OWNER SUR'){ d.intake_type_desc = 'owner surrendered'; }
  else if(d.intake_type == 'TRNSFR-EXT'){ d.intake_type = 'IN-TRNSFR-EXT'; d.intake_type_desc = 'transferred in'; }
  else if(d.intake_type == 'STRAY'){ d.intake_type_desc = 'stray'; }
  else if(d.intake_type == 'CONFISCATE'){ d.intake_type_desc = 'confiscated'; }
  else if(d.intake_type == 'RETURN'){ d.intake_type_desc = 'returned'; }
  else if(d.intake_type == 'WILDLIFE'){ d.intake_type_desc = 'wildlife'; }
  else if(d.intake_type == 'BRN N CARE'){ d.intake_type_desc = 'born in care'; }
  else if(d.intake_type == 'HMHL'){ d.intake_type_desc = 'hmhl'; }

  if(d.outcome_type == 'ADOPTION'){ d.outcome_type_desc = 'adopted'; }
  else if(d.outcome_type == 'EUTH'){ d.outcome_type_desc = 'euthanized'; }
  else if(d.outcome_type == 'RELEASE'){ d.outcome_type_desc = 'released'; }
  else if(d.outcome_type == 'DIED'){ d.outcome_type_desc = 'died'; }
  else if(d.outcome_type == 'TRNSFR-EXT'){ d.outcome_type_desc = 'transferred out'; }
  else if(d.outcome_type == 'RTF'){ d.outcome_type_desc = 'returned to field'; }
  else if(d.outcome_type == 'RTO'){ d.outcome_type_desc = 'returned to owner'; }
  else if(d.outcome_type == ''){ d.outcome_type = 'SHELTER'; d.outcome_type_desc = 'still in shelter'; }

  // find los offset for those already in shelter
  if(timeCount.getTime() > d.intake_date.getTime()){
    dayOffset = (timeCount.getTime()-d.intake_date.getTime())/oneDay;
    d.losOffset = Math.round(dayOffset);
    d.intakeDelay = 0;
  }
  else{
    dayDelay = (d.intake_date.getTime()-timeCount.getTime())/oneDay;
    d.losOffset = 0;
    d.intakeDelay = Math.round(dayDelay);
  }

  // redefine los
  if(d.outcome_type != 'SHELTER'){
    d.los_new = Math.round(((d.outcome_date.getTime()-d.intake_date.getTime())/oneDay));
    if(d.los_new == 0){
      d.los_new = 0.5;
    }
  }
  else{ d.los_new = +d.los; }

  // give outcome date
  if(isNaN(d.outcome_date.getTime())){
    d.outcome_date = new Date(d.intake_date);
    d.outcome_date.setDate(d.intake_date.getDate() + d.los_new)
  }

  return{
    id: d.animal_id,
    type: d.animal_type,
    sex: d.sex,
    yrs: +d.yrs,
    mnth: +d.mnth,
    breed: d.breed,
    color1: d.color_prim,
    color2: d.color_sec,
    los: +d.los,
    los_new: d.los_new,
    los_offset: d.losOffset,
    intake_type: d.intake_type,
    intake_type_desc: d.intake_type_desc,
    intake_subtype: d.intake_subtype,
    intake_date: d.intake_date,
    intake_delay: d.intakeDelay,
    outcome_type: d.outcome_type,
    outcome_type_desc: d.outcome_type_desc,
    outcome_subtype: d.outcome_subtype,
    outcome_date: d.outcome_date
  };
}

function runData(){

  w = d3.select('#visualization-container').node().clientWidth;
  h = d3.select('#visualization-container').node().clientWidth;
  sideW = d3.select('#supplemental').node().clientWidth;
  radius = Math.min((w*.7), (h*.7)) / 2;

  const contentW = d3.select('#content').node().clientWidth;
  d3.select('#supplemental').style('left',(contentW-w-sideW)+'px');

  svg = d3.select('#visualization')
    .append('svg')
    .attr('id','viz-svg')
    .attr('width', w)
    .attr('height',h-100)
    .append('g')
    .attr('id','viz-svg-g')
    .attr('transform','translate(' + ((w/2)) + ',' + ((2*h/5)) + ')');

  d3.csv('./data/arl_jan18.csv', parse).then(function(data){

    // aggregate data by intake and outcome types
    const intake = d3.nest()
      .key(function(d){ return d.intake_type; })
      .rollup(function(d) { return d.length; })
      .entries(data);

    const outcome = d3.nest()
      .key(function(d){ return d.outcome_type })
      .rollup(function(d) { return d.length; })
      .entries(data);

    data.forEach(function(d){
      intake.forEach(function(i){
        if(i.key == d.intake_type){
          d.intake_total = i.value;
        }
      })
      outcome.forEach(function(i){
        if(i.key == d.outcome_type){
          d.outcome_total = i.value;
        }
      })
    });


    // sort data for intake
    data.sort(function(a,b){
      //return d3.ascending(a.intake_type, b.intake_type) || d3.ascending(a.outcome_type, b.outcome_type) || d3.ascending(a.type, b.type) || a.intake_date.getTime() - b.intake_date.getTime();
      if(a.outcome_type == 'SHELTER' && b.outcome_type == 'ADOPTION' || b.outcome_type == 'SHELTER' && a.outcome_type == 'ADOPTION'){
        return d3.ascending(a.intake_type, b.intake_type) || a.outcome_total - b.outcome_total || d3.ascending(a.type, b.type) || a.intake_date.getTime() - b.intake_date.getTime();
      }
      else{
        return d3.ascending(a.intake_type, b.intake_type) || b.outcome_total - a.outcome_total || d3.ascending(a.type, b.type) || a.intake_date.getTime() - b.intake_date.getTime();
      }
    })

    // map intake description and calc intake index
    count = 1;
    prevType = '';
    data.forEach(function(d){
      labelMap.set(d.intake_type, d.intake_type_desc);

      if(prevType == d.intake_type || prevType == ''){
        d.intake_index = count;
      }else{
        count = 1;
        d.intake_index = count;
      }

      prevType = d.intake_type;
      count++;

      // counts for sidebar
      totalCount++;
      if(d.intake_date.getTime() >= timeCount.getTime()){
        intakePrior++;
      }else{
        intakeDuring++;
      }
      if(d.outcome_type != 'SHELTER'){
        outcomeDuring++;
      }

    });

    // sort data for outcome
    data.sort(function(a,b){
      // return d3.ascending(a.outcome_type, b.outcome_type) || d3.ascending(a.intake_type, b.intake_type) || d3.ascending(a.type, b.type) || a.outcome_date.getTime() - b.outcome_date.getTime();
      return d3.ascending(a.outcome_type, b.outcome_type) || b.intake_total - a.intake_total || d3.ascending(a.type, b.type) /*|| a.outcome_date.getTime() - b.outcome_date.getTime()*/;
    })

    // map outcome description and calc outcome index
    count = 1;
    prevType = '';
    data.forEach(function(d){
      labelMap.set(d.outcome_type, d.outcome_type_desc);

      if(prevType == d.outcome_type || prevType == ''){
        d.outcome_index = count;
      }else{
        count = 1;
        d.outcome_index = count;
      }

      prevType = d.outcome_type;
      count++;

    });

    // sort data for los
    data.sort(function(a,b){
      return (b.los_new - a.los_new) /*|| d3.ascending(a.outcome_type, b.outcome_type) || d3.ascending(a.intake_type, b.intake_type) || d3.ascending(a.type, b.type) || a.outcome_date.getTime() - b.outcome_date.getTime()*/;
    })

    // rank by los
    i=0;
    data.forEach(function(d){
      d.los_rank = i;
      i++;
    });

    const minLos = d3.min(data.map(function(d){return d.los_new}));
    const maxLos = d3.max(data.map(function(d){return d.los_new}));
    const minDate = d3.min(data.map(function(d){return d.intake_date}));
    const maxDate = d3.max(data.map(function(d){return d.outcome_date}));
    const maxIntake = d3.max(data.map(function(d){return d.intake_date}));

    scaleLos
      .domain([minLos,maxLos])
      // .range([-(w/2)+110,(w/2)-10])
      .range([-(2*w/5),(2*w/5)]);

    scaleTime
      .domain([timeCount,maxDate])
      // .range([-(h/2)+150,(h/2)-100])
      .range([-(1*h/5),(3*h/10)]);


    scaleLosHist
      .domain([minLos,maxLos]);

    scaleTimeBar
      .domain([timeCount,maxDate]);

    const intakeMaxCount = d3.max(intake.map(function(d){return d.value}));
    intake.forEach(function(d){
      if(d.value == intakeMaxCount){ intakeMost = d.key; }
    });

    const outcomeMaxCount = d3.max(outcome.map(function(d){return d.value}));
    outcome.forEach(function(d){
      if(d.value == outcomeMaxCount){ outcomeMost = d.key; }
    });

    type = d3.nest()
      .key(function(d){ return d.type; })
      .rollup(function(d) { return d.length; })
      .entries(data);

    const typeAll = d3.nest()
      .key(function(d){ return d.type; })
      .entries(data);

    //push sidebar info, calc from typeAll, to type
    type.forEach(function(x){
      typeAll.forEach(function(d){
        let typeIntakePrior = 0,
          typeIntakeDuring = 0,
          typeOutcomeDuring = 0,
          // typeIntakeMost = intake,
          // typeOutcomeMost = outcome,
          typeLosMin = 0, typeLosMax = 0;
        if(x.key == d.key){
          d.values.forEach(function(i){
            // counts of intake and outcome
            if(i.intake_date.getTime() >= timeCount.getTime()){
              typeIntakePrior++;
            }else{
              typeIntakeDuring++;
            }
            if(i.outcome_type != 'SHELTER'){
              typeOutcomeDuring++;
            }
            // most common intake and outcome types
            intake.forEach(function(t){
              if(i.intake_type == t.key && typeof t.count === 'undefined'){
                t.count = 1;
              }else if(i.intake_type == t.key){
                t.count++;
              }
            })
            outcome.forEach(function(t){
              if(i.outcome_type == t.key && typeof t.count === 'undefined'){
                t.count = 1;
              }else if(i.outcome_type == t.key){
                t.count++;
              }
            })
            // Los min and max
            if(typeLosMin == 0 && typeLosMax == 0){
              typeLosMin = i.los_new;
              typeLosMax = i.los_new;
            }else if(typeLosMin > i.los_new){
              typeLosMin = i.los_new;
            }else if(typeLosMax < i.los_new){
              typeLosMax = i.los_new;
            }
          })
          intake.forEach(function(t){
            if(t.count == d3.max(intake.map(function(i){return i.count}))){ x.intakeMost = t.key; }
          });
          outcome.forEach(function(t){
            if(t.count == d3.max(outcome.map(function(i){return i.count}))){ x.outcomeMost = t.key; }
          });
          x.intakePrior = typeIntakePrior;
          x.intakeDuring = typeIntakeDuring;
          x.outcomeDuring = typeOutcomeDuring;
          x.losMin = typeLosMin;
          x.losMax = typeLosMax;
        }
      })
    });

    const typeMaxCount = d3.max(type.map(function(d){return d.value}));
    type.forEach(function(d){
      if(d.value == typeMaxCount){ typeMost = d.key; }
    });
    if(typeMost == 'CAT'){ typeMost = 'cats'; }
    else if(typeMost == 'DOG'){ typeMost = 'dogs'; }
    else if(typeMost == 'OTHER'){ typeMost = 'furries'; }
    else if(typeMost == 'BIRD'){ typeMost = 'birds'; }
    else{ typeMost = 'livestock'; }

    // svg.append('text')
    //   .text('intake')
    //   .attr('x', ((-w/2) + 100) + 'px')
    //   .attr('y', ((-h/2) + 60) + 'px')
    //   .style('fill','#A9A9A9');
    //
    // svg.append('text')
    //   .text('outcomes')
    //   .attr('x', ((w/2) - 100) + 'px')
    //   .attr('y', ((-h/2) + 60) + 'px')
    //   .style('text-anchor','end')
    //   .style('fill','#A9A9A9');

    //push flow sidebar summary info, calc from intakeAll and outcomeAll to intake and outcome
    const intakeAll = d3.nest()
      .key(function(d){ return d.intake_type; })
      .entries(data);

    intake.forEach(function(x){
      outcome.forEach(function(i){
        i.count = 0;
      })
      type.forEach(function(i){
        i.count = 0;
      })
      intakeAll.forEach(function(d){
        let intakeIntakePrior = 0,
          intakeIntakeDuring = 0,
          intakeOutcomeDuring = 0,
          // intakeOutcomeMost = outcome,
          intakeLosMin = 0, intakeLosMax = 0;
        if(x.key == d.key){
          d.values.forEach(function(i){
            // counts of intake and outcome
            if(i.intake_date.getTime() >= timeCount.getTime()){
              intakeIntakePrior++;
            }else{
              intakeIntakeDuring++;
            }
            if(i.outcome_type != 'SHELTER'){
              intakeOutcomeDuring++;
            }
            // most common outcome type
            outcome.forEach(function(t){
              if(i.outcome_type == t.key){
                t.count++;
              }
            })
            // most common animal type
            type.forEach(function(t){
              if(i.type == t.key){
                t.count++;
              }
            })
            // Los min and max
            if(intakeLosMin == 0 && intakeLosMax == 0){
              intakeLosMin = i.los_new;
              intakeLosMax = i.los_new;
            }else if(intakeLosMin > i.los_new){
              intakeLosMin = i.los_new;
            }else if(intakeLosMax < i.los_new){
              intakeLosMax = i.los_new;
            }
          })
          outcome.forEach(function(t){
            if(t.count == d3.max(outcome.map(function(i){return i.count}))){ x.outcomeMost = t.key; }
          })
          type.forEach(function(t){
            if(t.count == d3.max(type.map(function(i){return i.count}))){ x.typeMost = t.key; }
          })
          x.intakePrior = intakeIntakePrior;
          x.intakeDuring = intakeIntakeDuring;
          x.outcomeDuring = intakeOutcomeDuring;
          x.losMin = intakeLosMin;
          x.losMax = intakeLosMax;
        }
      })
    });

    const outcomeAll = d3.nest()
      .key(function(d){ return d.outcome_type; })
      .entries(data);

    outcome.forEach(function(x){
      intake.forEach(function(i){
        i.count = 0;
      })
      type.forEach(function(i){
        i.count = 0;
      })
      outcomeAll.forEach(function(d){
        let outcomeIntakePrior = 0,
          outcomeIntakeDuring = 0,
          // outcomeIntakeMost = intake,
          outcomeLosMin = 0, outcomeLosMax = 0;
        if(x.key == d.key){
          d.values.forEach(function(i){
            // counts of intake and outcome
            if(i.intake_date.getTime() >= timeCount.getTime()){
              outcomeIntakePrior++;
            }else{
              outcomeIntakeDuring++;
            }
            // most common intake types
            intake.forEach(function(t){
              if(i.intake_type == t.key){
                t.count++;
              }
            })
            // most common animal type
            type.forEach(function(t){
              if(i.type == t.key){
                t.count++;
              }
            })
            // Los min and max
            if(outcomeLosMin == 0 && outcomeLosMax == 0){
              outcomeLosMin = i.los_new;
              outcomeLosMax = i.los_new;
            }else if(outcomeLosMin > i.los_new){
              outcomeLosMin = i.los_new;
            }else if(outcomeLosMax < i.los_new){
              outcomeLosMax = i.los_new;
            }
          })
          intake.forEach(function(t){
            if(t.count == d3.max(intake.map(function(i){return i.count}))){ x.intakeMost = t.key; }
          });
          type.forEach(function(t){
            if(t.count == d3.max(type.map(function(i){return i.count}))){ x.typeMost = t.key; }
          });
          x.intakePrior = outcomeIntakePrior;
          x.intakeDuring = outcomeIntakeDuring;
          x.losMin = outcomeLosMin;
          x.losMax = outcomeLosMax;
        }
      })
    });

    const aggIntake = d3.nest()
      .key(function(d){ return d.intake_date; })
      .entries(data);
    aggIntake.forEach(function(d){
      d.key = new Date(d.key);
      d.values.forEach(function(i){
        if(typeof d.values[i.type] === 'undefined'){
          d.values[i.type] = 1;
        }else{
          d.values[i.type]++;
        }
      })
    });
    aggIntake.sort(function(a,b){ return a.key.getTime() - b.key.getTime(); })

    const aggOutcome = d3.nest()
      .key(function(d){ return d.outcome_date; })
      .entries(data.filter(function(d){ return d.outcome_type != 'SHELTER'; }));
    aggOutcome.forEach(function(d){
      d.key = new Date(d.key);
      d.values.forEach(function(i){
        if(typeof d.values[i.type] === 'undefined'){
          d.values[i.type] = 1;
        }else{
          d.values[i.type]++;
        }
      })
    });
    aggOutcome.sort(function(a,b){ return a.key.getTime() - b.key.getTime(); })

    const maxIntakeCount = d3.max(aggIntake.map(function(d){return d.values.length}));
    const maxOutcomeCount = d3.max(aggOutcome.map(function(d){return d.values.length}));
    maxCount = Math.max(maxIntakeCount, maxOutcomeCount);
    interactVarObj.maxCount = maxCount;

    scaleCount
      .domain([0,maxCount]);

    const histogram = d3.histogram()
      .value(function(d){ return d.los_new; })
      // .domain(scaleLosHist.domain())
      .thresholds(scaleLosHist.ticks(20));

    const bins = histogram(data);

    bins.forEach(function(d){
      d.forEach(function(i){
        if(typeof d[i.type] === 'undefined'){
          d[i.type] = 1;
        }else{
          d[i.type]++;
        }
      })
    });

    const maxBin = d3.max(bins, function(d) { return d.length; })
    interactVarObj.maxBin = maxBin;

    scaleHistCount
      .domain([0,maxBin]);

    const losExtent = d3.extent(data, function(d){ return d.los_new });

    const flowVarObj = {
      radius,
      inner,
      outer,
      pi,
      dayDuration,
      oneDay,
      labelStart,
      labelMap,
      pathOpacity,
      months,
      timeCount,
      scaleTime,
      scaleColor,
      w,
      h
    }

    summaryVarObj.totalCount = totalCount;
    summaryVarObj.intakePrior = intakePrior;
    summaryVarObj.intakeDuring = intakeDuring;
    summaryVarObj.outcomeDuring = outcomeDuring;
    summaryVarObj.typeMost = typeMost;
    summaryVarObj.intakeMost = intakeMost;
    summaryVarObj.outcomeMost = outcomeMost;
    summaryVarObj.losExtent = losExtent;
    summaryVarObj.labelMap = labelMap;

    flowSummaryObj.intake = intake;
    flowSummaryObj.outcome = outcome;

    const scalesObj = {
      scaleLos,
      scaleLosHist,
      scaleHistCount,
      scaleTime,
      scaleTimeBar,
      scaleCount,
      scaleIntake
    }

    const viewsObj = {
      pathOpacity,
      pathOpacityDur,
      dayDuration
    }

    flowFunctions.drawFlow(data,intake,outcome,flowVarObj);
    sideFunctions.createViewBtns(summaryVarObj,scalesObj,viewsObj);
    sideFunctions.summaryInformation(sideW,summaryVarObj);
    sideFunctions.makeBarChart(aggIntake,aggOutcome,bins,scalesObj,months,timeCount,maxDate,oneDay);
    sideFunctions.createAnimalBtns(type,sideW,scaleColor,type,labelMap,aggIntake,aggOutcome,bins);
    sideFunctions.addDataInfo(sideW);

  })

}

export default {
  interactVarObj,
  summaryVarObj,
  flowSummaryObj,
  type,
  timeCount
}
