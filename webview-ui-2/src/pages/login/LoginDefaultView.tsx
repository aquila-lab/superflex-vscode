import { EventRequestType } from '../../../../shared/protocol';
import { useVSCode } from '../../context/VSCodeContext';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';

export const LoginDefaultView = () => {
  const { postMessage } = useVSCode();

  const handleCreateAccount = () => {
    postMessage(EventRequestType.CREATE_ACCOUNT);
    postMessage(EventRequestType.CREATE_AUTH_LINK, { action: 'create_account' });
  };

  const handleSignIn = () => {
    postMessage(EventRequestType.LOGIN);
    postMessage(EventRequestType.CREATE_AUTH_LINK, { action: 'login' });
  };

  const handleOpenVideo = () => {
    postMessage(EventRequestType.OPEN_EXTERNAL_URL, {
      url: 'https://www.youtube.com/watch?v=hNSYwKTxIP8'
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-5 pb-4">
      <Card className="max-w-md my-auto">
        <CardHeader className="flex flex-col items-center justify-center space-y-1">
          <CardTitle>Welcome to Superflex!</CardTitle>
          <CardDescription>Your Frontend Engineering Assistant.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center space-y-4 mt-2">
          <Button className="w-full" onClick={handleCreateAccount}>
            Start for Free
          </Button>
          <p className="text-muted-foreground">Already have an account?</p>
          <Button variant="link" onClick={handleSignIn}>
            Sign In
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-3 mt-auto mb-8">
        <p className="text-lg font-semibold">Watch our onboarding video:</p>
        <div className="w-full cursor-pointer relative" onClick={handleOpenVideo}>
          <div className="absolute inset-0 z-10" />
          <iframe
            className="w-full aspect-video border border-border rounded-lg shadow-sm"
            src="https://www.youtube.com/embed/hNSYwKTxIP8?si=8C9RVdflePElLhJx"
            title="Superflex Onboarding Video"
            frameBorder="0"
            sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
