
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VoiceRecorder, AudioPlayer, convertBlobToBase64 } from '@/utils/voiceUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface VoiceInterfaceProps {
  onTranscription: (text: string) => void;
  onAudioResponse: (audioBase64: string) => void;
  isProcessing: boolean;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onTranscription,
  onAudioResponse,
  isProcessing
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [voice, setVoice] = useState('alloy');
  const [volume, setVolume] = useState([0.8]);
  const [showSettings, setShowSettings] = useState(false);
  
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    recorderRef.current = new VoiceRecorder();
    playerRef.current = new AudioPlayer();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!recorderRef.current) return;

      await recorderRef.current.startRecording();
      setIsRecording(true);
      setIsListening(true);
      
      // Start audio visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(average / 255);
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
      
      toast({
        title: "Recording Started",
        description: "Speak now... Click stop when finished.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    try {
      if (!recorderRef.current) return;

      const audioBlob = await recorderRef.current.stopRecording();
      setIsRecording(false);
      setIsListening(false);
      setAudioLevel(0);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Convert to base64 and send for transcription
      const base64Audio = await convertBlobToBase64(audioBlob);
      
      toast({
        title: "Processing Audio",
        description: "Converting speech to text...",
      });

      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });

      if (error) {
        throw error;
      }

      if (data?.text) {
        onTranscription(data.text);
        toast({
          title: "Speech Recognized",
          description: `"${data.text.substring(0, 50)}${data.text.length > 50 ? '...' : ''}"`,
        });
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process audio recording.",
        variant: "destructive",
      });
    }
  };

  const playAudioResponse = async (text: string) => {
    try {
      if (!playerRef.current) return;

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) {
        throw error;
      }

      if (data?.audioContent) {
        await playerRef.current.playAudio(data.audioContent);
        onAudioResponse(data.audioContent);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Audio Error",
        description: "Failed to play audio response.",
        variant: "destructive",
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Voice Visualizer */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-monkeyGreen/20 to-monkeyGreen/40 flex items-center justify-center">
              <div 
                className="w-24 h-24 rounded-full bg-monkeyGreen flex items-center justify-center transition-transform duration-150"
                style={{ 
                  transform: `scale(${1 + audioLevel * 0.3})`,
                  boxShadow: `0 0 ${audioLevel * 50}px rgba(46, 125, 50, 0.4)`
                }}
              >
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : isRecording ? (
                  <Mic className="w-8 h-8 text-white" />
                ) : (
                  <MicOff className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            
            {/* Audio Level Rings */}
            {isListening && (
              <>
                <div 
                  className="absolute inset-0 rounded-full border-2 border-monkeyGreen/30 animate-ping"
                  style={{ animationDuration: '2s' }}
                />
                <div 
                  className="absolute inset-2 rounded-full border-2 border-monkeyGreen/20 animate-ping"
                  style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
                />
              </>
            )}
          </div>

          {/* Recording Button */}
          <Button
            onClick={toggleRecording}
            disabled={isProcessing}
            size="lg"
            className={`w-full ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-monkeyGreen hover:bg-monkeyGreen/90'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </>
            )}
          </Button>

          {/* Settings Toggle */}
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Voice Settings
          </Button>

          {/* Voice Settings */}
          {showSettings && (
            <div className="w-full space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Voice</label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alloy">Alloy</SelectItem>
                    <SelectItem value="echo">Echo</SelectItem>
                    <SelectItem value="fable">Fable</SelectItem>
                    <SelectItem value="onyx">Onyx</SelectItem>
                    <SelectItem value="nova">Nova</SelectItem>
                    <SelectItem value="shimmer">Shimmer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Volume</label>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Status Text */}
          <p className="text-sm text-gray-600 text-center">
            {isProcessing ? (
              "Processing your request..."
            ) : isRecording ? (
              "Listening... Speak now"
            ) : (
              "Tap to start voice conversation"
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceInterface;
