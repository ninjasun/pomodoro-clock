import React from 'react';
import './App.css';

const AppControl = ({  onClick, type, value}) => {


  return (
    <div className="appSetting" >
      <div id={type+"-label"} className="settingTitle">{type} Length</div>

      <button onClick={(e)=>{onClick(e, type, value-1)}} id={type+"-decrement"}>-</button>
      <div className="settingValue" id={type+"-length"}>{value}</div>
      <button onClick={(e)=>{onClick(e, type, value+1)}} id={type+"-increment"}>+</button>
    </div>
  )
}

function format(val) {
  if(val > -1 && val < 10) return "0"+val
  return val+"";
}

function convertTimeLeft(timeSec){
  let time_string = "";
  let min = parseInt(timeSec / 60);
  let sec = parseInt(timeSec % 60);
  time_string =  format(min) + ":" + format(sec);
  return time_string;
}

/**
 * time  mm:ss format (i.e. 25:00).
 */
const Display=({timeLeft, rangeActive})=>{
  let time = convertTimeLeft(timeLeft);
  return(
    <div className="displayTimer">
      <p id="timer-label">{rangeActive}</p>
      <p id="time-left">{time}</p>
    </div>
  )
}

const initialConf = {
  break: 5, //min
  session: 25, //min
  timeLeft: 1500 //sec
}

const _SESSION = "Session";
const _BREAK = "Break";
const _MIN = 0; /** 0 min */
const _MAX = 60; /** 60 min */
const _1SEC = 1;
/** */
function isValid(min, max, value){
  if(value === min || value > max) return false;
  return true;
}


class App extends React.Component {

  constructor(){
    super();
    this.state = {
      break: initialConf.break,
      session: initialConf.session,
      timeLeft: initialConf.timeLeft,
      isRunning: false,
      rangeActive: _SESSION
    }
    this.timer = null;
    this.beep = React.createRef();
  }


  /** 
   * newValue is integer  minute
   */
  handleSettings = (e, type, newValue) => {
    /** check */
    e.preventDefault();
    e.stopPropagation();
    if (this.state.isRunning) return;
    if(!isValid(_MIN, _MAX, newValue)) return;
    let updatedTimeLeft = this.state.timeLeft;

    if( this.state.rangeActive === _SESSION && type ===  "session"){
      updatedTimeLeft = newValue * 60;
    }
    if(this.state.rangeActive === _BREAK && type === "break") {
      updatedTimeLeft = newValue * 60;
    }
    
    return this.setState({
      [type]: newValue,
      timeLeft: updatedTimeLeft
    })
  }

  nextRange=()=>{
    if( this.state.rangeActive === _SESSION) return _BREAK;
    if(this.state.rangeActive === _BREAK) return _SESSION;
  }

/**
 * break, session are minutes
 * @return seconds
 */
  nextTimeLeft=()=>{
    if( this.state.rangeActive === _SESSION) return this.state.break * 60 ;
    if( this.state.rangeActive === _BREAK) return this.state.session * 60 ;
  }

  playSound=()=>{
    this.beep.current.play();
  }

  /** start from the value displayed and the range active*/
  handlePlay = (e) => {
    if(e){
      e.preventDefault();
      e.stopPropagation();
    }

    const { isRunning, timeLeft, isPaused } = this.state;
    const _self = this;
    if (isRunning && !isPaused) return this.handlePause();
    //if(this.state.isPaused)
   
    this.timer = setInterval( function(){
     
        /** START NEXT POMODORO */
        if (_self.state.timeLeft === 0 ){
            clearInterval(_self.timer);
            let nextRange =  _self.nextRange();
            let nextRangeTime =  _self.nextTimeLeft();
            _self.playSound();
            
            _self.setState({
              rangeActive: nextRange,
              timeLeft: nextRangeTime,
              isRunning: false,
            }, function(){
              _self.handlePlay();
            })
        }

        let nextTimeLeft = _self.state.timeLeft - 1;

        _self.setState({
          timeLeft: nextTimeLeft,
          isRunning: true
        })
    }, 1000 )
  }

  handlePause = (e) => {
    if(e){
      e.preventDefault();
      e.stopPropagation();
    }

    this.setState({
      isPaused: true
    })
  }

  handleReset = (e) => {
    e.preventDefault();
    e.stopPropagation();
    /** delete running timer and set to initial params */
    if(this.state.isRunning){
      clearInterval(this.timer);
    }
    this.setState({
      break: initialConf.break,
      session: initialConf.session,
      timeLeft: initialConf.timeLeft,
      isRunning: false,
      rangeActive: _SESSION
    })
    return
  }

  render(){

    return (
      <div className="App">
        <div className="container">
          <h1 className="title">Pomodoro Clock</h1>
          <audio id="beep" src="./horse.mp3" ref={this.beep}></audio>
          <div className="settingsContainer">
            <AppControl type="break"   onClick={this.handleSettings} value={this.state.break} />
            <AppControl type="session"  onClick={this.handleSettings} value= {this.state.session} />
          </div>
          <Display timeLeft={this.state.timeLeft} rangeActive={this.state.rangeActive}/>
          <div className="timerControls">
          <button onClick={(e)=>{this.handlePlay(e)}} id="start_stop">start</button>
          <button onClick={(e)=>{this.handlePause(e)}} id="">pause</button>
          <button onClick={(e)=>{this.handleReset(e)}} id="reset">reset</button>
          </div>
        </div>  
      </div>
    );
  }
}

export default App;
