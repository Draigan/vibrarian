import { Button } from '@/components/ui/button';
import { useUserSettings } from '@/context/UserSettingsContext';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { settings } = useUserSettings();

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="flex flex-col items-center justify-center text-center w-full max-w-3xl">
        <div className="animate-fade-in w-full">
          <div className="flex flex-col items-center">
            <img
              src="/vibrarian.jpg"
              alt="Vibrarian Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 mb-6 rounded-full border-4 border-primary p-1 object-cover"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Welcome to Vibrarian
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 px-2">
            Your fractally context-aware transcript-querying companion.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            {settings.userName ? (
              <>
                <Button
                  onClick={() => navigate('/chat')}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Start Chatting
                </Button>
                <Button
                  onClick={() => navigate('/transcripts')}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  View Transcripts
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                className="w-full sm:w-auto"
              >
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

