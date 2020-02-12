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
      rangeActive: _SESSION,
      paused: true,
      settings: true,
    }
    this.timer = null;
    this.beep = React.createRef();
  }

  componentDidMount(){
    this.timer = setInterval( this.countDown, 1000 )
  }

  countDown = () => {
    const nextTimeLeft = this.state.timeLeft - 1;
      
      /** START NEXT POMODORO ***/
      if (nextTimeLeft < 0 ){
        console.log("**** START NEXT POMODORO ***** nextTimeLeft: ", nextTimeLeft);
        //this.endPomodoro();
        this.beep.current.play();
        return this.startNextPomodoro();
      }
      if (this.state.paused) {
        return;
      };
      /** UPDATE TIME LEFT ***/
      console.log("**** UPDATE TIME LEFT  nextTimeLeft: ", nextTimeLeft)
      this.setState({
        timeLeft: nextTimeLeft,
        paused: false
      })
  }
 

  /** 
   * newValue is integer  minute
   */
  handleSettings = (e, type, newValue) => {
    /** check */
    e.preventDefault();
    e.stopPropagation();
    const { timeLeft, paused } = this.state;

    if ( !paused ) return;
    if (!isValid(_MIN, _MAX, newValue)) return;
    let updatedTimeLeft = timeLeft;

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

  endPomodoro = () => {
    this.playSound();
    return;
  }

  startNextPomodoro = () => {
      let nextRange =  this.nextRange();
      let nextRangeTime =  this.nextTimeLeft();
      console.log("nextRangeTime ", nextRangeTime);
      console.log("nextRange ", nextRange);       
      this.setState({
          rangeActive: nextRange,
          timeLeft: nextRangeTime,
      })
  }


  /** start from the value displayed ( timeLeft)*/
  handlePlayStop = (e) => {
    if(e){
      e.preventDefault();
      e.stopPropagation();
    }
    this.setState({
      paused: !this.state.paused,
      setting: false
    })
  }

  handleReset = (e) => {
    e.preventDefault();
    e.stopPropagation();
    /** delete running timer and set to initial params */
  
    this.setState({
      break: initialConf.break,
      session: initialConf.session,
      timeLeft: initialConf.timeLeft,
      rangeActive: _SESSION,
      paused: true,
      setting: true
    })
    console.log(" AUDIO TRACK currentTime: ", this.beep.current.currentTime);
    this.beep.current.load();
    return;
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
          <Display timeLeft={this.state.timeLeft} rangeActive={this.state.rangeActive} />
          <div className="timerControls">
          <button onClick={(e)=>{this.handlePlayStop(e)}} id="start_stop">start | stop</button>
          <button onClick={(e)=>{this.handleReset(e)}} id="reset">reset</button>
          </div>
        </div>  
      </div>
    );
  }
}

export default App;
