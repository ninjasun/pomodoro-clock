import React from 'react';
import './App.css';

const AppControl = ({  onClick, type, value}) => {


  return (
    <div className="appSetting" >
      <p id={type+"-label"} className="settingTitle">{type} Length</p>

      <button onClick={(e)=>{onClick(e, type, value-1)}} id={type+"-decrement"}>-</button>
      <div className="settingValue" id={type+"-length"}>{value}</div>
      <button onClick={(e)=>{onClick(e, type, value+1)}} id={type+"-increment"}>+</button>
    </div>
  )
}

/**
 * time  mm:ss format (i.e. 25:00).
 */
const Display=()=>{
  return(
    <div className="displayTimer">
      <p id="timer-label">Session</p>
      <p id="time-left">18:45</p>
    </div>
  )
}

const initialConf = {
  breakLength : 5,
  sessionLength: 25,
  timeLeft: "25:00"
}

class App extends React.Component {

  constructor(){
    super();
    this.state = {
      break: initialConf.breakLength,
      session: initialConf.sessionLength,
      timeLeft: initialConf.timeLeft,
      isRunning: false,
    }
  }

  handleSettings = (e, type, newValue) => {
    /** check */
    e.preventDefault();
    e.stopPropagation();
    if(this.state.isRunning) return

    return this.setState({
      [type]: newValue
    })
  }

  handlePlay = () => {

  }

  handlePause = () => {

  }

  handleReset = () => {
    /** delete running timer and set to initial params */
    this.setState({
      breakLength: initialConf.breakLength,
      sessionLength: initialConf.sessionLength,
      timeLeft: initialConf.timeLeft
    })
    return
  }

  render(){

    return (
      <div className="App">
        <div className="container">
          <h1 className="title">Pomodoro Clock</h1>
          <div className="settingsContainer">
            <AppControl type="break"   onClick={this.handleSettings} value={this.state.break} />
            <AppControl type="session"  onClick={this.handleSettings} value= {this.state.session} />
          </div>
          <Display />
          <div className="timerControls">
          <button onClick={this.handlePlay} id="start_stop">start</button>
          <button onClick={this.handlePause} id="">pause</button>
          <button onClick={this.handleReset} id="reset">reset</button>
          </div>
        </div>  
      </div>
    );
  }
}

export default App;
