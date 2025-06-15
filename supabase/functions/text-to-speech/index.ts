
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice = 'alloy', model = 'tts-1' } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    console.log('Generating speech for text:', text.substring(0, 100) + '...')

    // Use ElevenLabs for high-quality TTS
    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    
    if (elevenlabsApiKey) {
      // ElevenLabs voices mapping
      const voiceMapping: { [key: string]: string } = {
        'alloy': '9BWtsMINqrJLrRacOk9x', // Aria
        'echo': 'EXAVITQu4vr4xnSDxMaL', // Sarah
        'fable': 'FGY2WhTYpPnrIDTdsKH5', // Laura
        'onyx': 'JBFqnCBsd6RMkjVDRZzb', // George
        'nova': 'XB0fDUnXU5powFXDhCwa', // Charlotte
        'shimmer': 'pFZP5JQG7iQjIQuC4Bku' // Lily
      }

      const voiceId = voiceMapping[voice] || '9BWtsMINqrJLrRacOk9x'

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenlabsApiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('ElevenLabs API error:', error)
        throw new Error(`ElevenLabs API error: ${error}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      return new Response(
        JSON.stringify({ audioContent: base64Audio }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Fallback to OpenAI TTS
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          input: text,
          voice: voice,
          response_format: 'mp3',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to generate speech')
      }

      const arrayBuffer = await response.arrayBuffer()
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      return new Response(
        JSON.stringify({ audioContent: base64Audio }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Text-to-speech error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
