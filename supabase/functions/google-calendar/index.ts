import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { action, accessToken, eventData, eventId } = await req.json()

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }

    if (action === 'createEvent') {
      const googleEvent = {
        summary: eventData.summary,
        description: eventData.description,
        start: {
          dateTime: eventData.start.dateTime,
          timeZone: eventData.start.timeZone || 'America/Sao_Paulo',
        },
        end: {
          dateTime: eventData.end.dateTime,
          timeZone: eventData.end.timeZone || 'America/Sao_Paulo',
        },
        conferenceData: {
          createRequest: {
            requestId: `meet_${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        colorId: '10', // Verde claro para eventos da plataforma
      }

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
        {
          method: 'POST',
          headers,
          body: JSON.stringify(googleEvent),
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Falha ao criar evento: ${errorData}`)
      }

      const createdEvent = await response.json()

      return new Response(
        JSON.stringify({
          eventId: createdEvent.id,
          meetLink: createdEvent.conferenceData?.entryPoints?.[0]?.uri || null,
          event: createdEvent,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateEvent') {
      const googleEvent = {
        summary: eventData.summary,
        description: eventData.description,
        start: {
          dateTime: eventData.start.dateTime,
          timeZone: eventData.start.timeZone || 'America/Sao_Paulo',
        },
        end: {
          dateTime: eventData.end.dateTime,
          timeZone: eventData.end.timeZone || 'America/Sao_Paulo',
        },
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify(googleEvent),
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Falha ao atualizar evento: ${errorData}`)
      }

      const updatedEvent = await response.json()

      return new Response(
        JSON.stringify({ success: true, event: updatedEvent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'deleteEvent') {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'DELETE',
          headers,
        }
      )

      if (!response.ok && response.status !== 410) { // 410 = Gone (already deleted)
        const errorData = await response.text()
        throw new Error(`Falha ao deletar evento: ${errorData}`)
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'listEvents') {
      const { timeMin, timeMax } = eventData
      
      const params = new URLSearchParams({
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
      })

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
        { headers }
      )

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Falha ao listar eventos: ${errorData}`)
      }

      const eventsData = await response.json()

      return new Response(
        JSON.stringify({ events: eventsData.items || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Ação não suportada' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na API do Google Calendar:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})