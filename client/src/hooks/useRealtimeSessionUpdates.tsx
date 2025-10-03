import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUserSettings } from '@/context/UserSettingsContext';
import { useAuth } from '@/context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function useRealtimeSessionUpdates() {
  const queryClient = useQueryClient();
  const { settings } = useUserSettings();
  const { user } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Only set up subscription if user is authenticated
    if (!user?.email || !settings.userName) {
      return;
    }

    console.log('🔌 Setting up real-time session updates...');

    // Create EventSource for Server-Sent Events
    const eventSource = new EventSource(`${BASE_URL}/api/session-updates`, {
      withCredentials: true
    });

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ SSE connection established for session updates');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received session update:', data);

        switch (data.type) {
          case 'connected':
            console.log('🎉 Session updates stream connected');
            break;
            
          case 'session_updated':
            console.log('🔄 Session updated, refreshing cache:', data.session);
            // Invalidate and refetch sessions when a session is updated
            queryClient.invalidateQueries({
              queryKey: ["chatSessions", settings.userName],
            });
            break;
            
          case 'heartbeat':
            // Silent heartbeat to keep connection alive
            break;
            
          default:
            console.log('Unknown SSE message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
      
      // Reconnect after a delay if connection is lost
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          console.log('🔄 Attempting to reconnect SSE...');
          // The useEffect will handle creating a new connection
        }
      }, 5000);
    };

    // Cleanup function
    return () => {
      console.log('🔌 Closing SSE connection for session updates');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [user, settings.userName, queryClient]);

  // Return connection status for debugging
  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    connectionState: eventSourceRef.current?.readyState
  };
}