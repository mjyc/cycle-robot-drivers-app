import {runTabletFaceRobotApp} from '@cycle-robot-drivers/run';
import xs from 'xstream';
import delay from 'xstream/extra/delay';
import {makeDOMDriver} from '@cycle/dom';


function main(sources) {
  const goals$ = sources.TabletFace.events('load').mapTo({
    face: 'HAPPY',
    sound: 'https://raw.githubusercontent.com/aramadia/willow-sound/master/G/G15.ogg',
    robotSpeechbubble: 'How are you?',
    humanSpeechbubble: ['Good', 'Bad'],
    synthesis: 'How are you?',
    recognition: {},
  }).compose(delay(1000));

  sources.HumanSpeechbubbleAction.result
    .addListener({next: result => {
      if (result.status.status === 'SUCCEEDED') {
        console.log(`I received "${result.result}"`);
      }
    }});
  sources.SpeechRecognitionAction.result
    .addListener({next: result => {
      if (result.status.status === 'SUCCEEDED') {
        console.log(`I heard "${result.result}"`);
      }
    }});
  sources.PoseDetection.events('poses')
    .addListener({next: () => {}});  // see outputs on the browser

  return {
    FacialExpressionAction: {goal: goals$.map(goals => goals.face)},
    RobotSpeechbubblesAction: {goal: goals$.map(goals => goals.robotSpeechbubble)},
    HumanSpeechbubblesAction: {goal: goals$.map(goals => goals.humanSpeechbubble)},
    AudioPlayerAction: {goal: goals$.map(goals => goals.sound)},
    SpeechSynthesisAction: {goal: goals$.map(goals => goals.synthesis)},
    SpeechRecognitionAction: {goal: goals$.map(goals => goals.recognition)},
    PoseDetection: xs.of({
      algorithm: 'single-pose',
      singlePoseDetection: {minPoseConfidence: 0.2},
    }),
  }
}

runTabletFaceRobotApp(main, {DOM: makeDOMDriver('#root')});
