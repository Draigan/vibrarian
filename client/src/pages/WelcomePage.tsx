import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useUserSettings } from '@/context/UserSettingsContext';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { settings } = useUserSettings();

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center justify-center h-full text-center p-4 overflow-hidden">
        <div className="animate-fade-in max-w-2xl">
          <div className="flex flex-col items-center justify-center text-center">
            <img
              src="/vibrarian.jpg"
              alt="Vibrarian Logo"
              className="w-32 h-32 mb-6 rounded-full border-4 border-primary p-1 object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Welcome to Vibrarian
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your fractally context-aware transcript-querying companion.
          </p>
          <div className="flex justify-center gap-4">
            {settings.userName ? (
              <>
                <Button onClick={() => navigate('/chat')} size="lg">
                  Start Chatting
                </Button>
                <Button onClick={() => navigate('/transcripts')} variant="outline" size="lg">
                  View Transcripts
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/login')} size="lg">
                Sign In to Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
