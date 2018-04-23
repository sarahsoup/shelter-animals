import * as d3 from 'd3';
import './style.css';

function inactivityTime() {
    let t;
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(idle, 120000) //two minutes...
    }

    function idle() {
        createIdlePage();
    }
};

function createIdlePage(){

  console.log('timed out!');
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
