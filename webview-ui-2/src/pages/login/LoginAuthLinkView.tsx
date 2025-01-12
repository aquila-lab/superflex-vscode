import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../components/ui/Card';

export const LoginAuthLinkView = ({
  authUniqueLink,
  onCopyLink,
  onReturnToLogin
}: {
  authUniqueLink: string;
  onCopyLink: () => void;
  onReturnToLogin: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-5 pb-4">
      <Card className="max-w-md my-auto">
        <CardHeader className="flex flex-col justify-center items-center space-y-2">
          <CardTitle className="text-lg font-semibold text-center">
            If you are not redirected to the webpage, copy this link to your browser:
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center">
          <CardDescription className="text-center text-muted-foreground truncate max-w-[18rem]">
            {authUniqueLink}
          </CardDescription>
          <Button className="mt-4" onClick={onCopyLink}>
            Copy Link
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center items-center">
          <Button variant="link" onClick={onReturnToLogin}>
            Return to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
