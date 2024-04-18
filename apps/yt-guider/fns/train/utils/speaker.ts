export class Speaker {
    speak(text: string) {
        speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        utter.rate = 1.2;
        utter.voice = speechSynthesis.getVoices().find((voice) => voice.name === 'Microsoft Aria Online (Natural) - English (United States)');
        speechSynthesis.speak(utter);
    }

    stop() {
        speechSynthesis.cancel();
    }
}

export const speaker = new Speaker();