import React from 'react';
import './App.css';

const _SESSION = "Session";
const _BREAK = "Break";
const _MIN = 0; /** 0 min */
const _MAX = 60; /** 60 min */
const _UPDATE_EVERY_SEC = 1000 /** msec */

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

/**
 * time  mm:ss format (i.e. 25:00).
 */
const Display=({timeLeft, trackActive})=>{
  let time = convertTimeLeft(timeLeft);
  return(
    <div className="displayTimer">
      <p id="timer-label">{trackActive}</p>
      <p id="time-left">{time}</p>
    </div>
  )
}

function format(x) {
  if(x > -1 && x < 10) return "0" + x
  return x + "";
}

function convertTimeLeft(timeSec){
  let time_string = "";
  let min = parseInt(timeSec / 60);
  let sec = parseInt(timeSec % 60);
  time_string =  format(min) + ":" + format(sec);
  return time_string;
}

  /**
   * 
   * @param {*} currentTrack:  _SESSION: Session | _BREAK:Break
   */
  const getNextTrack = function getNextTrack({trackActive, breakTime, sessionTime, }){
    console.log("MOTHER FUCKER: ", arguments)
    if(trackActive === _SESSION){
      return {
        nextTrack: _BREAK,
        nextTimeLeft: breakTime * 60
      };
    }
    else {
      return {
        nextTrack: _SESSION,
        nextTimeLeft: sessionTime * 60
      };
    }
  }



const initialConf = {
  break: 5, //min
  session: 25, //min
  timeLeft: 1500 //sec
}


/** check ranges */
function isValid({min, max, value}){
  if(value === min || value > max) return false;
  return true;
}

/**
 * update break and session length
 * also update timeLeft if is currently shown
 */
function getTimeLeft({timeLeft, trackActive, type, newValue}){
  if(trackActive === _SESSION && type ===  "session"){
     return newValue * 60;
  }
  else if(trackActive === _BREAK && type === "break") {
    return newValue * 60;
  }
  else {
    return timeLeft;
  }
}


class App extends React.Component {

  constructor(){
    super();
    this.state = {
      break: initialConf.break,
      session: initialConf.session,
      timeLeft: initialConf.timeLeft,
      trackActive: _SESSION,
      paused: true, 
      settings: true, //ENABLED
    }
    this.timer = null;
    this.beep = React.createRef();
  }

  componentDidMount(){
    this.timer = setInterval( this.countDown, _UPDATE_EVERY_SEC );
    return;
  }

  componentWillUnmount(){
    clearInterval(this.timer);
    return;
  }

  countDown = () => {
    if (this.state.paused ) {
      return;
    };
    const nextTimeLeft = this.state.timeLeft - 1;
    /** START NEXT TRACK ***/
    if (nextTimeLeft < 0 ){
        console.log("**** START NEXT TRACK ***** nextTimeLeft: ", nextTimeLeft);
        this.beep.current.play();
        return this.startNextTrack();
    }
    /** UPDATE TIME LEFT ***/
    console.log("**** UPDATE TIME LEFT: ", nextTimeLeft)
    this.setState({
      timeLeft: nextTimeLeft,
    })
  }

  /** 
   * newValue is integer  minute,
   * type is session or break
   */
  handleSettings = (e, type, newValue) => {
    /** check */
    e.preventDefault();
    e.stopPropagation();
    const { timeLeft, paused, trackActive, settings } = this.state;
    
    if ( !settings ) return /** CHECK SETTINGS ENABLED */
    if ( !paused ) return; /** CHECK PLAY */
    if ( !isValid({min: _MIN, max: _MAX, value: newValue})) return; /** CHECK RANGE */

    this.setState({
      [type]: newValue,
      timeLeft: getTimeLeft({timeLeft, trackActive, type, newValue})
    })
    return;
  }


  startNextTrack = () => {
      const { trackActive,  session } = this.state;
      const { nextTrack, nextTimeLeft }  = getNextTrack({trackActive, sessionTime: session, breakTime: this.state.break});
      console.log("nextTrack: ", nextTrack);
      console.log("nextTimeLeft: ", nextTimeLeft);
      this.setState({
          trackActive: nextTrack,
          timeLeft: nextTimeLeft,
      })
  }

  /** start stop timer */
  handlePlayStop = (e) => {
    if(e){
      e.preventDefault();
      e.stopPropagation();
    }
    this.setState({
      paused: !this.state.paused,
      settings: false
    })
  }

 /** reset timer. set up standard conf */
  handleReset = (e) => {
    e.preventDefault();
    e.stopPropagation();
    /** delete running timer and set to initial params */
    
    this.setState({
      break: initialConf.break,
      session: initialConf.session,
      timeLeft: initialConf.timeLeft,
      trackActive: _SESSION,
      paused: true,
      settings: true
    })
    /** SOUND IS ON */
    if(!this.beep.current.paused){
         console.log("RESET AUDIO: ")
         this.beep.current.pause();
         this.beep.current.currentTime = 0;
    }
    return;
  }

  render(){

    return (
      <div className="App">
        <div className="container">
          <h1 className="title">Pomodoro Clock</h1>
          <audio id="beep" src="https://goo.gl/65cBl1" preload="auto" ref={this.beep}></audio>
          <div className="settingsContainer">
            <AppControl type="break"   onClick={this.handleSettings} value={this.state.break} />
            <AppControl type="session"  onClick={this.handleSettings} value= {this.state.session} />
          </div>
          <Display timeLeft={this.state.timeLeft} trackActive={this.state.trackActive} />
          <div className="timerControls">
          <button onClick={(e)=>{this.handlePlayStop(e)}} id="start_stop">start | pause</button>
          <button onClick={(e)=>{this.handleReset(e)}} id="reset">reset</button>
          </div>
        </div>  
      </div>
    );
  }
}

export default App;
