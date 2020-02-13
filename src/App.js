import React from 'react';
import './App.css';

const _SESSION = "Session";
const _BREAK = "Break";
const _MIN = 0; /** 0 min */
const _MAX = 60; /** 60 min */
const UPDATE_EVERY_1_SEC = 1000 /** 1sec */
const AUDIO_SRC="https://goo.gl/65cBl1"

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

  function playSound(audioEl){
      let promise = audioEl.play();
      if(promise !== undefined) {
        promise
        .then( _ => {
              console.log("Promise PLAY: ",_);
        })
        .catch(e => {
              console.log("Promise Error: ", e)
          })
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

  /**
   * MAIN FUNCTION: update every sec the timeLeft and switch track
   */
  countDown = () => {
    if (this.state.paused ) {
      return;
    };
    
    const { timeLeft } = this.state;
    console.log("countDown: ", timeLeft)
    /** START NEXT TRACK ***/
    if (timeLeft === 0 ){
        playSound(this.beep.current);
        this.stop();
        this.startNextTrack();
        return;
    }
    /** UPDATE TIME LEFT ***/
    this.setState({
      timeLeft: timeLeft - 1,
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

      this.setState({
          trackActive: nextTrack,
          timeLeft: nextTimeLeft,
      }, this.start());
      return;
  }

  start=()=>{
    this.timer = setInterval( this.countDown, UPDATE_EVERY_1_SEC );
    return;
  }

  stop=()=>{
    clearInterval(this.timer);
    return;
  }

  /** start stop timer */
  handlePlayStop = (e) => {
    if(e){
      e.preventDefault();
      e.stopPropagation();
    }
    if(this.state.paused){
      this.start();
    }
    else{
      this.stop();
    }

    this.setState({
      paused: !this.state.paused,
      settings: false
    });
    return;
  }

 /** reset timer. set up standard conf */
  handleReset = (e) => {
    e.preventDefault();
    e.stopPropagation();
    /** delete running timer and set to initial params */
    this.stop();
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
          <audio id="beep" src={AUDIO_SRC} preload="auto" ref={this.beep}></audio>
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
