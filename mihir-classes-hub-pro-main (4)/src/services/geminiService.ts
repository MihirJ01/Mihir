interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

const GEMINI_API_KEY = 'AIzaSyCoHL4k1tLuCxveLK5JLJ47JKmLKh0Ohhw';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export class GeminiService {
  static async generateResponse(message: string): Promise<string> {
    try {
      console.log('Sending request to Gemini API:', message);
      
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Sora, the AI assistant for Mihir Classes. You are a helpful, friendly female assistant who helps students with their academic questions and provides educational guidance. Your name is Sora - if anyone asks your name, you should say "I'm Sora, your AI assistant from Mihir Classes." Please respond to: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      console.log('API Response:', data);
      
      const responseText = data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not process your request.';
      
      // Automatically speak the response with female voice
      this.speakText(responseText);
      
      return responseText;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      this.speakText(errorMessage);
      return errorMessage;
    }
  }

  static speakText(text: string): void {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2; // Increased from 0.8 to 1.2 for faster speech
      utterance.pitch = 1.1; // Slightly higher pitch for female voice
      utterance.volume = 0.8;
      
      // Wait for voices to load and select a female voice
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        
        // Try to find a female voice
        const femaleVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('karen') ||
          voice.name.toLowerCase().includes('victoria') ||
          voice.name.toLowerCase().includes('susan') ||
          voice.name.toLowerCase().includes('alice') ||
          voice.name.toLowerCase().includes('fiona') ||
          (voice.name.toLowerCase().includes('google') && voice.name.toLowerCase().includes('us')) ||
          (voice.lang.startsWith('en') && voice.name.toLowerCase().includes('uk'))
        );
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        } else {
          // Fallback to any English voice
          const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
          if (englishVoice) {
            utterance.voice = englishVoice;
          }
        }
        
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        setVoice();
      } else {
        window.speechSynthesis.onvoiceschanged = setVoice;
      }
    }
  }

  static stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
